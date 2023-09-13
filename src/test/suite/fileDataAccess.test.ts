import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import { FileDataAccess } from '../../data/fileDataAccess';
import { Snippet } from '../../interface/snippet';

suite('FileDataAccess Tests', () => {
  // Create a temporary test data file for testing
  const testDataFile = path.join(__dirname, 'testData.json');

  // Create a temporary root element for testing
  const testRootElement: Snippet = {
    id: 1,
    label: 'Root',
    children: [],
  };

  let fileDataAccess: FileDataAccess;

  setup(() => {
    // Create a new instance of FileDataAccess with the test data file
    fileDataAccess = new FileDataAccess(testDataFile);
  });

  teardown(() => {
    // Clean up the temporary test data file after each test
    if (fs.existsSync(testDataFile)) {
      fs.unlinkSync(testDataFile);
    }
  });

  test('hasNoChild returns true when there are no children', () => {
    // Arrange: Save the test root element with no children
    fileDataAccess.save(testRootElement);

    // Act: Call the hasNoChild method
    const result = fileDataAccess.hasNoChild();

    // Assert: Check if it returns true
    assert.strictEqual(result, true);
  });

  test('hasNoChild returns false when there are children', () => {
    // Arrange: Save the test root element with children
    const rootWithChildren: Snippet = {
      id: 1,
      label: 'Root',
      children: [{ id: 2, label: 'Child', children: [] }],
    };
    fileDataAccess.save(rootWithChildren);

    // Act: Call the hasNoChild method
    const result = fileDataAccess.hasNoChild();

    // Assert: Check if it returns false
    assert.strictEqual(result, false);
  });
});