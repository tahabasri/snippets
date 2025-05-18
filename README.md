![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/tahabasri.snippets.svg?style=flat-square)
![Visual Studio Marketplace Installs](https://img.shields.io/visual-studio-marketplace/i/tahabasri.snippets.svg?style=flat-square)
![Visual Studio Marketplace Downloads](https://img.shields.io/visual-studio-marketplace/d/tahabasri.snippets.svg?style=flat-square)
![Visual Studio Marketplace Rating](https://img.shields.io/visual-studio-marketplace/r/tahabasri.snippets.svg?style=flat-square)
![GitHub Repo stars](https://img.shields.io/github/stars/tahabasri/snippets)
![GitHub Workflow Status (with event)](https://img.shields.io/github/actions/workflow/status/tahabasri/snippets/unit-tests.yml)
![The MIT License](https://img.shields.io/badge/license-MIT-orange.svg?style=flat-square)

# Snippets — Supercharge Snippets in VS Code

Code snippets are valuable additions for anyone looking to save time during development. They simplify the process of entering repetitive code, such as loops, complex HTML structures, or reusable methods.

Visual Studio Code already provides robust support for snippets, including their appearance in IntelliSense, tab-completion, and a dedicated snippet picker (`Insert Snippet` in the Command Palette). This extension takes snippets to another level by introducing new features that enhance code snippet management.

## Getting Started

Install **Snippets** by one of the following options:
- Clicking `Install` on the banner above
- Searching for `Snippets` from the Extensions side bar in VS Code
- Typing `ext install tahabasri.snippets` from the Command Palette in VS Code

---

[Features](#features) | [FAQ](#faq) | [Known Issues](#known-issues) | [Release Notes](#release-notes) | [Feedback](#feedback) | [Credits](#credits)

## Features

Boost your productivity with a set of powerful features that enhance snippet management:

- [Create](#create) — Create Snippets easily with a few clicks.
- [Open](#open) — Open Snippets quickly from anywhere in VS Code.
- [Search](#search) — Find your Snippet in 2 seconds or less.
- [Manage](#manage) — Organize your snippets freely, with no forced order, beyond editing and deleting.
- [Customize](#customize) — Personalize your Snippets to match your style.
- [Sync](#sync) — Various options for synchronizing your snippets across multiple devices and users.
- [Boost](#boost) — Supercharge your snippets to make them more developer-friendly.
- [AI Integration](#ai-integration) — Seamlessly work with AI assistants in VS Code.

## Create

### Create Snippet from open editor

<img src="https://raw.githubusercontent.com/tahabasri/snippets/main/images/features/01-new-snippet.gif" 
alt="Create Snippet">

### Create Snippet directly from the clipboard

<img src="https://raw.githubusercontent.com/tahabasri/snippets/main/images/features/02-new-snippet-clipboard.gif" 
alt="Create Snippet from Clipboard">

### Create Snippet manually

<img src="https://raw.githubusercontent.com/tahabasri/snippets/main/images/features/03-new-snippet-manual.gif" 
alt="Create Snippet Manually">


## Open

### Open Snippet with a single click

<img src="https://raw.githubusercontent.com/tahabasri/snippets/main/images/features/05-open-snippet-click.gif" 
alt="Open Snippet">

### Drop Snippet directly into the editor

> You may need to hold `Shift` key while dragging to correctly drop the item in the editor.

<img src="https://raw.githubusercontent.com/tahabasri/snippets/main/images/features/063-drag-and-drop-into-editor.gif" 
alt="Open Snippet">

### Copy Snippet to Clipboard

<img src="https://raw.githubusercontent.com/tahabasri/snippets/main/images/features/10-copy-to-clipboard.jpg" 
alt="Copy Snippet to Clipboard">

### Insert Snippet directly into Terminal

<img src="https://raw.githubusercontent.com/tahabasri/snippets/main/images/features/08-open-snippet-terminal.gif" 
alt="Open Snippet in Terminal">

## Search

### Use IntelliSense to quickly access all your Snippets

> You can set a special key to trigger IntelliSense from the extension settings. Default key is `>`. More about **IntelliSense** [here](https://code.visualstudio.com/docs/editor/intellisense).

<img src="https://raw.githubusercontent.com/tahabasri/snippets/main/images/features/051-open-snippet-suggestion.gif" 
alt="Open Snippet using Suggestions">

### Search for Snippets using Command Palette

<img src="https://raw.githubusercontent.com/tahabasri/snippets/main/images/features/07-open-snippet-palette.gif" 
alt="Open Snippets from Command Palette">

You can also search directly into the Snippets view similarly to the File Explorer.

<img src="https://raw.githubusercontent.com/tahabasri/snippets/main/images/features/11-native-search.jpg" 
alt="Native Search">

### Preview Snippets before insertion

<img src="https://raw.githubusercontent.com/tahabasri/snippets/main/images/features/006-preview.gif" 
alt="Preview Snippets">

## Manage

### Drag and drop Snippets from one folder to another

<img src="https://raw.githubusercontent.com/tahabasri/snippets/main/images/features/056-drag-and-drop.gif" 
alt="Drag and Drop Snippets">

### Reorder Snippets using Up and Down actions

<img src="https://raw.githubusercontent.com/tahabasri/snippets/main/images/features/04-snippets-reorder.gif" 
alt="Reorder Snippets">

### Sort alphabetically a Snippets folder or all your Snippets

<img src="https://raw.githubusercontent.com/tahabasri/snippets/main/images/features/047-sort-snippets.gif" 
alt="Reorder Snippets">

### Action Buttons

The extension now features enhanced action buttons throughout the interface for improved usability, making it easier to perform common operations with fewer clicks.

## Customize
### Set icons for your folders

<img src="https://raw.githubusercontent.com/tahabasri/snippets/main/images/features/051-folder-icons.gif" 
alt="Set Folder Icon">

### Add a description to your Snippet

> Descriptions show when hovering on top of a Snippet and in IntelliSense.

<img src="https://raw.githubusercontent.com/tahabasri/snippets/main/images/features/064-description.gif" 
alt="Set Snippet Description">

### Add a prefix to your Snippet

> When displaying Snippets using IntelliSense, custom prefix will be used instead of the original Snippet label. A prefix is a recommended shortcut for Snippets with long labels.

<img src="https://raw.githubusercontent.com/tahabasri/snippets/main/images/features/042-prefix.gif" 
alt="Set Snippet Prefix">

### Prefix all your Snippets

You can set a prefix for all your snippets to distinguish them from other VS Code snippets.
- set a keyword for the setting `Snippets: Global Prefix` e.g `snipp`
- suggestions coming from your custom Snippets will be prefixed in IntelliSense 

> An [explicit prefix](#add-a-prefix-to-your-snippet) in a single Snippet will override Global Prefix settings.
> 
> For example, if the global prefix in your settings is set to `foo`, and a custom snippet is explicitly prefixed with `boo`, the latter will be displayed in IntelliSense as `boo`. All other snippets with no explicit prefix will be displayed as `foo`.

<img src="https://raw.githubusercontent.com/tahabasri/snippets/main/images/features/12-global-prefix.jpg" 
alt="Global Prefix">


## Sync

### Import and Export Snippets using JSON files

<img src="https://raw.githubusercontent.com/tahabasri/snippets/main/images/features/13-import-export.jpg" 
alt="Import and Export Snippets">

### Import VS Code Snippets to Cursor or Windsurf

You can import your existing VS Code snippets directly to Cursor or Windsurf combining the best snippets you collected for both editors.

### Sync Snippets between multiple devices

> **⚠ Experimental feature:** feel free to [file a bug](https://github.com/tahabasri/snippets/issues/new?labels=bug) as this is still an experimental change.

Starting with version 2.0 and up, *Snippets* supports backup using **VS Code Settings Sync** feature. Your snippets will be saved alongside your VS Code data no matter your operating system.

Check the [docs](https://code.visualstudio.com/docs/editor/settings-sync) to know more about **Settings Sync** feature and how to use it.

### Sync your Snippets with a Version Control System

A large number of users utilize a VCS (e.g Git) and may need to associate a set of snippets with a specific project (e.g sharing project-specific snippets with team members). This can be achieved by enabling the `snippets.useWorkspaceFolder` setting. Once this option is enabled, the extension will read/write snippets to/from the `.vscode/snippets.json` file if it's available (the extension will prompt you to create the file the first time you enable this option).

> Note: Workspace snippets are excluded from synchronization via **Settings Sync**. You will be responsible for backing up the `.vscode/snippets.json` file using your favorite VSC.


## Boost

### Bind Snippets to Programming Languages

Snippets created from a language specific editor/file will keep reference of the programming language used. The same Snippet will be suggested only in editors/files of same programming language.

> A Snippet bound to a programming language will get an icon for that particular language natively.

<img src="https://raw.githubusercontent.com/tahabasri/snippets/main/images/features/038-language-scope.gif" 
alt="Bind Snippets to Languages">

You can explicitly set a programming language by appending the language file extension to the Snippet name at the creation prompt.

<img src="https://raw.githubusercontent.com/tahabasri/snippets/main/images/features/038-language-scope-by-name.gif" 
alt="Manually Bind Snippets to Languages">

### Resolve Snippet Syntax

> Learn more about the Snippet syntax [here](https://code.visualstudio.com/docs/editor/userdefinedsnippets#_snippet-syntax).
> 
> Option to **Resolve Snippet Syntax** is disabled by default for new Snippets, you may need to edit the Snippet to enable it.

<img src="https://raw.githubusercontent.com/tahabasri/snippets/main/images/features/06-open-intelligent-snippet.gif" 
alt="Open Snippet with Variables">

## AI Integration

Seamlessly integrate your snippets with AI assistants in VS Code:

### GitHub Copilot Chat

Use your snippets directly with GitHub Copilot Chat for enhanced productivity and context-aware code generation.

- Save prompts as snippets and use them directly in Github Copilot.

<img src="https://raw.githubusercontent.com/tahabasri/snippets/main/images/features/14-ai-ask-copilot.gif" 
alt="Ask Github Copilot using Snippets">

- Use code snippets directly in Github Copilot

<img src="https://raw.githubusercontent.com/tahabasri/snippets/main/images/features/15-add-to-copilot-snippet.gif" 
alt="Add Code Snippets to Github Copilot">

### Cursor AI Pane

Integrate with Cursor's AI capabilities to get intelligent suggestions based on your snippets library.

<img src="https://raw.githubusercontent.com/tahabasri/snippets/main/images/features/17-ai-cursor.gif" 
alt="Add Code Snippets to Cursor AI Pane">

### Gemini Code Assist

Leverage Google's Gemini Code Assist alongside your snippets for more powerful code completion and generation.

<img src="https://raw.githubusercontent.com/tahabasri/snippets/main/images/features/16-ai-gemini.gif" 
alt="Use Snippets with Gemini Code Assist">

**Enjoy!**

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
**A: The extension now integrates with GitHub Copilot Chat, Cursor AI Pane, and Gemini Code Assist. Check the [AI Integration](#ai-integration) section for details.**

### Q: I'm switching to Cursor/Windsurf. How do I import my existing VS Code snippets?
**A: You can import your VS Code snippets directly to Cursor/Windsurf using the import feature. See the [Import VS Code Snippets to Cursor Position](#import-vs-code-snippets-to-cursor-or-windsurf) section.**

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
