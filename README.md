# Snippets for VSCode <!-- omit in toc -->

Code snippets are great additions to anyone who wants to save time while developing. They make it easier to enter repeating code, such as loops, complex HTML structures or reusable methods.

Visual Studio Code already has great support for snippets, including snippets appearance in IntelliSense `(Ctrl+Space)`, tab-completion, as well as a dedicated snippet picker `(Insert Snippet in the Command Palette)`.

This extension takes snippets to another level bringing new features which will improve managing code snippets.

#### Table of contents  <!-- omit in toc -->
- [Features](#features)
  - [Create Snippet](#create-snippet)
  - [Organize Snippets](#organize-snippets)
  - [Open Snippet](#open-snippet)
  - [Edit Snippet](#edit-snippet)
  - [Sync your Snippets](#sync-your-snippets)
- [Installation](#installation)
- [Known Issues](#known-issues)
- [Release Notes](#release-notes)
  - [1.2.0](#120)
  - [1.1.1](#111)
  - [1.1.0](#110)
  - [1.0.0](#100)
- [Feedback](#feedback)
- [Credits](#credits)

## Features

### Create Snippet

You can easily create a snippet from your open editor in VSCode.

<img src="https://raw.githubusercontent.com/tahabasri/snippets/main/images/features/01-new-snippet.gif" 
alt="Create Snippet">

You can add code snippet directly from outside VSCode via your clipboard.

<img src="https://raw.githubusercontent.com/tahabasri/snippets/main/images/features/02-new-snippet-clipboard.gif" 
alt="Create Snippet from Clipboard">

If you have a command in mind, just add it manually.

<img src="https://raw.githubusercontent.com/tahabasri/snippets/main/images/features/03-new-snippet-manual.gif" 
alt="Create Snippet Manually">

### Organize Snippets

You have the flexibility to reorder your snippets, there is no default order.

<img src="https://raw.githubusercontent.com/tahabasri/snippets/main/images/features/04-snippets-reorder.gif" 
alt="Reorder Snippets">

### Open Snippet

Add your snippet with a single click.

<img src="https://raw.githubusercontent.com/tahabasri/snippets/main/images/features/05-open-snippet-click.gif" 
alt="Open Snippet">

Your snippet has variables ? No worries.

<img src="https://raw.githubusercontent.com/tahabasri/snippets/main/images/features/06-open-intelligent-snippet.gif" 
alt="Open Snippet with Variables">

Lot of snippets ? Use Command Palette to quickly search for the wanted one.

<img src="https://raw.githubusercontent.com/tahabasri/snippets/main/images/features/07-open-snippet-palette.gif" 
alt="Open Snippets from Command Palette">

You have some commands for terminal ? Open them directly.

<img src="https://raw.githubusercontent.com/tahabasri/snippets/main/images/features/08-open-snippet-terminal.gif" 
alt="Open Snippet in Terminal">

### Edit Snippet

Edit your snippet easily and benefit from support of VSCode built-in [Snippet Syntax](https://code.visualstudio.com/docs/editor/userdefinedsnippets#_snippet-syntax).

<img src="https://raw.githubusercontent.com/tahabasri/snippets/main/images/features/09-edit-snippet.gif" 
alt="Edit Snippet">

### Backup your Snippets

#### Sync your Snippets with VSCode

Starting with version 2.0 and up, *Snippets* supports backup using **VSCode Settings Sync** feature. **This means that you will no more need to deal with snippets location in your file local machine**. Your snippets will be saved alongside your VSCode data no matter your operating system.

Check the [docs](https://code.visualstudio.com/docs/editor/settings-sync) to know more about Settings Sync feature and how to use it.

> Note: **Settings Sync** is still a VSCode preview feature.

#### Sync your Snippets with Version Control System

A huge number of users use a VCS (e.g Git) and they may want to bind snippets to a specific project (e.g share project specific snippets with team members). This is doable using the option `snippets.useWorkspaceFolder`. Once this option is enabled, the extension will read/write snippets from/in `.vscode/snippets.json` if that file is available (extension will ask to create the file for you the first time you enable the option).

> Note: Enabling the option `snippets.useWorkspaceFolder` will omit synchronization via **Settings Sync**. You'll be responsible of backing up the file `.vscode/snippets.json` using your favorite VSC.

**Enjoy!**

## Installation

Open VSCode and type ctrl+P, type `ext install tahabasri.snippets`.

## Known Issues

- **With version 1.2 and bellow**, there is an issue regarding permissions when trying to change snippets location. In Windows in particular, changing location to some restricted folders (e.g `C:\\`) will cause the extension to rollback to default path. This is due to lack of permissions on files from within VSCode itself.

**Upgrade to version 2+** to fix such issues related to filesystem.

<img src="https://raw.githubusercontent.com/tahabasri/snippets/main/images/issues/01-issue-windows-permissions.png" 
alt="Permissions issue">


## Release Notes

### 2.0.0

- Use `globalState` as default snippets location. No more files in filesystem !
- Enable sync using VSCode API.
- Polish the usability of option `snippets.useWorkspaceFolder`.
- Refresh snippets across multiple open workspaces in more efficient way.
- Add GitHub Actions to automate Code Analysis.

### 1.2.1

- Fix typos in code + ESLint warnings.

### 1.2.0

- Set workspace specific snippets and allows snippets to sync via git with your `.vscode` folder.

### 1.1.1

- Make default snippets path available after fresh installation.

### 1.1.0

- Sync snippets across open workspaces.
- Enable/disable snippets syntax resolving.
- Change default snippets location using settings property `snippets.snippetsLocation`.

### 1.0.0

Initial release of the extension.

## Feedback

* [Request a feature](https://github.com/tahabasri/snippets/issues/new?labels=enhancement).
* [File a bug](https://github.com/tahabasri/snippets/issues/new?labels=bug).

### Credits
- <div>Icons made by <a href="https://www.flaticon.com/authors/darius-dan" title="Darius Dan">Darius Dan</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>

- <span>Social Preview Background Photo by <a href="https://unsplash.com/@jjying?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">JJ Ying</a> on <a href="https://unsplash.com/?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">Unsplash</a></span>
