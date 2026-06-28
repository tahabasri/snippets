---
name: VS Code Extension Patterns
description: Expert knowledge of VS Code Extension API patterns, TreeDataProvider implementation, and command registration
version: 1.0.0
---

# VS Code Extension Patterns Skill

This skill provides deep expertise in VS Code Extension API patterns, common implementations, and best practices for building robust VS Code extensions.

## Core Competencies

### 1. TreeDataProvider Implementation

Expert knowledge of implementing tree views in VS Code extensions:

```typescript
export class MyTreeProvider implements vscode.TreeDataProvider<TreeItem> {
  // Event emitter for refresh notifications
  private _onDidChangeTreeData = new vscode.EventEmitter<TreeItem | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  // Trigger refresh
  refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
  }

  // Convert data to tree item
  getTreeItem(element: TreeItem): vscode.TreeItem {
    const item = new vscode.TreeItem(
      element.label,
      element.children ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None
    );

    // Set icon using ThemeIcon for consistency
    item.iconPath = new vscode.ThemeIcon('file');

    // Add command for click action
    item.command = {
      command: 'extension.openItem',
      title: 'Open',
      arguments: [element]
    };

    // Set context value for context menu filtering
    item.contextValue = element.type;

    return item;
  }

  // Get children for a node
  async getChildren(element?: TreeItem): Promise<TreeItem[]> {
    if (!element) {
      return this.getRootItems();
    }
    return element.children || [];
  }
}
```

**Key Patterns:**
- Use `EventEmitter` for change notifications
- Implement `getTreeItem()` and `getChildren()` methods
- Set `contextValue` for context menu filtering
- Use `ThemeIcon` for built-in icons
- Attach commands to tree items for click actions
- Handle async data loading in `getChildren()`

### 2. Command Registration

Proper command registration patterns:

```typescript
export function activate(context: vscode.ExtensionContext) {
  // Register command
  const disposable = vscode.commands.registerCommand(
    'extension.myCommand',
    async (...args) => {
      try {
        // Command implementation
        vscode.window.showInformationMessage('Command executed!');
      } catch (error) {
        vscode.window.showErrorMessage(
          `Command failed: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }
  );

  // CRITICAL: Add to subscriptions for disposal
  context.subscriptions.push(disposable);
}
```

**Best Practices:**
- Always add disposables to `context.subscriptions`
- Handle errors and show user-friendly messages
- Use async/await for asynchronous operations
- Validate arguments before processing
- Provide meaningful error messages

### 3. Extension Lifecycle

Understanding extension activation and deactivation:

```typescript
// Activation
export async function activate(context: vscode.ExtensionContext) {
  console.log('Extension activating...');

  // Register providers
  const treeProvider = new MyTreeProvider();
  vscode.window.registerTreeDataProvider('myView', treeProvider);

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.refresh', () => {
      treeProvider.refresh();
    })
  );

  // Set up file watchers
  const watcher = vscode.workspace.createFileSystemWatcher('**/*.config');
  watcher.onDidChange(() => treeProvider.refresh());
  context.subscriptions.push(watcher);

  console.log('Extension activated successfully');
}

// Deactivation (cleanup)
export function deactivate() {
  console.log('Extension deactivating...');
  // Cleanup if needed (disposables auto-disposed)
}
```

**Activation Events:**
- `onStartupFinished` - Activate after VS Code loads (recommended)
- `*` - Activate immediately (use sparingly)
- `onCommand:` - Activate when command executed
- `onView:` - Activate when view opened
- `onLanguage:` - Activate for specific file types

### 4. Configuration Management

Working with VS Code settings:

```typescript
// Read configuration
const config = vscode.workspace.getConfiguration('myExtension');
const setting = config.get<string>('mySetting', 'defaultValue');

// Write configuration
await config.update('mySetting', newValue, vscode.ConfigurationTarget.Global);

// Listen for configuration changes
context.subscriptions.push(
  vscode.workspace.onDidChangeConfiguration(e => {
    if (e.affectsConfiguration('myExtension.mySetting')) {
      // Reload or update based on new setting
      treeProvider.refresh();
    }
  })
);
```

**Configuration Targets:**
- `Global` - User settings
- `Workspace` - Workspace settings
- `WorkspaceFolder` - Folder-specific settings

### 5. File System Watchers

Monitoring file changes:

```typescript
// Watch specific pattern
const watcher = vscode.workspace.createFileSystemWatcher(
  new vscode.RelativePattern(workspaceFolder, '.claude/**/*')
);

// Handle events
watcher.onDidCreate(uri => {
  console.log('File created:', uri.fsPath);
  treeProvider.refresh();
});

watcher.onDidChange(uri => {
  console.log('File changed:', uri.fsPath);
  treeProvider.refresh();
});

watcher.onDidDelete(uri => {
  console.log('File deleted:', uri.fsPath);
  treeProvider.refresh();
});

// CRITICAL: Dispose watcher
context.subscriptions.push(watcher);
```

### 6. User Interaction

Showing messages and prompts:

```typescript
// Information message
vscode.window.showInformationMessage('Operation successful!');

// Warning message
vscode.window.showWarningMessage('This action cannot be undone');

// Error message
vscode.window.showErrorMessage('Operation failed');

// Confirmation dialog
const answer = await vscode.window.showWarningMessage(
  'Delete this file?',
  { modal: true },
  'Delete',
  'Cancel'
);

if (answer === 'Delete') {
  // Proceed with deletion
}

// Input box
const input = await vscode.window.showInputBox({
  prompt: 'Enter name',
  placeHolder: 'my-file.ts',
  validateInput: (value) => {
    return value.length === 0 ? 'Name cannot be empty' : undefined;
  }
});

// Quick pick
const selection = await vscode.window.showQuickPick(
  ['Option 1', 'Option 2', 'Option 3'],
  { placeHolder: 'Select an option' }
);
```

### 7. WebView Panels

Creating custom UI panels:

```typescript
const panel = vscode.window.createWebviewPanel(
  'myView',
  'My View',
  vscode.ViewColumn.One,
  {
    enableScripts: true,
    retainContextWhenHidden: true
  }
);

// Set HTML content
panel.webview.html = getWebviewContent();

// Handle messages from webview
panel.webview.onDidReceiveMessage(
  message => {
    switch (message.command) {
      case 'save':
        // Handle save
        break;
    }
  },
  undefined,
  context.subscriptions
);

// Dispose
context.subscriptions.push(panel);
```

### 8. Context Menus

Adding context menu items:

In `package.json`:
```json
{
  "contributes": {
    "menus": {
      "view/item/context": [
        {
          "command": "extension.editItem",
          "when": "view == myView && viewItem == editableItem",
          "group": "inline"
        }
      ],
      "view/title": [
        {
          "command": "extension.refresh",
          "when": "view == myView",
          "group": "navigation"
        }
      ]
    }
  }
}
```

**When Clauses:**
- `view == myView` - Show only in specific view
- `viewItem == type` - Filter by tree item context value
- `viewItem =~ /pattern/` - Regex matching
- `!expression` - Negation
- `a && b` - Logical AND
- `a || b` - Logical OR

### 9. Status Bar Items

Creating status bar indicators:

```typescript
const statusBarItem = vscode.window.createStatusBarItem(
  vscode.StatusBarAlignment.Left,
  100 // Priority
);

statusBarItem.text = '$(check) Ready';
statusBarItem.tooltip = 'Extension status';
statusBarItem.command = 'extension.showStatus';
statusBarItem.show();

context.subscriptions.push(statusBarItem);

// Update dynamically
function updateStatus(text: string) {
  statusBarItem.text = `$(sync~spin) ${text}`;
}
```

### 10. Output Channels

Creating output channels for logging:

```typescript
const outputChannel = vscode.window.createOutputChannel('My Extension');

outputChannel.appendLine('Extension started');
outputChannel.appendLine(`Loaded ${items.length} items`);

// Show output panel
outputChannel.show();

// Dispose
context.subscriptions.push(outputChannel);
```

## Common Pitfalls to Avoid

### 1. Not Disposing Resources
```typescript
// Bad - memory leak
const watcher = vscode.workspace.createFileSystemWatcher('**/*');

// Good - properly disposed
const watcher = vscode.workspace.createFileSystemWatcher('**/*');
context.subscriptions.push(watcher);
```

### 2. Blocking the Extension Host
```typescript
// Bad - synchronous I/O
const content = fs.readFileSync(path, 'utf-8');

// Good - asynchronous
const content = await fs.promises.readFile(path, 'utf-8');
```

### 3. Bundling vscode Module
```javascript
// esbuild.mjs
export default {
  external: ['vscode'], // CRITICAL: Never bundle vscode
};
```

### 4. Ignoring Errors
```typescript
// Bad
treeProvider.refresh();

// Good
try {
  await loadData();
  treeProvider.refresh();
} catch (error) {
  vscode.window.showErrorMessage(`Failed to load data: ${error.message}`);
}
```

### 5. Hardcoding Paths
```typescript
// Bad
const configPath = '/Users/name/.claude/config.json';

// Good
import * as path from 'path';
const homeDir = process.env.HOME || process.env.USERPROFILE;
const configPath = path.join(homeDir, '.claude', 'config.json');
```

## Testing in Extension Development Host

1. Press F5 to launch Extension Development Host
2. New VS Code window opens with extension loaded
3. Set breakpoints in TypeScript code
4. Debug Console shows logs and errors
5. Restart with Cmd+Shift+F5 after code changes

## Resources

- [VS Code Extension API](https://code.visualstudio.com/api)
- [TreeDataProvider Guide](https://code.visualstudio.com/api/extension-guides/tree-view)
- [Extension Samples](https://github.com/microsoft/vscode-extension-samples)
- [Extension Manifest](https://code.visualstudio.com/api/references/extension-manifest)

## Usage

When working on VS Code extension code, this skill provides:
- Correct implementation patterns
- Best practices and conventions
- Common pitfall avoidance
- Proper error handling
- Resource disposal patterns
- Testing strategies