import * as vscode from 'vscode';
import { Snippet } from '../interface/snippet';
import { SnippetsProvider } from './snippetsProvider';

/**
 * Backs the "Quick Edit" feature (#131): a snippet body opens as a virtual document
 * in a real VS Code editor tab, and saving it (ctrl+s) writes the new body back to
 * the snippet through the owning SnippetsProvider.
 *
 * One instance serves both views — extension.ts registers the global provider at
 * activation and the workspace provider when/if it is initialized. The view name is
 * the first URI path segment, the snippet id the second, and the last segment is a
 * display filename whose extension drives syntax highlighting.
 */
export class SnippetEditorProvider implements vscode.FileSystemProvider {
    static scheme = 'snippetseditor';

    private _views = new Map<string, SnippetsProvider>();
    // last write time per uri, so VS Code's dirty-state tracking stays consistent
    private _mtimes = new Map<string, number>();

    private _emitter = new vscode.EventEmitter<vscode.FileChangeEvent[]>();
    readonly onDidChangeFile: vscode.Event<vscode.FileChangeEvent[]> = this._emitter.event;

    registerView(view: string, provider: SnippetsProvider): void {
        this._views.set(view, provider);
    }

    buildUri(view: string, snippet: Snippet): vscode.Uri {
        // strip path separators so the label can't inject extra URI segments
        const safeLabel = snippet.label.replace(/[\\/]/g, '_');
        // snippet.language already carries a leading dot (e.g. '.js')
        const extension = snippet.language || '.txt';
        return vscode.Uri.from({
            scheme: SnippetEditorProvider.scheme,
            path: `/${view}/${snippet.id}/${safeLabel}${extension}`
        });
    }

    private lookup(uri: vscode.Uri): { provider: SnippetsProvider, snippet: Snippet } {
        const [view, rawId] = uri.path.replace(/^\//, '').split('/');
        const provider = this._views.get(view);
        const snippet = provider?.getSnippetById(Number(rawId));
        if (!provider || !snippet) {
            throw vscode.FileSystemError.FileNotFound(uri);
        }
        return { provider, snippet };
    }

    // --- FileSystemProvider ---

    watch(_uri: vscode.Uri): vscode.Disposable {
        return new vscode.Disposable(() => { });
    }

    stat(uri: vscode.Uri): vscode.FileStat {
        const { snippet } = this.lookup(uri);
        return {
            type: vscode.FileType.File,
            ctime: 0,
            mtime: this._mtimes.get(uri.toString()) ?? 0,
            size: Buffer.byteLength(snippet.value ?? '', 'utf8')
        };
    }

    readFile(uri: vscode.Uri): Uint8Array {
        const { snippet } = this.lookup(uri);
        return Buffer.from(snippet.value ?? '', 'utf8');
    }

    async writeFile(uri: vscode.Uri, content: Uint8Array, _options: { create: boolean, overwrite: boolean }): Promise<void> {
        const { provider, snippet } = this.lookup(uri);
        snippet.value = Buffer.from(content).toString('utf8');
        // persists via the owning provider so the tree refreshes like any other edit
        await Promise.resolve(provider.editSnippet(snippet));
        this._mtimes.set(uri.toString(), Date.now());
        this._emitter.fire([{ type: vscode.FileChangeType.Changed, uri }]);
    }

    readDirectory(uri: vscode.Uri): [string, vscode.FileType][] {
        throw vscode.FileSystemError.NoPermissions(uri);
    }

    createDirectory(uri: vscode.Uri): void {
        throw vscode.FileSystemError.NoPermissions(uri);
    }

    delete(uri: vscode.Uri): void {
        throw vscode.FileSystemError.NoPermissions(uri);
    }

    rename(oldUri: vscode.Uri): void {
        throw vscode.FileSystemError.NoPermissions(oldUri);
    }
}
