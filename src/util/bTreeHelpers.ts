import type { BTreeConfig, BTreeInternalNode, BTreeLeafNode, BTreeNode, BTreeRootNodePositioned } from "../types";
import { BTREE_CONFIG } from "./bTreeSettingsXXX";
import sortBy from "lodash.sortby";

export const createBTreeFromData = (indexConfig: BTreeConfig): BTreeNode => {
  // Sort records by all key columns in order

  const sortedRecords = sortBy([...indexConfig.data], indexConfig.keyColumns);

  // Create leaf nodes
  const leaves: BTreeLeafNode[] = [];
  for (let i = 0; i < sortedRecords.length; i += BTREE_CONFIG.maxKeysPerLeaf) {
    const leafRecords = sortedRecords.slice(i, i + BTREE_CONFIG.maxKeysPerLeaf);
    const leaf: BTreeLeafNode = {
      type: "leaf",
      keys: leafRecords.map((r) => indexConfig.keyColumns.map((col) => r[col])),
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
        if (children[j].type === "leaf") {
          keys.push(children[j].keys[0]);
        } else {
          // For internal nodes, use the first key
          keys.push(children[j].keys[0]);
        }
      }

      // If we have only one child, this internal node shouldn't exist
      // But if it does (due to tree structure), we need at least one key for display
      if (keys.length === 0 && children.length === 1) {
        // Use the first key from the single child as a representative key
        if (children[0].type === "leaf") {
          keys.push(children[0].keys[0]);
        } else {
          keys.push(children[0].keys[0] || []);
        }
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

export const createPositionedHierarchyTree = (node: BTreeNode): BTreeRootNodePositioned => {
  return {
    x: 0,
    y: 0,
    data: node,
    children: node.type === "internal" ? node.children.map((child) => createPositionedHierarchyTree(child)) : [],
  };
};

export const calculateTreeDepth = (node: any): number => {
  if (!node.children || node.children.length === 0) {
    return 1; // Leaf
  }
  return 1 + Math.max(...node.children.map((child: any) => calculateTreeDepth(child)));
};
