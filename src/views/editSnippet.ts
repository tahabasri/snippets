import * as vscode from 'vscode';
import { Snippet } from '../interface/snippet';
import { SnippetsProvider } from '../provider/snippetsProvider';
import { EditView } from './editView';

export class EditSnippet extends EditView {
    constructor(context: vscode.ExtensionContext, private _snippet: Snippet, private _snippetsProvider: SnippetsProvider) {
        super(
            context,
            _snippet,
            'editSnippet',
            'file',
            'Edit Snippet'
        );
    }

    handleReceivedMessage(message: any): any {
        switch (message.command) {
            case 'edit-snippet':
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
