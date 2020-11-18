import * as vscode from 'vscode';
import { SnippetsProvider } from './provider/snippetsProvider';
import { Snippet } from './interface/snippet';

export function activate(context: vscode.ExtensionContext) {

	const content: Snippet = {
		"label": "snippets",
		//"id": 1,
		"children": [
			{
				"label": "Bootstrap_Snippets",
				// "id": 2,
				"children": [
					{
						"label": "Alerts",
						// "id": 3,
						"children": [
							{
								"label": "Success Alert",
								// "id": 6,
								"value": '<div class="alert alert-success" role="alert"></div>',
								"children": []
							}
						]
					},
					{
						"label": "Cards",
						// "id": 4,
						"children": [
							{
								"label": "Primary Card",
								"value": '<div class="card text-white bg-primary mb-3" style="max-width: 18rem;"></div>',
								// "id": 5,
								"children": []
							}
						]
					}
				]
			}
		]
	};

	function openSnippet(value:string) {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
		  vscode.window.showInformationMessage("no editor is open");
		  return;
		}
		editor.edit(edit => {
			edit.insert(editor.selection.start, value);
		});
	}

	context.subscriptions.push(
		vscode.commands.registerCommand('snippets.openSnippet', openSnippet)
	);

	const snippetsProvider = new SnippetsProvider(content);
	
	vscode.window.registerTreeDataProvider('snippetsExplorer', snippetsProvider);
	vscode.commands.registerCommand('snippetsExplorer.refreshEntry', () =>
		snippetsProvider.refresh()
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('snippets.helloWorld', () => {
			vscode.window.showInformationMessage('Hello World from Snippets!');
		})
	);
}

export function deactivate() { }
