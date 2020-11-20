export class Snippet {
	id: number;
    parentId?: number;
    label: string;
    children: Array<Snippet>;

    value?: string;
    lastId?: number;

    constructor(
        id: number,
        label: string,
        children: Array<Snippet>,
        parentId?: number,
        value?: string
    ){
        this.id = id;
        this.label = label;
        this.children = children;
        this.parentId = parentId;
        this.value = value;
    }

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

    static toArray(obj: any): any[] {
        const result = [];
        for (const prop in obj) {
            const value = obj[prop];
            if (typeof value === 'object') {
                result.push(Snippet.toArray(value)); // <- recursive call
            }
            else if (prop === 'id'){
                result.push(value);
            }
        }
        return result;
    }
}