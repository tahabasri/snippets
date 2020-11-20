import * as vscode from 'vscode';
import { SnippetsProvider } from './provider/snippetsProvider';
import { DataAcess } from './data/dataAccess';
import { Snippet } from './interface/snippet';

export function activate(context: vscode.ExtensionContext) {

	// commands
	function openSnippet(value: string) {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showInformationMessage("no editor is open");
			return;
		}
		editor.edit(edit => {
			edit.insert(editor.selection.start, value);
		});
	}

	context.subscriptions.push(
		vscode.commands.registerCommand('snippets.openSnippet', openSnippet)
	);

	const snippetsProvider = new SnippetsProvider(new DataAcess(context.globalStorageUri.fsPath));

	//vscode.window.registerTreeDataProvider('snippetsExplorer', snippetsProvider);

	let snippetsExplorer = vscode.window.createTreeView('snippetsExplorer', {
		treeDataProvider: snippetsProvider
	});

	vscode.commands.registerCommand('snippets.testCommand', () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showInformationMessage("no editor is open");
			return;
		}
		if (snippetsExplorer.selection.length === 0) {
			console.log("No item is selected in the treeView, appending snippet to root of tree");
			snippetsProvider.addSnippet(editor.document.getText(editor.selection), 1);
		} else if (snippetsExplorer.selection[0]) {
			const selectedItem = snippetsExplorer.selection[0];
			if (selectedItem.children.length !== 0) {
				console.log("Selected item is a folder, appending snippet to the end of current folder");
				snippetsProvider.addSnippet(editor.document.getText(editor.selection), selectedItem.id);
			} else {
				console.log("Selected item is a snippet, appending snippet to the end of current folder");
				snippetsProvider.addSnippet(editor.document.getText(editor.selection), selectedItem.parentId ?? 1);
			}
		}
	});

	vscode.commands.registerCommand('snippetsExplorer.refreshEntry', () =>
		snippetsProvider.refresh()
	);
}

export function deactivate() { }
