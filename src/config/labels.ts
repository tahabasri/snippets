export const enum Labels {
	noOpenEditor = "No open editor was found.",
	noOpenTerminal = "No open terminal was found.",
	noValueGiven = "No value was given.",
	noTextSelected = "No text was selected from active editor.",
	noClipboardContent = "No content was found in the clipboard.",

	insertSnippetName = "Select the snippet you want to open ...",

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
	snippetsWorkspacePath = "Snippets will be saved to workspace location [{0}].",
	snippetsWorkspaceCreateFileOption = "Workspace snippets is enabled but no snippets file is found",
	snippetsWorkspaceCreateFileOptionMakeJson = "Make new file",
	snippetsWorkspaceCreateFileOptionUseGlobal = "Use global snippets",
	snippetsInvalidPath = "Snippets path [{0}] is not a valid JSON file, will revert back to default location [{1}].",
	snippetsChangedPath = "Snippets location changed to [{0}]",
	snippetsInvalidNewPath = "Snippets path [{0}] is not a valid JSON file, will revert back to old location [{1}].",
	snippetsNoNewPath = "Snippets will be saved to old location [{0}].",
}