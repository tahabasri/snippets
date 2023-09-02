import * as vscode from 'vscode';
import { Snippet } from '../interface/snippet';
import { SnippetsProvider } from '../provider/snippetsProvider';
import { UIUtility } from "../utility/uiUtility";
import { EditSnippet } from '../views/editSnippet';
import { Labels } from "./Labels";
import { StringUtility } from '../utility/stringUtility';


export const enum CommandsConsts {
	miscRequestWSConfig = "miscCmd.requestWSConfig",
	// common commands across global & ws
	commonOpenSnippet = "globalSnippetsCmd.openSnippet",
	commonOpenSnippetInTerminal = "globalSnippetsCmd.openSnippetInTerminal",
	commonCopySnippetToClipboard = "globalSnippetsCmd.copySnippetToClipboard",
	commonAddSnippet = "commonSnippetsCmd.addSnippet",
	commonAddSnippetFromClipboard = "commonSnippetsCmd.addSnippetFromClipboard",
	commonAddSnippetFolder = "commonSnippetsCmd.addSnippetFolder",
	// global commands
	globalAddSnippet = "globalSnippetsCmd.addSnippet",
	globalAddSnippetFromClipboard = "globalSnippetsCmd.addSnippetFromClipboard",
	globalAddSnippetFolder = "globalSnippetsCmd.addSnippetFolder",
	globalEditSnippet = "globalSnippetsCmd.editSnippet",
	globalEditSnippetFolder = "globalSnippetsCmd.editSnippetFolder",
	globalDeleteSnippet = "globalSnippetsCmd.deleteSnippet",
	globalDeleteSnippetFolder = "globalSnippetsCmd.deleteSnippetFolder",
	globalMoveSnippetUp = "globalSnippetsCmd.moveSnippetUp",
	globalMoveSnippetDown = "globalSnippetsCmd.moveSnippetDown",
	globalFixSnippets = "globalSnippetsCmd.fixSnippets",
	globalExportSnippets = "globalSnippetsCmd.exportSnippets",
	globalImportSnippets = "globalSnippetsCmd.importSnippets",
	// ws commands
	wsAddSnippet = "wsSnippetsCmd.addSnippet",
	wsAddSnippetFromClipboard = "wsSnippetsCmd.addSnippetFromClipboard",
	wsAddSnippetFolder = "wsSnippetsCmd.addSnippetFolder",
	wsEditSnippet = "wsSnippetsCmd.editSnippet",
	wsEditSnippetFolder = "wsSnippetsCmd.editSnippetFolder",
	wsDeleteSnippet = "wsSnippetsCmd.deleteSnippet",
	wsDeleteSnippetFolder = "wsSnippetsCmd.deleteSnippetFolder",
	wsMoveSnippetUp = "wsSnippetsCmd.moveSnippetUp",
	wsMoveSnippetDown = "wsSnippetsCmd.moveSnippetDown",
	wsFixSnippets = "wsSnippetsCmd.fixSnippets",
}

export async function commonAddSnippet(snippetsProvider: SnippetsProvider, wsSnippetsProvider: SnippetsProvider, workspaceSnippetsAvailable: boolean) {
	var text: string | undefined;

	const editor = vscode.window.activeTextEditor;
	// if no editor is open or editor has no text, get value from user
	if (!editor || editor.document.getText(editor.selection) === "") {
		// get snippet name
		text = await UIUtility.requestSnippetValue();
		if (!text || text.length === 0) {
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

	// request where to save snippets if ws is available
	if (workspaceSnippetsAvailable) {
		const targetView = await UIUtility.requestTargetSnippetsView();
		// no value chosen
		if (!targetView) {
			vscode.window.showWarningMessage(Labels.noViewTypeSelected);
		} else if (targetView === Labels.globalSnippets) {
			snippetsProvider.addSnippet(name, text, Snippet.rootParentId);
		} else if (targetView === Labels.wsSnippets) {
			wsSnippetsProvider.addSnippet(name, text, Snippet.rootParentId);
		}
	} else {
		snippetsProvider.addSnippet(name, text, Snippet.rootParentId);
	}
}

export async function addSnippet(snippetsExplorer: vscode.TreeView<Snippet>, snippetsProvider: SnippetsProvider, node: any) {
	var text: string | undefined;

	const editor = vscode.window.activeTextEditor;
	// if no editor is open or editor has no text, get value from user
	if (!editor || editor.document.getText(editor.selection) === "") {
		// get snippet name
		text = await UIUtility.requestSnippetValue();
		if (!text || text.length === 0) {
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
}

export async function commonAddSnippetFromClipboard(snippetsProvider: SnippetsProvider, wsSnippetsProvider: SnippetsProvider, workspaceSnippetsAvailable: boolean) {
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

	// request where to save snippets if ws is available
	if (workspaceSnippetsAvailable) {
		const targetView = await UIUtility.requestTargetSnippetsView();
		// no value chosen
		if (!targetView) {
			vscode.window.showWarningMessage(Labels.noViewTypeSelected);
		} else if (targetView === Labels.globalSnippets) {
			snippetsProvider.addSnippet(name, clipboardContent, Snippet.rootParentId);
		} else if (targetView === Labels.wsSnippets) {
			wsSnippetsProvider.addSnippet(name, clipboardContent, Snippet.rootParentId);
		}
	} else {
		snippetsProvider.addSnippet(name, clipboardContent, Snippet.rootParentId);
	}
}

export async function addSnippetFromClipboard(snippetsExplorer: vscode.TreeView<Snippet>, snippetsProvider: SnippetsProvider, node: any) {
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
	// When triggering the command with right-click the parameter node of type Tree Node will be tested.
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
}

export async function commonAddSnippetFolder(snippetsProvider: SnippetsProvider, wsSnippetsProvider: SnippetsProvider, workspaceSnippetsAvailable: boolean) {
	// get snippet name
	const name = await UIUtility.requestSnippetFolderName();
	if (name === undefined || name === "") {
		vscode.window.showWarningMessage(Labels.snippetFolderNameErrorMsg);
		return;
	}

	// request where to save snippets if ws is available
	if (workspaceSnippetsAvailable) {
		const targetView = await UIUtility.requestTargetSnippetsView();
		// no value chosen
		if (!targetView) {
			vscode.window.showWarningMessage(Labels.noViewTypeSelected);
		} else if (targetView === Labels.globalSnippets) {
			snippetsProvider.addSnippetFolder(name, Snippet.rootParentId);
		} else if (targetView === Labels.wsSnippets) {
			wsSnippetsProvider.addSnippetFolder(name, Snippet.rootParentId);
		}
	} else {
		snippetsProvider.addSnippetFolder(name, Snippet.rootParentId);
	}
}

export async function addSnippetFolder(snippetsExplorer: vscode.TreeView<Snippet>, snippetsProvider: SnippetsProvider, node: any) {
	// get snippet name
	const name = await UIUtility.requestSnippetFolderName();
	if (name === undefined || name === "") {
		vscode.window.showWarningMessage(Labels.snippetFolderNameErrorMsg);
		return;
	}
	// When triggering the command with right-click the parameter node of type Tree Node will be tested.
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
}

export function editSnippet(context: vscode.ExtensionContext, snippet: Snippet, snippetsProvider: SnippetsProvider) {
	// note: enable syntax resolving by default if property is not yet defined in JSON
	if (snippet.resolveSyntax === undefined) {
		snippet.resolveSyntax = true;
	}
	// Create and show a new webview for editing snippet
	new EditSnippet(context, snippet, snippetsProvider);
}

export async function exportSnippets(snippetsProvider: SnippetsProvider) {
	// get snippet destination
	vscode.window.showSaveDialog(
		{
			filters: {
				// eslint-disable-next-line @typescript-eslint/naming-convention
				'JSON': ['json']
			},
			title: 'Export Snippets',
			saveLabel: 'Export'
		}
	).then(fileUri => {
		if (fileUri && fileUri.fsPath) {
			snippetsProvider.exportSnippets(fileUri.fsPath);
		}
	});
}

export async function importSnippets(snippetsProvider: SnippetsProvider) {
	// get snippets destination
	vscode.window.showOpenDialog({
		canSelectFiles: true,
		canSelectFolders: false,
		canSelectMany: false,
		filters: {
			// eslint-disable-next-line @typescript-eslint/naming-convention
			'JSON': ['json']
		},
		openLabel: 'Import',
		title: 'Import Snippets'
	}).then(fileUris => {
		if (fileUris && fileUris[0] && fileUris[0].fsPath) {
			vscode.window.showWarningMessage(
				Labels.snippetImportRequestConfirmation,
				...[Labels.importSnippets, Labels.discardImport])
				.then(selection => {
					switch (selection) {
						case Labels.importSnippets:
							if (snippetsProvider.importSnippets(fileUris[0].fsPath)) {
								snippetsProvider.fixLastId();
								vscode.window.showInformationMessage(Labels.snippetsImported);
							} else {
								vscode.window.showErrorMessage(Labels.snippetsNotImported);
							}
						case Labels.discardImport:
							break;
					}
				});
		}
	});
}

export async function fixSnippets(snippetsProvider: SnippetsProvider) {
	vscode.window.withProgress({
		location: vscode.ProgressLocation.Window,
		cancellable: false,
		title: 'Scanning Snippets'
	}, async (progress) => {
		progress.report({  increment: 0 });
		vscode.window
			.showInformationMessage(Labels.troubleshootConfirmation, Labels.troubleshootProceed, Labels.troubleshootCancel)
			.then(answer => {
				if (answer === Labels.troubleshootProceed) {
					let results = snippetsProvider.fixSnippets();
					vscode.window.showInformationMessage(
						(results[0] > 0 || results[1] > 0) 
						? StringUtility.formatString(Labels.troubleshootResults, results[0].toString(), results[1].toString())
						: Labels.troubleshootResultsOk
					);
				}
			});
		progress.report({ increment: 100 });
	});
}