import fs = require('fs');
import * as vscode from 'vscode';
import * as path from 'path';
import * as commands from './config/commands';
import { SnippetsProvider } from './provider/snippetsProvider';
import { MementoDataAccess } from './data/mementoDataAccess';
import { Snippet } from './interface/snippet';
import { EditSnippetFolder } from './views/editSnippetFolder';
import { SnippetService } from './service/snippetService';
import { UIUtility } from './utility/uiUtility';
import { StringUtility } from './utility/stringUtility';
import { Labels } from './config/Labels';
import { FileDataAccess } from './data/fileDataAccess';

/**
 * Activate extension by initializing views for snippets and feature commands.
 * @param context 
 */
export function activate(context: vscode.ExtensionContext) {
	// workspace configuration
	const snippetsConfigKey = "snippets";
	let settings = vscode.workspace.getConfiguration(snippetsConfigKey);
	let snippetsPath: string;
	// declare workspace snippets
	const workspaceFileName = ".vscode/snippets.json";
	const contextWorkspaceStateKey = "snippets.workspaceState";
	let workspaceSnippetsAvailable = false;
	let wsSnippetService : SnippetService;
	let wsSnippetsProvider : SnippetsProvider;
	let wsSnippetsExplorer : vscode.TreeView<Snippet>;

	// sync global snippets
	context.globalState.setKeysForSync([MementoDataAccess.snippetsMementoPrefix]);

	// initialize global snippets
	const dataAccess = new MementoDataAccess(context.globalState);
	const snippetService = new SnippetService(dataAccess);
	const snippetsProvider = new SnippetsProvider(snippetService, context.extensionPath);

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

	// refresh windows whenever it gains focus
	// this will prevent de-sync between multiple open workspaces
	vscode.window.onDidChangeWindowState((event) => {
		if (event.focused) {
			refreshUI();
		}
	});

	function refreshUI() {
		snippetsProvider.refresh();
		let wsAvailable = workspaceSnippetsAvailable;
		// re-check if .vscode/snippets.json is always available (use case when deleting file after enabling workspace in settings)
		if (wsAvailable && vscode.workspace.workspaceFolders) {
			const snippetsPath = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, workspaceFileName);
			wsAvailable = fs.existsSync(snippetsPath);
		}
		if (wsAvailable) {
			wsSnippetsProvider.refresh();
		} else {
			vscode.commands.executeCommand('setContext', contextWorkspaceStateKey, "fileNotAvailable");
		}
	}

	// refresh UI when updating workspace setting
	vscode.workspace.onDidChangeConfiguration(event => {
		let affected = event.affectsConfiguration(`${snippetsConfigKey}.useWorkspaceFolder`);
		if (affected) {
			refreshUI();
		}
	});

	let snippetsExplorer = vscode.window.createTreeView('snippetsExplorer', {
		treeDataProvider: snippetsProvider,
		showCollapseAll: true
	});

	//** COMMAND : INITIALIZE WS CONFIG **/*
	context.subscriptions.push(vscode.commands.registerCommand(commands.CommandsConsts.miscRequestWSConfig, async _ => {
		// check if a workspace is open and if useWorkspaceFolder is enabled
		if (vscode.workspace.workspaceFolders && settings.useWorkspaceFolder) {
			snippetsPath = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, workspaceFileName);
			
			// request creation of file `.vscode/snippets.json` if :
			// - file not found
			// - user didn't request to ignore this phase (information persisted at workspace level)
			const ignoreCreateSnippetsFileKey = "ignoreCreateSnippetsFile";
			let ignoreCreateSnippetsFile = context.workspaceState.get<boolean>(ignoreCreateSnippetsFileKey);

			const snippetsPathExists = fs.existsSync(snippetsPath);

			if (!ignoreCreateSnippetsFile && !snippetsPathExists) {
				await vscode.window.showWarningMessage(
					Labels.snippetsWorkspaceCreateFileRequest, 
					Labels.snippetsWorkspaceCreateFileRequestConfirm, 
					Labels.snippetsWorkspaceCreateFileRequestIgnore
					).then(selection => {
					if (selection === Labels.snippetsWorkspaceCreateFileRequestConfirm) {
						// create parent folder if it doesn't exist (.vscode/)
						const snippetsPathParent = path.dirname(snippetsPath);
						if (!fs.existsSync(snippetsPathParent)){
							fs.mkdirSync(snippetsPathParent);
						}
						// create empty file
						fs.closeSync(fs.openSync(snippetsPath, 'w'));
						// mark useWorkspaceFolder as enabled
						workspaceSnippetsAvailable = true;
						vscode.window.showInformationMessage(StringUtility.formatString(Labels.snippetsWorkspaceFileCreated, snippetsPath));
					}else if (selection === Labels.snippetsWorkspaceCreateFileRequestIgnore) {
						// ignore at workspace level
						context.workspaceState.update(ignoreCreateSnippetsFileKey, true);
					}
				});
			}else if (snippetsPathExists){
				// file already exists, just mark useWorkspaceFolder as enabled
				workspaceSnippetsAvailable = true;
			}

			// finish with a boolean to detect if we're using workspaceFolder (option enabled + workspace open + snippets.json available)
			if (workspaceSnippetsAvailable) {
				// send flag to context in order to change viewWelcome (see contributes > viewsWelcome in package.json)
				vscode.commands.executeCommand('setContext', contextWorkspaceStateKey, "fileAvailable");

				// initialize workspace snippets
				const wsDataAccess = new FileDataAccess(snippetsPath);
				wsSnippetService = new SnippetService(wsDataAccess);
				wsSnippetsProvider = new SnippetsProvider(wsSnippetService, context.extensionPath);

				wsSnippetsExplorer = vscode.window.createTreeView('wsSnippetsExplorer', {
					treeDataProvider: wsSnippetsProvider,
					showCollapseAll: true
				});
			}else {
				vscode.commands.executeCommand('setContext', contextWorkspaceStateKey, "fileNotAvailable");
			}
		}
	}));

	//** COMMAND : OPEN SNIPPET **/

	context.subscriptions.push(vscode.commands.registerCommand(commands.CommandsConsts.commonOpenSnippet, async (snippet) => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showInformationMessage(Labels.noOpenEditor);
			return;
		}
		// if command is not triggered from treeView, a snippet must be selected by final user
		if (!snippet) {
			let allSnippets = snippetService.getAllSnippets();
			if (workspaceSnippetsAvailable){
				allSnippets = allSnippets.concat(wsSnippetService.getAllSnippets());
			}
			snippet = await UIUtility.requestSnippetFromUser(allSnippets);
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

	context.subscriptions.push(vscode.commands.registerCommand(commands.CommandsConsts.commonOpenSnippetInTerminal, async (snippet) => {
		const terminal = vscode.window.activeTerminal;
		if (!terminal) {
			vscode.window.showInformationMessage(Labels.noOpenTerminal);
			return;
		}
		// if command is not triggered from treeView, a snippet must be selected by final user
		if (!snippet) {
			let allSnippets = snippetService.getAllSnippets();
			if (workspaceSnippetsAvailable){
				allSnippets = allSnippets.concat(wsSnippetService.getAllSnippets());
			}
			snippet = await UIUtility.requestSnippetFromUser(allSnippets);
		}
		if (!snippet) {
			return;
		}
		terminal.sendText(snippet.value);
	}));

	//** COMMAND : ADD SNIPPET **/

	context.subscriptions.push(vscode.commands.registerCommand(commands.CommandsConsts.commonAddSnippet, async _ => {
		commands.commonAddSnippet(snippetsProvider, wsSnippetsProvider, workspaceSnippetsAvailable);
	}));

	context.subscriptions.push(vscode.commands.registerCommand(commands.CommandsConsts.globalAddSnippet, async (node) => {
		commands.addSnippet(snippetsExplorer, snippetsProvider, node);
	}));

	context.subscriptions.push(vscode.commands.registerCommand(commands.CommandsConsts.wsAddSnippet, async (node) => {
		commands.addSnippet(wsSnippetsExplorer, wsSnippetsProvider, node);
	}));

	//** COMMAND : ADD SNIPPET FROM CLIPBOARD **/

	context.subscriptions.push(vscode.commands.registerCommand(commands.CommandsConsts.commonAddSnippetFromClipboard, async _ => {
		commands.commonAddSnippetFromClipboard(snippetsProvider, wsSnippetsProvider, workspaceSnippetsAvailable);
	}));

	context.subscriptions.push(vscode.commands.registerCommand(commands.CommandsConsts.globalAddSnippetFromClipboard, async (node) => {
		commands.addSnippetFromClipboard(snippetsExplorer, snippetsProvider, node);
	}));

	context.subscriptions.push(vscode.commands.registerCommand(commands.CommandsConsts.wsAddSnippetFromClipboard, async (node) => {
		commands.addSnippetFromClipboard(wsSnippetsExplorer, wsSnippetsProvider, node);
	}));

	//** COMMAND : ADD SNIPPET FOLDER **/
	
	context.subscriptions.push(vscode.commands.registerCommand(commands.CommandsConsts.commonAddSnippetFolder, async _ => {
		commands.commonAddSnippetFolder(snippetsProvider, wsSnippetsProvider, workspaceSnippetsAvailable);
	}));
	
	context.subscriptions.push(vscode.commands.registerCommand(commands.CommandsConsts.globalAddSnippetFolder, async (node) => {
		commands.addSnippetFolder(snippetsExplorer, snippetsProvider, node);
	}));
	
	context.subscriptions.push(vscode.commands.registerCommand(commands.CommandsConsts.wsAddSnippetFolder, async (node) => {
		commands.addSnippetFolder(wsSnippetsExplorer, wsSnippetsProvider, node);
	}));
	
	//** COMMAND : EDIT SNIPPET **/

	context.subscriptions.push(vscode.commands.registerCommand(commands.CommandsConsts.globalEditSnippet, (snippet: Snippet) => {
		commands.editSnippet(context, snippet, snippetsProvider);
	}));

	context.subscriptions.push(vscode.commands.registerCommand(commands.CommandsConsts.wsEditSnippet, (snippet: Snippet) => {
		commands.editSnippet(context, snippet, wsSnippetsProvider);
	}));

	//** COMMAND : EDIT SNIPPET FOLDER **/

	context.subscriptions.push(vscode.commands.registerCommand(commands.CommandsConsts.globalEditSnippetFolder, (snippet: Snippet) => {
		new EditSnippetFolder(context, snippet, snippetsProvider);
	}));

	context.subscriptions.push(vscode.commands.registerCommand(commands.CommandsConsts.wsEditSnippetFolder, (snippet: Snippet) => {
		new EditSnippetFolder(context, snippet, wsSnippetsProvider);
	}));

	//** COMMAND : REMOVE SNIPPET **/

	context.subscriptions.push(vscode.commands.registerCommand(commands.CommandsConsts.globalDeleteSnippet, (snippet) => {
		snippetsProvider.removeSnippet(snippet);
	}));

	context.subscriptions.push(vscode.commands.registerCommand(commands.CommandsConsts.wsDeleteSnippet, (snippet) => {
		wsSnippetsProvider.removeSnippet(snippet);
	}));

	//** COMMAND : REMOVE SNIPPET FOLDER **/

	context.subscriptions.push(vscode.commands.registerCommand(commands.CommandsConsts.globalDeleteSnippetFolder, (snippetFolder) => {
		snippetsProvider.removeSnippet(snippetFolder);
	}));

	context.subscriptions.push(vscode.commands.registerCommand(commands.CommandsConsts.wsDeleteSnippetFolder, (snippetFolder) => {
		wsSnippetsProvider.removeSnippet(snippetFolder);
	}));

	//** COMMAND : MOVE SNIPPET UP **/

	context.subscriptions.push(vscode.commands.registerCommand(commands.CommandsConsts.globalMoveSnippetUp, (snippet) => {
		snippetsProvider.moveSnippetUp(snippet);
	}));

	context.subscriptions.push(vscode.commands.registerCommand(commands.CommandsConsts.wsMoveSnippetUp, (snippet) => {
		wsSnippetsProvider.moveSnippetUp(snippet);
	}));

	//** COMMAND : MOVE SNIPPET DOWN **/

	context.subscriptions.push(vscode.commands.registerCommand(commands.CommandsConsts.globalMoveSnippetDown, (snippet) => {
		snippetsProvider.moveSnippetDown(snippet);
	}));

	context.subscriptions.push(vscode.commands.registerCommand(commands.CommandsConsts.wsMoveSnippetDown, (snippet) => {
		wsSnippetsProvider.moveSnippetDown(snippet);
	}));

	//** COMMAND : REFRESH **/

	context.subscriptions.push(vscode.commands.registerCommand("commonSnippetsCmd.refreshEntry", _ => {
		refreshUI();
	}));
}

export function deactivate() { }
