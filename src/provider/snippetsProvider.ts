import * as vscode from 'vscode';
import { Snippet } from '../interface/snippet';
import { CommandsConsts } from '../config/commands';
import { SnippetService } from '../service/snippetService';
import { Labels } from '../config/labels';
import { LoggingUtility } from '../utility/loggingUtility';
import { DecorationProvider } from './decorationProvider';

export class SnippetsProvider implements vscode.TreeDataProvider<Snippet>, vscode.TreeDragAndDropController<Snippet> {
    constructor(private _snippetService: SnippetService, private _languagesConfig: any[], private _decorationProvider: DecorationProvider) { }

    dropMimeTypes: readonly string[] = ['application/vnd.code.tree.snippetsProvider'];
    dragMimeTypes: readonly string[] = ['text/uri-list'];
    
    handleDrag?(source: readonly Snippet[], dataTransfer: vscode.DataTransfer, token: vscode.CancellationToken): void | Thenable<void> {
        dataTransfer.set('application/vnd.code.tree.snippetsProvider', new vscode.DataTransferItem(source));
    }

    handleDrop?(target: Snippet | undefined, dataTransfer: vscode.DataTransfer, token: vscode.CancellationToken): void | Thenable<void> {
        const transferItem = dataTransfer.get('application/vnd.code.tree.snippetsProvider');
        // if target is undefined, that's root of tree
        if (!target) {
            target = this._snippetService.getParent(undefined);
        }
        // skip if :
        // - source is undefined
        // - target is undefined
        // - source = target
        // skip if source or target are undefined or source = target
        if (!transferItem || transferItem.value.length === 0 || !target || transferItem.value[0].id === target.id) {
			return;
		}

        const transferSnippet = transferItem.value[0];
        // if target is root of tree or target is folder, move child inside it directly
        // skip if target is already source parent
        if (target.parentId === -1 || (target.folder && target.id !== transferSnippet.parentId)) {
            // in case of moving folder to folder, don't allow moving parent folder inside child folder
            if (target.folder && transferSnippet.folder) {
                let targetInsideSource = false;
                // potential child folder
                let targetParent = target;
                while (targetParent.parentId && targetParent.parentId > -1 || !targetInsideSource) {                    
                    const targetParentResult = this._snippetService.getParent(targetParent.parentId);
                    if (targetParentResult?.id === transferSnippet.id) {
                        // skip operation
                        return;
                    } else if (targetParentResult) {
                        targetParent = targetParentResult;
                    } else {
                        break;
                    }
                }
            }

            // all good ? proceed with moving snippet to target folder
            // basically, remove it from original place and add it to the new place

            // temp delay, to be changed by concrete concurrency treatment
            // this._snippetService.getAllSnippetsAndFolders();

            this._snippetService.removeSnippet(transferSnippet);

            // compared to normal addSnippet, we don't bump up lastId here 
            // as we need to only move item and not create new one
            // --> only update parentId
            
            transferSnippet.parentId = target.id;
            this._snippetService.addExistingSnippet(transferSnippet);
        }
        this.sync();
    }

    getTreeItem(element: Snippet): vscode.TreeItem {
        return this.snippetToTreeItem(element);
    }

    getChildren(element?: Snippet): Thenable<Snippet[]> {
        if (element) {
            return Promise.resolve(element.children);
        } else {
            return Promise.resolve(this._snippetService.getRootChildren());
        }
    }

    private _onDidChangeTreeData: vscode.EventEmitter<Snippet | undefined | null | void> = new vscode.EventEmitter<Snippet | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<Snippet | undefined | null | void> = this._onDidChangeTreeData.event;

    // only read from data file
    refresh(): void {
        LoggingUtility.getInstance().debug(`Refreshing snippets`);
        this._snippetService.refresh();
        this._onDidChangeTreeData.fire();
    }

    // save state of snippets, then refresh
    sync(): void {
        LoggingUtility.getInstance().debug(`Syncing snippets`);
        this._snippetService.saveSnippets();
        this.refresh();
    }

    addSnippet(name: string, snippet: string, parentId: number, languageExt?: string) {
        let lastId = this._snippetService.incrementLastId();

        let extStartPoint = name.lastIndexOf("\.");
        
        if (extStartPoint > 0 && extStartPoint < (name.length-1)) {
            let extension = name.slice(extStartPoint);
            let language = this._languagesConfig.find(l => l.extension === extension);
            if (language) {
                languageExt = language.extension;
                name = name.substring(0, extStartPoint);
            }
        }

        this._snippetService.addSnippet(
            {
                id: lastId,
                parentId: parentId,
                label: name,
                value: snippet,
                language: languageExt,
                children: []
            }
        );
        this.sync();
    }

    addSnippetFolder(name: string, parentId: number, icon?: string) {
        let lastId = this._snippetService.incrementLastId();

        this._snippetService.addSnippet(
            {
                id: lastId,
                parentId: parentId,
                label: name,
                folder: true,
                icon: icon,
                children: []
            }
        );
        this.sync();
        return lastId;
    }

    editSnippet(snippet: Snippet) {
        this._snippetService.updateSnippet(snippet);
        this.sync();
    }

    editSnippetFolder(snippet: Snippet) {
        this._snippetService.updateSnippet(snippet);
        this.sync();
    }

    removeSnippet(snippet: Snippet) {
        this._snippetService.removeSnippet(snippet);
        this.sync();
    }

    moveSnippetUp(snippet: Snippet) {
        this._snippetService.moveSnippet(snippet, -1);
        this.sync();
    }

    moveSnippetDown(snippet: Snippet) {
        this._snippetService.moveSnippet(snippet, 1);
        this.sync();
    }

    sortSnippets(snippet: Snippet) {
        this._snippetService.sortSnippets(snippet);
        this.sync();
    }

    sortAllSnippets() {
        this._snippetService.sortAllSnippets();
        this.sync();
    }

    private snippetToTreeItem(snippet: Snippet): vscode.TreeItem {
        let treeItem = new vscode.TreeItem(
            snippet.label + (snippet.language ? snippet.language : ''),
            snippet.folder && snippet.folder === true
                ? vscode.TreeItemCollapsibleState.Expanded
                : vscode.TreeItemCollapsibleState.None
        );
        // dynamic context value depending on item type (snippet or snippet folder)
        // context value is used in view/item/context in 'when' condition
        if (snippet.folder && snippet.folder === true) {
            treeItem.contextValue = 'snippetFolder';
            if (snippet.icon) {
                treeItem.iconPath = new vscode.ThemeIcon(snippet.icon);
            } else {
                treeItem.iconPath = vscode.ThemeIcon.Folder;
            }
            treeItem.resourceUri = vscode.Uri.parse(`snippets:${snippet.id}`);
            // decorate item
            this._decorationProvider.decorateSnippet(treeItem.resourceUri);
        } else {
            treeItem.tooltip = snippet.description ? `(${snippet.description})\n${snippet.value}` : `${snippet.value}`;
            treeItem.contextValue = 'snippet';
            treeItem.iconPath = vscode.ThemeIcon.File;
            treeItem.description = snippet.prefix;
            if (snippet.language) {
                treeItem.resourceUri = vscode.Uri.parse(`_${snippet.language}`);
            }
            // conditional in configuration
            treeItem.command = {
                command: CommandsConsts.commonOpenSnippet,
                arguments: [snippet],
                title: 'Open Snippet'
            };
        }
        // get parent element
        const parentElement = this._snippetService.getParent(snippet.parentId);
        if (parentElement) {
            const childrenCount = parentElement.children.length;
            // show order actions only if there is room for reorder
            if (childrenCount > 1) {
                const index = parentElement.children.findIndex((obj => obj.id === snippet.id));
                if (index > 0 && index < childrenCount - 1) {
                    treeItem.contextValue = `${treeItem.contextValue}:up&down`;
                } else if (index === 0) {
                    treeItem.contextValue = `${treeItem.contextValue}:down`;
                } else if (index === childrenCount - 1) {
                    treeItem.contextValue = `${treeItem.contextValue}:up`;
                }
            }
        }
        return treeItem;
    }

    exportSnippets(destinationPath: string) {
        this._snippetService.exportSnippets(destinationPath, Snippet.rootParentId);
        this.sync();
    }

    importSnippets(destinationPath: string) : boolean {
        this._snippetService.importSnippets(destinationPath);
        this.sync();
        const parentElt = this._snippetService.getParent(undefined);
        return parentElt !== undefined && parentElt.children!== undefined && parentElt.children.length > 0;
    }

    fixLastId() : void {
        this._snippetService.fixLastId();
    }

    fixSnippets() : number[] {
        let duplicateCount = 0;
        let corruptedCount = 0;
        // fix last id
        this._snippetService.fixLastId();
        let snippets = this._snippetService.getAllSnippetsAndFolders();
        // get all folders ids
        var idsSet = snippets.map(s => s.id);
        var duplicateIds = idsSet.filter((item, idx) =>  idsSet.indexOf(item) !== idx);

        for (const duplicateId of duplicateIds) {
            // get snippets with duplicate id and no children
            // test on children count instead of folder property as the latter may be undefined (that's the root cause)
            let corruptedSnippets = snippets.filter(s=>s.id === duplicateId && s.children.length === 0);
            for (const cs of corruptedSnippets) {
                duplicateCount++;
                // increment last snippet Id
                this._snippetService.overrideSnippetId(cs);
            }
        }
        // sync duplicates
        if (duplicateCount > 0) {
            this.sync();
        }
        // extract snippets within non-folders snippets
        var nonFolderSnippets = 
            this._snippetService.getAllSnippetsAndFolders().filter(s=> !s.folder && s.children.length > 0);
        
        if (nonFolderSnippets.length > 0) {
            // create folder for extracted snippets
            const folderId = this.addSnippetFolder(Labels.troubleshootFolder, Snippet.rootParentId, 'warning');
            snippets = this._snippetService.getAllSnippetsAndFolders();
            let targetFolder = snippets.find(s => s.id === folderId);
            if (targetFolder) {
                for (let snippet of nonFolderSnippets) {
                    while (snippet.children.length > 0) {
                        corruptedCount++;
                        // after removing an item, snippet.children gets reduced
                        let snippetChild = snippet.children.shift() || snippet.children[0];
                        // remove snippet from original place and add it to the new folder
                        this._snippetService.removeSnippet(snippetChild);
                        // compared to normal addSnippet, we don't bump up lastId here 
                        // as we need to only move item and not create new one
                        // => only update parentId
                        snippetChild.parentId = targetFolder.id;
                        this._snippetService.addExistingSnippet(snippetChild);
                        LoggingUtility.getInstance().debug(`Fixed corrupted snippet ${JSON.stringify(snippetChild)}`);
                    }
                }
                // fix duplicate ids
                let unorganizedSnippets: Snippet[] = [];
                SnippetService.flattenAndKeepFolders(targetFolder.children, unorganizedSnippets);
                LoggingUtility.getInstance().debug(`Fixing duplicate ids (${JSON.stringify(unorganizedSnippets)})`);
                for (const s of unorganizedSnippets.filter(s=>s.children.length === 0)) {
                    // increment last snippet Id
                    this._snippetService.overrideSnippetId(s);
                }
            }
        }
        // sync corrupted
        if (corruptedCount > 0) {
            LoggingUtility.getInstance().debug(`Corrupted Count: ${corruptedCount}`);
            this.sync();
        }
        return new Array(duplicateCount, corruptedCount);
    }
}