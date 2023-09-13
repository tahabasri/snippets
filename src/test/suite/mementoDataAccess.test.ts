import * as assert from 'assert';
import { Memento } from 'vscode';
import { MementoDataAccess } from '../../data/mementoDataAccess';
import { Snippet } from '../../interface/snippet';

suite('MementoDataAccess Tests', () => {
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

  // Create a temporary root element for testing
  const testRootElement: Snippet = {
    id: 1,
    label: 'Root',
    children: [],
  };

  let mementoDataAccess: MementoDataAccess;

  setup(() => {
    // Create a new instance of MementoDataAccess with a mock Memento object
    const mockMemento = new MockMemento();
    mockMemento.update(MementoDataAccess.snippetsMementoPrefix, testRootElement);
    mementoDataAccess = new MementoDataAccess(mockMemento);
  });

  test('hasNoChild returns true when there are no children', () => {
    // Act: Call the hasNoChild method
    const result = mementoDataAccess.hasNoChild();

    // Assert: Check if it returns true
    assert.strictEqual(result, true);
  });

  test('hasNoChild returns false when there are children', () => {
    // Arrange: Set a test root element with children
    const rootWithChildren: Snippet = {
      id: 1,
      label: 'Root',
      children: [{ id: 2, label: 'Child', children: [] }],
    };
    mementoDataAccess.save(rootWithChildren);

    // Act: Call the hasNoChild method
    const result = mementoDataAccess.hasNoChild();

    // Assert: Check if it returns false
    assert.strictEqual(result, false);
  });
});
