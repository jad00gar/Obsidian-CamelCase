# CamelCase Auto-Linker for Obsidian

A lightweight, lightning-fast Obsidian plugin that automatically converts CamelCase, PascalCase, and snake_case words into `[[WikiLinks]]` as you type. 

If you are tired of manually typing brackets every time you want to link to a concept or entity, this plugin does the heavy lifting for you in the background.

## 🧠 Why use this plugin?

In the early days of wikis (like the original WikiWikiWeb), you didn't need brackets to create links. You just typed words together using **CamelCase**, and the system automatically recognized it as a page link. 

Modern markdown apps like Obsidian use the standard `[[WikiLink]]` format instead. While powerful, typing brackets interrupts your flow. This plugin brings back the classic, frictionless wiki experience. You just type your concepts naturally, and the plugin automatically wraps them in brackets for you!

### What are these text patterns?
* **PascalCase:** Words are joined together, and every word is capitalized. (e.g., `CyberSecurity`, `ProjectAlpha`, `DailyNotes`)
* **camelCase:** Similar to PascalCase, but the very first letter is lowercase. (e.g., `userAccount`, `revenueReport`)
* **snake_case:** Words are entirely lowercase and separated by underscores. (e.g., `server_logs`, `api_keys`)

## ✨ Features

* **Live Auto-Linking:** Instantly formats matching text into links as you type.
* **Smart Aliasing:** Automatically cleans up your file names! `CyberSecurity` becomes `[[Cyber Security|CyberSecurity]]`, keeping your file names readable while maintaining your typing flow.
* **Typing Delay (Debounce):** The plugin waits until you finish typing a word before it formats it, preventing annoying cursor jumps or interruptions.
* **Minimum Word Length:** Set a minimum character limit so short terms (like `iOS` or `macOS`) aren't accidentally linked.
* **Smart Exclusions:** Automatically ignores text inside code blocks (\` \`\`) and YAML frontmatter (`---`).
* **Custom Regex:** Define your own linking rules! Easily automatically link Jira tickets (e.g., `PROJ-123`) or @mentions (e.g., `@john_doe`).

## 🚀 Installation

**Option 1: Community Plugins (Recommended)**
1. Open Obsidian **Settings** > **Community Plugins**.
2. Turn off "Restricted Mode".
3. Click **Browse** and search for "CamelCase Auto-Linker".
4. Click **Install**, then **Enable**.

**Option 2: Manual Installation**
1. Download the latest release from the GitHub Releases page.
2. Extract the `main.js` and `manifest.json` files.
3. Place them in your vault's plugins folder: `<vault>/.obsidian/plugins/camelcase-autolinker/`
4. Reload Obsidian and enable the plugin in Settings.

## ⚙️ How to Use

Once enabled, just start typing! 

If you type `KnowledgeBase`, the plugin will wait for you to hit space, and then instantly convert it to `[[Knowledge Base|KnowledgeBase]]`.

You can also convert entire old notes at once. Just press `Cmd/Ctrl + P` to open the command palette and run **Convert Patterns to WikiLinks**. You can map this to a custom hotkey in Obsidian's settings for even faster bulk conversions!
