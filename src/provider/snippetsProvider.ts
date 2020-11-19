import * as vscode from 'vscode';
import fs = require('fs');
import { Snippet } from '../interface/snippet';
import { DataAcess } from '../data/dataAccess';

export class SnippetsProvider implements vscode.TreeDataProvider<Snippet> {
    
    snippetsFlatten: string;
    snippets: Snippet;

    constructor(private dataAccess: DataAcess) {
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
        if(this.compact(this.snippets) !== this.snippetsFlatten){
            this.dataAccess.writeToFile(this.snippets);
        }
        this._onDidChangeTreeData.fire();
    }

    // custom methods

    compact(snippets: Snippet): string {
        return JSON.stringify(snippets);
    }

	addSnippet(snippet: string) {
        //throw new Error('Method not implemented.');
        
        this.snippets.children.push({
            label: "new snippet",
            value: snippet,
            children: []
        });
        console.log("Data changed");
        console.log(this.snippets);

        this.refresh();
	}

    private snippetToTreeItem(element: Snippet): vscode.TreeItem {
        let treeItem = new vscode.TreeItem(
            element.label,
            element.children.length > 0
                ? vscode.TreeItemCollapsibleState.Expanded
                : vscode.TreeItemCollapsibleState.None
        );
        treeItem.tooltip = `Snippet for ${element.label}`;
        treeItem.description = "";
        // dynamic context value depending on item type (snippet or snippet folder)
        // context value is used in view/item/context in 'when' condition
        treeItem.contextValue = 'snippet';
        if (element.children.length === 0) {
            treeItem.command = {
                command: 'snippets.openSnippet',
                arguments: [element.value],
                title: 'Open snippet'
            };
        }
        return treeItem;
    }
}