import { Snippet } from '../interface/snippet';

export class EditSnippet {
    private static docsUrl = "https://code.visualstudio.com/docs/editor/userdefinedsnippets#_snippet-syntax";

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
                <textarea name="snippet-value" rows="20" cols="75" required onkeyup="detectSnippetSyntax(this)">${snippet.value}</textarea>
                <br/><input type="submit" value="Save">

                <div name="_snippets_syntax">
                Snippet syntax was detected: see
                <a href="${EditSnippet.docsUrl}" target="_blank">docs</a>
                for more information.
                </div>
            </form>
        
            <script>
                function detectSnippetSyntax(e) {
                    const div = document.querySelector(\`div[name="_snippets_syntax"]\`);
                    const regex = '\\\\\${?\\\\w+(:?\\\\S*)}?';
                    let re = new RegExp(regex);
                    var res = e.value.search(re);
                    div.style.display = res < 0 ? "none" : "block";
                }

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
                }());
            
                detectSnippetSyntax(document.getElementsByName("snippet-value")[0]);
            </script>
        </body>
        </html>`;
    }
}