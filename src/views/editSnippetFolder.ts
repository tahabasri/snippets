import * as vscode from 'vscode';
import { Snippet } from '../interface/snippet';
import { SnippetsProvider } from '../provider/snippetsProvider';
import { EditView } from './editView';
import { LoggingUtility } from '../utility/loggingUtility';

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
        LoggingUtility.getInstance().debug(`EditSnippetFolder Message Received ${JSON.stringify(message)}`);
        switch (message.command) {
            case 'edit-folder':
                const label = message.data.label;
                const icon = message.data.icon;
                // call provider only if there is data change
                if (label) {
                    this._snippet.label = label;
                }
                this._snippet.icon = icon;
                this._snippetsProvider.editSnippetFolder(this._snippet);
                this._panel.dispose();
                return;
        }
    }
}
