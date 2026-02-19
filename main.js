const { Plugin, PluginSettingTab, Setting } = require("obsidian");

// --- 1. SETTINGS DEFINITION ---
const DEFAULT_SETTINGS = {
    liveMode: true,
    debounceTime: 500,
    minLength: 4,
    smartAliasing: true,
    ignoreList: ["HTTP", "JSON", "NASA", "iOS", "macOS"],
    enablePascal: true,
    enableCamel: true,
    enableSnake: true,
    customPattern: ""
};

class CamelCaseSettingTab extends PluginSettingTab {
    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display() {
        const { containerEl } = this;
        containerEl.empty();
        containerEl.createEl("h2", { text: "CamelCase Settings" });

        new Setting(containerEl)
            .setName("Live Auto-Linking")
            .setDesc("Convert patterns into links as you type.")
            .addToggle(toggle => toggle.setValue(this.plugin.settings.liveMode)
                .onChange(async value => {
                    this.plugin.settings.liveMode = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName("Live Typing Delay (ms)")
            .setDesc("How long to wait after you stop typing before formatting links.")
            .addText(text => text.setValue(String(this.plugin.settings.debounceTime))
                .onChange(async value => {
                    const parsed = parseInt(value, 10);
                    if (!isNaN(parsed)) {
                        this.plugin.settings.debounceTime = parsed;
                        await this.plugin.saveSettings();
                    }
                }));

        new Setting(containerEl)
            .setName("Smart Aliasing")
            .setDesc("Creates clean file names. (e.g., CyberSecurity becomes [[Cyber Security|CyberSecurity]])")
            .addToggle(toggle => toggle.setValue(this.plugin.settings.smartAliasing)
                .onChange(async value => {
                    this.plugin.settings.smartAliasing = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName("Minimum Word Length")
            .setDesc("Ignore patterns shorter than this number of characters.")
            .addText(text => text.setValue(String(this.plugin.settings.minLength))
                .onChange(async value => {
                    const parsed = parseInt(value, 10);
                    if (!isNaN(parsed)) {
                        this.plugin.settings.minLength = parsed;
                        await this.plugin.saveSettings();
                    }
                }));

        new Setting(containerEl)
            .setName("Ignore List")
            .setDesc("Comma-separated list of words to ignore.")
            .addText(text => text.setValue(this.plugin.settings.ignoreList.join(", "))
                .onChange(async value => {
                    this.plugin.settings.ignoreList = value.split(",").map(s => s.trim()).filter(s => s.length > 0);
                    await this.plugin.saveSettings();
                }));

        containerEl.createEl("h3", { text: "Pattern Support" });

        new Setting(containerEl).setName("PascalCase").addToggle(t => t.setValue(this.plugin.settings.enablePascal).onChange(async v => { this.plugin.settings.enablePascal = v; await this.plugin.saveSettings(); }));
        new Setting(containerEl).setName("camelCase").addToggle(t => t.setValue(this.plugin.settings.enableCamel).onChange(async v => { this.plugin.settings.enableCamel = v; await this.plugin.saveSettings(); }));
        new Setting(containerEl).setName("snake_case").addToggle(t => t.setValue(this.plugin.settings.enableSnake).onChange(async v => { this.plugin.settings.enableSnake = v; await this.plugin.saveSettings(); }));
        
        // Create a formatted description for the Regex setting
        const regexDesc = document.createDocumentFragment();
        regexDesc.appendText("Optional. Define a custom regex pattern to auto-link.");
        regexDesc.createEl("br");
        regexDesc.createEl("br");
        regexDesc.createEl("strong", { text: "Examples:" });
        regexDesc.createEl("br");
        regexDesc.createEl("code", { text: "\\b[A-Z]{2,}-\\d+\\b" });
        regexDesc.appendText(" (Jira tickets, e.g., PROJ-123)");
        regexDesc.createEl("br");
        regexDesc.createEl("code", { text: "@[A-Za-z0-9_]+" });
        regexDesc.appendText(" (@mentions, e.g., @john_doe)");

        new Setting(containerEl)
            .setName("Custom Regex Pattern")
            .setDesc(regexDesc)
            .addText(text => text.setValue(this.plugin.settings.customPattern)
                .onChange(async value => {
                    this.plugin.settings.customPattern = value;
                    await this.plugin.saveSettings();
                }));
    }
}

// --- 2. MAIN PLUGIN CLASS ---
module.exports = class CamelCaseAutoLinker extends Plugin {
    async onload() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
        this.addSettingTab(new CamelCaseSettingTab(this.app, this));
        
        this.isConverting = false;
        this.debounceTimer = null;

        this.addCommand({
            id: "convert-camelcase-links",
            name: "Convert Patterns to WikiLinks",
            editorCallback: (editor) => this.convertCurrentFile(editor)
        });

        this.registerEvent(
            this.app.workspace.on("editor-change", (editor) => {
                if (!this.settings.liveMode) return;

                clearTimeout(this.debounceTimer);
                
                this.debounceTimer = setTimeout(() => {
                    this.convertInEditor(editor);
                }, this.settings.debounceTime);
            })
        );
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    convertCurrentFile(editor) {
        this.isConverting = true;
        const text = editor.getValue();
        const newText = this.processSafeText(text, -1); 
        
        if (newText !== text) editor.setValue(newText);
        this.isConverting = false;
    }

    convertInEditor(editor) {
        if (this.isConverting) return;
        
        const cursor = editor.getCursor();
        const line = editor.getLine(cursor.line);
        
        const newLine = this.processSafeText(line, cursor.ch);
        
        if (newLine !== line) {
            this.isConverting = true;
            const lengthDiff = newLine.length - line.length;
            editor.setLine(cursor.line, newLine);
            editor.setCursor({ line: cursor.line, ch: cursor.ch + lengthDiff });
            this.isConverting = false;
        }
    }

    processSafeText(text, cursorCh) {
        const protectionRegex = /(```[\s\S]*?```|`[^`\n]+`|^---\n[\s\S]*?\n---)/g;
        const tokens = text.split(protectionRegex);
        
        for (let i = 0; i < tokens.length; i++) {
            if (i % 2 === 0) {
                const tokenCursorCh = cursorCh !== -1 ? cursorCh : -1;
                tokens[i] = this.processText(tokens[i], tokenCursorCh);
            }
        }
        return tokens.join('');
    }

    processText(text, cursorCh) {
        const patterns = [];
        if (this.settings.enablePascal) patterns.push(/\b([A-Z][a-z]+(?:[A-Z][a-z]+)+)\b/g);
        if (this.settings.enableCamel) patterns.push(/\b([a-z]+(?:[A-Z][a-z]+)+)\b/g);
        if (this.settings.enableSnake) patterns.push(/\b([A-Za-z]+_[A-Za-z_]+)\b/g);
        
        if (this.settings.customPattern) {
            try { patterns.push(new RegExp(this.settings.customPattern, "g")); } catch (e) { }
        }

        let result = text;
        for (const regex of patterns) {
            result = result.replace(regex, (match, p1, offset) => {
                if (match.length < this.settings.minLength) return match;
                if (this.settings.ignoreList.includes(match)) return match;

                if (cursorCh !== -1) {
                    const isTouchingCursor = (offset <= cursorCh && cursorCh <= offset + match.length);
                    if (isTouchingCursor) return match;
                }

                const textBefore = result.substring(0, offset);
                const openLinks = (textBefore.match(/\[\[/g) || []).length;
                const closeLinks = (textBefore.match(/\]\]/g) || []).length;
                if (openLinks > closeLinks) return match; 

                if (this.settings.smartAliasing) {
                    let cleanName = match.replace(/_/g, " ").replace(/([a-z])([A-Z])/g, '$1 $2');
                    if (cleanName !== match) {
                        return `[[${cleanName}|${match}]]`;
                    }
                }

                return `[[${match}]]`;
            });
        }
        return result;
    }
};
