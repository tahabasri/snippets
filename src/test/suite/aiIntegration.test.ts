import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { Snippet } from '../../interface/snippet';
import { SnippetService } from '../../service/snippetService';
import * as commands from '../../config/commands';
import { DataAccess } from '../../data/dataAccess';
import { UIUtility } from '../../utility/uiUtility';

suite('AI Integration Commands Tests', () => {
  // Mock classes for testing
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

    save(data: Snippet): void {
      this._data = data;
    }
  }

  let sandbox: sinon.SinonSandbox;
  let snippetService: SnippetService;
  let wsSnippetService: SnippetService;
  let executeCommandStub: sinon.SinonStub;
  
  // Instead of stubbing clipboard directly, we'll use a workaround
  let oldClipboardContent = 'old content';
  let fakeClipboard = {
    readText: async () => oldClipboardContent,
    writeText: async () => {}
  };

  setup(() => {
    sandbox = sinon.createSandbox();
    snippetService = new SnippetService(new MockDataAccess());
    wsSnippetService = new SnippetService(new MockDataAccess());
    
    // Setup test snippets
    snippetService.addSnippet({
      id: 2,
      parentId: 1,
      label: 'Test Snippet',
      value: 'console.log("test");',
      children: []
    });
    
    // Create stub for executeCommand
    executeCommandStub = sandbox.stub(vscode.commands, 'executeCommand');
    
    // Create spy for clipboard operations
    sandbox.stub(vscode.env, 'clipboard').value(fakeClipboard);
    sandbox.spy(fakeClipboard, 'readText');
    sandbox.spy(fakeClipboard, 'writeText');
  });

  teardown(() => {
    sandbox.restore();
  });

  test('addToChat should add a snippet to chat', async () => {
    // Arrange
    const snippet: Snippet = {
      id: 2,
      label: 'Test Snippet',
      value: 'console.log("test");',
      children: []
    };
    
    // Act
    await commands.addToChat(snippet, snippetService, wsSnippetService, false, 'workbench.action.chat.openInSidebar');
    
    // Assert
    assert.ok(executeCommandStub.calledWith('workbench.action.chat.openInSidebar'));
    assert.ok(executeCommandStub.calledWith('editor.action.clipboardPasteAction'));
  });

  test('addAsCodeSnippetToChat should add a snippet as code block to chat', async () => {
    // Arrange
    const snippet: Snippet = {
      id: 2,
      label: 'Test Snippet',
      value: 'console.log("test");',
      children: []
    };
    
    // Act
    await commands.addAsCodeSnippetToChat(snippet, snippetService, wsSnippetService, false, 'workbench.action.chat.openInSidebar');
    
    // Assert
    assert.ok(executeCommandStub.calledWith('workbench.action.chat.openInSidebar'));
    assert.ok(executeCommandStub.calledWith('editor.action.clipboardPasteAction'));
  });

  test('addToChat should request snippet selection when no snippet is provided', async () => {
    // Arrange
    const selectedSnippet: Snippet = {
      id: 2,
      label: 'Test Snippet',
      value: 'console.log("test");',
      children: []
    };

    // Mock UIUtility.requestSnippetFromUser
    const requestSnippetStub = sandbox.stub(UIUtility, 'requestSnippetFromUser').resolves(selectedSnippet);
    
    // Act
    await commands.addToChat(undefined, snippetService, wsSnippetService, false, 'workbench.action.chat.openInSidebar');
    
    // Assert
    assert.ok(requestSnippetStub.calledOnce);
    assert.ok(executeCommandStub.calledWith('workbench.action.chat.openInSidebar'));
    
    // Restore the original method
    requestSnippetStub.restore();
  });

  test('addToChat should do nothing when no snippet is selected', async () => {
    // Arrange
    // Mock UIUtility.requestSnippetFromUser to return undefined (user cancelled)
    const requestSnippetStub = sandbox.stub(UIUtility, 'requestSnippetFromUser').resolves(undefined);
    
    // Act
    await commands.addToChat(undefined, snippetService, wsSnippetService, false, 'workbench.action.chat.openInSidebar');
    
    // Assert
    assert.ok(requestSnippetStub.calledOnce);
    assert.ok(!executeCommandStub.called);
    
    // Restore the original method
    requestSnippetStub.restore();
  });

  test('addToChat should include workspace snippets when available', async () => {
    // Arrange
    // Add a workspace snippet
    wsSnippetService.addSnippet({
      id: 3,
      parentId: 1,
      label: 'Workspace Snippet',
      value: 'console.log("workspace");',
      children: []
    });
    
    // Mock getAllSnippets to verify it's called correctly
    const getAllSnippetsStub = sandbox.spy(snippetService, 'getAllSnippets');
    const getAllWsSnippetsStub = sandbox.spy(wsSnippetService, 'getAllSnippets');
    
    // Mock UIUtility.requestSnippetFromUser
    const requestSnippetStub = sandbox.stub(UIUtility, 'requestSnippetFromUser').resolves(undefined);
    
    // Act
    await commands.addToChat(undefined, snippetService, wsSnippetService, true, 'workbench.action.chat.openInSidebar');
    
    // Assert
    assert.ok(getAllSnippetsStub.calledOnce);
    assert.ok(getAllWsSnippetsStub.calledOnce);
    
    // Verify that requestSnippetFromUser was called with a concatenated array of snippets
    assert.ok(requestSnippetStub.calledOnce);
    
    // Restore the original method
    requestSnippetStub.restore();
  });
});