import type { BTreeConfig, BTreeInternalNode, BTreeLeafNode, BTreeNode } from "../types";
import { BTREE_CONFIG } from "./btreeSettings";

export const createBTreeFromData = (indexConfig: BTreeConfig): BTreeNode => {
  // Sort records by all key columns in order
  const sortedRecords = [...indexConfig.data].sort((a, b) => {
    for (const keyColumn of indexConfig.keyColumns) {
      const aVal = a[keyColumn];
      const bVal = b[keyColumn];

      // Handle different data types
      if (typeof aVal === "string" && typeof bVal === "string") {
        const comparison = aVal.localeCompare(bVal);
        if (comparison !== 0) return comparison;
      } else if (typeof aVal === "number" && typeof bVal === "number") {
        if (aVal !== bVal) return aVal - bVal;
      } else {
        // Fallback to string comparison
        const comparison = String(aVal).localeCompare(String(bVal));
        if (comparison !== 0) return comparison;
      }
    }
    return 0;
  });

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
