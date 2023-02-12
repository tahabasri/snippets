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
    //** variables **//
    // global settings
    const snippetsConfigKey = "snippets";
    // global config
    let snippetsPath: string;
    // workspace config
    const useWorkspaceFolderKey = "useWorkspaceFolder";
    const workspaceFileName = ".vscode/snippets.json";
    let workspaceSnippetsAvailable = false;
    let wsSnippetService: SnippetService;
    let wsSnippetsProvider: SnippetsProvider;
    let wsSnippetsExplorer: vscode.TreeView<Snippet>;
    // context config (shared between package.json and this function)
    const setContextCmd = 'setContext';
    const contextWSStateKey = "snippets.workspaceState";
    const contextWSFileAvailable = "fileAvailable";
    const contextWSFileNotAvailable = "fileNotAvailable";
    //** variables **//

    //** pre-initialization **//
    // sync global snippets
    context.globalState.setKeysForSync([MementoDataAccess.snippetsMementoPrefix]);

    // initialize global snippets
    const dataAccess = new MementoDataAccess(context.globalState);
    const snippetService = new SnippetService(dataAccess);
    const snippetsProvider = new SnippetsProvider(snippetService, context.extensionPath);
    let cipDisposable: { dispose(): any };

    //** upgrade from 1.x to 2.x **//
    let oldSnippetsPath: string = vscode.workspace.getConfiguration('snippets').get('snippetsLocation')
        || path.join(context.globalStorageUri.fsPath, "data.json");
    if (oldSnippetsPath && fs.existsSync(oldSnippetsPath)) {
        let rawData = fs.readFileSync(oldSnippetsPath, 'utf8');
        // true if is blank
        let noData = StringUtility.isBlank(rawData);

        // request data restore only if :
        // - there are no new snippets in new location (globalState)
        // - there is an old file locally with some snippets
        if (dataAccess.hasNoChild() && !noData) {
            const migrateData = Labels.migrateData;
            const discardData = Labels.discardData;
            vscode.window.showWarningMessage(
                StringUtility.formatString(Labels.snippetsBackupRequest, oldSnippetsPath)
            );
            vscode.window.showInformationMessage(
                StringUtility.formatString(Labels.snippetsMigrateRequest, oldSnippetsPath),
                ...[migrateData, discardData])
                .then(selection => {
                    switch (selection) {
                        case migrateData:
                            let oldSnippets: Snippet = JSON.parse(rawData);
                            if (oldSnippets && oldSnippets.children && oldSnippets.children.length > 0) {
                                let newSnippets: Snippet = dataAccess.load();
                                newSnippets.children = oldSnippets.children;
                                newSnippets.lastId = oldSnippets.lastId;
                                dataAccess.save(newSnippets);
                                snippetsProvider.sync();
                                if (dataAccess.hasNoChild() || !newSnippets.children || newSnippets.children.length !== oldSnippets.children.length) {
                                    vscode.window.showErrorMessage(
                                        StringUtility.formatString(Labels.snippetsDataNotRestored, oldSnippetsPath)
                                    );
                                } else {
                                    fs.rename(oldSnippetsPath, `${oldSnippetsPath}_bak`, (err) => {
                                        if (err) {
                                            vscode.window.showInformationMessage(
                                                StringUtility.formatString(Labels.snippetsDataRestoredButFileNotRenamed, `${oldSnippetsPath}_bak`)
                                            );
                                        } else {
                                            //file removed
                                            vscode.window.showInformationMessage(
                                                StringUtility.formatString(Labels.snippetsDataRestored, `${oldSnippetsPath}_bak`)
                                            );
                                        }
                                    });
                                }
                            } else {
                                vscode.window.showInformationMessage(Labels.snippetsNoDataRestored);
                            }
                        case discardData:
                            break;
                    }
                });
        }
    }
    //** upgrade from 1.x to 2.x **//
    //** pre-initialization **//

    //** initialization **//
    // refresh windows whenever it gains focus
    // this will prevent de-sync between multiple open workspaces
    vscode.window.onDidChangeWindowState((event) => {
        if (event.focused) {
            refreshUI();
        }
    });

    // refresh UI when updating workspace setting
    vscode.workspace.onDidChangeConfiguration(event => {
        let affected = event.affectsConfiguration(`${snippetsConfigKey}.${useWorkspaceFolderKey}`);
        if (affected) {
            if (vscode.workspace.getConfiguration(snippetsConfigKey).get(useWorkspaceFolderKey)) {
                requestWSConfigSetup();
            }
            refreshUI();
        }
    });

    let snippetsExplorer = vscode.window.createTreeView('snippetsExplorer', {
        treeDataProvider: snippetsProvider,
        showCollapseAll: true,
        // Drag and Drop API binding
        // This check is for older versions of VS Code that don't have the most up-to-date tree drag and drop API
        dragAndDropController: typeof vscode.DataTransferItem === 'function' ? snippetsProvider : undefined
    });

    // refresh UI to initialize all required config for workspace panel
    requestWSConfigSetup(false);

    //** initialization **//

    //** common logic **//
    function refreshUI() {
        cipDisposable?.dispose();
        snippetsProvider.refresh();
        // re-check if .vscode/snippets.json is always available (use case when deleting file after enabling workspace in settings)
        requestWSConfigSetup(false);
        if (workspaceSnippetsAvailable) {
            wsSnippetsProvider.refresh();
        } else {
            vscode.commands.executeCommand(setContextCmd, contextWSStateKey, contextWSFileNotAvailable);
        }
        registerCIPSnippets();
    }

    async function requestWSConfigSetup(requestInput = true) {
        if (vscode.workspace.workspaceFolders && vscode.workspace.getConfiguration(snippetsConfigKey).get(useWorkspaceFolderKey)) {
            snippetsPath = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, workspaceFileName);
            // request creation of file `.vscode/snippets.json` if :
            // - file not found
            // - user didn't request to ignore this phase (information persisted at workspace level)
            const ignoreCreateSnippetsFileKey = "ignoreCreateSnippetsFile";
            let ignoreCreateSnippetsFile = context.workspaceState.get<boolean>(ignoreCreateSnippetsFileKey);

            const snippetsPathExists = fs.existsSync(snippetsPath);

            // requestInput=true means that we user requested setup, extension will ask for user feedback if file is unavailable
            if (requestInput && !ignoreCreateSnippetsFile && !snippetsPathExists) {
                await vscode.window.showWarningMessage(
                    Labels.snippetsWorkspaceCreateFileRequest,
                    Labels.snippetsWorkspaceCreateFileRequestConfirm,
                    Labels.snippetsWorkspaceCreateFileRequestIgnore
                ).then(selection => {
                    if (selection === Labels.snippetsWorkspaceCreateFileRequestConfirm) {
                        // create parent folder if it doesn't exist (.vscode/)
                        const snippetsPathParent = path.dirname(snippetsPath);
                        if (!fs.existsSync(snippetsPathParent)) {
                            fs.mkdirSync(snippetsPathParent);
                        }
                        // create empty file
                        fs.closeSync(fs.openSync(snippetsPath, 'w'));
                        // mark useWorkspaceFolder as enabled
                        workspaceSnippetsAvailable = true;
                    } else if (selection === Labels.snippetsWorkspaceCreateFileRequestIgnore) {
                        // ignore at workspace level
                        context.workspaceState.update(ignoreCreateSnippetsFileKey, true);
                    }
                });
            } else if (snippetsPathExists) {
                // file already exists, just mark useWorkspaceFolder as enabled
                workspaceSnippetsAvailable = true;
            } else {
                workspaceSnippetsAvailable = false;
            }

            // finish with a boolean to detect if we're using workspaceFolder (option enabled + workspace open + snippets.json available)
            if (workspaceSnippetsAvailable) {
                // send flag to context in order to change viewWelcome (see contributes > viewsWelcome in package.json)
                vscode.commands.executeCommand(setContextCmd, contextWSStateKey, contextWSFileAvailable);

                // initialize workspace snippets
                if (!wsSnippetsExplorer) {
                    const wsDataAccess = new FileDataAccess(snippetsPath);
                    wsSnippetService = new SnippetService(wsDataAccess);
                    wsSnippetsProvider = new SnippetsProvider(wsSnippetService, context.extensionPath);

                    wsSnippetsExplorer = vscode.window.createTreeView('wsSnippetsExplorer', {
                        treeDataProvider: wsSnippetsProvider,
                        showCollapseAll: true,
                        // Drag and Drop API binding
                        // This check is for older versions of VS Code that don't have the most up-to-date tree drag and drop API
                        dragAndDropController: typeof vscode.DataTransferItem === 'function' ? wsSnippetsProvider : undefined
                    });
                }
            } else {
                vscode.commands.executeCommand(setContextCmd, contextWSStateKey, contextWSFileNotAvailable);
            }
        } else {
            workspaceSnippetsAvailable = false;
        }
    }

    // generic error handler for most commands
    // command: Promise<any>
    function handleCommand(callback: (...args: any[]) => any) {
        new Promise(callback).catch(error => {
            vscode.window.showErrorMessage(StringUtility.formatString(Labels.genericError, error.message));
            refreshUI();
        });
    }
    //** common logic **//

    //** common commands **//
    //** COMMAND : INITIALIZE WS CONFIG **/*
    context.subscriptions.push(vscode.commands.registerCommand(commands.CommandsConsts.miscRequestWSConfig, async _ => {
        // check if a workspace is open and if useWorkspaceFolder is enabled
        requestWSConfigSetup();
    }));

    //** COMMAND : INITIALIZE GENERIC COMPLETION ITEM PROVIDER **/*

    let triggerCharacter: any = vscode.workspace.getConfiguration(snippetsConfigKey).get("triggerKey");
    if (!triggerCharacter) {
        triggerCharacter = "snp"; // placeholder which is not a simple character in order to trigger IntelliSense
    }
    const registerCIPSnippets = () => cipDisposable = vscode.languages.registerCompletionItemProvider(
        '*', {
        provideCompletionItems(document, position) {
            if (!vscode.workspace.getConfiguration(snippetsConfigKey).get("showSuggestions")) {
                return;
            }
            let isTriggeredByChar = triggerCharacter === document.lineAt(position).text.charAt(position.character - 1);
            // append workspace snippets if WS is available
            let candidates = snippetService.getAllSnippets();
            if (workspaceSnippetsAvailable) {
                // add suffix for all workspace items
                candidates = candidates.concat(wsSnippetService.getAllSnippets().map(
                    elt => {
                        elt.label = `${elt.label}__(ws)`;
                        return elt;
                    }
                ));
            }
            return candidates.map(element =>
                <vscode.CompletionItem>{
                    label: `snp:${element.label.replace('\n', '').replace(' ', '-').replace("__(ws)", " (ws)")}`,
                    insertText: new vscode.SnippetString(element.value),
                    detail: element.label.replace("__(ws)", " (snippet from workspace)"),
                    kind: vscode.CompletionItemKind.Snippet,
                    // replace trigger character with the chosen suggestion
                    additionalTextEdits: isTriggeredByChar
                        ? [vscode.TextEdit.delete(new vscode.Range(position.with(position.line, position.character - 1), position))]
                        : []
                });
        },
    }, triggerCharacter
    );

    context.subscriptions.push(registerCIPSnippets());

    //** COMMAND : OPEN SNIPPET **/

    context.subscriptions.push(vscode.commands.registerCommand(commands.CommandsConsts.commonOpenSnippet,
        async (snippet) => handleCommand(async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showInformationMessage(Labels.noOpenEditor);
                return;
            }
            // if command is not triggered from treeView, a snippet must be selected by final user
            if (!snippet) {
                let allSnippets = snippetService.getAllSnippets();
                if (workspaceSnippetsAvailable) {
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
        })
    ));

    context.subscriptions.push(vscode.commands.registerCommand(commands.CommandsConsts.commonOpenSnippetInTerminal,
        async (snippet) => handleCommand(async () => {
            const terminal = vscode.window.activeTerminal;
            if (!terminal) {
                vscode.window.showInformationMessage(Labels.noOpenTerminal);
                return;
            }
            // if command is not triggered from treeView, a snippet must be selected by final user
            if (!snippet) {
                let allSnippets = snippetService.getAllSnippets();
                if (workspaceSnippetsAvailable) {
                    allSnippets = allSnippets.concat(wsSnippetService.getAllSnippets());
                }
                snippet = await UIUtility.requestSnippetFromUser(allSnippets);
            }
            if (!snippet) {
                return;
            }
            terminal.sendText(snippet.value);
        })
    ));

    //** COMMAND : ADD SNIPPET **/

    context.subscriptions.push(vscode.commands.registerCommand(commands.CommandsConsts.commonAddSnippet,
        async _ => handleCommand(() => commands.commonAddSnippet(snippetsProvider, wsSnippetsProvider, workspaceSnippetsAvailable))
    ));

    context.subscriptions.push(vscode.commands.registerCommand(commands.CommandsConsts.globalAddSnippet,
        async (node) => handleCommand(() => commands.addSnippet(snippetsExplorer, snippetsProvider, node))
    ));

    context.subscriptions.push(vscode.commands.registerCommand(commands.CommandsConsts.wsAddSnippet,
        async (node) => handleCommand(() => commands.addSnippet(wsSnippetsExplorer, wsSnippetsProvider, node))
    ));

    //** COMMAND : ADD SNIPPET FROM CLIPBOARD **/

    context.subscriptions.push(vscode.commands.registerCommand(commands.CommandsConsts.commonAddSnippetFromClipboard,
        async _ => handleCommand(() => commands.commonAddSnippetFromClipboard(snippetsProvider, wsSnippetsProvider, workspaceSnippetsAvailable))
    ));

    context.subscriptions.push(vscode.commands.registerCommand(commands.CommandsConsts.globalAddSnippetFromClipboard,
        async (node) => handleCommand(() => commands.addSnippetFromClipboard(snippetsExplorer, snippetsProvider, node))
    ));

    context.subscriptions.push(vscode.commands.registerCommand(commands.CommandsConsts.wsAddSnippetFromClipboard,
        async (node) => handleCommand(() => commands.addSnippetFromClipboard(wsSnippetsExplorer, wsSnippetsProvider, node)
        )));

    //** COMMAND : ADD SNIPPET FOLDER **/

    context.subscriptions.push(vscode.commands.registerCommand(commands.CommandsConsts.commonAddSnippetFolder,
        async _ => handleCommand(() => commands.commonAddSnippetFolder(snippetsProvider, wsSnippetsProvider, workspaceSnippetsAvailable))
    ));

    context.subscriptions.push(vscode.commands.registerCommand(commands.CommandsConsts.globalAddSnippetFolder,
        async (node) => handleCommand(() => commands.addSnippetFolder(snippetsExplorer, snippetsProvider, node))
    ));

    context.subscriptions.push(vscode.commands.registerCommand(commands.CommandsConsts.wsAddSnippetFolder,
        async (node) => handleCommand(() => commands.addSnippetFolder(wsSnippetsExplorer, wsSnippetsProvider, node))
    ));

    //** COMMAND : EDIT SNIPPET **/

    context.subscriptions.push(vscode.commands.registerCommand(commands.CommandsConsts.globalEditSnippet,
        (snippet: Snippet) => handleCommand(() => commands.editSnippet(context, snippet, snippetsProvider))
    ));

    context.subscriptions.push(vscode.commands.registerCommand(commands.CommandsConsts.wsEditSnippet,
        (snippet: Snippet) => handleCommand(() => commands.editSnippet(context, snippet, wsSnippetsProvider))
    ));

    //** COMMAND : EDIT SNIPPET FOLDER **/

    context.subscriptions.push(vscode.commands.registerCommand(commands.CommandsConsts.globalEditSnippetFolder,
        (snippet: Snippet) => handleCommand(() => new EditSnippetFolder(context, snippet, snippetsProvider))
    ));

    context.subscriptions.push(vscode.commands.registerCommand(commands.CommandsConsts.wsEditSnippetFolder,
        (snippet: Snippet) => handleCommand(() => new EditSnippetFolder(context, snippet, wsSnippetsProvider))
    ));

    //** COMMAND : REMOVE SNIPPET **/

    context.subscriptions.push(vscode.commands.registerCommand(commands.CommandsConsts.globalDeleteSnippet,
        (snippet) => handleCommand(() => {
            if (vscode.workspace.getConfiguration('snippets').get('confirmBeforeDeletion')) {
                vscode.window
                    .showInformationMessage(`Do you really want to delete the snippet (${snippet.label}) ?`, Labels.confirmationYes, Labels.confirmationNo)
                    .then(answer => {
                        if (answer === Labels.confirmationYes) {
                            snippetsProvider.removeSnippet(snippet);
                        }
                    });
            } else {
                snippetsProvider.removeSnippet(snippet);
            }
        })
    ));

    context.subscriptions.push(vscode.commands.registerCommand(commands.CommandsConsts.wsDeleteSnippet,
        (snippet) => handleCommand(() => {
            if (vscode.workspace.getConfiguration('snippets').get('confirmBeforeDeletion')) {
                vscode.window
                    .showInformationMessage(`Do you really want to delete the snippet (${snippet.label}) ?`, Labels.confirmationYes, Labels.confirmationNo)
                    .then(answer => {
                        if (answer === Labels.confirmationYes) {
                            wsSnippetsProvider.removeSnippet(snippet);
                        }
                    });
            } else {
                wsSnippetsProvider.removeSnippet(snippet);
            }
        })
    ));

    //** COMMAND : REMOVE SNIPPET FOLDER **/

    context.subscriptions.push(vscode.commands.registerCommand(commands.CommandsConsts.globalDeleteSnippetFolder,
        (snippetFolder) => handleCommand(() => {
            if (vscode.workspace.getConfiguration('snippets').get('confirmBeforeDeletion')) {
                vscode.window
                    .showInformationMessage(`Do you really want to delete the folder (${snippetFolder.label}) ?`, Labels.confirmationYes, Labels.confirmationNo)
                    .then(answer => {
                        if (answer === Labels.confirmationYes) {
                            snippetsProvider.removeSnippet(snippetFolder);
                        }
                    });
            } else {
                snippetsProvider.removeSnippet(snippetFolder);
            }
        })
    ));

    context.subscriptions.push(vscode.commands.registerCommand(commands.CommandsConsts.wsDeleteSnippetFolder,
        (snippetFolder) => handleCommand(() => {
            if (vscode.workspace.getConfiguration('snippets').get('confirmBeforeDeletion')) {
                vscode.window
                    .showInformationMessage(`Do you really want to delete the folder (${snippetFolder.label}) ?`, Labels.confirmationYes, Labels.confirmationNo)
                    .then(answer => {
                        if (answer === Labels.confirmationYes) {
                            wsSnippetsProvider.removeSnippet(snippetFolder);
                        }
                    });
            } else {
                wsSnippetsProvider.removeSnippet(snippetFolder);
            }
        })
    ));

    //** COMMAND : MOVE SNIPPET UP **/

    context.subscriptions.push(vscode.commands.registerCommand(commands.CommandsConsts.globalMoveSnippetUp,
        (snippet) => handleCommand(() => snippetsProvider.moveSnippetUp(snippet))
    ));

    context.subscriptions.push(vscode.commands.registerCommand(commands.CommandsConsts.wsMoveSnippetUp,
        (snippet) => handleCommand(() => wsSnippetsProvider.moveSnippetUp(snippet))
    ));

    //** COMMAND : MOVE SNIPPET DOWN **/

    context.subscriptions.push(vscode.commands.registerCommand(commands.CommandsConsts.globalMoveSnippetDown,
        (snippet) => handleCommand(() => snippetsProvider.moveSnippetDown(snippet))
    ));

    context.subscriptions.push(vscode.commands.registerCommand(commands.CommandsConsts.wsMoveSnippetDown,
        (snippet) => handleCommand(() => wsSnippetsProvider.moveSnippetDown(snippet))
    ));

    //** COMMAND : REFRESH **/

    context.subscriptions.push(vscode.commands.registerCommand("commonSnippetsCmd.refreshEntry", _ => refreshUI()));

    //** COMMAND : IMPORT & EXPORT **/

    context.subscriptions.push(vscode.commands.registerCommand(commands.CommandsConsts.globalExportSnippets,
        async _ => handleCommand(() => commands.exportSnippets(snippetsProvider))
    ));

    context.subscriptions.push(vscode.commands.registerCommand(commands.CommandsConsts.globalImportSnippets,
        async _ => handleCommand(() => commands.importSnippets(snippetsProvider))
    ));
}

export function deactivate() { }
