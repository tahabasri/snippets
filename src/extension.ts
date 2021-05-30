import * as vscode from 'vscode';
import fs = require('fs');
import { Commands } from './config/commands';
import { SnippetsProvider } from './provider/snippetsProvider';
import { MementoDataAccess } from './data/mementoDataAccess';
import { Snippet } from './interface/snippet';
import { EditSnippet } from './views/editSnippet';
import { EditSnippetFolder } from './views/editSnippetFolder';
import { SnippetService } from './service/snippetService';
import { UIUtility } from './utility/uiUtility';
import { StringUtility } from './utility/stringUtility';
import { Labels } from './config/Labels';

export function activate(context: vscode.ExtensionContext) {
	context.globalState.setKeysForSync([MementoDataAccess.snippetsMementoPrefix]);

	const dataAccess = new MementoDataAccess(context.globalState);
	const snippetService = new SnippetService(dataAccess);
	const snippetsProvider = new SnippetsProvider(snippetService, context.extensionPath);

	// refresh windows whenever it gains focus
	// this will prevent de-sync between multiple open workspaces
	vscode.window.onDidChangeWindowState((event) => {
		if (event.focused) {
			snippetsProvider.refresh();
		}
	});

	// upgrade from 1.x to 2.x
	const snippetsPathConfigKey = 'snippetsLocation';
	let oldSnippetsPath: string = vscode.workspace.getConfiguration('snippets').get(snippetsPathConfigKey) || "";

	if(oldSnippetsPath && fs.existsSync(oldSnippetsPath)) {
		let rawData = fs.readFileSync(oldSnippetsPath, 'utf8');
		// true if is blank
		let noData = !rawData || /^\s*$/.test(rawData);

		// request data restore only if :
		// - there are no new snippets in new location (globalState)
		// - there is an old file locally with some snippets
		if(dataAccess.hasNoChild() && !noData) {
			const migrateData = Labels.migrateData;
			const discardData = Labels.discardData;
			vscode.window.showInformationMessage(
				StringUtility.formatString(Labels.snippetsMigrateRequest, oldSnippetsPath),
				...[migrateData, discardData])
			.then(selection => {
				switch (selection) {
					case migrateData:
						let oldSnippets : Snippet = JSON.parse(rawData);
						if (oldSnippets && oldSnippets.children && oldSnippets.children.length > 0) {
							let newSnippets : Snippet = dataAccess.load();
							newSnippets.children = oldSnippets.children;
							dataAccess.save(newSnippets);
							snippetsProvider.sync();
							vscode.window.showInformationMessage(StringUtility.formatString(Labels.snippetsDataRestored, 
								`${oldSnippets.children.length}`, oldSnippetsPath));
						}else{
							vscode.window.showInformationMessage(Labels.snippetsNoDataRestored);
						}
					case discardData:
						break;
				}
			});
		}
	}

	let snippetsExplorer = vscode.window.createTreeView('snippetsExplorer', {
		treeDataProvider: snippetsProvider,
		showCollapseAll: true
	});

	context.subscriptions.push(vscode.commands.registerCommand(Commands.openSnippet, async (snippet) => {
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
		// note: enable syntax resolving by default if property is not yet defined in JSON
		if (snippet.resolveSyntax === undefined) {
			snippet.resolveSyntax = true;
		}
		if (snippet.resolveSyntax) {
			vscode.commands.executeCommand("editor.action.insertSnippet", { snippet: snippet.value }
			);
		} else {
			editor.edit(edit => {
				edit.insert(editor.selection.start, snippet.value);
			});
		}

		vscode.window.showTextDocument(editor.document);
	}));

	context.subscriptions.push(vscode.commands.registerCommand(Commands.openSnippetInTerminal, async (snippet) => {
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
	}));

	context.subscriptions.push(vscode.commands.registerCommand(Commands.addSnippet, async (node) => {
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
			snippetsProvider.addSnippet(name, text, Snippet.rootParentId);
		} else {
			const selectedItem = node ? node : snippetsExplorer.selection[0];
			if (selectedItem.folder && selectedItem.folder === true) {
				snippetsProvider.addSnippet(name, text, selectedItem.id);
			} else {
				snippetsProvider.addSnippet(name, text, selectedItem.parentId ?? Snippet.rootParentId);
			}
		}
	}));

	context.subscriptions.push(vscode.commands.registerCommand(Commands.addSnippetFromClipboard, async (node) => {
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
			snippetsProvider.addSnippet(name, clipboardContent, Snippet.rootParentId);
		} else {
			const selectedItem = node ? node : snippetsExplorer.selection[0];
			if (selectedItem.folder && selectedItem.folder === true) {
				snippetsProvider.addSnippet(name, clipboardContent, selectedItem.id);
			} else {
				snippetsProvider.addSnippet(name, clipboardContent, selectedItem.parentId ?? Snippet.rootParentId);
			}
		}
	}));

	context.subscriptions.push(vscode.commands.registerCommand(Commands.addSnippetFolder, async (node) => {
		// get snippet name
		const name = await UIUtility.requestSnippetFolderName();
		if (name === undefined || name === "") {
			vscode.window.showWarningMessage(Labels.snippetFolderNameErrorMsg);
			return;
		}
		// When trigerring the command with right-click the parameter node of type Tree Node will be tested.
		// When the command is invoked via the menu popup, this node will be the highlighted node, and not the selected node, the latter will undefined.
		if (snippetsExplorer.selection.length === 0 && !node) {
			snippetsProvider.addSnippetFolder(name, Snippet.rootParentId);
		} else {
			const selectedItem = node ? node : snippetsExplorer.selection[0];
			if (selectedItem.folder && selectedItem.folder === true) {
				snippetsProvider.addSnippetFolder(name, selectedItem.id);
			} else {
				snippetsProvider.addSnippetFolder(name, selectedItem.parentId ?? Snippet.rootParentId);
			}
		}
	}));

	context.subscriptions.push(vscode.commands.registerCommand(Commands.editSnippet, (snippet: Snippet) => {
		// note: enable syntax resolving by default if property is not yet defined in JSON
		if (snippet.resolveSyntax === undefined) {
			snippet.resolveSyntax = true;
		}
		// Create and show a new webview for editing snippet
		new EditSnippet(context, snippet, snippetsProvider);
	}));

	context.subscriptions.push(vscode.commands.registerCommand(Commands.editSnippetFolder, (snippet: Snippet) => {
		// Create and show a new webview for editing snippet folder
		new EditSnippetFolder(context, snippet, snippetsProvider);
	}));

	context.subscriptions.push(vscode.commands.registerCommand(Commands.deleteSnippet, (snippet) => {
		snippetsProvider.removeSnippet(snippet);
	}));

	context.subscriptions.push(vscode.commands.registerCommand(Commands.deleteSnippetFolder, (snippetFolder) => {
		snippetsProvider.removeSnippet(snippetFolder);
	}));

	context.subscriptions.push(vscode.commands.registerCommand(Commands.moveSnippetUp, (snippet) => {
		snippetsProvider.moveSnippetUp(snippet);
	}));

	context.subscriptions.push(vscode.commands.registerCommand(Commands.moveSnippetDown, (snippet) => {
		snippetsProvider.moveSnippetDown(snippet);
	}));

	context.subscriptions.push(vscode.commands.registerCommand(Commands.refresh, () => snippetsProvider.refresh()));
}

export function deactivate() { }
