import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as mustache from 'mustache';
import { Snippet } from '../interface/snippet';
import { SnippetsProvider } from '../provider/snippetsProvider';

export class EditSnippet {
    private static docsUrl = "https://code.visualstudio.com/docs/editor/userdefinedsnippets#_snippet-syntax";
    private static readonly viewsFolder: string = 'views';
    private readonly _panel: vscode.WebviewPanel;

    constructor(context: vscode.ExtensionContext, snippet: Snippet, snippetsProvider: SnippetsProvider) {
        this._panel = vscode.window.createWebviewPanel(
            'editSnippet', // Identifies the type of the webview. Used internally
            `Edit Snippet [${snippet.label}]`, // Title of the panel displayed to the user
            {
                viewColumn: vscode.ViewColumn.One,  // Editor column to show the new webview panel in.
                preserveFocus: true
            },
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                enableCommandUris: true,
                localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, EditSnippet.viewsFolder))]
            }
        );

        this._panel.iconPath = {
            light: vscode.Uri.file(path.join(__filename, '..', '..', 'resources', 'icons', 'light', 'file.svg')),
            dark: vscode.Uri.file(path.join(__filename, '..', '..', 'resources', 'icons', 'dark', 'file.svg'))
        };

        const resourceName = "editSnippet";
        const htmlTemplate = path.join(context.extensionPath, EditSnippet.viewsFolder, `${resourceName}.html`);
        this._panel.webview.html = mustache.render(fs.readFileSync(htmlTemplate).toString(),
            {
                cspSource: this._panel.webview.cspSource,
                resetCssUri: this._panel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, EditSnippet.viewsFolder, 'css', 'reset.css'))),
                cssUri: this._panel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, EditSnippet.viewsFolder, 'css', `${resourceName}.css`))),
                jsUri: this._panel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, EditSnippet.viewsFolder, 'js', `${resourceName}.js`))),
                snippet: snippet,
                docsUrl: EditSnippet.docsUrl
            }
        );

        // Handle messages from the webview
        this._panel.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'edit-snippet':
                        console.log('Form returned ' + message);
                        const { label, value } = message.data;
                        // call provider only if there is data change
                        if (label) {
                            snippet.label = label;
                        }
                        if (value) {
                            snippet.value = value;
                        }
                        snippetsProvider.editSnippet(snippet);
                        this._panel.dispose();
                        return;
                }
            },
            undefined, context.subscriptions
        );
    }
}
