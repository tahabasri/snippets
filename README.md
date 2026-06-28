![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/tahabasri.snippets.svg?style=flat-square)
![Visual Studio Marketplace Installs](https://img.shields.io/visual-studio-marketplace/i/tahabasri.snippets.svg?style=flat-square)
![Visual Studio Marketplace Downloads](https://img.shields.io/visual-studio-marketplace/d/tahabasri.snippets.svg?style=flat-square)
![Visual Studio Marketplace Rating](https://img.shields.io/visual-studio-marketplace/r/tahabasri.snippets.svg?style=flat-square)
![GitHub Repo stars](https://img.shields.io/github/stars/tahabasri/snippets)
![GitHub Workflow Status (with event)](https://img.shields.io/github/actions/workflow/status/tahabasri/snippets/unit-tests.yml)
![The MIT License](https://img.shields.io/badge/license-MIT-orange.svg?style=flat-square)

# Snippets — Supercharge Snippets in VS Code and Cursor

Code snippets are valuable additions for anyone looking to save time during development. They simplify the process of entering repetitive code, such as loops, complex HTML structures, or reusable methods.

Visual Studio Code already provides robust support for snippets, including their appearance in IntelliSense, tab-completion, and a dedicated snippet picker (`Insert Snippet` in the Command Palette). This extension takes snippets to another level by introducing new features that enhance code snippet management.

## Getting Started

Install **Snippets** by one of the following options:
- Clicking `Install` on the banner above
- Searching for `Snippets` from the Extensions side bar in VS Code and Cursor
- Typing `ext install tahabasri.snippets` from the Command Palette in VS Code and Cursor

---

[Features](#features) | [Settings](#settings) | [FAQ](#faq) | [Known Issues](#known-issues) | [Release Notes](#release-notes) | [Feedback](#feedback) | [Credits](#credits)

## Features

Boost your productivity with a set of powerful features that enhance snippet management:

- [Create](#create) — Create Snippets easily with a few clicks.
- [Open](#open) — Open Snippets quickly from anywhere in VS Code and Cursor.
- [Search](#search) — Find your Snippet in 2 seconds or less.
- [Manage](#manage) — Organize your snippets freely, with no forced order, beyond editing and deleting.
- [Customize](#customize) — Personalize your Snippets to match your style.
- [Sync](#sync) — Various options for synchronizing your snippets across multiple devices and users.
- [Boost](#boost) — Supercharge your snippets to make them more developer-friendly.
- [AI Integration](#ai-integration) — Seamlessly work with AI assistants in VS Code and Cursor.

---

## Create

### Create Snippet from open editor

Select code in any open editor and save it as a Snippet in a single action — the current selection becomes the Snippet value.

<img src="https://raw.githubusercontent.com/tahabasri/snippets/main/images/features/01-new-snippet.gif" 
alt="Create Snippet">

### Create Snippet directly from the clipboard

Turn whatever you last copied into a Snippet without selecting anything in the editor, straight from your clipboard.

<img src="https://raw.githubusercontent.com/tahabasri/snippets/main/images/features/02-new-snippet-clipboard.gif" 
alt="Create Snippet from Clipboard">

### Create Snippet manually

Create an empty Snippet and type its content yourself — handy when the code isn't already in your editor or clipboard.

<img src="https://raw.githubusercontent.com/tahabasri/snippets/main/images/features/03-new-snippet-manual.gif" 
alt="Create Snippet Manually">

---

## Open

### Open Snippet with a single click

Click a Snippet in the Snippets view to insert its content at the cursor in the active editor.

<img src="https://raw.githubusercontent.com/tahabasri/snippets/main/images/features/05-open-snippet-click.gif" 
alt="Open Snippet">

### Drop Snippet directly into the editor

Drag a Snippet from the Snippets view and drop it exactly where you want it in the editor.

> You may need to hold `Shift` key while dragging to correctly drop the item in the editor.

<img src="https://raw.githubusercontent.com/tahabasri/snippets/main/images/features/063-drag-and-drop-into-editor.gif" 
alt="Open Snippet">

### Copy Snippet to Clipboard

Copy a Snippet's content to the clipboard to paste it wherever you need, inside or outside the editor.

<img src="https://raw.githubusercontent.com/tahabasri/snippets/main/images/features/10-copy-to-clipboard.jpg" 
alt="Copy Snippet to Clipboard">

### Insert Snippet directly into Terminal

Send a Snippet straight to the integrated terminal instead of the editor — useful for commands you run often.

> Enable `snippets.runCommandInTerminal` to have the inserted command executed automatically in the terminal.

<img src="https://raw.githubusercontent.com/tahabasri/snippets/main/images/features/08-open-snippet-terminal.gif" 
alt="Open Snippet in Terminal">

---

## Search

### Use IntelliSense to quickly access all your Snippets

Your Snippets appear as IntelliSense suggestions while you type, so you can insert them without leaving the keyboard.

> Suggestions are toggled with `snippets.showSuggestions` and triggered by the `snippets.triggerKey` character (default `>`). Labels are camel-cased in suggestions when `snippets.camelize` is enabled. More about **IntelliSense** [here](https://code.visualstudio.com/docs/editor/intellisense).

<img src="https://raw.githubusercontent.com/tahabasri/snippets/main/images/features/051-open-snippet-suggestion.gif" 
alt="Open Snippet using Suggestions">

### Search for Snippets using Command Palette

Fuzzy-search all your Snippets by name from the Command Palette and open the one you need.

<img src="https://raw.githubusercontent.com/tahabasri/snippets/main/images/features/07-open-snippet-palette.gif" 
alt="Open Snippets from Command Palette">

You can also search directly into the Snippets view similarly to the File Explorer.

<img src="https://raw.githubusercontent.com/tahabasri/snippets/main/images/features/11-native-search.jpg" 
alt="Native Search">

### Preview Snippets before insertion

Hover a suggestion to preview the Snippet's content before inserting it, so you always pick the right one.

<img src="https://raw.githubusercontent.com/tahabasri/snippets/main/images/features/006-preview.gif" 
alt="Preview Snippets">

---

## Manage

### Drag and drop Snippets from one folder to another

Reorganize your library by dragging Snippets and folders into any folder in the tree.

<img src="https://raw.githubusercontent.com/tahabasri/snippets/main/images/features/056-drag-and-drop.gif" 
alt="Drag and Drop Snippets">

### Reorder Snippets using Up and Down actions

Move a Snippet or folder up or down within its parent to arrange items in the exact order you want.

<img src="https://raw.githubusercontent.com/tahabasri/snippets/main/images/features/04-snippets-reorder.gif" 
alt="Reorder Snippets">

### Sort alphabetically a Snippets folder or all your Snippets

Sort a single folder or your whole library alphabetically in one click when you'd rather not order items by hand.

<img src="https://raw.githubusercontent.com/tahabasri/snippets/main/images/features/047-sort-snippets.gif" 
alt="Reorder Snippets">

### Action Buttons

The extension features enhanced action buttons throughout the interface for improved usability, making it easier to perform common operations with fewer clicks.

> When Action Buttons are enabled, they become the primary method for interacting with Snippets in the Tree view, replacing the default click behavior. Set `snippets.openButton` to open a Snippet in the editor/terminal from the action buttons instead of by clicking its name.

<img src="https://raw.githubusercontent.com/tahabasri/snippets/main/images/features/18-action-buttons.png" 
alt="Action Buttons">

---

## Customize

### Set icons for your folders

Assign an icon to a folder from the **Edit Folder** screen to recognize it at a glance in the tree.

<img src="https://raw.githubusercontent.com/tahabasri/snippets/main/images/features/051-folder-icons.gif" 
alt="Set Folder Icon">

### Color your folders

Give a folder a color from the **Edit Folder** screen to make it stand out in the tree. By default the color cascades to the snippets and subfolders nested inside it.

> Set `snippets.disableFolderColorCascade` to limit the color to the folder and the items directly inside it instead.

<img src="https://raw.githubusercontent.com/tahabasri/snippets/main/images/features/070-folder-colors.png" 
alt="Color your folders">

### Open folders collapsed by default

Folders can open collapsed so the tree stays compact, expanding one level at a time as you drill in instead of revealing the whole subtree at once.

> Enable `snippets.collapseFolders` to turn this on. This change requires a window restart.

### Add a description to your Snippet

Add a free-text description to a Snippet to remind yourself what it does and when to use it.

> Descriptions show when hovering on top of a Snippet and in IntelliSense.

<img src="https://raw.githubusercontent.com/tahabasri/snippets/main/images/features/064-description.gif" 
alt="Set Snippet Description">

### Add a prefix to your Snippet

Give a Snippet a short custom prefix to use as its IntelliSense shortcut instead of its full label.

> When displaying Snippets using IntelliSense, the custom prefix will be used instead of the original Snippet label. A prefix is a recommended shortcut for Snippets with long labels.

<img src="https://raw.githubusercontent.com/tahabasri/snippets/main/images/features/042-prefix.gif" 
alt="Set Snippet Prefix">

### Prefix all your Snippets

Set a single global prefix for every Snippet to distinguish them from other VS Code and Cursor snippets in IntelliSense.

- set a keyword for the setting `snippets.globalPrefix` (e.g `snipp`)
- suggestions coming from your custom Snippets will be prefixed in IntelliSense

> An [explicit prefix](#add-a-prefix-to-your-snippet) on a single Snippet overrides the Global Prefix setting.
> 
> For example, if the global prefix in your settings is set to `foo`, and a custom snippet is explicitly prefixed with `boo`, the latter will be displayed in IntelliSense as `boo`. All other snippets with no explicit prefix will be displayed as `foo`.

<img src="https://raw.githubusercontent.com/tahabasri/snippets/main/images/features/12-global-prefix.jpg" 
alt="Global Prefix">

### Redesigned snippet editor

The snippet editor uses a two-panel layout: the snippet value on one side and its properties (description, prefix, language, syntax resolving) on the other, making longer snippets easier to edit at a glance.

> Enable `snippets.expertMode` to always show the advanced options by default when editing a Snippet.

<img src="https://raw.githubusercontent.com/tahabasri/snippets/main/images/features/071-snippet-editor.png" 
alt="Redesigned snippet editor">

---

## Sync

### Import and Export Snippets using JSON files

Back up your whole library to a JSON file and import it back on another machine, or share it with teammates.

> Two import modes are available: **Import data** replaces all your global snippets with the imported ones (a backup is kept for rollback), while **Import Snippets into New Folder** adds the imported snippets under a dedicated `Imported Snippets` folder without overwriting anything you already have.

<img src="https://raw.githubusercontent.com/tahabasri/snippets/main/images/features/13-import-export.jpg" 
alt="Import and Export Snippets">

### Import VS Code Snippets to Cursor or Devin AI (aka Windsurf)

You can import your existing VS Code snippets directly to Cursor or Devin AI (aka Windsurf), combining the best snippets you collected for both editors.

### Sync Snippets between multiple devices

Starting with version 2.0 and up, *Snippets* supports backup using the **VS Code Settings Sync** feature. Your snippets are saved alongside your VS Code data no matter your operating system.

> **⚠ Experimental feature:** feel free to [file a bug](https://github.com/tahabasri/snippets/issues/new?labels=bug) as this is still an experimental change.

Check the [docs](https://code.visualstudio.com/docs/editor/settings-sync) to know more about the **Settings Sync** feature and how to use it.

### Sync your Snippets with a Version Control System

A large number of users utilize a VCS (e.g Git) and may need to associate a set of snippets with a specific project (e.g sharing project-specific snippets with team members). This can be achieved by enabling the `snippets.useWorkspaceFolder` setting. Once this option is enabled, the extension will read/write snippets to/from the `.vscode/snippets.json` file if it's available (the extension will prompt you to create the file the first time you enable this option).

> Note: Workspace snippets are excluded from synchronization via **Settings Sync**. You will be responsible for backing up the `.vscode/snippets.json` file using your favorite VCS.

---

## Boost

### Bind Snippets to Programming Languages

Snippets created from a language-specific editor/file keep a reference to the programming language used, and are suggested only in editors/files of the same programming language.

> A Snippet bound to a programming language gets an icon for that particular language natively.

<img src="https://raw.githubusercontent.com/tahabasri/snippets/main/images/features/038-language-scope.gif" 
alt="Bind Snippets to Languages">

You can explicitly set a programming language by appending the language file extension to the Snippet name at the creation prompt.

<img src="https://raw.githubusercontent.com/tahabasri/snippets/main/images/features/038-language-scope-by-name.gif" 
alt="Manually Bind Snippets to Languages">

#### Global Snippets

Snippets saved without a language scope are **global**: they appear in IntelliSense in every file, regardless of the active language. Pick `Global (all languages)` from the language picker on a Snippet to make it available everywhere.

> Plain Text files always show every Snippet, global or language-scoped, since they are the default language for new untitled files.

### Resolve Snippet Syntax

Snippets can contain VS Code snippet syntax (tab stops, placeholders, variables) that is resolved on insertion instead of being pasted literally.

> Learn more about the Snippet syntax [here](https://code.visualstudio.com/docs/editor/userdefinedsnippets#_snippet-syntax).
> 
> The **Resolve Snippet Syntax** option is disabled by default for new Snippets — you may need to edit the Snippet to enable it.

<img src="https://raw.githubusercontent.com/tahabasri/snippets/main/images/features/06-open-intelligent-snippet.gif" 
alt="Open Snippet with Variables">

---

## AI Integration

Seamlessly integrate your snippets with AI assistants in VS Code and Cursor:

### GitHub Copilot Chat

Use your snippets directly with GitHub Copilot Chat for enhanced productivity and context-aware code generation.

- Save prompts as snippets and use them directly in Github Copilot.

<img src="https://raw.githubusercontent.com/tahabasri/snippets/main/images/features/14-ai-ask-copilot.gif" 
alt="Ask Github Copilot using Snippets">

- Use code snippets directly in Github Copilot.

<img src="https://raw.githubusercontent.com/tahabasri/snippets/main/images/features/15-add-to-copilot-snippet.gif" 
alt="Add Code Snippets to Github Copilot">

### Cursor Pane

Integrate with Cursor's AI capabilities to get intelligent suggestions based on your snippets library.

<img src="https://raw.githubusercontent.com/tahabasri/snippets/main/images/features/17-ai-cursor.gif" 
alt="Add Code Snippets to Cursor Pane">

### Gemini Code Assist

Leverage Google's Gemini Code Assist alongside your snippets for more powerful code completion and generation.

<img src="https://raw.githubusercontent.com/tahabasri/snippets/main/images/features/16-ai-gemini.gif" 
alt="Use Snippets with Gemini Code Assist">

**Enjoy!**

---

## Settings

All settings are exposed under the `Snippets` section of VS Code Settings (`Ctrl`/`Cmd` + `,`). Settings noted as requiring a window restart take effect only after reloading the window.

| Setting | Default | Description |
| --- | --- | --- |
| `snippets.useWorkspaceFolder` | `false` | Save snippets to a `.vscode/snippets.json` file in the current workspace instead of (or in addition to) the global store. See [Sync with a VCS](#sync-your-snippets-with-a-version-control-system). |
| `snippets.showSuggestions` | `true` | Show Snippets as IntelliSense suggestions while typing. |
| `snippets.triggerKey` | `>` | Single character typed to trigger Snippets suggestions. *Requires a window restart.* |
| `snippets.globalPrefix` | *(empty)* | Default prefix applied to Snippets that have no explicit prefix; they are suggested as `prefix:snippetName` (max 5 characters). *Requires a window restart.* |
| `snippets.confirmBeforeDeletion` | `true` | Ask for confirmation before deleting a Snippet or folder. |
| `snippets.runCommandInTerminal` | `false` | Automatically execute a Snippet in the terminal when it is opened there. |
| `snippets.camelize` | `true` | Camel-case Snippet labels in suggestions (`awesome-and-cool snippet` → `awesomeAndCoolSnippet`). |
| `snippets.expertMode` | `false` | Show the advanced options by default when editing a Snippet. |
| `snippets.openButton` | `false` | Use the action buttons to open a Snippet in the editor/terminal, disabling open-on-name-click. |
| `snippets.collapseFolders` | `false` | Open folders collapsed, expanding one level at a time. *Requires a window restart.* |
| `snippets.disableFolderColorCascade` | `false` | Limit a folder's color to the folder and the items directly inside it, instead of cascading to all nested descendants. |

> `snippets.snippetsLocation` is **deprecated**. The default storage is now VS Code `globalState` (which syncs across machines); use `snippets.useWorkspaceFolder` for file-based, project-scoped storage instead.

---

## FAQ

### Q: Is there a limit on the number of snippets/folders I can create?
**A: There is no limit; your disk space is the only limitation.**

### Q: I'm feeling overwhelmed by multiple snippets. How can I better organize them?
**A: Check the [Manage](#manage) section for available organizational features including folders, drag-and-drop, reordering, and alphabetical sorting.**

### Q: Clicking "Request to Initialize File" does nothing. What should I do?
**A: If you're attempting to initialize the snippets file for a new [workspace](#sync-your-snippets-with-a-version-control-system) and nothing happens, ensure that the path to your current folder open in VS Code has the correct file permissions.**

### Q: Can I specify the cursor position so that, when the snippet is added, the cursor is moved to a particular position?
**A: Yes, you can enable `Resolve Snippet Syntax` for a particular snippet and use [VS Code Tab Stops](https://code.visualstudio.com/docs/editor/userdefinedsnippets#_tabstops).**

### Q: How do I use snippets with AI assistants?
**A: The extension integrates with GitHub Copilot Chat, Cursor Pane, and Gemini Code Assist. Check the [AI Integration](#ai-integration) section for details.**

### Q: I'm switching to Cursor/Devin AI (aka Windsurf). How do I import my existing VS Code snippets?
**A: You can import your VS Code snippets directly to Cursor/Devin AI (aka Windsurf) using the import feature. See the [Import VS Code Snippets to Cursor or Devin AI](#import-vs-code-snippets-to-cursor-or-devin-ai-aka-windsurf) section.**

## Known Issues

### Troubleshoot Snippets

- The new "Troubleshoot Snippets" option helps fix common issues, including:
  - Old snippets not appearing.
  - Moving snippets not working.
  - New snippets disappearing.

These issues often arise when two conflicting features, moving snippets and syncing them simultaneously, are in use. Fortunately, no snippets should be permanently lost. They are all stored locally, but inconsistencies in the database can make the snippets temporarily invisible.

<img src="https://raw.githubusercontent.com/tahabasri/snippets/main/images/issues/068-troubleshoot-snippets.gif" 
alt="Fix Snippets">

### Files Permissions on Windows

You may encounter some inconsistencies when dealing with snippets on Windows. The first thing to check is whether all related VS Code files are accessible and if any folder permissions are affecting accessibility.

## Release Notes

Check the [CHANGELOG](CHANGELOG.md) for full release notes.

## Feedback

* [Request a feature](https://github.com/tahabasri/snippets/issues/new?labels=enhancement).
* [File a bug](https://github.com/tahabasri/snippets/issues/new?labels=bug).

### Credits

- <span>GitHub Repo Social Preview Background Photo by <a href="https://unsplash.com/@jjying?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">JJ Ying</a> on <a href="https://unsplash.com/?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">Unsplash</a></span>
