import type { BTreeRootNodePositioned } from "../types";
import { LEFT_SPACING, LEVEL_HEIGHT, NODE_WIDTH, PADDING } from "./constants";

export const flattenNodes = (node: BTreeRootNodePositioned): BTreeRootNodePositioned[] => {
  const result: BTreeRootNodePositioned[] = [];
  result.push(node);
  result.push(...node.children.flatMap(flattenNodes));

  return result;
};

// Calculate positions for nodes with tighter leaf spacing
export const positionNodes = (node: BTreeRootNodePositioned, treeDepth: number, leftBound: number, rightBound: number, y: number): void => {
  const centerX = (leftBound + rightBound) / 2;

  node.x = centerX;
  node.y = y;

  if (node.children && node.children.length > 0) {
    const allLeaves = collectLeaves(node);
    const startX = PADDING; // Start from left padding

    // // Position all leaves with consistent spacing
    allLeaves.forEach((leaf: any, i: number) => {
      leaf.x = startX + i * LEFT_SPACING;
      leaf.y = y + LEVEL_HEIGHT * (treeDepth - 1); // All leaves go to the bottom level (dynamically calculated)
    });

    // Position all internal nodes starting from level 0
    positionInternalNodes(node, 0, y);
  }
};

// Now position internal nodes above their leaf ranges
export const positionInternalNodes = (node: BTreeRootNodePositioned, currentLevel: number, initialYOffset: number): void => {
  if (!node.children || node.children.length === 0) return; // Skip leaves

  // Find the range of leaves under this node
  const leavesUnder = collectLeaves(node);
  const leftmostLeaf = leavesUnder[0];
  const rightmostLeaf = leavesUnder[leavesUnder.length - 1];

  // Position this internal node centered over its leaves, but ensure it doesn't go beyond left padding
  const centeredX = (leftmostLeaf.x + rightmostLeaf.x) / 2;
  const minX = PADDING + NODE_WIDTH / 2; // Ensure node doesn't extend beyond left padding
  node.x = Math.max(minX, centeredX);
  node.y = initialYOffset + LEVEL_HEIGHT * currentLevel;

  // Position child internal nodes
  node.children.forEach((child: any) => {
    positionInternalNodes(child, currentLevel + 1, initialYOffset);
  });
};

// Universal approach: collect all leaf descendants and space them evenly
export const collectLeaves = (n: BTreeRootNodePositioned): BTreeRootNodePositioned[] => {
  if (!n.children || n.children.length === 0) {
    return [n];
  }
  let leaves: BTreeRootNodePositioned[] = [];
  n.children.forEach((child: BTreeRootNodePositioned) => {
    leaves = leaves.concat(collectLeaves(child));
  });
  return leaves;
};
