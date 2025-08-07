import type { BTreeRootNodePositioned, HeapVisualizationProps } from "../types";
import { HEAP_HEIGHT, NODE_HEIGHT, NODE_WIDTH } from "./constants";

export const calculateHeapProps = (height: number, leafNodes: BTreeRootNodePositioned[]): HeapVisualizationProps => {
  const heapY = height - HEAP_HEIGHT - 20;
  const leafNodesForAlignment = leafNodes;
  const leftmostLeaf = leafNodesForAlignment[0];
  const rightmostLeaf = leafNodesForAlignment[leafNodesForAlignment.length - 1];

  const heapX = leftmostLeaf.x - NODE_WIDTH / 2;
  const heapWidth = rightmostLeaf.x + NODE_WIDTH / 2 - (leftmostLeaf.x - NODE_WIDTH / 2);

  return {
    x: heapX,
    y: heapY,
    width: heapWidth,
    height: HEAP_HEIGHT,
    leafNodes: leafNodesForAlignment.map((node) => ({
      x: node.x,
      y: node.y,
      data: node.data,
    })),
    nodeHeight: NODE_HEIGHT,
  };
};
