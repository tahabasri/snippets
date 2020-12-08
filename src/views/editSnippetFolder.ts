import * as vscode from 'vscode';
import { Snippet } from '../interface/snippet';
import { SnippetsProvider } from '../provider/snippetsProvider';
import { EditView } from './editView';

export class EditSnippetFolder extends EditView {
    constructor(context: vscode.ExtensionContext, private _snippet: Snippet, private _snippetsProvider: SnippetsProvider) {
        super(
            context,
            _snippet,
            'editSnippetFolder',
            'folder',
            'Edit Folder'
        );
    }

    handleReceivedMessage(message: any): any {
        switch (message.command) {
            case 'edit-folder':
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
