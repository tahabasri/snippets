import * as vscode from 'vscode';
import fs = require('fs');
import * as path from 'path';
import { Snippet } from '../interface/snippet';
import { CommandsConsts } from '../config/commands';
import { SnippetService } from '../service/snippetService';

export class SnippetsProvider implements vscode.TreeDataProvider<Snippet> {
    constructor(private _snippetService: SnippetService, private _extensionPath: string) { }

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
}