import * as vscode from 'vscode';
import { SnippetsProvider } from './provider/snippetsProvider';
import { DataAcess } from './data/dataAccess';
import { Snippet } from './interface/snippet';

export function activate(context: vscode.ExtensionContext) {

	vscode.commands.registerCommand('snippets.openSnippet', (snippet) => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showInformationMessage("no editor is open");
			return;
		}
		editor.edit(edit => {
			edit.insert(editor.selection.start, snippet.value);
		});
	}
	);

	const snippetsProvider = new SnippetsProvider(new DataAcess(context.globalStorageUri.fsPath));

	//vscode.window.registerTreeDataProvider('snippetsExplorer', snippetsProvider);

	let snippetsExplorer = vscode.window.createTreeView('snippetsExplorer', {
		treeDataProvider: snippetsProvider
	});

	vscode.commands.registerCommand('snippetsExplorer.addSnippet', async (node) => {
		const PARENT_ID = 1;
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showWarningMessage("no editor is open");
			return;
		}
		const text = editor.document.getText(editor.selection);
		if (text.length === 0) {
			vscode.window.showWarningMessage("no text is selected");
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

	vscode.commands.registerCommand('snippetsExplorer.addSnippetFolder', async (node) => {
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

	vscode.commands.registerCommand('snippetsExplorer.editSnippet', (snippet: Snippet) => {
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

		panel.webview.html = getWebviewContent();

		// Handle messages from the webview
		panel.webview.onDidReceiveMessage(
			message => {
				switch (message.command) {
					case 'edit-snippet':
						console.log('Form returned ' + message);
						const {label, value} = message.data;
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

		function getWebviewContent() {
			return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>${snippet.label}</title>
			</head>
			<body>
				<form name="edit-snippet-form">
					<label for="snippet-label">Snippet Label:</label><br>
					<input type="text" id="snippet-label" value="${snippet.label}" required><br><br>
					<label for="snippet-value">Snippet Content:</label><br>
					<textarea name="snippet-value" rows="20" cols="75" required>${snippet.value}</textarea>
					<br/><input type="submit" value="Save">
				</form>
			
				<script>
					(function() {
						const vscode = acquireVsCodeApi();

						document.querySelector('form').addEventListener('submit', (e) => {
							e.preventDefault();
							const form = document.querySelector('form[name="edit-snippet-form"]');
							const snippetLabel = form.elements['snippet-label'].value;
							const snippetValue = form.elements['snippet-value'].value;

							vscode.postMessage({
								data: {
									label: snippetLabel,
									value: snippetValue
								},
								command: 'edit-snippet',
								text: 'New value '
							});
						});

						  
						// const form = document.getElementById("edit-snippet-form");
  
						// form.onsubmit = function (e) {
						// 	e.preventDefault();
						// 	vscode.postMessage({
						// 		command: 'alert',
						// 		text: '🐛  on line '
						// 	});
						// }
					}())
				</script>
			</body>
			</html>`;
		}
	});

	vscode.commands.registerCommand('snippetsExplorer.deleteSnippet', (snippet) => {
		console.log("Removing snippet");
		snippetsProvider.removeSnippet(snippet);
	});

	vscode.commands.registerCommand('snippetsExplorer.deleteSnippetFolder', (snippetFolder) => {
		console.log("Removing snippet folder");
		snippetsProvider.removeSnippet(snippetFolder);
	});

	vscode.commands.registerCommand('snippetsExplorer.refreshEntry', () =>
		snippetsProvider.refresh()
	);
}

export function deactivate() { }
