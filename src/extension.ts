import * as vscode from 'vscode';
import { Commands } from './config/commands';
import { SnippetsProvider } from './provider/snippetsProvider';
import { DataAcess } from './data/dataAccess';
import { Snippet } from './interface/snippet';
import { EditSnippet } from './views/editSnippet';
import { EditSnippetFolder } from './views/editSnippetFolder';
import { SnippetService } from './service/snippetService';

export function activate(context: vscode.ExtensionContext) {
	const snippetService = new SnippetService(new DataAcess(context.globalStorageUri.fsPath));
	const snippetsProvider = new SnippetsProvider(snippetService, context.extensionPath);

	vscode.commands.registerCommand(Commands.openSnippet, async (snippet) => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showInformationMessage("no editor is open");
			return;
		}
		if (!snippet) {
			let snippets= snippetService.getAllSnippets();

			interface CustomQuickPickItem extends vscode.QuickPickItem {
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

	vscode.commands.registerCommand(Commands.openSnippetInTerminal, async (snippet) => {
		const terminal = vscode.window.activeTerminal;
		if (!terminal) {
			vscode.window.showInformationMessage("no terminal is open");
			return;
		}
		if (!snippet) {
			let snippets = snippetService.getAllSnippets();

			interface CustomQuickPickItem extends vscode.QuickPickItem {
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
		terminal.sendText(snippet.value);
	});

	let snippetsExplorer = vscode.window.createTreeView('snippetsExplorer', {
		treeDataProvider: snippetsProvider
	});

	vscode.commands.registerCommand(Commands.addSnippet, async (node) => {
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
			snippetsProvider.addSnippet(name, text, Snippet.PARENT_ID);
		} else {
			const selectedItem = node ? node : snippetsExplorer.selection[0];
			if (selectedItem.folder && selectedItem.folder === true) {
				console.log("Selected item is a folder, appending snippet to the end of current folder");
				snippetsProvider.addSnippet(name, text, selectedItem.id);
			} else {
				console.log("Selected item is a snippet, appending snippet to the end of current folder");
				snippetsProvider.addSnippet(name, text, selectedItem.parentId ?? Snippet.PARENT_ID);
			}
		}
	});

	vscode.commands.registerCommand(Commands.addSnippetFromClipboard, async (node) => {
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
			snippetsProvider.addSnippet(name, clipboardContent, Snippet.PARENT_ID);
		} else {
			const selectedItem = node ? node : snippetsExplorer.selection[0];
			if (selectedItem.folder && selectedItem.folder === true) {
				console.log("Selected item is a folder, appending snippet to the end of current folder");
				snippetsProvider.addSnippet(name, clipboardContent, selectedItem.id);
			} else {
				console.log("Selected item is a snippet, appending snippet to the end of current folder");
				snippetsProvider.addSnippet(name, clipboardContent, selectedItem.parentId ?? Snippet.PARENT_ID);
			}
		}
	});

	vscode.commands.registerCommand(Commands.addSnippetFolder, async (node) => {
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
			snippetsProvider.addSnippetFolder(name, Snippet.PARENT_ID);
		} else {
			const selectedItem = node ? node : snippetsExplorer.selection[0];
			if (selectedItem.folder && selectedItem.folder === true) {
				console.log("Selected item is a folder, appending snippet to the end of current folder");
				snippetsProvider.addSnippetFolder(name, selectedItem.id);
			} else {
				console.log("Selected item is a snippet, appending snippet to the end of current folder");
				snippetsProvider.addSnippetFolder(name, selectedItem.parentId ?? Snippet.PARENT_ID);
			}
		}
	});

	vscode.commands.registerCommand(Commands.editSnippet, (snippet: Snippet) => {
		console.log(`Editing snippet [${snippet.label}]`);
		// Create and show a new webview for editing snippet
		new EditSnippet(context, snippet, snippetsProvider);
	});

	vscode.commands.registerCommand(Commands.editSnippetFolder, (snippet: Snippet) => {
		console.log(`Editing folder [${snippet.label}]`);
		// Create and show a new webview for editing snippet folder
		new EditSnippetFolder(context, snippet, snippetsProvider);
	});

	vscode.commands.registerCommand(Commands.deleteSnippet, (snippet) => {
		console.log("Removing snippet");
		snippetsProvider.removeSnippet(snippet);
	});

	vscode.commands.registerCommand(Commands.deleteSnippetFolder, (snippetFolder) => {
		console.log("Removing snippet folder");
		snippetsProvider.removeSnippet(snippetFolder);
	});

	vscode.commands.registerCommand(Commands.moveSnippetUp, (snippet) => {
		console.log("Moving Snippet Up");
		snippetsProvider.moveSnippetUp(snippet);
	});

	vscode.commands.registerCommand(Commands.moveSnippetDown, (snippet) => {
		console.log("Moving Snippet Down");
		snippetsProvider.moveSnippetDown(snippet);
	});

	vscode.commands.registerCommand(Commands.refresh, () =>
		snippetsProvider.refresh()
	);

	vscode.commands.registerCommand(Commands.test, async (snippet) => {
		// let result: any[] = [];
		// Snippet.flatten(snippetsProvider.snippets.children, result);
		// console.log(result);
	});
}

export function deactivate() { }
