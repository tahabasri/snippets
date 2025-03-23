export class Snippet {
  static readonly rootParentId = 1;

  id: number;
  parentId?: number;
  label: string;
  folder?: boolean;
  children: Array<Snippet>;
  value?: string;
  lastId?: number;
  resolveSyntax?: boolean;
  description?: string;
  prefix?: string;
  language?: string;
  icon?: string;
  completionDescription?: string;

  constructor(
    id: number,
    label: string,
    children: Array<Snippet>,
    folder?: boolean,
    parentId?: number,
    value?: string
  ) {
    this.id = id;
    this.label = label;
    this.folder = folder;
    this.children = children;
    this.parentId = parentId;
    this.value = value;
  }
}