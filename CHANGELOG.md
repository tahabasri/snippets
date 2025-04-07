# Change Log
### 4.0.0

- [[#108](https://github.com/tahabasri/snippets/pull/108)]
  - Improved logging capabilities
  - Updated FAQ documentation
  - Fixed security vulnerabilities
- [[#110](https://github.com/tahabasri/snippets/pull/110)]
  - Fixed tooltip descriptions
  - Enforced value change before updating snippet/folder
- [[#111](https://github.com/tahabasri/snippets/pull/111)]
  - Removed duplicate languages in language selector
  - Sorted languages by alias for better navigation
- [[#112](https://github.com/tahabasri/snippets/pull/112)] Added action buttons for improved usability
- [[#115](https://github.com/tahabasri/snippets/pull/115)] Added ability to import VS Code snippets to cursor position
- [[#116](https://github.com/tahabasri/snippets/pull/116)]
  - Added integration with GitHub Copilot Chat
  - Added integration with Cursor AI Pane
  - Added integration with Gemini Code Assist

### 3.1.0

- [[#81](https://github.com/tahabasri/snippets/pull/81)] Added support for language scope with icons and auto-detect ✌.
- [[#83](https://github.com/tahabasri/snippets/pull/83)] Added support for alphabetical sort.
- [[#82](https://github.com/tahabasri/snippets/pull/82)] Added new action `Troubleshoot Snippets`.
- [[#51](https://github.com/tahabasri/snippets/pull/51)] Added support for folder icons.
- [[#76](https://github.com/tahabasri/snippets/pull/76)] Fixed tab key on Snippet content editor.
- [[#80](https://github.com/tahabasri/snippets/pull/80)] Added Snippet prefix and Global prefix in Settings.
- [[#79](https://github.com/tahabasri/snippets/pull/79)] Unchecked Syntax Resolving for new snippets.
- [[#78](https://github.com/tahabasri/snippets/pull/78)] Added description field to Snippets.
- [[#77](https://github.com/tahabasri/snippets/pull/77)] Expanded the Snippet tooltip size.
- [[#70](https://github.com/tahabasri/snippets/pull/70)] Added support for Drag and Drop into active editor.
- Added configurable `Camelize` to Snippets labels in IntelliSense (Checked by default).
- Added Developer Mode setting.
- Additional bug fixes.

### 3.0.0

- [[#56](https://github.com/tahabasri/snippets/pull/56)] Added support for drag and drop 🙌.
- Added new command for copying Snippet to clipboard.
- Made configurable the automatic execution of copied commands in terminal.
- Updated vulnerable dependencies.

### 2.2.2

- Update vulnerable dependencies.

### 2.2.1

- Update vulnerable dependencies.
### 2.2.0

- [[#37](https://github.com/tahabasri/snippets/pull/37)] Add feature to Import/Export Snippets.
- [[#43](https://github.com/tahabasri/snippets/pull/43)] Customize suggestions trigger key.
- [[#44](https://github.com/tahabasri/snippets/pull/44)] Show confirmation alert before removing snippet/folder.

### 2.1.1

- Update vulnerable dependencies.

### 2.1.0

- Provide snippets as suggestions via IntelliSense or by typing character '`>`'.
- Update vulnerable dependencies.

### 2.0.2

- Provide safer logic when dealing with restore process.
- Rename backup instead of deleting it.

### 2.0.0

- Use `globalState` as default snippets location. No more files in filesystem !
- Enable sync using VS Code API.
- Polish the usability of option `snippets.useWorkspaceFolder`.
- Refresh snippets across multiple open workspaces in more efficient way.
- Add GitHub Actions to automate Code Analysis.

### 1.2.1

- Fix typos in code + ESLint warnings.

### 1.2.0

- Set workspace specific snippets and allows snippets to sync via git with your `.vscode` folder.

### 1.1.1

- [[#18](https://github.com/tahabasri/snippets/pull/18)] Make default snippets path available after fresh installation.

### 1.1.0

- [[#16](https://github.com/tahabasri/snippets/pull/16)] Sync snippets across open workspaces.
- [[#8](https://github.com/tahabasri/snippets/pull/8)] Enable/disable snippets syntax resolving.
- [[#14](https://github.com/tahabasri/snippets/pull/14)] Change default snippets location using settings property `snippets.snippetsLocation`.

### 1.0.0

Initial release of the extension.