import * as vscode from 'vscode';
import fs = require('fs');
import * as path from 'path';
import { Snippet } from '../interface/snippet';
import { DataAcess } from '../data/dataAccess';

export class SnippetsProvider implements vscode.TreeDataProvider<Snippet> {

    context: vscode.ExtensionContext;
    snippetsFlatten: string;
    snippets: Snippet;

    constructor(private dataAccess: DataAcess, context: vscode.ExtensionContext) {
        this.context = context;
        this.snippets = dataAccess.readFile();
        this.snippetsFlatten = this.compact(this.snippets);
        console.log(this.snippets);
    }

    getTreeItem(element: Snippet): vscode.TreeItem {
        return this.snippetToTreeItem(element);
    }

    getChildren(element?: Snippet): Thenable<Snippet[]> {
        if (element) {
            return Promise.resolve(element.children);
        } else {
            return Promise.resolve(this.snippets.children);
        }
    }

    private _onDidChangeTreeData: vscode.EventEmitter<Snippet | undefined | null | void> = new vscode.EventEmitter<Snippet | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<Snippet | undefined | null | void> = this._onDidChangeTreeData.event;

    refresh(): void {
        console.log("refreshing from fs");
        //this.snippetsFlatten = this.compact(this.snippets);
        if (this.compact(this.snippets) !== this.snippetsFlatten) {
            this.dataAccess.writeToFile(this.snippets);
        }
        this._onDidChangeTreeData.fire();
    }

    // custom methods

    compact(snippets: Snippet): string {
        return JSON.stringify(snippets);
    }

    addSnippet(name: string, snippet: string, parentId: number) {
        let lastId = (this.snippets.lastId ?? 0) + 1;

        const newSnippet = {
            id: lastId,
            parentId: parentId,
            label: name,
            value: snippet,
            children: []
        };

        parentId === 1
            ? this.snippets.children.push(newSnippet)
            : Snippet.findParent(parentId, this.snippets)?.children.push(newSnippet);

        this.snippets.lastId = lastId;

        console.log("Snippet added, refreshing");
        console.log(this.snippets);
        this.refresh();
    }

    addSnippetFolder(name: string, parentId: number) {
        let lastId = (this.snippets.lastId ?? 0) + 1;

        const newSnippet = {
            id: lastId,
            parentId: parentId,
            label: name,
            folder: true,
            children: []
        };

        parentId === 1
            ? this.snippets.children.push(newSnippet)
            : Snippet.findParent(parentId, this.snippets)?.children.push(newSnippet);

        this.snippets.lastId = lastId;

        console.log("Snippet folder added, refreshing");
        console.log(this.snippets);
        this.refresh();
    }

    editSnippet(snippet: Snippet) {
        const parentElement = Snippet.findParent(snippet.parentId ?? 1, this.snippets);

        if (parentElement) {
            const index = parentElement.children.findIndex((obj => obj.id === snippet.id));

            if (index > -1) {
                parentElement.children.map(obj =>
                    obj.id === snippet.id ? {
                        ...obj,
                        label: snippet.label,
                        value: snippet.value
                    }
                        : obj
                );
            }
        }
        console.log("Snippet updated, refreshing");
        console.log(this.snippets);
        this.refresh();
    }

    editSnippetFolder(snippet: Snippet) {
        const parentElement = Snippet.findParent(snippet.parentId ?? 1, this.snippets);

        if (parentElement) {
            const index = parentElement.children.findIndex((obj => obj.id === snippet.id));

            if (index > -1) {
                parentElement.children.map(obj =>
                    obj.id === snippet.id ? {
                        ...obj,
                        label: snippet.label
                    }
                        : obj
                );
            }
        }
        console.log("Snippet updated, refreshing");
        console.log(this.snippets);
        this.refresh();
    }

    removeSnippet(snippet: Snippet) {
        const parentElement = Snippet.findParent(snippet.parentId ?? 1, this.snippets);

        if (parentElement) {
            const index = parentElement.children.findIndex((obj => obj.id === snippet.id));

            if (index > -1) {
                parentElement?.children.splice(index, 1);
            }
        }
        console.log("Snippet removed, refreshing");
        console.log(this.snippets);
        this.refresh();
    }

    private snippetToTreeItem(element: Snippet): vscode.TreeItem {
        let treeItem = new vscode.TreeItem(
            element.label,
            element.folder && element.folder === true
                ? vscode.TreeItemCollapsibleState.Expanded
                : vscode.TreeItemCollapsibleState.None
        );
        //treeItem.description = "";
        // dynamic context value depending on item type (snippet or snippet folder)
        // context value is used in view/item/context in 'when' condition
        if (element.folder && element.folder === true) {
            treeItem.contextValue = 'snippetFolder';
            treeItem.iconPath = {
                light: path.join(__filename, '..', '..', '..', 'resources', 'icons', 'light', 'folder.svg'),
                dark: path.join(__filename, '..', '..', '..', 'resources', 'icons', 'dark', 'folder.svg')
            };
        } else {
            const maxLength = 20;
            treeItem.tooltip = `${element.value
                ? "'" + element.value.replace('\n', '').slice(0, maxLength)
                + (element.value.length > 20 ? '...' : '') + "'"
                : "''"}`;
            treeItem.contextValue = 'snippet';
            treeItem.iconPath = {
                light: path.join(__filename, '..', '..', '..', 'resources', 'icons', 'light', 'file.svg'),
                dark: path.join(__filename, '..', '..', '..', 'resources', 'icons', 'dark', 'file.svg')
            };

            // conditional in configuration
            treeItem.command = {
                command: 'snippets.openSnippet',
                arguments: [element],
                title: 'Open Snippet'
            };
        }

        return treeItem;
    }
}