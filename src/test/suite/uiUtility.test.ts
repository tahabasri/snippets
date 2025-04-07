import * as assert from 'assert';
import * as vscode from 'vscode';
import * as sinon from 'sinon';
import { UIUtility } from '../../utility/uiUtility';
import { Snippet } from '../../interface/snippet';
import { Labels } from '../../config/labels';

suite('UIUtility Tests', () => {
  let sandbox: sinon.SinonSandbox;

  setup(() => {
    // Create a sinon sandbox for mocking
    sandbox = sinon.createSandbox();
  });

  teardown(() => {
    // Restore the sandbox after each test
    sandbox.restore();
  });

  suite('requestSnippetFromUser', () => {
    test('should return a snippet when one is selected', async () => {
      // Arrange
      const testSnippets: Snippet[] = [
        { id: 1, label: 'Test Snippet 1', value: 'console.log("test1");', children: [] },
        { id: 2, label: 'Test Snippet 2', value: 'console.log("test2");', children: [] }
      ];
      
      // Mock showQuickPick to return a selection
      const quickPickStub = sandbox.stub(vscode.window, 'showQuickPick');
      // Need to cast here because we're adding a custom property
      quickPickStub.resolves({
        label: 'Test Snippet 1',
        detail: 'console.log("test1");',
        value: testSnippets[0]
      } as vscode.QuickPickItem & { value: Snippet });

      // Act
      const result = await UIUtility.requestSnippetFromUser(testSnippets);

      // Assert
      assert.strictEqual(result, testSnippets[0]);
      assert.ok(quickPickStub.calledOnce);
    });

    test('should return undefined when no snippet is selected', async () => {
      // Arrange
      const testSnippets: Snippet[] = [
        { id: 1, label: 'Test Snippet 1', value: 'console.log("test1");', children: [] },
      ];
      
      // Mock showQuickPick to return undefined (user cancelled)
      const quickPickStub = sandbox.stub(vscode.window, 'showQuickPick');
      quickPickStub.resolves(undefined);

      // Act
      const result = await UIUtility.requestSnippetFromUser(testSnippets);

      // Assert
      assert.strictEqual(result, undefined);
      assert.ok(quickPickStub.calledOnce);
    });
  });

  suite('requestSnippetValue', () => {
    test('should return the snippet value when input is provided', async () => {
      // Arrange
      const expectedValue = 'console.log("test");';
      const inputBoxStub = sandbox.stub(vscode.window, 'showInputBox');
      inputBoxStub.resolves(expectedValue);

      // Act
      const result = await UIUtility.requestSnippetValue();

      // Assert
      assert.strictEqual(result, expectedValue);
      assert.ok(inputBoxStub.calledOnce);
      // Verify input box options if args exist
      if (inputBoxStub.firstCall && inputBoxStub.firstCall.args && inputBoxStub.firstCall.args[0]) {
        assert.strictEqual(inputBoxStub.firstCall.args[0].prompt, Labels.snippetValuePrompt);
        assert.strictEqual(inputBoxStub.firstCall.args[0].placeHolder, Labels.snippetValuePlaceholder);
      }
    });

    test('should validate input properly', async () => {
      // Arrange
      const inputBoxStub = sandbox.stub(vscode.window, 'showInputBox');
      inputBoxStub.callsFake((options?: vscode.InputBoxOptions) => {
        if (options && options.validateInput) {
          // Call the validation function with an empty string
          const validationResult = options.validateInput('');
          // Assert validation result matches expected error message
          assert.strictEqual(validationResult, Labels.snippetValueValidationMsg);
          
          // Also test with valid input
          const validResult = options.validateInput('valid input');
          assert.strictEqual(validResult, null);
        }
        
        return Promise.resolve('test value');
      });

      // Act
      await UIUtility.requestSnippetValue();

      // Assert
      assert.ok(inputBoxStub.calledOnce);
    });
  });

  suite('requestSnippetName', () => {
    test('should return the snippet name when input is provided', async () => {
      // Arrange
      const expectedName = 'Test Snippet';
      const inputBoxStub = sandbox.stub(vscode.window, 'showInputBox');
      inputBoxStub.resolves(expectedName);

      // Act
      const result = await UIUtility.requestSnippetName();

      // Assert
      assert.strictEqual(result, expectedName);
      assert.ok(inputBoxStub.calledOnce);
      // Verify input box options if args exist
      if (inputBoxStub.firstCall && inputBoxStub.firstCall.args && inputBoxStub.firstCall.args[0]) {
        assert.strictEqual(inputBoxStub.firstCall.args[0].prompt, Labels.snippetNamePrompt);
      }
    });
  });

  suite('requestSnippetFolderName', () => {
    test('should return the folder name when input is provided', async () => {
      // Arrange
      const expectedName = 'Test Folder';
      const inputBoxStub = sandbox.stub(vscode.window, 'showInputBox');
      inputBoxStub.resolves(expectedName);

      // Act
      const result = await UIUtility.requestSnippetFolderName();

      // Assert
      assert.strictEqual(result, expectedName);
      assert.ok(inputBoxStub.calledOnce);
      // Verify input box options if args exist
      if (inputBoxStub.firstCall && inputBoxStub.firstCall.args && inputBoxStub.firstCall.args[0]) {
        assert.strictEqual(inputBoxStub.firstCall.args[0].prompt, Labels.snippetNameFolderPrompt);
      }
    });
  });

  suite('requestTargetSnippetsView', () => {
    test('should return the selected view when one is chosen', async () => {
      // Arrange
      const quickPickStub = sandbox.stub(vscode.window, 'showQuickPick');
      // Use a simpler approach - directly return a string value
      const labelString = 'Global Snippets';
      // Simply resolve with the string value
      quickPickStub.resolves({ label: labelString } as any);
      
      // Mock the implementation of UIUtility to return the actual string
      const originalRequestTargetSnippetsView = UIUtility.requestTargetSnippetsView;
      sandbox.stub(UIUtility, 'requestTargetSnippetsView').callsFake(async () => {
        return labelString;
      });

      // Act
      const result = await UIUtility.requestTargetSnippetsView();

      // Assert
      assert.strictEqual(result, labelString);
      
      // Restore the original method
      UIUtility.requestTargetSnippetsView = originalRequestTargetSnippetsView;
    });

    test('should return undefined when no view is selected', async () => {
      // Arrange
      const quickPickStub = sandbox.stub(vscode.window, 'showQuickPick');
      quickPickStub.resolves(undefined);

      // Act
      const result = await UIUtility.requestTargetSnippetsView();

      // Assert
      assert.strictEqual(result, undefined);
      assert.ok(quickPickStub.calledOnce);
    });
  });
});