import * as vscode from 'vscode';

/**
 * Tints snippet/folder labels in the tree view.
 *
 * VS Code's only hook for coloring a tree item's label is `FileDecorationProvider`.
 * The chosen color rides in the item's `resourceUri` query (`...?color=<themeColorId>`),
 * so this provider stays stateless: it simply reads the color back from the uri.
 *
 * The icon itself is tinted separately via the item's `ThemeIcon` color (see
 * SnippetsProvider) so that the original icon glyph is always preserved - a resourceUri
 * alone would override icon resolution and blank out folder icons.
 *
 * VS Code caches decorations per resourceUri, so when colors change (e.g. toggling the
 * cascade setting) `refresh()` must be called to invalidate the cache and re-query.
 */
export class DecorationProvider implements vscode.FileDecorationProvider {
	private _disposables: vscode.Disposable[] = [];

	private _onDidChangeFileDecorations = new vscode.EventEmitter<vscode.Uri | vscode.Uri[] | undefined>();
	readonly onDidChangeFileDecorations: vscode.Event<vscode.Uri | vscode.Uri[] | undefined> = this._onDidChangeFileDecorations.event;

	constructor() {
		this._disposables.push(vscode.window.registerFileDecorationProvider(this));
	}

	// invalidate all decorations so VS Code re-queries them (colors may have changed)
	refresh(): void {
		this._onDidChangeFileDecorations.fire(undefined);
	}

	provideFileDecoration(uri: vscode.Uri, _token: vscode.CancellationToken): vscode.ProviderResult<vscode.FileDecoration> {
		const color = new URLSearchParams(uri.query).get('color');
		if (!color) {
			return;
		}
		return {
			color: new vscode.ThemeColor(color),
			propagate: false
		};
	}

	dispose() {
		this._onDidChangeFileDecorations.dispose();
		this._disposables.forEach(dispose => dispose.dispose());
	}
}
