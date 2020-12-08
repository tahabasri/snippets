import * as vscode from 'vscode';
import { Commands } from './config/commands';
import { SnippetsProvider } from './provider/snippetsProvider';
import { DataAcess } from './data/dataAccess';
import { Snippet } from './interface/snippet';
import { EditSnippet } from './views/editSnippet';
import { EditSnippetFolder } from './views/editSnippetFolder';
import { SnippetService } from './service/snippetService';
import { UIUtility } from './utility/uiUtility';
import { Labels } from './config/Labels';

export function activate(context: vscode.ExtensionContext) {
	const snippetService = new SnippetService(new DataAcess(context.globalStorageUri.fsPath));
	const snippetsProvider = new SnippetsProvider(snippetService, context.extensionPath);

	let snippetsExplorer = vscode.window.createTreeView('snippetsExplorer', {
		treeDataProvider: snippetsProvider
	});

	vscode.commands.registerCommand(Commands.openSnippet, async (snippet) => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showInformationMessage(Labels.noOpenEditor);
			return;
		}
		// if command is not triggered from treeView, a snippet must be selected by final user
		if (!snippet) {
			snippet = await UIUtility.requestSnippetFromUser(snippetService.getAllSnippets());
		}
		if (!snippet) {
			return;
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
			vscode.window.showInformationMessage(Labels.noOpenTerminal);
			return;
		}
		// if command is not triggered from treeView, a snippet must be selected by final user
		if (!snippet) {
			snippet = await UIUtility.requestSnippetFromUser(snippetService.getAllSnippets());
		}
		if (!snippet) {
			return;
		}
		terminal.sendText(snippet.value);
	});

	vscode.commands.registerCommand(Commands.addSnippet, async (node) => {
		var text: string | undefined;

		const editor = vscode.window.activeTextEditor;
		// if no editor is open or editor has no text, get value from user
		if (!editor || editor.document.getText(editor.selection) === "") {
			// get snippet name
			text = await UIUtility.requestSnippetValue();
			if (!text || text.length === 0) {
				vscode.window.showWarningMessage(Labels.noValueGiven);
				return;
			}
		} else {
			text = editor.document.getText(editor.selection);
			if (text.length === 0) {
				vscode.window.showWarningMessage(Labels.noTextSelected);
				return;
			}
		}
		// get snippet name
		const name = await UIUtility.requestSnippetName();
		if (name === undefined || name === "") {
			vscode.window.showWarningMessage(Labels.snippetNameErrorMsg);
			return;
		}
		if (text === undefined || text === "") {
			vscode.window.showWarningMessage(Labels.snippetValueErrorMsg);
			return;
		}
		// When triggering the command with right-click the parameter node of type Tree Node will be tested.
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
			vscode.window.showWarningMessage(Labels.noClipboardContent);
			return;
		}
		// get snippet name
		const name = await UIUtility.requestSnippetName();
		if (name === undefined || name === "") {
			vscode.window.showWarningMessage(Labels.snippetNameErrorMsg);
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
		const name = await UIUtility.requestSnippetFolderName();
		if (name === undefined || name === "") {
			vscode.window.showWarningMessage(Labels.snippetFolderNameErrorMsg);
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
