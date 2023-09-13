import * as assert from 'assert';
import { SnippetsProvider } from '../../provider/snippetsProvider';
import { SnippetService } from '../../service/snippetService';
import { DataAccess } from '../../data/dataAccess';
import { Snippet } from '../../interface/snippet';

suite('SnippetsProvider Tests', () => {
  let snippetsProvider: SnippetsProvider;

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

  // Mock the SnippetService for testing
  class MockSnippetService extends SnippetService {
    constructor() {
      super(new MockDataAccess()); // Pass null and empty array for constructor arguments
    }
    
    // Mock the methods you need for testing
    refresh(): void {
      // Mock the refresh method
    }

    sync(): void {
      // Mock the sync method
    }

    // Mock other methods as needed
  }

  setup(() => {
    // Create a new instance of SnippetsProvider with a mock SnippetService
    snippetsProvider = new SnippetsProvider(new MockSnippetService(), []);
  });

  test('AddSnippet adds a snippet correctly', async () => {
    // Arrange
    const name = 'New Snippet';
    const snippet = 'console.log("Hello, World!");';
    const parentId = 1;

    // Act
    snippetsProvider.addSnippet(name, snippet, parentId);

    // Assert
    const allSnippets = await snippetsProvider.getChildren();
    assert.strictEqual(allSnippets.length, 1);
    assert.strictEqual(allSnippets[0].label, name);
    assert.strictEqual(allSnippets[0].value, snippet);
  });

  test('RemoveSnippet removes a snippet correctly', async () => {
    // Arrange
    const name = 'New Snippet';
    const snippet = 'console.log("Hello, World!");';
    const parentId = 1;
    snippetsProvider.addSnippet(name, snippet, parentId);

    // Act
    let allSnippets = await snippetsProvider.getChildren();
    snippetsProvider.removeSnippet(allSnippets[0]);

    // Assert
    allSnippets = await snippetsProvider.getChildren();
    assert.strictEqual(allSnippets.length, 0);
  });
});
