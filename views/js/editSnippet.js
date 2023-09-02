(function() {
    // add TAB support
    const snippetValue = document.getElementById('snippet-value');
    snippetValue.addEventListener('keydown', function (e) {
        // [Tab] pressed
        if (e.key === "Tab") {
            // suspend default behaviour
            e.preventDefault();
            // Get the current cursor position
            let cursorPosition = snippetValue.selectionStart;
            // Insert tab space at the cursor position
            let newValue = snippetValue.value.substring(0, cursorPosition) + "\t" +
                snippetValue.value.substring(cursorPosition);
            // Update the snippetValue value and cursor position
            snippetValue.value = newValue;
            snippetValue.selectionStart = cursorPosition + 1;
            snippetValue.selectionEnd = cursorPosition + 1;
            return;
        }
    });

    const vscode = acquireVsCodeApi();

    const resolveSyntaxCB = document.lastChild.querySelector('input[name="_snippets_resolve_syntax"]');
    resolveSyntaxCB.checked = resolveSyntaxCB.value === "true" ? "checked" : "" ;

    document.querySelector('form').addEventListener('submit', (e) => {
        e.preventDefault();
        const form = document.querySelector('form[name="edit-snippet-form"]');
        const snippetLabel = form.elements['snippet-label'].value;
        const snippetDescription = form.elements['snippet-description'].value;
        const snippetValue = form.elements['snippet-value'].value;
        const resolveSyntax = form.elements['snippet-resolveSyntax'].checked;

        vscode.postMessage({
            data: {
                label: snippetLabel,
                description: snippetDescription,
                value: snippetValue,
                resolveSyntax: resolveSyntax
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