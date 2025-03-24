import { DataAccess } from "../data/dataAccess";
import { FileDataAccess } from "../data/fileDataAccess";
import { Snippet } from "../interface/snippet";
import { LoggingUtility } from "../utility/loggingUtility";

export class SnippetService {
    private _rootSnippet: Snippet;

    constructor(private _dataAccess: DataAccess) {
        this._rootSnippet = this.loadSnippets();
    }

    // static utility methods

    static findParent(parentId: number, currentElt: Snippet): Snippet | undefined {
        var i, currentChild, result;

        if (parentId === currentElt.id) {
            return currentElt;
        } else {
            // Use a for loop instead of forEach to avoid nested functions
            // Otherwise "return" will not work properly
            for (i = 0; i < currentElt.children.length; i++) {
                currentChild = currentElt.children[i];

                // Search in the current child
                result = this.findParent(parentId, currentChild);

                // Return the result if the node has been found
                if (result !== undefined) {
                    return result;
                }
            }
            // The node has not been found and we have no more options
            return undefined;
        }
    }

   /**
   * to be used like the following:
   * let result: any[] = [];
   * Snippet.flatten(snippetsProvider.snippets.children, result);
   * @param arr array of element
   * @param result final result
   */
    private static flatten(arr: any, result: any[] = []) {
        if (!arr || !arr.length) {
            return result;
        }
        for (let i = 0, length = arr.length; i < length; i++) {
            const value = arr[i];
            if (value.folder === true) {
                SnippetService.flatten(value.children, result);
            } else {
                result.push(value);
            }
        }
        return result;
    }
    
    public static flattenAndKeepFolders(arr: any, result: any[] = []) {
        if (!arr || !arr.length) {
            return result;
        }
        for (let i = 0, length = arr.length; i < length; i++) {
            const value = arr[i];
            if (value.folder === true) {
                result.push(value);
                SnippetService.flattenAndKeepFolders(value.children, result);
            } else {
                result.push(value);
            }
        }
        return result;
    }

    // private methods

    private _reorderArray(arr: Snippet[], oldIndex: number, newIndex: number) {
        if (newIndex < arr.length) {
            arr.splice(newIndex, 0, arr.splice(oldIndex, 1)[0]);
        }
    }

    private _sortArray(arr: Snippet[]) {
        arr.sort((a, b) => a.label.localeCompare(b.label));
    }

    private _sortSnippetsAndChildren(snippets: Snippet[]) {
        this._sortArray(snippets);
        snippets.forEach((s) => {
            if (s.folder && s.children.length > 0) {
                this._sortSnippetsAndChildren(s.children);
            }
        });
    }

    private _updateLastId(newId: number): void {
        this._rootSnippet.lastId = newId;
    }
    
    // public service methods

    refresh(): void {
        this._rootSnippet = this.loadSnippets();
    }

    loadSnippets(): Snippet {
        return this._dataAccess.load();
    }
    
    saveSnippets(): void {
        this._dataAccess.save(this._rootSnippet);
    }

    fixLastId(): void{
        let snippetIds = this.getAllSnippetsAndFolders().map(s=>s.id);
        const maxId = Math.max.apply(Math, snippetIds);
        if (this._rootSnippet.lastId && this._rootSnippet.lastId < maxId) {
            LoggingUtility.getInstance().debug(`Fixed last id, maxId=${maxId} & rootSnippet.lastId=${this._rootSnippet.lastId}`);
            this._updateLastId(maxId);
        }
    }

    getRootChildren(): Snippet[] {
        return this._rootSnippet.children;
    }

    getAllSnippets(): Snippet[] {
        // sync snippets
        this._rootSnippet = this.loadSnippets();
        let snippets: Snippet[] = [];
        SnippetService.flatten(this._rootSnippet.children, snippets);
        return snippets;
    }

    getAllSnippetsAndFolders(): Snippet[] {
        // sync snippets
        this._rootSnippet = this.loadSnippets();
        let snippets: Snippet[] = [];
        SnippetService.flattenAndKeepFolders(this._rootSnippet.children, snippets);
        return snippets;
    }

    incrementLastId(): number {
        return (this._rootSnippet.lastId ?? 0) + 1;
    }

    getParent(parentId: number | undefined): Snippet | undefined {
        return SnippetService.findParent(parentId ?? Snippet.rootParentId, this._rootSnippet);
    }

    compact(): string {
        return JSON.stringify(this._rootSnippet);
    }

    // snippet management services

    addSnippet(newSnippet: Snippet): void {
        this.addExistingSnippet(newSnippet);
        this._updateLastId(newSnippet.id);
    }

    addExistingSnippet(newSnippet: Snippet): void {
        newSnippet.parentId === Snippet.rootParentId
            ? this._rootSnippet.children.push(newSnippet)
            : SnippetService.findParent(newSnippet.parentId ?? Snippet.rootParentId, this._rootSnippet)?.children.push(newSnippet);
    }

    updateSnippet(snippet: Snippet): void {
        const parentElement = SnippetService.findParent(snippet.parentId ?? Snippet.rootParentId, this._rootSnippet);

        if (parentElement) {
            const index = parentElement.children.findIndex((obj => obj.id === snippet.id));

            if (index > -1) {
                parentElement.children.map(obj =>
                    obj.id === snippet.id ? {
                        ...obj,
                        label: snippet.label,
                        // if its a folder, don't update content, use old value instead
                        // if its a snippet, update its content
                        value: [snippet.folder ? obj.value : snippet.value]
                    }
                        : obj
                );
            }
        }
    }

    overrideSnippetId(snippet: Snippet): void {
        let lastId = this.incrementLastId();
        snippet.id = lastId;
        this.updateSnippet(snippet);
        this._updateLastId(snippet.id);
    }

    removeSnippet(snippet: Snippet): void {
        const parentElement = SnippetService.findParent(snippet.parentId ?? Snippet.rootParentId, this._rootSnippet);

        if (parentElement) {
            const index = parentElement.children.findIndex((obj => obj.id === snippet.id));

            if (index > -1) {
                parentElement?.children.splice(index, 1);
            }
        }
    }

    moveSnippet(snippet: Snippet, offset: number) {
        const parentElement = SnippetService.findParent(snippet.parentId ?? Snippet.rootParentId, this._rootSnippet);

        if (parentElement) {
            const index = parentElement.children.findIndex((obj => obj.id === snippet.id));

            if (index > -1 && parentElement.children) {
                this._reorderArray(parentElement.children, index, index + offset);
            }
        }
    }

    sortSnippets(snippet: Snippet) {
        if (snippet.folder && snippet.children.length > 0) {
            this._sortArray(snippet.children);
        }
    }

    sortAllSnippets() {
        let snippet = this._rootSnippet;
        if (snippet.children.length > 0) {
            this._sortSnippetsAndChildren(snippet.children);
        }
    }

    exportSnippets(destinationPath: string, parentId: number) {
        const parentElement = SnippetService.findParent(parentId ?? Snippet.rootParentId, this._rootSnippet);
        if (parentElement) {
            // save file using destroyable instance of FileDataAccess
            new FileDataAccess(destinationPath).save(parentElement);
            LoggingUtility.getInstance().info(`Exported snippets to destination (${destinationPath})`);
        }
    }

    importSnippets(destinationPath: string) {
        // save a backup version of current snippets next to the file to import
        this.exportSnippets(
            destinationPath.replace(FileDataAccess.dataFileExt, `_pre-import-bak${FileDataAccess.dataFileExt}`),
            Snippet.rootParentId
        );
        let newSnippets: Snippet = new FileDataAccess(destinationPath).load();
        this._rootSnippet.children = newSnippets.children;
        this._rootSnippet.lastId = newSnippets.lastId;
        LoggingUtility.getInstance().info(`Imported snippets from source (${destinationPath})`);
    }
}