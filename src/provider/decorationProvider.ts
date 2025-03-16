import * as vscode from 'vscode';

export class DecorationProvider implements vscode.FileDecorationProvider {
	private _disposables: vscode.Disposable[] = [];

	private _onDidChangeFileDecorations: vscode.EventEmitter<vscode.Uri | vscode.Uri[]> = new vscode.EventEmitter<vscode.Uri | vscode.Uri[]>();
	onDidChangeFileDecorations: vscode.Event<vscode.Uri | vscode.Uri[]> = this._onDidChangeFileDecorations.event;

	constructor() {
		this._disposables.push(vscode.window.registerFileDecorationProvider(this));
	}

    async decorateSnippet(resourceUri: vscode.Uri): Promise<void>  {
        // if (snippet.contextValue?.startsWith('snippet')) {
            this._onDidChangeFileDecorations.fire(resourceUri);
        // }
      }

	provideFileDecoration(uri: vscode.Uri, _token: vscode.CancellationToken): vscode.ProviderResult<vscode.FileDecoration> {
		if (!uri.scheme.startsWith('snippets')) {
			return;
		}	
        return {
				propagate: false,
				// badge: "⇐",
                color: new vscode.ThemeColor("charts.red"), 
				tooltip: 'unread notification'
		};
	}


	dispose() {
		this._disposables.forEach(dispose => dispose.dispose());
	}
}