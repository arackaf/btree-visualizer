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

export type VisualNode = {
  id: string;
  x: number;
  y: number;
  data: BTreeNode;
};

export type VisualLink = {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

export type LeafArrow = {
  id: string;
  startX: number;
  endX: number;
  y: number;
};

export type UiPayload = {
  nodes: VisualNode[];
  links: VisualLink[];
  leafArrows: LeafArrow[];
};

export type HeapVisualizationProps = {
  x: number;
  y: number;
  width: number;
  leafNodes: Array<{
    x: number;
    y: number;
    data: BTreeNode;
  }>;
};
