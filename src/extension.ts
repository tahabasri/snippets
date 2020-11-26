import * as vscode from 'vscode';
import { SnippetsProvider } from './provider/snippetsProvider';
import { DataAcess } from './data/dataAccess';
import { Snippet } from './interface/snippet';
import { EditSnippet } from './views/editSnippet';
import { EditSnippetFolder } from './views/editSnippetFolder';

export function activate(context: vscode.ExtensionContext) {

	vscode.commands.registerCommand('snippetsCmd.openSnippet', async (snippet) => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showInformationMessage("no editor is open");
			return;
		}
		if (!snippet) {
			let snippets: Snippet[] = [];
			Snippet.flatten(snippetsProvider.snippets.children, snippets);

			interface CustomQuickPickItem extends vscode.QuickPickItem{
				label: string;
				detail: string,
				value: Snippet
			}

			const arr: CustomQuickPickItem[] = snippets.map(s => {
				return {
					label: s.label,
					detail: s.value?.slice(0, 10) ?? "",
					value: s
				};
			});

			const selection = await vscode.window.showQuickPick(arr, {
				placeHolder: 'Select a snippet which should be opened'
			});

			if (
				!selection ||
				!selection.value) {
				console.log(`No valid selection made!`);
				return;
			}

			// refer to selected snippet
			snippet = selection.value;
		}
		vscode.commands.executeCommand("editor.action.insertSnippet",
			{
				snippet: snippet.value
			}
		);
		vscode.window.showTextDocument(editor.document);
	});

	vscode.commands.registerCommand('snippetsCmd.openSnippetInTerminal', async (snippet) => {
		const termianl = vscode.window.activeTerminal;
		if (!termianl) {
			vscode.window.showInformationMessage("no terminal is open");
			return;
		}
		if (!snippet) {
			let snippets: Snippet[] = [];
			Snippet.flatten(snippetsProvider.snippets.children, snippets);

			interface CustomQuickPickItem extends vscode.QuickPickItem{
				label: string;
				detail: string,
				value: Snippet
			}

			const arr: CustomQuickPickItem[] = snippets.map(s => {
				return {
					label: s.label,
					detail: s.value?.slice(0, 10) ?? "",
					value: s
				};
			});

			const selection = await vscode.window.showQuickPick(arr, {
				placeHolder: 'Select a snippet which should be opened'
			});

			if (
				!selection ||
				!selection.value) {
				console.log(`No valid selection made!`);
				return;
			}

			// refer to selected snippet
			snippet = selection.value;
		}
		termianl.sendText(snippet.value);
	});

	const snippetsProvider = new SnippetsProvider(new DataAcess(context.globalStorageUri.fsPath), context);

	//vscode.window.registerTreeDataProvider('snippetsExplorer', snippetsProvider);

	let snippetsExplorer = vscode.window.createTreeView('snippetsExplorer', {
		treeDataProvider: snippetsProvider
	});

	vscode.commands.registerCommand('snippetsCmd.addSnippet', async (node) => {
		const PARENT_ID = 1;
		var text: string | undefined;

		const editor = vscode.window.activeTextEditor;
		// if no editor is open or editor has no text, get value from user
		if (!editor || editor.document.getText(editor.selection) === "") {
			// get snippet name
			text = await vscode.window.showInputBox({
				prompt: 'Snippet Value',
				placeHolder: 'An example: <div>my cool div</div>',
				validateInput: text => {
					return text === "" ? 'Snippet value should not be empty' : null;
				}
			});
			if (!text || text.length === 0) {
				vscode.window.showWarningMessage("no text was given");
				return;
			}
		} else {
			text = editor.document.getText(editor.selection);
			if (text.length === 0) {
				vscode.window.showWarningMessage("no text is selected");
				return;
			}
		}
		// get snippet name
		const name = await vscode.window.showInputBox({
			prompt: 'Snippet Name',
			placeHolder: 'Some examples: Custom Navbar, CSS Alert Style, etc.',
			validateInput: text => {
				return text === "" ? 'Snippet name should not be empty' : null;
			}
		});
		if (name === undefined || name === "") {
			vscode.window.showWarningMessage("Snippet must have a non-empty name.");
			return;
		}
		if (text === undefined || text === "") {
			vscode.window.showWarningMessage("Snippet must have a non-empty value.");
			return;
		}
		// When trigerring the command with right-click the parameter node of type Tree Node will be tested.
		// When the command is invoked via the menu popup, this node will be the highlighted node, and not the selected node, the latter will undefined.
		if (snippetsExplorer.selection.length === 0 && !node) {
			console.log("No item is selected nor highlighted in the treeView, appending snippet to root of tree");
			snippetsProvider.addSnippet(name, text, PARENT_ID);
		} else {
			const selectedItem = node ? node : snippetsExplorer.selection[0];
			if (selectedItem.folder && selectedItem.folder === true) {
				console.log("Selected item is a folder, appending snippet to the end of current folder");
				snippetsProvider.addSnippet(name, text, selectedItem.id);
			} else {
				console.log("Selected item is a snippet, appending snippet to the end of current folder");
				snippetsProvider.addSnippet(name, text, selectedItem.parentId ?? PARENT_ID);
			}
		}
	});

	vscode.commands.registerCommand('snippetsCmd.addSnippetFromClipboard', async (node) => {
		const PARENT_ID = 1;
		let clipboardContent = await vscode.env.clipboard.readText();
		if (!clipboardContent || clipboardContent.trim() === "") {
			vscode.window.showWarningMessage("no content in your clipboard");
			return;
		}
		// get snippet name
		const name = await vscode.window.showInputBox({
			prompt: 'Snippet Name',
			placeHolder: 'Some examples: Custom Navbar, CSS Alert Style, etc.',
			validateInput: text => {
				return text === "" ? 'Snippet name should not be empty' : null;
			}
		});
		if (name === undefined || name === "") {
			vscode.window.showWarningMessage("Snippet must have a non-empty name.");
			return;
		}
		// When trigerring the command with right-click the parameter node of type Tree Node will be tested.
		// When the command is invoked via the menu popup, this node will be the highlighted node, and not the selected node, the latter will undefined.
		if (snippetsExplorer.selection.length === 0 && !node) {
			console.log("No item is selected nor highlighted in the treeView, appending snippet to root of tree");
			snippetsProvider.addSnippet(name, clipboardContent, PARENT_ID);
		} else {
			const selectedItem = node ? node : snippetsExplorer.selection[0];
			if (selectedItem.folder && selectedItem.folder === true) {
				console.log("Selected item is a folder, appending snippet to the end of current folder");
				snippetsProvider.addSnippet(name, clipboardContent, selectedItem.id);
			} else {
				console.log("Selected item is a snippet, appending snippet to the end of current folder");
				snippetsProvider.addSnippet(name, clipboardContent, selectedItem.parentId ?? PARENT_ID);
			}
		}
	});

	vscode.commands.registerCommand('snippetsCmd.addSnippetFolder', async (node) => {
		const PARENT_ID = 1;
		// get snippet name
		const name = await vscode.window.showInputBox({
			prompt: 'Snippet Folder Name',
			placeHolder: 'Some examples: Alerts, JS Snippets, etc.',
			validateInput: text => {
				return text === "" ? 'Folder name should not be empty' : null;
			}
		});
		if (name === undefined || name === "") {
			vscode.window.showWarningMessage("Snippet folder must have a non-empty name.");
			return;
		}
		// When trigerring the command with right-click the parameter node of type Tree Node will be tested.
		// When the command is invoked via the menu popup, this node will be the highlighted node, and not the selected node, the latter will undefined.
		if (snippetsExplorer.selection.length === 0 && !node) {
			console.log("No item is selected in the treeView, appending folder to root of tree");
			//snippetsProvider.addSnippetFolder();
		} else {
			const selectedItem = node ? node : snippetsExplorer.selection[0];
			if (selectedItem.folder && selectedItem.folder === true) {
				console.log("Selected item is a folder, appending snippet to the end of current folder");
				snippetsProvider.addSnippetFolder(name, selectedItem.id);
			} else {
				console.log("Selected item is a snippet, appending snippet to the end of current folder");
				snippetsProvider.addSnippetFolder(name, selectedItem.parentId ?? PARENT_ID);
			}
		}
	});

	vscode.commands.registerCommand('snippetsCmd.editSnippet', (snippet: Snippet) => {
		console.log(`Editing snippet [${snippet.label}]`);
		// Create and show a new webview for editing snippet
		const panel = vscode.window.createWebviewPanel(
			'editSnippet', // Identifies the type of the webview. Used internally
			`Edit Snippet [${snippet.label}]`, // Title of the panel displayed to the user
			vscode.ViewColumn.One, // Editor column to show the new webview panel in.
			{
				enableScripts: true,
				retainContextWhenHidden: true
			}
		);

		panel.webview.html = EditSnippet.getWebviewContent(snippet);

		// Handle messages from the webview
		panel.webview.onDidReceiveMessage(
			message => {
				switch (message.command) {
					case 'edit-snippet':
						console.log('Form returned ' + message);
						const { label, value } = message.data;
						// call provider only if there is data change
						if (label) {
							snippet.label = label;
						}
						if (value) {
							snippet.value = value;
						}
						snippetsProvider.editSnippet(snippet);
						panel.dispose();
						return;
				}
			},
			undefined,
			context.subscriptions
		);
	});

	vscode.commands.registerCommand('snippetsCmd.editSnippetFolder', (snippet: Snippet) => {
		console.log(`Editing folder [${snippet.label}]`);
		// Create and show a new webview for editing snippet
		const panel = vscode.window.createWebviewPanel(
			'editSnippetFolder', // Identifies the type of the webview. Used internally
			`Edit Folder [${snippet.label}]`, // Title of the panel displayed to the user
			vscode.ViewColumn.One, // Editor column to show the new webview panel in.
			{
				enableScripts: true,
				retainContextWhenHidden: true
			}
		);

		panel.webview.html = EditSnippetFolder.getWebviewContent(snippet);

		// Handle messages from the webview
		panel.webview.onDidReceiveMessage(
			message => {
				switch (message.command) {
					case 'edit-folder':
						console.log('Form returned ' + message);
						const label = message.data.label;
						// call provider only if there is data change
						if (label) {
							snippet.label = label;
						}
						snippetsProvider.editSnippetFolder(snippet);
						panel.dispose();
						return;
				}
			},
			undefined,
			context.subscriptions
		);
	});

	vscode.commands.registerCommand('snippetsCmd.deleteSnippet', (snippet) => {
		console.log("Removing snippet");
		snippetsProvider.removeSnippet(snippet);
	});

	vscode.commands.registerCommand('snippetsCmd.deleteSnippetFolder', (snippetFolder) => {
		console.log("Removing snippet folder");
		snippetsProvider.removeSnippet(snippetFolder);
	});

	vscode.commands.registerCommand('snippetsCmd.moveSnippetUp', (snippet) => {
		console.log("Moving Snippet Up");
		snippetsProvider.moveSnippetUp(snippet);
	});

	vscode.commands.registerCommand('snippetsCmd.moveSnippetDown', (snippet) => {
		console.log("Moving Snippet Down");
		snippetsProvider.moveSnippetDown(snippet);
	});

	vscode.commands.registerCommand('snippetsCmd.refreshEntry', () =>
		snippetsProvider.refresh()
	);

	vscode.commands.registerCommand('snippetsCmd.test', async (snippet) => {
		let result: any[] = [];
		Snippet.flatten(snippetsProvider.snippets.children, result);
		console.log(result);
	});
}

export function deactivate() { }
