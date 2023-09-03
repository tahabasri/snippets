import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as mustache from 'mustache';
import { Snippet } from '../interface/snippet';
import { UIUtility } from '../utility/uiUtility';

export abstract class EditView {
    private static snippetsConfigKey = "snippets";
    private static docsUrl = "https://code.visualstudio.com/docs/editor/userdefinedsnippets#_snippet-syntax";
    private static readonly viewsFolder: string = 'views';
    protected readonly _panel: vscode.WebviewPanel;

    constructor(
        context: vscode.ExtensionContext,
        snippet: Snippet,
        viewType: string, // 'editSnippetFolder'
        iconName: string,
        title: string // 'Edit Folder'
        ) {
        this._panel = vscode.window.createWebviewPanel(
            viewType, // Identifies the type of the webview. Used internally
            `${title} [${snippet.label}]`, // Title of the panel displayed to the user
            {
                viewColumn: vscode.ViewColumn.One,  // Editor column to show the new webview panel in.
                preserveFocus: true
            },
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                enableCommandUris: true,
                localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, EditView.viewsFolder))]
            }
        );

        this._panel.iconPath = {
            light: vscode.Uri.file(path.join(__filename, '..', '..', 'resources', 'icons', 'light', `${iconName}.svg`)),
            dark: vscode.Uri.file(path.join(__filename, '..', '..', 'resources', 'icons', 'dark', `${iconName}.svg`))
        };

        const htmlTemplate = path.join(context.extensionPath, EditView.viewsFolder, `${viewType}.html`);
        this._panel.webview.html = mustache.render(fs.readFileSync(htmlTemplate).toString(),
            {
                cspSource: this._panel.webview.cspSource,
                resetCssUri: this._panel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, EditView.viewsFolder, 'css', 'reset.css'))),
                cssUri: this._panel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, EditView.viewsFolder, 'css', 'vscode-custom.css'))),
                jsUri: this._panel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, EditView.viewsFolder, 'js', `${viewType}.js`))),
                snippet: snippet,
                docsUrl: EditView.docsUrl,
                expertMode: vscode.workspace.getConfiguration(EditView.snippetsConfigKey).get("expertMode"),
                languages: UIUtility.getLanguageNamesWithExtensions()
            }
        );

        // Handle messages from the webview
        this._panel.webview.onDidReceiveMessage(
            message => this.handleReceivedMessage(message),
            undefined, context.subscriptions
        );
    }

    abstract handleReceivedMessage(message: any): any; // must be implemented in derived classes
}