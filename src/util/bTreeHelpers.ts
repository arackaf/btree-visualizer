import type {
  BTreeConfig,
  BTreeInternalNode,
  BTreeLeafNode,
  BTreeNode,
  BTreeRootNodePositioned,
  HeapArrowData,
} from "../types";
import { BTREE_CONFIG } from "./coreBTreeSettings";
import sortBy from "lodash.sortby";

// Helper function to find the minimum key in a subtree
const getMinimumKeyInSubtree = (node: BTreeNode): any[] => {
  if (node.type === "leaf") {
    return node.keys[0];
  } else {
    // For internal nodes, recurse to the leftmost child
    return getMinimumKeyInSubtree(node.children[0]);
  }
};

export const createBTreeFromData = (indexConfig: BTreeConfig): BTreeNode => {
  // Sort records by all key columns in order

  const sortedRecords = sortBy([...indexConfig.data], indexConfig.keyColumns);

  // Create leaf nodes
  const leaves: BTreeLeafNode[] = [];
  for (let i = 0; i < sortedRecords.length; i += BTREE_CONFIG.maxKeysPerLeaf) {
    const leafRecords = sortedRecords.slice(i, i + BTREE_CONFIG.maxKeysPerLeaf);
    const leaf: BTreeLeafNode = {
      type: "leaf",
      keys: leafRecords.map(r => indexConfig.keyColumns.map(col => r[col])),
      records: leafRecords,
    };
    leaves.push(leaf);
  }

  // Link leaf nodes
  for (let i = 0; i < leaves.length - 1; i++) {
    leaves[i].next = leaves[i + 1];
  }

  // Build internal levels bottom-up
  let currentLevel: BTreeNode[] = leaves;

  while (currentLevel.length > 1) {
    const nextLevel: BTreeInternalNode[] = [];

    for (let i = 0; i < currentLevel.length; i += BTREE_CONFIG.maxKeysPerInternal + 1) {
      const children = currentLevel.slice(i, i + BTREE_CONFIG.maxKeysPerInternal + 1);

      // Create keys for internal node (first key of each child except the first)
      const keys: any[] = [];
      for (let j = 1; j < children.length; j++) {
        // For both leaf and internal nodes, find the minimum key in the subtree
        keys.push(getMinimumKeyInSubtree(children[j]));
      }

      // If we have only one child, this internal node shouldn't exist
      // But if it does (due to tree structure), we need at least one key for display
      if (keys.length === 0 && children.length === 1) {
        // Use the minimum key from the single child's subtree as a representative key
        keys.push(getMinimumKeyInSubtree(children[0]));
      }

      const internalNode: BTreeInternalNode = {
        type: "internal",
        keys,
        children,
      };

      nextLevel.push(internalNode);
    }

    currentLevel = nextLevel;
  }

  return currentLevel[0];
};

// Generate random arrow angles for leaf node records
const generateRandomArrowAngles = (records: Record<string, any>[]): HeapArrowData[] => {
  return records.map(() => {
    const heapAngle = Math.random() * 2 * Math.PI;
    const radiusScale = Math.sqrt(Math.random()) * 0.8; // Keep arrows well inside the oval

    return { heapAngle, radiusScale };
  });
};

export const createPositionedHierarchyTree = (node: BTreeNode): BTreeRootNodePositioned => {
  if (node.type === "leaf") {
    return {
      x: 0,
      y: 0,
      data: node,
      children: [],
      arrowAngles: generateRandomArrowAngles(node.records),
    };
  }

  return {
    x: 0,
    y: 0,
    data: node,
    children: node.children.map(child => createPositionedHierarchyTree(child)),
  };
};

export const calculateTreeDepth = (node: any): number => {
  if (!node.children || node.children.length === 0) {
    return 1; // Leaf
  }
  return 1 + Math.max(...node.children.map((child: any) => calculateTreeDepth(child)));
};
