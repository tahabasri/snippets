import * as assert from 'assert';
import { Memento } from 'vscode';
import { Snippet } from '../../interface/snippet';
import { SnippetService } from '../../service/snippetService';
import { DataAccess } from '../../data/dataAccess';

suite('SnippetService Tests', () => {
  // Mock the DataAccess and Memento objects for testing
  class MockDataAccess implements DataAccess {
    private _data: Snippet = {
      id: 1,
      label: 'Root',
      children: [],
    };

    hasNoChild(): boolean {
      return !this._data.children || this._data.children.length === 0;
    }

    load(): Snippet {
      return this._data;
    }

    save(data: Snippet): void {
      this._data = data;
    }
  }

  // DataAccess that hands back a fresh deep clone on every load, like FileDataAccess
  // (JSON.parse) or a memento that re-deserializes. Used to reproduce the stale-reference
  // bug where an open edit webview holds an orphaned node after the tree is reloaded.
  class CloningMockDataAccess implements DataAccess {
    private _data: Snippet = {
      id: 1,
      label: 'Root',
      children: [],
    };

    hasNoChild(): boolean {
      return !this._data.children || this._data.children.length === 0;
    }

    load(): Snippet {
      return JSON.parse(JSON.stringify(this._data));
    }

    save(data: Snippet): void {
      this._data = JSON.parse(JSON.stringify(data));
    }
  }

  // Mock the Memento object for testing
  class MockMemento implements Memento {
    keys(): readonly string[] {
      throw new Error('Method not implemented.');
    }
    private storage: { [key: string]: any } = {};

    get<T>(key: string, defaultValue?: T): T | undefined {
      return this.storage[key] ?? defaultValue;
    }

    update(key: string, value: any): Thenable<void> {
      this.storage[key] = value;
      return Promise.resolve();
    }
  }

  let snippetService: SnippetService;

  setup(() => {
    // Create a new instance of SnippetService with mock DataAccess and Memento objects
    const mockDataAccess = new MockDataAccess();
    snippetService = new SnippetService(mockDataAccess);
  });

  test('AddSnippet adds a snippet correctly', () => {
    // Arrange
    const newSnippet: Snippet = {
      id: 2,
      label: 'New Snippet',
      children: [],
    };

    // Act
    snippetService.addSnippet(newSnippet);

    // Assert
    const allSnippets = snippetService.getAllSnippets();
    assert.strictEqual(allSnippets.length, 1);
    assert.strictEqual(allSnippets[0].label, 'New Snippet');
  });

  test('UpdateSnippet persists edited fields', () => {
    // Arrange
    const newSnippet: Snippet = {
      id: 2,
      parentId: 1,
      label: 'Old Label',
      value: 'old value',
      children: [],
    };
    snippetService.addSnippet(newSnippet);

    // Act
    snippetService.updateSnippet({
      id: 2,
      parentId: 1,
      label: 'New Label',
      value: 'new value',
      language: 'js',
      description: 'desc',
      prefix: 'pfx',
      resolveSyntax: true,
      children: [],
    });

    // Assert
    const allSnippets = snippetService.getAllSnippets();
    assert.strictEqual(allSnippets.length, 1);
    assert.strictEqual(allSnippets[0].label, 'New Label');
    assert.strictEqual(allSnippets[0].value, 'new value');
    assert.strictEqual(allSnippets[0].language, 'js');
    assert.strictEqual(allSnippets[0].description, 'desc');
    assert.strictEqual(allSnippets[0].prefix, 'pfx');
    assert.strictEqual(allSnippets[0].resolveSyntax, true);
  });

  test('UpdateSnippet saves even when the caller holds a stale, orphaned node (issue #129)', () => {
    // Arrange: a service whose backing store re-deserializes the tree on each load,
    // so reloading produces fresh object references (like the real file/memento stores).
    const service = new SnippetService(new CloningMockDataAccess());
    const snip: Snippet = {
      id: 2,
      parentId: 1,
      label: 'Old Label',
      value: 'old value',
      children: [],
    };
    service.addSnippet(snip);
    service.saveSnippets();

    // Simulate an IntelliSense completion lookup reloading the tree while the edit
    // webview is open. The service's in-memory tree is now a fresh clone, and `snip`
    // (still held by the webview) is an orphaned reference into the old tree.
    service.getAllSnippets();

    // Act: the webview mutates its orphaned node and asks the service to persist it.
    snip.label = 'New Label';
    snip.value = 'new value';
    service.updateSnippet(snip);
    service.saveSnippets();

    // Assert: a fresh reload must reflect the edit (it would be silently lost before the fix).
    service.refresh();
    const allSnippets = service.getAllSnippets();
    assert.strictEqual(allSnippets.length, 1);
    assert.strictEqual(allSnippets[0].label, 'New Label');
    assert.strictEqual(allSnippets[0].value, 'new value');
  });

  test('RemoveSnippet removes a snippet correctly', () => {
    // Arrange
    const newSnippet: Snippet = {
      id: 2,
      label: 'New Snippet',
      children: [],
    };
    snippetService.addSnippet(newSnippet);

    // Act
    snippetService.removeSnippet(newSnippet);

    // Assert
    const allSnippets = snippetService.getAllSnippets();
    assert.strictEqual(allSnippets.length, 0);
  });
});
