(function() {
    const vscode = acquireVsCodeApi();

    document.querySelector('form').addEventListener('submit', (e) => {
        e.preventDefault();
        const form = document.querySelector('form[name="edit-folder-form"]');

        // Ensure all fields are synchronized before submitting
        form.elements['folder-name'].dispatchEvent(new Event('input'));
        form.elements['folder-icon'].dispatchEvent(new Event('input'));

        const snippetLabel = form.elements['folder-name'].value;
        const snippetIcon = form.elements['folder-icon'].value;

        vscode.postMessage({
            data: {
                label: snippetLabel,
                icon: snippetIcon
            },
            command: 'edit-folder'
        });
    });
}());