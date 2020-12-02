# Snippets for VSCode

Code snippets are great additions to anyone who wants to save time while developing. They make it easier to enter repeating code, such as loops, complex HTML structures or reusable methods.

Visual Studio Code already has great support for snippets, including snippets appearance in IntelliSense `(Ctrl+Space)`, tab-completion, as well as a dedicated snippet picker `(Insert Snippet in the Command Palette)`.

This extension takes snippets to another level bringing new features which will improve managing code snippets.

## Features

### Create a Snippet

- You can easily create a snippet from your open editor in VSCode.
\!\[feature X\]\(images/feature-x.png\)

- You can add code snippet directly from outside VSCode via your clipboard.
\!\[feature X\]\(images/feature-x.png\)

### Organize Snippets

### Open a Snippet (terminal too)

### Edit a Snippet

### Create a Snippet

### Misc

- Quick preview


Describe specific features of your extension including screenshots of your extension in action. Image paths are relative to this README file.

For example if there is an image subfolder under your extension project workspace:

\!\[feature X\]\(images/feature-x.png\)

> Tip: Many popular extensions utilize animations. This is an excellent way to show off your extension! We recommend short, focused animations that are easy to follow.

## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

* `myExtension.enable`: enable/disable this extension
* `myExtension.thing`: set to `blah` to do something

## Installation

Open VSCode and type ctrl+P, type `ext install tahabasri.snippets`.

## Known Issues

- Provide snippets as completionItems (shown next to the built in snippets using ctrl+space).
  - When initializing the application, we can successfully populate VSCode with snippets prefixed with `snp:snippet-label`
  - Problem starts to show up when we update existing snippets as the code bellow do not override existing ones but duplicate them
```typescript
// see https://code.visualstudio.com/api/references/vscode-api#DocumentSelector
this.context.subscriptions.push(vscode.languages.registerCompletionItemProvider(
    '*', {
    provideCompletionItems() {
        return [
            {
                // see https://code.visualstudio.com/api/references/vscode-api#DocumentFilter
                label: `snp:${element.label.replace('\n', '').replace(' ', '-')}`,
                insertText: new vscode.SnippetString(element.value),
                detail: element.label,
                kind: vscode.CompletionItemKind.Snippet,
            },
        ];
    },
},
    // '' trigger character
));

// list completionItems
const list: any = await vscode.commands.executeCommand('vscode.executeCompletionItemProvider',
    vscode.window.activeTextEditor?.document.uri,
    new vscode.Position(0, 0));
console.log(list.items);
```

Calling out known issues can help limit users opening duplicate issues against your extension.

## Release Notes

Users appreciate release notes as you update your extension.

### 1.0.0

Initial release of ...

### 1.0.1

Fixed issue #.

### 1.1.0

Added features X, Y, and Z.

-----------------------------------------------------------------------------------------------------------

## Working with Markdown

**Note:** You can author your README using Visual Studio Code.  Here are some useful editor keyboard shortcuts:

* Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux)
* Toggle preview (`Shift+CMD+V` on macOS or `Shift+Ctrl+V` on Windows and Linux)
* Press `Ctrl+Space` (Windows, Linux) or `Cmd+Space` (macOS) to see a list of Markdown snippets

### Credits
<div>Icons made by <a href="https://www.flaticon.com/authors/darius-dan" title="Darius Dan">Darius Dan</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>

### For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**
