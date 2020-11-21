import { Snippet } from '../interface/snippet';

export class EditSnippet {

	static getWebviewContent(snippet: Snippet):string {
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${snippet.label}</title>
        </head>
        <body>
            <form name="edit-snippet-form">
                <label for="snippet-label">Snippet Label:</label><br>
                <input type="text" id="snippet-label" value="${snippet.label}" required><br><br>
                <label for="snippet-value">Snippet Content:</label><br>
                <textarea name="snippet-value" rows="20" cols="75" required>${snippet.value}</textarea>
                <br/><input type="submit" value="Save">
            </form>
        
            <script>
                (function() {
                    const vscode = acquireVsCodeApi();

                    document.querySelector('form').addEventListener('submit', (e) => {
                        e.preventDefault();
                        const form = document.querySelector('form[name="edit-snippet-form"]');
                        const snippetLabel = form.elements['snippet-label'].value;
                        const snippetValue = form.elements['snippet-value'].value;

                        vscode.postMessage({
                            data: {
                                label: snippetLabel,
                                value: snippetValue
                            },
                            command: 'edit-snippet'
                        });
                    });
                }())
            </script>
        </body>
        </html>`;
    }
}