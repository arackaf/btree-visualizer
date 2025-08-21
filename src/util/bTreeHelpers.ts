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

  // Create leaf nodes - ensure records with identical keys stay together
  const leaves: BTreeLeafNode[] = [];
  let i = 0;
  while (i < sortedRecords.length) {
    const leafRecords: any[] = [];

    while (i < sortedRecords.length && leafRecords.length < BTREE_CONFIG.maxKeysPerLeaf) {
      const currentRecord = sortedRecords[i];
      const currentKey = indexConfig.keyColumns.map(col => currentRecord[col]);

      // Look ahead to see if adding this key would require splitting duplicates
      let duplicateCount = 1;
      let j = i + 1;
      while (j < sortedRecords.length) {
        const nextRecord = sortedRecords[j];
        const nextKey = indexConfig.keyColumns.map(col => nextRecord[col]);
        const keysEqual = currentKey.length === nextKey.length && currentKey.every((val, idx) => val === nextKey[idx]);

        if (!keysEqual) break;
        duplicateCount++;
        j++;
      }

      // If adding all duplicates would exceed capacity, and we already have records,
      // don't add any of them to this leaf (save them for the next leaf)
      if (leafRecords.length > 0 && leafRecords.length + duplicateCount > BTREE_CONFIG.maxKeysPerLeaf) {
        break;
      }

      // Add all records with this key to the current leaf
      for (let k = 0; k < duplicateCount; k++) {
        leafRecords.push(sortedRecords[i + k]);
      }
      i += duplicateCount;
    }

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

      // Create keys for internal node with proper B-tree separator semantics
      const keys: any[] = [];
      for (let j = 1; j < children.length; j++) {
        const rightChild = children[j];

        // Use minimum key from right subtree as separator
        // This maintains B-tree invariant: left < separator <= right
        const separator = getMinimumKeyInSubtree(rightChild);
        keys.push(separator);
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
