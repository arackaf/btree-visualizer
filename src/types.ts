export type BTreeConfig = {
  keyColumns: string[];
  includeColumns: string[];
  data: Record<string, any>[];
};

export type BTreeLeafNode = {
  type: "leaf";
  keys: any[];
  records: Record<string, any>[];
  next?: BTreeLeafNode;
};

export type BTreeInternalNode = {
  type: "internal";
  keys: any[];
  children: (BTreeInternalNode | BTreeLeafNode)[];
};

export type BTreeNode = BTreeInternalNode | BTreeLeafNode;

export type BTreeRootNode = {
  node: BTreeNode;
  children: BTreeRootNode[];
};

export type BTreeRootNodePositioned = {
  data: BTreeNode;
  x: number;
  y: number;
  children: BTreeRootNodePositioned[];
};
