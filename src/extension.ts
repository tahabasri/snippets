import fs = require('fs');
import * as vscode from 'vscode';
import * as path from 'path';
import * as commands from './config/commands';
import { SnippetsProvider } from './provider/snippetsProvider';
import { MementoDataAccess } from './data/mementoDataAccess';
import { Snippet } from './interface/snippet';
import { EditSnippetFolder } from './views/editSnippetFolder';
import { NewRelease } from './views/newRelease';
import { SnippetService } from './service/snippetService';
import { UIUtility } from './utility/uiUtility';
import { StringUtility } from './utility/stringUtility';
import { Labels } from './config/labels';
import { FileDataAccess } from './data/fileDataAccess';
import { LoggingUtility } from './utility/loggingUtility';

/**
 * Activate extension by initializing views for snippets and feature commands.
 * @param context 
 */
export function activate(context: vscode.ExtensionContext) {
    // exact version for which show Changelog panel
    const changelogVersion = '3.1.0';

    //** variables **//
    // global settings
    const snippetsConfigKey = "snippets";
    // global config
    let snippetsPath: string;
    // workspace config
    const useWorkspaceFolderKey = "useWorkspaceFolder";
    const openButtonKey = "openButton";
    const workspaceFileName = ".vscode/snippets.json";
    let workspaceSnippetsAvailable = false;
    let wsSnippetService: SnippetService;
    let wsSnippetsProvider: SnippetsProvider;
    let wsSnippetsExplorer: vscode.TreeView<Snippet>;
    // context config (shared between package.json and this function)
    const setContextCmd = 'setContext';
    const contextWSStateKey = "snippets.workspaceState";
    const contextHostStateKey = "snippets.host";
    const contextWSFileAvailable = "fileAvailable";
    const contextWSFileNotAvailable = "fileNotAvailable";
    // actionMode is either 'button' or 'inline'
    const contextActionModeKey = "snippets.actionMode";
    let actionButtonsEnabled = false;
    //** variables **//

    //** pre-initialization **//
    // sync global snippets
    context.globalState.setKeysForSync([MementoDataAccess.snippetsMementoPrefix]);

    // get all local languages
    let allLanguages: any[] = UIUtility.getLanguageNamesWithExtensions();
    // add entry for documents not related to languages (pattern=**)
    allLanguages.push({
        id: '**',
        extension: '',
        alias: ''
    });

    // initialize global snippets
    const dataAccess = new MementoDataAccess(context.globalState);
    const snippetService = new SnippetService(dataAccess);
    const snippetsProvider = new SnippetsProvider(snippetService, allLanguages);
    let cipDisposable: { dispose(): any } = {
        dispose: function () {
        }
    };
    // useful for non language related snippets
    let globalCipDisposable: { dispose(): any } = {
        dispose: function () {
        }
    };
    let registerGlobalCIPSnippets: (() => vscode.Disposable) | undefined = undefined;

    // make sure lastId is accurate
    snippetService.fixLastId();

    // show What's new if it's first time at current release
    const currentVersion = context.extension.packageJSON.version;
    // generate release identifier for changelog related property
    const releaseChangelogId = `skipChangelog_${currentVersion}`;
    // if the key is undefined or value is not true, show Changelog window
    if (!context.globalState.get(releaseChangelogId) && currentVersion === changelogVersion) {
        new NewRelease(context);
        context.globalState.update(releaseChangelogId, true);
    }

    // check if host is vscode, cursor or windsurf
    vscode.commands.executeCommand(
        setContextCmd,
        contextHostStateKey,
        vscode.hasOwnProperty('cursor') ? 'cursor' : 'vscode'
    );
    vscode.commands.executeCommand(
        setContextCmd,
        contextHostStateKey,
        context.globalStorageUri.fsPath.toLowerCase().includes('windsurf') ? 'windsurf' : 'vscode'
    );

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
        if (event.affectsConfiguration(`${snippetsConfigKey}.${useWorkspaceFolderKey}`)) {
            LoggingUtility.getInstance().debug('Workspace setting changed');
            if (vscode.workspace.getConfiguration(snippetsConfigKey).get(useWorkspaceFolderKey)) {
                requestWSConfigSetup();
            }
            refreshUI();
        }
        if (event.affectsConfiguration(`${snippetsConfigKey}.${openButtonKey}`)) {
            handleButtonsVisibility();
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

    // handle action buttons visibility
    handleButtonsVisibility();
    // refresh UI to initialize all required config for workspace panel
    requestWSConfigSetup(false);

    //** initialization **//

    //** common logic **//
    function refreshUI() {
        LoggingUtility.getInstance().debug('Refreshing UI');
        // dispose CIP snippets
        cipDisposable?.dispose();
        snippetsProvider.refresh();
        // re-check if .vscode/snippets.json is always available (use case when deleting file after enabling workspace in settings)
        requestWSConfigSetup(false);
        if (workspaceSnippetsAvailable) {
            wsSnippetsProvider.refresh();
        } else {
            vscode.commands.executeCommand(setContextCmd, contextWSStateKey, contextWSFileNotAvailable);
        }
        if (registerGlobalCIPSnippets) {
            registerGlobalCIPSnippets();
        }
    }

    async function requestWSConfigSetup(requestInput = true) {
        if (vscode.workspace.workspaceFolders && vscode.workspace.getConfiguration(snippetsConfigKey).get(useWorkspaceFolderKey)) {
            LoggingUtility.getInstance().info('Configuring Workspace Configuration');
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
                        LoggingUtility.getInstance().debug('Workspace Configuration Enabled');
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
                    wsSnippetsProvider = new SnippetsProvider(wsSnippetService, allLanguages);

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

    async function handleButtonsVisibility() {
        actionButtonsEnabled = vscode.workspace.getConfiguration(snippetsConfigKey).get(openButtonKey) ? true : false;
        vscode.commands.executeCommand(
            setContextCmd,
            contextActionModeKey,
            actionButtonsEnabled ? 'button' : 'inline'
        );
    }

    // generic error handler for most commands
    // command: Promise<any>
    function handleCommand(callback: (...args: any[]) => any) {
        new Promise(callback).catch(error => {
            vscode.window.showErrorMessage(StringUtility.formatString(Labels.genericError, error.message));
            LoggingUtility.getInstance().error(JSON.stringify(error));
            refreshUI();
        });
    }
    //** common logic **//

    //** common commands **//
    //** COMMAND : INITIALIZE WS CONFIG **/*
    context.subscriptions.push(vscode.commands.registerCommand(commands.CommandsConsts.miscRequestWSConfig, async _ => {
        if (!vscode.workspace.workspaceFolders) {
            // can't initialize if no folder is open
            vscode.window.showWarningMessage(Labels.noOpenEditorForWSConfig);
        } else {
            // check if a workspace is open and if useWorkspaceFolder is enabled
            requestWSConfigSetup();
        }
    }));

    //** COMMAND : INITIALIZE GENERIC COMPLETION ITEM PROVIDER **/*

    let triggerCharacter: any = vscode.workspace.getConfiguration(snippetsConfigKey).get("triggerKey");
    if (!triggerCharacter) {
        triggerCharacter = "snp"; // placeholder which is not a simple character in order to trigger IntelliSense
    }
    LoggingUtility.getInstance().debug('Trigger Character : ' + triggerCharacter);

    let globalPrefix: any = vscode.workspace.getConfiguration(snippetsConfigKey).get("globalPrefix");
    let camelize: any = vscode.workspace.getConfiguration(snippetsConfigKey).get("camelize");

    const registerCIPSnippetsList: (() => vscode.Disposable)[] = [];

    for (const currentLanguage of allLanguages) {
        let disposable =  currentLanguage.id === '**' ? globalCipDisposable : cipDisposable;
        const registerCIPSnippets = () => disposable = vscode.languages.registerCompletionItemProvider(
            currentLanguage.id === '**' // use pattern filter for non-language snippets
            ? [{ language: 'plaintext', scheme: 'file' }, { language: 'plaintext', scheme: 'untitled' }]
            : [{ language: currentLanguage.id, scheme: 'file' }, { language: currentLanguage.id, scheme: 'untitled' }]
            , {
                provideCompletionItems(document, position) {
                    if (!vscode.workspace.getConfiguration(snippetsConfigKey).get("showSuggestions")) {
                        return;
                    }
                    LoggingUtility.getInstance().debug('Registering completion items for language : ' + currentLanguage.id);
                    let isTriggeredByChar: boolean = triggerCharacter === document.lineAt(position).text.charAt(position.character - 1);
                    let candidates = snippetService.getAllSnippets()
                        .filter(s => (currentLanguage.id === '**' && (s.language === currentLanguage.extension || !s.language)) 
                                        || s.language === currentLanguage.extension);
                    // append workspace snippets if WS is available
                    if (workspaceSnippetsAvailable) {
                        // add suffix for all workspace items
                        candidates = candidates.concat(
                            wsSnippetService.getAllSnippets()
                                .filter(s => (currentLanguage.id === '**' 
                                    && (s.language === currentLanguage.extension || !s.language)) 
                                    || s.language === currentLanguage.extension)
                                .map(elt => {
                                    elt.completionDescription = `${elt.description ? elt.description + ' ' : ''}__(ws)`;
                                    return elt;
                                }
                        ));
                    }
                    LoggingUtility.getInstance().debug(`Unmapped Completion Items for language ${currentLanguage.id}: ${JSON.stringify(candidates)}`);
                    let filteredCandidates = candidates.map(element =>
                        <vscode.CompletionItem>{
                            // label = prefix or [globalPrefix]:snippetName
                            label: element.prefix 
                                    ? element.prefix 
                                    : (globalPrefix ? `${globalPrefix}:` : '') 
                                        + (camelize // camelize if it's set in preferences
                                        ? element.label.replace(/-/g, ' ').replace(/(?:^\w|[A-Z]|\b\w)/g, function(word, index) {
                                            return index === 0 ? word.toLowerCase() : word.toUpperCase();
                                          }).replace(/\s+/g, '')
                                        : element.label.replace(/\n/g, '').replace(/ /g, '-')),
                            insertText: new vscode.SnippetString(element.value),
                            detail: element.completionDescription?.replace("__(ws)", "(snippet from local workspace)"),
                            kind: vscode.CompletionItemKind.Snippet,
                            // replace trigger character with the chosen suggestion
                            additionalTextEdits: isTriggeredByChar
                                ? [vscode.TextEdit.delete(new vscode.Range(position.with(position.line, position.character - 1), position))]
                                : []
                        });
                    LoggingUtility.getInstance().debug(`Mapped Completion Items for language ${currentLanguage.id}: ${JSON.stringify(candidates)}`);
                    return filteredCandidates;
                },
            }, triggerCharacter
        );
        // keep reference of this special one to invoke it on refreshUI
        if (currentLanguage.id === '**') {
            registerGlobalCIPSnippets = () => disposable;
        }
        registerCIPSnippetsList.push(registerCIPSnippets);
    };

    registerCIPSnippetsList.forEach(d => context.subscriptions.push(d()));

    //** COMMAND : OPEN SNIPPET **/

    context.subscriptions.push(vscode.commands.registerCommand(commands.CommandsConsts.commonOpenSnippet,
        async (snippet) => handleCommand(async () => commands.openSnippet(snippet, snippetService, wsSnippetService, workspaceSnippetsAvailable, actionButtonsEnabled))
    ));

    context.subscriptions.push(vscode.commands.registerCommand(commands.CommandsConsts.commonOpenSnippetButton,
        async (snippet) => handleCommand(async () => commands.openSnippet(snippet, snippetService, wsSnippetService, workspaceSnippetsAvailable))
    ));

    context.subscriptions.push(vscode.commands.registerCommand(commands.CommandsConsts.commonOpenSnippetInTerminal,
        async (snippet) => handleCommand(async () => commands.openSnippetInTerminal(snippet, snippetService, wsSnippetService, workspaceSnippetsAvailable, actionButtonsEnabled))
    ));

    context.subscriptions.push(vscode.commands.registerCommand(commands.CommandsConsts.commonOpenSnippetInTerminalButton,
        async (snippet) => handleCommand(async () => commands.openSnippetInTerminal(snippet, snippetService, wsSnippetService, workspaceSnippetsAvailable))
    ));

    context.subscriptions.push(vscode.commands.registerCommand(commands.CommandsConsts.commonCopySnippetToClipboard,
        async (snippet) => handleCommand(async () => vscode.env.clipboard.writeText(snippet.value))
    ));

    //** COMMAND : ADD SNIPPET **/

    context.subscriptions.push(vscode.commands.registerCommand(commands.CommandsConsts.commonAddSnippet,
        async _ => handleCommand(() => commands.commonAddSnippet(allLanguages, snippetsProvider, wsSnippetsProvider, workspaceSnippetsAvailable))
    ));

    context.subscriptions.push(vscode.commands.registerCommand(commands.CommandsConsts.globalAddSnippet,
        async (node) => handleCommand(() => commands.addSnippet(allLanguages, snippetsExplorer, snippetsProvider, node))
    ));

    context.subscriptions.push(vscode.commands.registerCommand(commands.CommandsConsts.wsAddSnippet,
        async (node) => handleCommand(() => commands.addSnippet(allLanguages, wsSnippetsExplorer, wsSnippetsProvider, node))
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
        (snippet) => handleCommand(() => snippet && snippetsProvider.moveSnippetUp(snippet))
    ));

    context.subscriptions.push(vscode.commands.registerCommand(commands.CommandsConsts.wsMoveSnippetUp,
        (snippet) => handleCommand(() => snippet && wsSnippetsProvider.moveSnippetUp(snippet))
    ));

    //** COMMAND : MOVE SNIPPET DOWN **/

    context.subscriptions.push(vscode.commands.registerCommand(commands.CommandsConsts.globalMoveSnippetDown,
        (snippet) => handleCommand(() => snippet && snippetsProvider.moveSnippetDown(snippet))
    ));

    context.subscriptions.push(vscode.commands.registerCommand(commands.CommandsConsts.wsMoveSnippetDown,
        (snippet) => handleCommand(() => snippet && wsSnippetsProvider.moveSnippetDown(snippet))
    ));

    //** COMMAND : SORT SNIPPETS **/

    context.subscriptions.push(vscode.commands.registerCommand(commands.CommandsConsts.globalSortSnippets,
        (snippet) => handleCommand(() => snippetsProvider.sortSnippets(snippet))
    ));

    context.subscriptions.push(vscode.commands.registerCommand(commands.CommandsConsts.wsSortSnippets,
        (snippet) => handleCommand(() => wsSnippetsProvider.sortSnippets(snippet))
    ));

    context.subscriptions.push(vscode.commands.registerCommand(commands.CommandsConsts.globalSortAllSnippets,
        async _ => handleCommand(() => snippetsProvider.sortAllSnippets())
    ));

    context.subscriptions.push(vscode.commands.registerCommand(commands.CommandsConsts.wsSortAllSnippets,
        async _ => handleCommand(() => wsSnippetsProvider.sortAllSnippets())
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

    //** COMMAND : TROUBLESHOOT **/

    context.subscriptions.push(vscode.commands.registerCommand(commands.CommandsConsts.globalFixSnippets,
        async _ => handleCommand(() => commands.fixSnippets(snippetsProvider))
    ));

    context.subscriptions.push(vscode.commands.registerCommand(commands.CommandsConsts.wsFixSnippets,
        async _ => handleCommand(() => commands.fixSnippets(wsSnippetsProvider))
    ));

    context.subscriptions.push(vscode.commands.registerCommand(commands.CommandsConsts.commonAskGithubCopilot,
        async (snippet) => handleCommand(async () => commands.askGithubCopilot(snippet, snippetService, wsSnippetService, workspaceSnippetsAvailable))
    ));

    context.subscriptions.push(vscode.commands.registerCommand(commands.CommandsConsts.commonAddToGithubCopilot,
        async (snippet) => handleCommand(async () => commands.addToChat(snippet, snippetService, wsSnippetService, workspaceSnippetsAvailable, 'workbench.action.chat.openInSidebar'))
    ));

    context.subscriptions.push(vscode.commands.registerCommand(commands.CommandsConsts.commonAddAsCodeSnippetToGithubCopilot,
        async (snippet) => handleCommand(async () => commands.addAsCodeSnippetToChat(snippet, snippetService, wsSnippetService, workspaceSnippetsAvailable, 'workbench.action.chat.openInSidebar'))
    ));

    context.subscriptions.push(vscode.commands.registerCommand(commands.CommandsConsts.commonAddToCursorAIPane,
        async (snippet) => handleCommand(async () => commands.addToChat(snippet, snippetService, wsSnippetService, workspaceSnippetsAvailable, 'workbench.action.focusAuxiliaryBar'))
    ));

    context.subscriptions.push(vscode.commands.registerCommand(commands.CommandsConsts.commonAddAsCodeSnippetToCursorAIPane,
        async (snippet) => handleCommand(async () => commands.addAsCodeSnippetToChat(snippet, snippetService, wsSnippetService, workspaceSnippetsAvailable, 'workbench.action.focusAuxiliaryBar'))
    ));

    context.subscriptions.push(vscode.commands.registerCommand(commands.CommandsConsts.commonAddToGeminiCodeAssist,
        async (snippet) => handleCommand(async () => commands.addToChat(snippet, snippetService, wsSnippetService, workspaceSnippetsAvailable, 'cloudcode.gemini.chatView.focus'))
    ));

    context.subscriptions.push(vscode.commands.registerCommand(commands.CommandsConsts.commonAddAsCodeSnippetToGeminiCodeAssist,
        async (snippet) => handleCommand(async () => commands.addAsCodeSnippetToChat(snippet, snippetService, wsSnippetService, workspaceSnippetsAvailable, 'cloudcode.gemini.chatView.focus'))
    ));
    
    context.subscriptions.push(vscode.languages.registerDocumentDropEditProvider('*', {
       async provideDocumentDropEdits(
          _document: vscode.TextDocument,
          position: vscode.Position,
          dataTransfer: vscode.DataTransfer,
          _token: vscode.CancellationToken
        ): Promise<vscode.DocumentDropEdit | undefined> {
            const dataItem = dataTransfer.get('application/vnd.code.tree.snippetsProvider');
            if (!dataItem) {
                return;
            }
            try {
                const text = await dataItem.asString();
                const parsedSource = JSON.parse(text) as readonly Snippet[];
                // only accept one snippet (not a folder)
                if (parsedSource?.length !== 1 || parsedSource[0].folder) {
                    return;
                }
                const draggedSnippet = parsedSource[0];
                // same as open snippet command
                if (draggedSnippet.resolveSyntax === undefined) {
                    // 3.1 update: disable syntax resolving by default if property is not yet defined in JSON
                    draggedSnippet.resolveSyntax = false;
                }
                if (draggedSnippet.resolveSyntax) {
                    vscode.commands.executeCommand("editor.action.insertSnippet", { snippet: draggedSnippet.value }
                    );
                } else {
                    const editor = vscode.window.activeTextEditor;
                    if (!editor) {
                        return;
                    }
                    editor.edit(edit => {
                        edit.insert(position, draggedSnippet.value ?? '');
                    });
                }
            } catch {
                // throws error when parsing `dataItem?.value`, just skip
            }
        }
    }));
}

export function deactivate() { }
