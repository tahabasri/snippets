import * as vscode from 'vscode';
import { Snippet } from '../interface/snippet';
import { SnippetsProvider } from '../provider/snippetsProvider';
import { EditView } from './editView';

export class EditSnippet extends EditView {
    private _snippet: Snippet;
    private _snippetsProvider: SnippetsProvider;

    constructor(context: vscode.ExtensionContext, snippet: Snippet, snippetsProvider: SnippetsProvider) {
        super(
            context,
            snippet,
            'editSnippet',
            'file',
            'Edit Snippet'
        );

        this._snippet = snippet;
        this._snippetsProvider = snippetsProvider;
    }

    handleReceivedMessage(message: any): any {
        switch (message.command) {
            case 'edit-snippet':
                console.log('Form returned ' + message);
                const { label, value } = message.data;
                // call provider only if there is data change
                if (label) {
                    this._snippet.label = label;
                }
                if (value) {
                    this._snippet.value = value;
                }
                this._snippetsProvider.editSnippet(this._snippet);
                this._panel.dispose();
                return;
        }
    }
}
