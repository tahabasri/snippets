import { Snippet } from "../interface/snippet";

export class DataAccessConsts {
    public static readonly defaultRootElement: Snippet = { id: 1, parentId: -1, label: 'snippets', lastId: 1, folder: true, children: [] };
}

export interface DataAccess {
    hasNoChild(): boolean;
    load(): Snippet;
    save(data: Snippet): void
}