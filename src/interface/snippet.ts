export class Snippet {
    //id: number;
    label: string;
    children: Array<Snippet>;
    hasChildren: boolean;
    value?: string;

    constructor(
        label: string,
        children: Array<Snippet>,
        value?: string
    ){
        this.label = label;
        this.children = children;
        this.hasChildren = this.children.length !== 0;
        this.value = value;
    }
}