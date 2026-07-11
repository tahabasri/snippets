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

  test('save is atomic: leaves no temp file and survives a save/load roundtrip', async () => {
    const rootWithChildren: Snippet = {
      id: 1,
      label: 'Root',
      children: [{ id: 2, label: 'Child', value: 'v', children: [] }],
    };

    await fileDataAccess.save(rootWithChildren);

    assert.strictEqual(fs.existsSync(`${testDataFile}.tmp`), false, 'temp file must be renamed away');
    const loaded = fileDataAccess.load();
    assert.strictEqual(loaded.children.length, 1);
    assert.strictEqual(loaded.children[0].label, 'Child');
  });

  test('load throws on corrupted JSON by default (transient import instances)', () => {
    fs.writeFileSync(testDataFile, '{"id":1,"label":"Root","chi');

    assert.throws(() => fileDataAccess.load());
    // the corrupt source file must be left untouched
    assert.strictEqual(fs.readFileSync(testDataFile, 'utf8'), '{"id":1,"label":"Root","chi');
  });

  test('load recovers from corrupted JSON when recovery is enabled (persistent backend)', () => {
    const recoveringAccess = new FileDataAccess(testDataFile, true);
    fs.writeFileSync(testDataFile, '{"id":1,"label":"Root","chi');

    let recovered: Snippet | undefined;
    const corruptCopies = () => fs.readdirSync(__dirname).filter(f => f.startsWith('testData.json.corrupt-'));
    try {
      recovered = recoveringAccess.load();

      // a fresh empty root is returned and re-seeded on disk
      assert.ok(recovered);
      assert.strictEqual(recovered!.children.length, 0);
      assert.strictEqual(recoveringAccess.hasNoChild(), true);

      // the unreadable content is preserved next to the data file
      const copies = corruptCopies();
      assert.strictEqual(copies.length, 1, 'corrupt file must be kept aside');
      assert.strictEqual(fs.readFileSync(path.join(__dirname, copies[0]), 'utf8'), '{"id":1,"label":"Root","chi');
    } finally {
      for (const f of corruptCopies()) {
        fs.unlinkSync(path.join(__dirname, f));
      }
    }
  });
});