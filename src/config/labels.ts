export const enum Labels {
	noOpenEditor = "No open editor was found.",
	noOpenTerminal = "No open terminal was found.",
	noOpenEditorForWSConfig = "No open folder was found. Please open a folder first and try again.",
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

	snippetsBackupRequest = "Please keep a copy of your snippets file before proceeding with the restore. Yours is located in [{0}]",
	snippetsMigrateRequest = "You have some old snippets saved in [{0}], do you want to restore them ? (Original file will be saved in case of error).",
	snippetsDataRestored = "Snippets restored. Kept original file as [{0}].",
	snippetsDataNotRestored = "Snippets were not restored. We kept original file in [{0}]. Please reload window and try again !",
	snippetsDataRestoredButFileNotRenamed = "Snippets restored. But couldn't rename file [{0}], please rename it manually.",
	snippetsNoDataRestored = "No data was provided from file to restore.",

	snippetsWorkspaceCreateFileRequest = "You enabled `useWorkspaceFolder` but you have no file `snippets.json`, do you want to create it ?",
	snippetsWorkspaceCreateFileRequestConfirm = "Create file",
	snippetsWorkspaceCreateFileRequestIgnore = "Always ignore for this folder",
	snippetsWorkspaceFileCreated = "File was successfully created in [{0}]",

	genericError = "[{0}]. You may refresh current window to fix issue.",

	snippetExportDestinationErrorMsg = "Export destination must not be empty.",

	importSnippets = "Import data",
	discardImport = "Discard import",
	snippetImportRequestConfirmation = "All your global snippets will be replaced with the imported ones (except for workspace snippets)! Do you want to proceed ? (A backup file of your snippets will be saved in case of a rollback).",
	snippetsImported = "Snippets imported. Kept a backup of old snippets next to the imported file in case of a rollback.",
	snippetsNotImported = "Snippets weren't imported. Please check the file content or redo a proper export/import (A copy of your old snippets was saved next to the recently imported file)",

	confirmationYes = "Yes",
	confirmationNo = "No",
}