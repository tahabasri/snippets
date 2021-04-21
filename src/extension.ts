import * as vscode from 'vscode';
import fs = require('fs');
import { Commands } from './config/commands';
import { SnippetsProvider } from './provider/snippetsProvider';
import { DataAccess } from './data/dataAccess';
import { Snippet } from './interface/snippet';
import { EditSnippet } from './views/editSnippet';
import { EditSnippetFolder } from './views/editSnippetFolder';
import { SnippetService } from './service/snippetService';
import { UIUtility } from './utility/uiUtility';
import { StringUtility } from './utility/stringUtility';
import { Labels } from './config/Labels';
import { ConfigurationTarget } from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	const defaultSnippetsPath = DataAccess.resolveFilename(context.globalStorageUri.fsPath);
	// default snippets path should always be available
	if (!fs.existsSync(context.globalStorageUri.fsPath)) {
		fs.mkdirSync(context.globalStorageUri.fsPath);
	}

	const snippetsPathConfigKey = 'snippetsLocation';

	// to be enabled whenever an explicit configuration update is requested (e.g getConfiguration#update)
	let explicitUpdate = false;
	let snippetsPath: string = vscode.workspace.getConfiguration('snippets').get(snippetsPathConfigKey) || "";

	// revert back to default snippets path if there is no entry in settings or there is one but it is not a valid JSON file
	const revertToDefaultLocation = snippetsPath === "" || !fs.existsSync(snippetsPath) || !fs.statSync(snippetsPath).isFile || !snippetsPath.endsWith(DataAccess.dataFileExt);
	if (revertToDefaultLocation) {
		vscode.workspace.getConfiguration('snippets').update(snippetsPathConfigKey, defaultSnippetsPath, ConfigurationTarget.Global);
		explicitUpdate = true;
		// show different message depending on the state of settings :
		// - show Labels.snippetsDefaultPath if there was no entry in settings
		// - show Labels.snippetsDefaultPath if default path was mentionned in settings but wasn't available
		// - show Labels.snippetsInvalidPath if there was an entry but it is not a valid JSON file
		if (snippetsPath === "" || snippetsPath === defaultSnippetsPath) {
			vscode.window.showInformationMessage(
				StringUtility.formatString(Labels.snippetsDefaultPath, defaultSnippetsPath)
			);
		}else{
			vscode.window.showInformationMessage(
				StringUtility.formatString(Labels.snippetsInvalidPath, snippetsPath, defaultSnippetsPath)
			);
		}
		

		snippetsPath = defaultSnippetsPath;
	}

	const dataAccess = new DataAccess(snippetsPath);
	const snippetService = new SnippetService(dataAccess);
	const snippetsProvider = new SnippetsProvider(snippetService, context.extensionPath);

	// watch changes on snippets file, this will prevent de-sync between multiple open workspaces
	fs.watchFile(snippetsPath, () => {
		snippetsProvider.refresh();
	});

	vscode.workspace.onDidChangeConfiguration(event => {
		let affected = event.affectsConfiguration(`snippets.${snippetsPathConfigKey}`);
		if (affected && !explicitUpdate) {
			let newPath: string | undefined = vscode.workspace.getConfiguration('snippets').get(snippetsPathConfigKey);
			if (newPath) {
				try {
					fs.renameSync(snippetsPath, newPath);
					snippetsPath = newPath;
					vscode.window.showInformationMessage(StringUtility.formatString(Labels.snippetsChangedPath, snippetsPath));
				} catch (error) {
					// new path is not valid, fall back to old location
					vscode.window.showErrorMessage(error.message);
					vscode.workspace.getConfiguration('snippets').update(snippetsPathConfigKey, snippetsPath, ConfigurationTarget.Global);
					explicitUpdate = true;
					vscode.window.showWarningMessage(StringUtility.formatString(Labels.snippetsInvalidNewPath, newPath, snippetsPath));
				}
			} else {
				// no new path given, fall back to default location
				fs.renameSync(snippetsPath, defaultSnippetsPath);
				snippetsPath = defaultSnippetsPath;
				vscode.workspace.getConfiguration('snippets').update(snippetsPathConfigKey, snippetsPath, ConfigurationTarget.Global);
				explicitUpdate = true;
				vscode.window.showInformationMessage(StringUtility.formatString(Labels.snippetsNoNewPath, snippetsPath));
			}
			// update dataFile in DataAccess object
			dataAccess.setDataFile(snippetsPath);
		} else if (explicitUpdate) {
			explicitUpdate = false;
		}
	});

	let snippetsExplorer = vscode.window.createTreeView('snippetsExplorer', {
		treeDataProvider: snippetsProvider
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
			snippetsProvider.addSnippet(name, text, Snippet.PARENT_ID);
		} else {
			const selectedItem = node ? node : snippetsExplorer.selection[0];
			if (selectedItem.folder && selectedItem.folder === true) {
				snippetsProvider.addSnippet(name, text, selectedItem.id);
			} else {
				snippetsProvider.addSnippet(name, text, selectedItem.parentId ?? Snippet.PARENT_ID);
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
			snippetsProvider.addSnippet(name, clipboardContent, Snippet.PARENT_ID);
		} else {
			const selectedItem = node ? node : snippetsExplorer.selection[0];
			if (selectedItem.folder && selectedItem.folder === true) {
				snippetsProvider.addSnippet(name, clipboardContent, selectedItem.id);
			} else {
				snippetsProvider.addSnippet(name, clipboardContent, selectedItem.parentId ?? Snippet.PARENT_ID);
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
			snippetsProvider.addSnippetFolder(name, Snippet.PARENT_ID);
		} else {
			const selectedItem = node ? node : snippetsExplorer.selection[0];
			if (selectedItem.folder && selectedItem.folder === true) {
				snippetsProvider.addSnippetFolder(name, selectedItem.id);
			} else {
				snippetsProvider.addSnippetFolder(name, selectedItem.parentId ?? Snippet.PARENT_ID);
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
