export class Snippet {
	id: number;
    parentId?: number;
    label: string;
    folder?: boolean;
    children: Array<Snippet>;
    value?: string;
    lastId?: number;

    constructor(
        id: number,
        label: string,
        children: Array<Snippet>,
        folder?: boolean,
        parentId?: number,
        value?: string
    ){
        this.id = id;
        this.label = label;
        this.folder = folder;
        this.children = children;
        this.parentId = parentId;
        this.value = value;
    }

    /**
     * to be used like the following:
     * let result: any[] = [];
     * Snippet.flatten(snippetsProvider.snippets.children, result);
     * @param arr array of element
     * @param result final result
     */
    static flatten(arr: any, result: any[] = []) {
        for (let i = 0, length = arr.length; i < length; i++) {
          const value = arr[i];
          if (value.folder === true) {
            Snippet.flatten(value.children, result);
          } else {
            result.push(value);
          }
        }
        return result;
      };      

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
}