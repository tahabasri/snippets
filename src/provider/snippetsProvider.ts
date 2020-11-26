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

    private arrayMove(arr: Snippet[], oldIndex: number, newIndex: number) {
        if (newIndex < arr.length) {
            arr.splice(newIndex, 0, arr.splice(oldIndex, 1)[0]);
        }
    };

    private moveSnippet(snippet: Snippet, offset: number) {
        const parentElement = Snippet.findParent(snippet.parentId ?? 1, this.snippets);

        if (parentElement) {
            const index = parentElement.children.findIndex((obj => obj.id === snippet.id));

            if (index > -1 && parentElement.children) {
                console.log(this.arrayMove(parentElement.children, index, index + offset));
            }
        }
        console.log("Snippet reordered, refreshing");
        console.log(this.snippets);
        this.refresh();
    }

    moveSnippetUp(snippet: Snippet) {
        this.moveSnippet(snippet, -1);
    }

    moveSnippetDown(snippet: Snippet) {
        this.moveSnippet(snippet, 1);
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
                light: path.join(__filename, '..', '..', 'resources', 'icons', 'light', 'folder.svg'),
                dark: path.join(__filename, '..', '..', 'resources', 'icons', 'dark', 'folder.svg')
            };
        } else {
            const maxLength = 20;
            treeItem.tooltip = `${snippet.value
                ? "'" + snippet.value.replace('\n', '').slice(0, maxLength)
                + (snippet.value.length > 20 ? '...' : '') + "'"
                : "''"}`;
            treeItem.contextValue = 'snippet';
            treeItem.iconPath = {
                light: path.join(__filename, '..', '..', 'resources', 'icons', 'light', 'file.svg'),
                dark: path.join(__filename, '..', '..', 'resources', 'icons', 'dark', 'file.svg')
            };

            // conditional in configuration
            treeItem.command = {
                command: 'snippetsCmd.openSnippet',
                arguments: [snippet],
                title: 'Open Snippet'
            };
        }
        // get parent element
        const parentElement = Snippet.findParent(snippet.parentId ?? 1, this.snippets);
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