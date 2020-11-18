export interface Snippet {
    //id: number;
    label: string;
    value?: string;
    children: Array<Snippet>;
}