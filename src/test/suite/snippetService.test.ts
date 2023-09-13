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
