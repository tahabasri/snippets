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
}());