(function() {
    // language auto select language
    const select = document.getElementById('snippet-language');
    select.value = select.getAttribute('init-value');

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

        // Ensure all fields are synchronized before submitting
        form.elements['snippet-label'].dispatchEvent(new Event('input'));
        form.elements['snippet-description'].dispatchEvent(new Event('input'));
        form.elements['snippet-language'].dispatchEvent(new Event('change'));
        form.elements['snippet-prefix'].dispatchEvent(new Event('input'));
        form.elements['snippet-value'].dispatchEvent(new Event('input'));
        form.elements['snippet-resolveSyntax'].dispatchEvent(new Event('change'));
        
        const snippetLabel = form.elements['snippet-label'].value;
        const snippetDescription = form.elements['snippet-description'].value;
        const snippetLanguage = form.elements['snippet-language'].value;
        let snippetPrefix = form.elements['snippet-prefix'].value;
        if (snippetPrefix) {
            snippetPrefix = camelize(snippetPrefix);
        }
        const snippetValue = form.elements['snippet-value'].value;
        const resolveSyntax = form.elements['snippet-resolveSyntax'].checked;

        vscode.postMessage({
            data: {
                label: snippetLabel,
                prefix: snippetPrefix,
                language: snippetLanguage,
                description: snippetDescription,
                value: snippetValue,
                resolveSyntax: resolveSyntax
            },
            command: 'edit-snippet'
        });
    });

    function camelize(str) {
        return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(word, index) {
            return index === 0 ? word.toLowerCase() : word.toUpperCase();
        }).replace(/\s+/g, '');
    }

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