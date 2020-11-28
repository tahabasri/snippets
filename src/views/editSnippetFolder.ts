import * as vscode from 'vscode';
import { Snippet } from '../interface/snippet';
import { SnippetsProvider } from '../provider/snippetsProvider';
import { EditView } from './editView';

export class EditSnippetFolder extends EditView {
    private _snippet: Snippet;
    private _snippetsProvider: SnippetsProvider;

    constructor(context: vscode.ExtensionContext, snippet: Snippet, snippetsProvider: SnippetsProvider) {
        super(
            context,
            snippet,
            'editSnippetFolder',
            'folder',
            'Edit Folder'
        );

        this._snippet = snippet;
        this._snippetsProvider = snippetsProvider;
    }

    handleReceivedMessage(message: any): any {
        switch (message.command) {
            case 'edit-folder':
                console.log('Form returned ' + message);
                const label = message.data.label;
                // call provider only if there is data change
                if (label) {
                    this._snippet.label = label;
                }
                this._snippetsProvider.editSnippetFolder(this._snippet);
                this._panel.dispose();
                return;
        }
    }
}
