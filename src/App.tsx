import React, { useMemo } from "react";
import "./App.css";
import type { BTreeNode, HeapVisualizationProps, LeafArrow, UiPayload, VisualLink, VisualNode } from "./types";

// import { indexConfig } from "./data/idIncludeTitle";
// import { indexConfig } from "./data/idTitle";
//import { indexConfig } from "./data/idTitleBackup";
import { indexConfig } from "./data/idIncludeTitle";

import { BTREE_CONFIG } from "./util/coreBTreeSettings";
import { BASE_TREE_HEIGHT, HEAP_HEIGHT, LEFT_SPACING, LEVEL_HEIGHT, NODE_HEIGHT, NODE_WIDTH, PADDING, SHOW_HEAP } from "./util/constants";
import { flattenNodes, positionNodes } from "./util/treeNodeHelpers";
import { calculateTreeDepth, createBTreeFromData, createPositionedHierarchyTree } from "./util/bTreeHelpers";
import { calculateHeapProps } from "./util/heapHelpers";
import { HeapVisualization } from "./components/heap";

type TreeVisualizationProps = {
  tree: BTreeNode;
};

const TreeVisualization: React.FC<TreeVisualizationProps> = ({ tree }) => {
  const totalLeaves = Math.ceil(indexConfig.data.length / BTREE_CONFIG.maxKeysPerLeaf);
  const treeWidth = (totalLeaves - 1) * LEFT_SPACING + NODE_WIDTH;

  const width = treeWidth + PADDING * 2;

  const { hierarchyRoot, treeDepth } = useMemo(() => {
    const result = createPositionedHierarchyTree(tree);
    const treeDepth = calculateTreeDepth(result);

    positionNodes(result, treeDepth, 0, width, 80);

    return { hierarchyRoot: result, treeDepth };
  }, [tree, width]);

  const dynamicTreeHeight = BASE_TREE_HEIGHT + (treeDepth - 1) * LEVEL_HEIGHT + NODE_HEIGHT + 40; // Bottom padding
  const height = SHOW_HEAP ? dynamicTreeHeight + HEAP_HEIGHT + 60 : dynamicTreeHeight;

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
      {/* Links */}
      <g className="links">
        {uiPayload.links.map((link) => (
          <line key={link.id} x1={link.x1} y1={link.y1} x2={link.x2} y2={link.y2} stroke="#666" strokeWidth={2} />
        ))}
      </g>

      {/* Leaf arrows */}
      <g className="leaf-arrows">
        {uiPayload.leafArrows.map((arrow) => (
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
        {uiPayload.nodes.map((node) => (
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
      {SHOW_HEAP ? <HeapVisualization {...heapProps} /> : null}
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
