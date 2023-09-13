import * as assert from 'assert';
import { StringUtility } from '../../utility/stringUtility';

suite('StringUtility Tests', () => {
  suite('formatString', () => {
    test('should format a string with values', () => {
      const formatted = StringUtility.formatString('Hello, {0}!', 'John');
      assert.strictEqual(formatted, 'Hello, John!');
    });

    test('should handle multiple placeholders', () => {
      const formatted = StringUtility.formatString('{0} likes {1}.', 'Alice', 'chocolate');
      assert.strictEqual(formatted, 'Alice likes chocolate.');
    });

    test('should handle missing values', () => {
      const formatted = StringUtility.formatString('Hello, {0}!');
      assert.strictEqual(formatted, 'Hello, {0}!');
    });
  });

  suite('isBlank', () => {
    test('should return true for an empty string', () => {
      const result = StringUtility.isBlank('');
      assert.strictEqual(result, true);
    });

    test('should return true for a string with only whitespace', () => {
      const result = StringUtility.isBlank('   ');
      assert.strictEqual(result, true);
    });

    test('should return false for a non-empty string', () => {
      const result = StringUtility.isBlank('Hello, world!');
      assert.strictEqual(result, false);
    });

    test('should return false for a string with leading/trailing whitespace', () => {
      const result = StringUtility.isBlank('   Hello, world!   ');
      assert.strictEqual(result, false);
    });
  });
});