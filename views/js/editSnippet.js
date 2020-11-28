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

    function detectSnippetSyntax(element) {
        const regex = '\\${?\\w+(:?\\S*)}?';
        let re = new RegExp(regex);
        var res = element.value.search(re);
        div.style.display = res < 0 ? "none" : "inline";
    };

    const div = document.lastChild.querySelector('div[name="_snippets_syntax"]');
    document.querySelector('textarea[name="snippet-value"]').addEventListener('keyup', (e) => {
        detectSnippetSyntax(e.target);
    });

    detectSnippetSyntax(document.querySelector('textarea[name="snippet-value"]'));
}());