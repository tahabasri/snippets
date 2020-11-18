import * as vscode from 'vscode';
import { Snippet } from '../interface/snippet';

export class SnippetsProvider implements vscode.TreeDataProvider<Snippet> {
    constructor(private snippetsRootElement: Snippet) {
        console.log(snippetsRootElement.children.length);
    }

    getTreeItem(element: Snippet): vscode.TreeItem {
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
        treeItem.command = {
            command: 'snippets.openSnippet',
            arguments: [element.value],
            title: 'Open snippet'
        };
        return treeItem;
    }

    getChildren(element?: Snippet): Thenable<Snippet[]> {
        if (element) {
            return Promise.resolve(element.children);
        } else {
            return Promise.resolve(this.snippetsRootElement.children);
        }
    }

    private _onDidChangeTreeData: vscode.EventEmitter<Snippet | undefined | null | void> = new vscode.EventEmitter<Snippet | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<Snippet | undefined | null | void> = this._onDidChangeTreeData.event;

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

}