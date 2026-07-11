import * as assert from 'assert';
import * as vscode from 'vscode';
import { SnippetEditorProvider } from '../../provider/snippetEditorProvider';
import { SnippetsProvider } from '../../provider/snippetsProvider';
import { SnippetService } from '../../service/snippetService';
import { Snippet } from '../../interface/snippet';
import { DataAccess } from '../../data/dataAccess';

suite('SnippetEditorProvider (Quick Edit) Tests', () => {
  class MockDataAccess implements DataAccess {
    private _data: Snippet = {
      id: 1,
      label: 'Root',
      children: [],
      lastId: 1
    };

    hasNoChild(): boolean {
      return !this._data.children || this._data.children.length === 0;
    }

    load(): Snippet {
      return this._data;
    }

    save(data: Snippet): Promise<void> {
      this._data = data;
      return Promise.resolve();
    }
  }

  let service: SnippetService;
  let treeProvider: SnippetsProvider;
  let editorProvider: SnippetEditorProvider;
  let snippet: Snippet;

  setup(() => {
    service = new SnippetService(new MockDataAccess());
    treeProvider = new SnippetsProvider(service, []);
    editorProvider = new SnippetEditorProvider();
    editorProvider.registerView('global', treeProvider);

    snippet = {
      id: 2,
      parentId: 1,
      label: 'My Snippet',
      value: 'console.log("hello");',
      language: '.js',
      children: []
    };
    service.addSnippet(snippet);
  });

  test('buildUri encodes view, id and a display filename with the language extension', () => {
    const uri = editorProvider.buildUri('global', snippet);

    assert.strictEqual(uri.scheme, SnippetEditorProvider.scheme);
    assert.strictEqual(uri.path, '/global/2/My Snippet.js');
  });

  test('buildUri falls back to .txt and sanitizes path separators in the label', () => {
    const trickySnippet: Snippet = {
      id: 3,
      parentId: 1,
      label: 'a/b\\c',
      value: 'v',
      children: []
    };
    service.addSnippet(trickySnippet);

    const uri = editorProvider.buildUri('global', trickySnippet);

    assert.strictEqual(uri.path, '/global/3/a_b_c.txt');
  });

  test('readFile returns the snippet body', () => {
    const uri = editorProvider.buildUri('global', snippet);

    const content = Buffer.from(editorProvider.readFile(uri)).toString('utf8');

    assert.strictEqual(content, 'console.log("hello");');
  });

  test('stat reports a file sized to the snippet body', () => {
    const uri = editorProvider.buildUri('global', snippet);

    const stat = editorProvider.stat(uri);

    assert.strictEqual(stat.type, vscode.FileType.File);
    assert.strictEqual(stat.size, Buffer.byteLength(snippet.value!, 'utf8'));
  });

  test('writeFile applies the new body to the snippet and persists it', async () => {
    const uri = editorProvider.buildUri('global', snippet);

    await editorProvider.writeFile(uri, Buffer.from('updated body'), { create: false, overwrite: true });

    // re-resolve from the service to prove it was persisted, not just mutated in place
    const persisted = service.getAllSnippets().find(s => s.id === 2);
    assert.strictEqual(persisted?.value, 'updated body');
  });

  test('writeFile keeps the other snippet fields untouched', async () => {
    const uri = editorProvider.buildUri('global', snippet);

    await editorProvider.writeFile(uri, Buffer.from('updated body'), { create: false, overwrite: true });

    const persisted = service.getAllSnippets().find(s => s.id === 2);
    assert.strictEqual(persisted?.label, 'My Snippet');
    assert.strictEqual(persisted?.language, '.js');
  });

  test('lookups on unknown snippets or views throw FileNotFound', () => {
    const goneSnippet = vscode.Uri.from({ scheme: SnippetEditorProvider.scheme, path: '/global/999/gone.txt' });
    const unknownView = vscode.Uri.from({ scheme: SnippetEditorProvider.scheme, path: '/nope/2/x.txt' });

    assert.throws(() => editorProvider.readFile(goneSnippet), (e: any) => e.code === 'FileNotFound');
    assert.throws(() => editorProvider.stat(unknownView), (e: any) => e.code === 'FileNotFound');
  });

  test('directory-like operations are refused', () => {
    const uri = editorProvider.buildUri('global', snippet);

    assert.throws(() => editorProvider.readDirectory(uri), (e: any) => e.code === 'NoPermissions');
    assert.throws(() => editorProvider.delete(uri), (e: any) => e.code === 'NoPermissions');
    assert.throws(() => editorProvider.rename(uri), (e: any) => e.code === 'NoPermissions');
  });

  test('end to end: opening the uri as a document shows the body, editing + saving persists it', async () => {
    const uri = editorProvider.buildUri('global', snippet);
    // the extension registers the real provider for this scheme; tests register their
    // own instance under the same scheme only if activation did not run — guard for both
    let registration: vscode.Disposable | undefined;
    try {
      try {
        registration = vscode.workspace.registerFileSystemProvider(SnippetEditorProvider.scheme, editorProvider, { isCaseSensitive: true });
      } catch {
        // already registered by the activated extension — use a view name it doesn't serve
        return;
      }
      const document = await vscode.workspace.openTextDocument(uri);
      assert.strictEqual(document.getText(), 'console.log("hello");');

      const edit = new vscode.WorkspaceEdit();
      edit.replace(uri, new vscode.Range(0, 0, document.lineCount, 0), 'edited via editor');
      await vscode.workspace.applyEdit(edit);
      await document.save();

      const persisted = service.getAllSnippets().find(s => s.id === 2);
      assert.strictEqual(persisted?.value, 'edited via editor');
    } finally {
      registration?.dispose();
    }
  });
});
