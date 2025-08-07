import React, { useEffect, useMemo } from "react";
import "./App.css";
import type { BTreeNode, BTreeRootNode, BTreeRootNodePositioned } from "./types";

// import { indexConfig } from "./data/idIncludeTitle";
// import { indexConfig } from "./data/idTitle";
//import { indexConfig } from "./data/idTitleBackup";
import { indexConfig } from "./data/idIncludeTitle";

import { BTREE_CONFIG } from "./util/btreeSettings";
import { createBTreeFromData } from "./util/createBTree";

const SHOW_HEAP = true;
const LEVEL_HEIGHT = 140;
const PADDING = 200;
const NODE_WIDTH = 120;
const NODE_HEIGHT = 60;
const LEFT_SPACING = 160;
const HEAP_HEIGHT = 120;

type HeapVisualizationProps = {
  x: number;
  y: number;
  width: number;
  height: number;
  leafNodes: Array<{
    x: number;
    y: number;
    data: BTreeNode;
  }>;
  nodeHeight: number;
};

const flattenNodes = (node: BTreeRootNodePositioned): BTreeRootNodePositioned[] => {
  const result: BTreeRootNodePositioned[] = [];
  result.push(node);
  result.push(...node.children.flatMap(flattenNodes));

  return result;
};

// Calculate positions for nodes with tighter leaf spacing
const positionNodes = (node: BTreeRootNodePositioned, treeDepth: number, leftBound: number, rightBound: number, y: number): void => {
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

// Universal approach: collect all leaf descendants and space them evenly
const collectLeaves = (n: BTreeRootNodePositioned): BTreeRootNodePositioned[] => {
  if (!n.children || n.children.length === 0) {
    return [n];
  }
  let leaves: BTreeRootNodePositioned[] = [];
  n.children.forEach((child: BTreeRootNodePositioned) => {
    leaves = leaves.concat(collectLeaves(child));
  });
  return leaves;
};

const HeapVisualization: React.FC<HeapVisualizationProps> = ({ x, y, width, height, leafNodes, nodeHeight }) => {
  // Calculate oval dimensions and center
  const ovalCenterX = x + width / 2;
  const ovalCenterY = y + height / 2;
  const ovalRadiusX = width / 2;
  const ovalRadiusY = height / 2;

  // Generate arrows data
  const arrows = React.useMemo(() => {
    const arrowsData: Array<{
      path: string;
      arrowHead: { x: number; y: number; angle: number };
    }> = [];

    leafNodes.forEach((leafNode) => {
      const numArrows = leafNode.data.type === "leaf" ? leafNode.data.records.length : 0;

      for (let i = 0; i < numArrows; i++) {
        // Start point: bottom of leaf node
        const startX = leafNode.x + (i - (numArrows - 1) / 2) * 15; // Spread arrows horizontally
        const startY = leafNode.y + nodeHeight / 2;

        // End point: random location inside the oval heap
        // Generate random point within the ellipse bounds
        const heapAngle = Math.random() * 2 * Math.PI;
        const radiusScale = Math.sqrt(Math.random()) * 0.8; // Keep arrows well inside the oval
        const endX = ovalCenterX + radiusScale * ovalRadiusX * Math.cos(heapAngle);
        const endY = ovalCenterY + radiusScale * ovalRadiusY * Math.sin(heapAngle);

        // Control point for curved arrow
        const controlX = (startX + endX) / 2;
        const controlY = startY + (endY - startY) * 0.7;

        // Draw curved arrow path
        const arrowPath = `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`;

        // Calculate angle for arrowhead
        const angle = Math.atan2(endY - controlY, endX - controlX);

        arrowsData.push({
          path: arrowPath,
          arrowHead: { x: endX, y: endY, angle },
        });
      }
    });

    return arrowsData;
  }, [leafNodes, nodeHeight, ovalCenterX, ovalCenterY, ovalRadiusX, ovalRadiusY]);

  return (
    <g className="heap">
      <ellipse cx={ovalCenterX} cy={ovalCenterY} rx={ovalRadiusX} ry={ovalRadiusY} fill="#f5f5f5" stroke="#999" strokeWidth={2} />

      <g className="heap-arrows">
        {arrows.map((arrow, index) => (
          <g key={index}>
            {/* Arrow path */}
            <path d={arrow.path} stroke="#666" strokeWidth={1.5} fill="none" />
            {/* Arrowhead */}
            <polygon
              points={`${arrow.arrowHead.x},${arrow.arrowHead.y} 
                       ${arrow.arrowHead.x - 6 * Math.cos(arrow.arrowHead.angle - Math.PI / 6)},${
                arrow.arrowHead.y - 6 * Math.sin(arrow.arrowHead.angle - Math.PI / 6)
              } 
                       ${arrow.arrowHead.x - 6 * Math.cos(arrow.arrowHead.angle + Math.PI / 6)},${
                arrow.arrowHead.y - 6 * Math.sin(arrow.arrowHead.angle + Math.PI / 6)
              }`}
              fill="#666"
            />
          </g>
        ))}
      </g>

      <text x={ovalCenterX} y={ovalCenterY + 18} textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="72px" fontWeight="bold">
        Heap
      </text>
    </g>
  );
};

interface TreeVisualizationProps {
  tree: BTreeNode;
}

// Types for visualization data
interface VisualNode {
  id: string;
  x: number;
  y: number;
  data: BTreeNode;
}

interface VisualLink {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface LeafArrow {
  id: string;
  startX: number;
  endX: number;
  y: number;
}

// Create hierarchy data
const createHierarchy = (node: BTreeNode): BTreeRootNodePositioned => {
  return {
    x: 0,
    y: 0,
    data: node,
    children: node.type === "internal" ? node.children.map((child) => createHierarchy(child)) : [],
  };
};

// Calculate the actual tree depth
const calculateTreeDepth = (node: any): number => {
  if (!node.children || node.children.length === 0) {
    return 1; // Leaf
  }
  return 1 + Math.max(...node.children.map((child: any) => calculateTreeDepth(child)));
};

// Now position internal nodes above their leaf ranges
const positionInternalNodes = (node: BTreeRootNodePositioned, currentLevel: number, initialYOffset: number): void => {
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

const TreeVisualization: React.FC<TreeVisualizationProps> = ({ tree }) => {
  const [nodes, setNodes] = React.useState<VisualNode[]>([]);
  const [links, setLinks] = React.useState<VisualLink[]>([]);
  const [leafArrows, setLeafArrows] = React.useState<LeafArrow[]>([]);
  const [heapProps, setHeapProps] = React.useState<HeapVisualizationProps | null>();

  // Calculate required width based on actual data
  const totalLeaves = Math.ceil(indexConfig.data.length / BTREE_CONFIG.maxKeysPerLeaf);
  const treeWidth = (totalLeaves - 1) * LEFT_SPACING + NODE_WIDTH;

  const hierarchyRoot = useMemo(() => createHierarchy(tree), [tree]);
  const treeDepth = useMemo(() => calculateTreeDepth(hierarchyRoot), [hierarchyRoot]);

  const width = treeWidth + PADDING * 2;

  const baseTreeHeight = 80; // Top padding

  const dynamicTreeHeight = baseTreeHeight + (treeDepth - 1) * LEVEL_HEIGHT + NODE_HEIGHT + 40; // Bottom padding
  const height = SHOW_HEAP ? dynamicTreeHeight + HEAP_HEIGHT + 60 : dynamicTreeHeight;

  useEffect(() => {
    // Start positioning - width is now calculated to fit perfectly
    positionNodes(hierarchyRoot, treeDepth, 0, width, 80);

    // Collect all nodes for rendering
    const allNodes = flattenNodes(hierarchyRoot);
    const leafNodes = allNodes.filter((node) => node.data.type === "leaf");

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

    // Set all the state
    setNodes(visualNodes);
    setLinks(visualLinks);
    setLeafArrows(visualLeafArrows);

    // Calculate heap position and dimensions
    const heapY = height - HEAP_HEIGHT - 20;
    const leafNodesForAlignment = leafNodes;
    const leftmostLeaf = leafNodesForAlignment[0];
    const rightmostLeaf = leafNodesForAlignment[leafNodesForAlignment.length - 1];

    const heapX = leftmostLeaf.x - NODE_WIDTH / 2;
    const heapWidth = rightmostLeaf.x + NODE_WIDTH / 2 - (leftmostLeaf.x - NODE_WIDTH / 2);

    // Set heap props for the HeapVisualization component
    setHeapProps({
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
    });
  }, [tree]);

  return (
    <svg width={width} height={height}>
      {/* Links */}
      <g className="links">
        {links.map((link) => (
          <line key={link.id} x1={link.x1} y1={link.y1} x2={link.x2} y2={link.y2} stroke="#666" strokeWidth={2} />
        ))}
      </g>

      {/* Leaf arrows */}
      <g className="leaf-arrows">
        {leafArrows.map((arrow) => (
          <g key={arrow.id}>
            {/* Main line */}
            <line x1={arrow.startX} y1={arrow.y} x2={arrow.endX} y2={arrow.y} stroke="#333" strokeWidth={1.5} />
            {/* Left arrow head (pointing left) */}
            <polygon points={`${arrow.startX + 8},${arrow.y - 4} ${arrow.startX},${arrow.y} ${arrow.startX + 8},${arrow.y + 4}`} fill="#333" />
            {/* Right arrow head (pointing right) */}
            <polygon points={`${arrow.endX - 8},${arrow.y - 4} ${arrow.endX},${arrow.y} ${arrow.endX - 8},${arrow.y + 4}`} fill="#333" />
          </g>
        ))}
      </g>

      {/* Nodes */}
      <g className="nodes">
        {nodes.map((node) => (
          <g key={node.id} transform={`translate(${node.x - NODE_WIDTH / 2}, ${node.y - NODE_HEIGHT / 2})`}>
            {/* Node rectangle */}
            <rect
              width={NODE_WIDTH}
              height={NODE_HEIGHT}
              fill={node.data.type === "leaf" ? "#E3F2FD" : "#FFF3E0"}
              stroke={node.data.type === "leaf" ? "#2196F3" : "#FF9800"}
              strokeWidth={2}
              rx={5}
            />

            {node.data.type === "leaf" ? (
              <>
                {/* Leaf node label */}
                <text x={NODE_WIDTH / 2} y={15} textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="10px" fontWeight="bold">
                  Leaf
                </text>

                {/* Display tuples in leaf nodes */}
                {node.data.records.map((record: any, i: number) => {
                  const keyValues = indexConfig.keyColumns.map((col) => record[col]);
                  const includeValues = indexConfig.includeColumns.map((col) => `"${record[col]}"`);
                  const allValues = [...keyValues, ...includeValues];

                  return (
                    <text key={i} x={NODE_WIDTH / 2} y={28 + i * 12} textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="9px">
                      {`[${allValues.join(", ")}]`}
                    </text>
                  );
                })}
              </>
            ) : (
              <>
                {/* Internal node label */}
                <text x={NODE_WIDTH / 2} y={20} textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="12px" fontWeight="bold">
                  Node
                </text>

                {/* Keys for internal nodes */}
                {(() => {
                  const hasStringKeys = node.data.keys.some((key: any) =>
                    Array.isArray(key) ? key.some((k) => typeof k === "string") : typeof key === "string"
                  );

                  if (hasStringKeys) {
                    // Display keys vertically for better readability
                    return node.data.keys.map((key: any, i: number) => {
                      const keyText = Array.isArray(key) ? `[${key.map((k) => (typeof k === "string" ? `"${k}"` : k)).join(", ")}]` : key;
                      return (
                        <text key={i} x={NODE_WIDTH / 2} y={32 + i * 12} textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="9px">
                          {keyText}
                        </text>
                      );
                    });
                  } else {
                    // Display keys horizontally for numbers
                    const keyTexts = node.data.keys.map((key: any) => (Array.isArray(key) && key.length > 1 ? `[${key.join(", ")}]` : key));
                    return (
                      <text x={NODE_WIDTH / 2} y={37} textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="11px">
                        {`[${keyTexts.join(", ")}]`}
                      </text>
                    );
                  }
                })()}
              </>
            )}
          </g>
        ))}
      </g>

      {/* Heap visualization */}
      {SHOW_HEAP && heapProps ? <HeapVisualization {...heapProps} /> : null}
    </svg>
  );
};

function App() {
  const tree = useMemo(() => createBTreeFromData(indexConfig), [indexConfig]);

  return (
    <div className="App">
      <header style={{ padding: "20px", textAlign: "center" }}>
        <h1>B+ Tree Visualizer</h1>
        <p>Interactive visualization of a B+ tree with (id, title) records</p>
      </header>
      <main>
        <div className="svg-container">
          <TreeVisualization tree={tree} />
        </div>
      </main>
    </div>
  );
}

export default App;
