import * as vscode from 'vscode';
import { Snippet } from '../interface/snippet';
import { SnippetsProvider } from '../provider/snippetsProvider';
import { EditView } from './editView';
import { LoggingUtility } from '../utility/loggingUtility';

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
        LoggingUtility.getInstance().debug(`EditSnippet Message Received ${JSON.stringify(message)}`);
        switch (message.command) {
            case 'edit-snippet':
                const { label, prefix, language, description, value, resolveSyntax } = message.data;
                // call provider only if there is data change
                if (label !== undefined) {
                    this._snippet.label = label;
                }
                if (value !== undefined) {
                    this._snippet.value = value;
                }
                this._snippet.language = language;
                this._snippet.description = description;
                this._snippet.prefix = prefix;
                // test against undefined so we don't mess with variable's state if user introduces an explicit value 'false'
                if (resolveSyntax !== undefined) {
                    this._snippet.resolveSyntax = resolveSyntax;
                }
                this._snippetsProvider.editSnippet(this._snippet);
                this._panel.dispose();
                return;
        }
    }
}
