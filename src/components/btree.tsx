import { useMemo } from "react";
import type { BTreeConfig, BTreeNode, HeapVisualizationProps, LeafArrow, UiPayload, VisualLink, VisualNode } from "../types";
import { BASE_TREE_HEIGHT, HEAP_HEIGHT, LEFT_SPACING, LEVEL_HEIGHT, NODE_HEIGHT, NODE_WIDTH, PADDING } from "../util/constants";
import { BTREE_CONFIG } from "../util/coreBTreeSettings";
import { HeapVisualization } from "./heap";
import { calculateTreeDepth, createPositionedHierarchyTree } from "../util/bTreeHelpers";
import { flattenNodes, positionNodes } from "../util/treeNodeHelpers";
import { calculateHeapProps } from "../util/heapHelpers";
import { Node } from "./node";

type TreeVisualizationProps = {
  config: BTreeConfig;
  tree: BTreeNode;
  highlightedNodes?: number[];
  showHeap?: boolean;
};

export const BTree: React.FC<TreeVisualizationProps> = ({ tree, config, highlightedNodes = [], showHeap = true }) => {
  const totalLeaves = Math.ceil(config.data.length / BTREE_CONFIG.maxKeysPerLeaf);
  const treeWidth = (totalLeaves - 1) * LEFT_SPACING + NODE_WIDTH;

  const width = treeWidth + PADDING * 2;

  const { hierarchyRoot, treeDepth } = useMemo(() => {
    const result = createPositionedHierarchyTree(tree);
    const treeDepth = calculateTreeDepth(result);

    positionNodes(result, treeDepth, 0, width, 80);

    return { hierarchyRoot: result, treeDepth };
  }, [tree, width]);

  const dynamicTreeHeight = BASE_TREE_HEIGHT + (treeDepth - 1) * LEVEL_HEIGHT + NODE_HEIGHT + 40; // Bottom padding
  const height = showHeap ? dynamicTreeHeight + HEAP_HEIGHT + 60 : dynamicTreeHeight;

  const { allNodes, leafNodes } = useMemo(() => {
    const allNodes = flattenNodes(hierarchyRoot);
    const leafNodes = allNodes.filter((node) => node.data.type === "leaf");
    return { allNodes, leafNodes };
  }, [hierarchyRoot]);

  const heapProps: HeapVisualizationProps = useMemo(() => calculateHeapProps(height, leafNodes), [height, leafNodes]);

  const uiPayload: UiPayload = useMemo(() => {
    // Create visual nodes with unique IDs
    const visualNodes: VisualNode[] = allNodes.map((node, index) => ({
      id: `node-${index}`,
      x: node.x,
      y: node.y,
      data: node.data,
    }));

    // Create visual links
    const visualLinks: VisualLink[] = [];
    let linkId = 0;
    allNodes.forEach((node) => {
      if (node.children) {
        node.children.forEach((child: any) => {
          visualLinks.push({
            id: `link-${linkId++}`,
            x1: node.x,
            y1: node.y + NODE_HEIGHT / 2,
            x2: child.x,
            y2: child.y - NODE_HEIGHT / 2,
          });
        });
      }
    });

    // Create leaf arrows
    const visualLeafArrows: LeafArrow[] = [];

    for (let i = 0; i < leafNodes.length - 1; i++) {
      const currentLeaf = leafNodes[i];
      const nextLeaf = leafNodes[i + 1];

      visualLeafArrows.push({
        id: `leaf-arrow-${i}`,
        startX: currentLeaf.x + NODE_WIDTH / 2,
        endX: nextLeaf.x - NODE_WIDTH / 2,
        y: currentLeaf.y,
      });
    }

    return {
      nodes: visualNodes,
      links: visualLinks,
      leafArrows: visualLeafArrows,
    };
  }, [allNodes]);

  return (
    <svg width={width} height={height}>
      <g className="links">
        {uiPayload.links.map((link) => (
          <line key={link.id} x1={link.x1} y1={link.y1} x2={link.x2} y2={link.y2} stroke="#666" strokeWidth={2} />
        ))}
      </g>

      <g className="leaf-arrows">
        {uiPayload.leafArrows.map((arrow) => (
          <g key={arrow.id}>
            <line x1={arrow.startX} y1={arrow.y} x2={arrow.endX} y2={arrow.y} stroke="#333" strokeWidth={1.5} />
            <polygon points={`${arrow.startX + 8},${arrow.y - 4} ${arrow.startX},${arrow.y} ${arrow.startX + 8},${arrow.y + 4}`} fill="#333" />
            <polygon points={`${arrow.endX - 8},${arrow.y - 4} ${arrow.endX},${arrow.y} ${arrow.endX - 8},${arrow.y + 4}`} fill="#333" />
          </g>
        ))}
      </g>

      <g className="nodes">
        {uiPayload.nodes.map((node, index) => (
          <Node key={node.id} node={node} config={config} isHighlighted={highlightedNodes.includes(index)} />
        ))}
      </g>

      {showHeap ? <HeapVisualization {...heapProps} /> : null}
    </svg>
  );
};
