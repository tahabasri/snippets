import * as vscode from 'vscode';
import fs = require('fs');
import * as path from 'path';
import { Snippet } from '../interface/snippet';
import { CommandsConsts } from '../config/commands';
import { SnippetService } from '../service/snippetService';

export class SnippetsProvider implements vscode.TreeDataProvider<Snippet>, vscode.TreeDragAndDropController<Snippet> {
    constructor(private _snippetService: SnippetService, private _extensionPath: string) { }

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
            this._snippetService.removeSnippet(transferSnippet);
            // compared to normal addSnippet, we don't bump up lastId here 
            // as we need to only move item and not create new one
            // --> only update parentId
            transferSnippet.parentId = target.id;
            this._snippetService.addSnippet(transferSnippet);
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
        this._snippetService.refresh();
        this._onDidChangeTreeData.fire();
    }

    // save state of snippets, then refresh
    sync(): void {
        this._snippetService.saveSnippets();
        this.refresh();
    }

    addSnippet(name: string, snippet: string, parentId: number) {
        let lastId = this._snippetService.incrementLastId();

        this._snippetService.addSnippet(
            {
                id: lastId,
                parentId: parentId,
                label: name,
                value: snippet,
                children: []
            }
        );

        this.sync();
    }

    addSnippetFolder(name: string, parentId: number) {
        let lastId = this._snippetService.incrementLastId();

        this._snippetService.addSnippet(
            {
                id: lastId,
                parentId: parentId,
                label: name,
                folder: true,
                children: []
            }
        );

        this.sync();
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

    private snippetToTreeItem(snippet: Snippet): vscode.TreeItem {
        let treeItem = new vscode.TreeItem(
            snippet.label,
            snippet.folder && snippet.folder === true
                ? vscode.TreeItemCollapsibleState.Expanded
                : vscode.TreeItemCollapsibleState.None
        );
        //treeItem.description = "";
        // dynamic context value depending on item type (snippet or snippet folder)
        // context value is used in view/item/context in 'when' condition
        if (snippet.folder && snippet.folder === true) {
            treeItem.contextValue = 'snippetFolder';
            treeItem.iconPath = {
                light: path.join(this._extensionPath, 'resources', 'icons', 'light', 'folder.svg'),
                dark: path.join(this._extensionPath, 'resources', 'icons', 'dark', 'folder.svg')
            };
        } else {
            const maxLength = 20;
            treeItem.tooltip = `${snippet.value
                ? "'" + snippet.value.replace('\n', '').slice(0, maxLength)
                + (snippet.value.length > 20 ? '...' : '') + "'"
                : "''"}`;
            treeItem.contextValue = 'snippet';
            treeItem.iconPath = {
                light: path.join(this._extensionPath, 'resources', 'icons', 'light', 'file.svg'),
                dark: path.join(this._extensionPath, 'resources', 'icons', 'dark', 'file.svg')
            };

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
}