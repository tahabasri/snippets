import * as assert from 'assert';
import * as vscode from 'vscode';

/**
 * Verification test for issue #95 — snippet IntelliSense does not fire in
 * Remote-SSH (and other remote) sessions.
 *
 * The completion provider in extension.ts registers DocumentFilters that pin
 * `scheme: 'file'` / `scheme: 'untitled'`. Remote documents (Remote-SSH, WSL,
 * Dev Containers) use the `vscode-remote` scheme, so VS Code never matches the
 * provider against them and `provideCompletionItems` is never called.
 *
 * `vscode.languages.match(selector, document)` is the exact API VS Code uses
 * internally to decide whether to invoke a provider, so it lets us prove the
 * root cause without an actual remote session.
 */
suite('Completion provider DocumentFilter / scheme (issue #95)', () => {

  // Mirrors the filter currently built in extension.ts for a real language.
  const currentFilter: vscode.DocumentSelector = [
    { language: 'javascript', scheme: 'file' },
    { language: 'javascript', scheme: 'untitled' }
  ];

  // Proposed fix: do not restrict by scheme, so any host (file/untitled/
  // vscode-remote/vscode-vfs/...) matches.
  const proposedFilter: vscode.DocumentSelector = [
    { language: 'javascript' }
  ];

  const fakeDoc = (scheme: string, languageId = 'javascript') => ({
    uri: vscode.Uri.parse(`${scheme}://authority/some/file.js`),
    languageId
  } as vscode.TextDocument);

  test('current filter matches a LOCAL (file) document', () => {
    assert.ok(vscode.languages.match(currentFilter, fakeDoc('file')) > 0,
      'expected the current filter to match local file documents');
  });

  test('current filter FAILS to match a REMOTE (vscode-remote) document — reproduces #95', () => {
    assert.strictEqual(vscode.languages.match(currentFilter, fakeDoc('vscode-remote')), 0,
      'current filter unexpectedly matched a remote document');
  });

  test('proposed scheme-less filter matches a REMOTE (vscode-remote) document', () => {
    assert.ok(vscode.languages.match(proposedFilter, fakeDoc('vscode-remote')) > 0,
      'expected the proposed filter to match remote documents');
  });

  test('proposed scheme-less filter still matches LOCAL and untitled documents', () => {
    assert.ok(vscode.languages.match(proposedFilter, fakeDoc('file')) > 0, 'should match file');
    assert.ok(vscode.languages.match(proposedFilter, fakeDoc('untitled')) > 0, 'should match untitled');
  });
});
