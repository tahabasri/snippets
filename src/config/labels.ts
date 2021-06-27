export const enum Labels {
	noOpenEditor = "No open editor was found.",
	noOpenTerminal = "No open terminal was found.",
	noTextSelected = "No text was selected from active editor.",
	noClipboardContent = "No content was found in the clipboard.",

	insertSnippetName = "Select the snippet you want to open ...",

	viewType = "Select where to save the new snippet ...",
	noViewTypeSelected = "No target was selected for new Snippet.",

	globalSnippets = "Global Snippets",
	wsSnippets = "Workspace Snippets",

	migrateData = "Restore data",
	discardData = "Discard data",

	snippetValuePrompt = "Snippet Value",
	snippetValuePlaceholder = "An example: <div>my cool div</div> ...",
	snippetValueValidationMsg = "Snippet value should not be empty.",
	snippetValueErrorMsg = "Snippet must have a non-empty value.",

	snippetNamePrompt = "Snippet Name",
	snippetNamePlaceholder = "Some examples: Custom Navbar, CSS Alert Style, etc.",
	snippetNameValidationMsg = "Snippet name should not be empty.",
	snippetNameErrorMsg = "Snippet must have a non-empty name.",

	snippetNameFolderPrompt = "Snippet Folder Name",
	snippetNameFolderPlaceholder = "Some examples: Alerts, JS Snippets, etc.",
	snippetFolderNameValidationMsg = "Folder name should not be empty.",
	snippetFolderNameErrorMsg = "Snippet folder must have a non-empty name.",

	snippetsDefaultPath = "Snippets will be saved to default location [{0}].",
	snippetsInvalidPath = "Snippets path [{0}] is not a valid JSON file, will revert back to default location [{1}].",
	snippetsChangedPath = "Snippets location changed to [{0}]",
	snippetsInvalidNewPath = "Snippets path [{0}] is not a valid JSON file, will revert back to old location [{1}].",
	snippetsNoNewPath = "Snippets will be saved to old location [{0}].",

	snippetsMigrateRequest = "You have some old snippets saved in [{0}], do you want to restore them ? (Original file will be removed).",
	snippetsDataRestored = "Snippets restored. Deleted file [{0}].",
	snippetsDataRestoredButFileNotRemoved = "Snippets restored. But couldn't delete file [{0}], please remove it manually.",
	snippetsNoDataRestored = "No data was provided from file to restore.",

	snippetsWorkspaceCreateFileRequest = "You enabled `useWorkspaceFolder` but you have no file `snippets.json`, do you want to create it ?",
	snippetsWorkspaceCreateFileRequestConfirm = "Create file",
	snippetsWorkspaceCreateFileRequestIgnore = "Always ignore for this folder",
	snippetsWorkspaceFileCreated = "File was successfully created in [{0}]",

	genericError = "[{0}]. You may refresh current window to fix issue.",
}