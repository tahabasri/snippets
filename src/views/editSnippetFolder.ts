import { Snippet } from '../interface/snippet';

export class EditSnippetFolder {

	static getWebviewContent(snippet: Snippet):string {
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${snippet.label}</title>
        </head>
        <body>
            <form name="edit-folder-form">
                <label for="folder-name">Folder Name:</label><br>
                <input type="text" id="folder-name" value="${snippet.label}" required><br><br>
                <br/><input type="submit" value="Save">
            </form>
        
            <script>
                (function() {
                    const vscode = acquireVsCodeApi();

                    document.querySelector('form').addEventListener('submit', (e) => {
                        e.preventDefault();
                        const form = document.querySelector('form[name="edit-folder-form"]');
                        const snippetLabel = form.elements['folder-name'].value;

                        vscode.postMessage({
                            data: {
                                label: snippetLabel
                            },
                            command: 'edit-folder'
                        });
                    });
                }())
            </script>
        </body>
        </html>`;
    }
}