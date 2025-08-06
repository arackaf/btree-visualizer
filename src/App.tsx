import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import "./App.css";
import type { BTreeConfig } from "./types";

import { indexConfig } from "./data/idTitle";

// B+ Tree data structures
interface BTreeLeafNode {
  type: "leaf";
  keys: any[];
  records: Record<string, any>[];
  next?: BTreeLeafNode;
}

interface BTreeInternalNode {
  type: "internal";
  keys: any[];
  children: (BTreeInternalNode | BTreeLeafNode)[];
}

type BTreeNode = BTreeInternalNode | BTreeLeafNode;

// Configuration: B+ tree parameters
const BTREE_CONFIG = {
  maxKeysPerLeaf: 3, // Maximum keys in a leaf node
  maxKeysPerInternal: 2, // Maximum keys in an internal node
  minKeysPerLeaf: 1, // Minimum keys in a leaf node (except root)
  minKeysPerInternal: 1, // Minimum keys in an internal node (except root)
};

const SHOW_HEAP = false;

// Build B+ tree from data records
const createBTreeFromData = (indexConfig: BTreeConfig): BTreeNode => {
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

interface TreeVisualizationProps {
  tree: BTreeNode;
}

const TreeVisualization: React.FC<TreeVisualizationProps> = ({ tree }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const nodeWidth = 120;
    const nodeHeight = 60;
    const levelHeight = 140;
    const leafSpacing = 160;

    // Calculate required width based on actual data
    const totalLeaves = Math.ceil(indexConfig.data.length / BTREE_CONFIG.maxKeysPerLeaf);
    const treeWidth = (totalLeaves - 1) * leafSpacing + nodeWidth;
    const padding = 200;
    const width = treeWidth + padding * 2;
    const heapHeight = 120;
    const height = SHOW_HEAP ? 700 + heapHeight + 60 : 700; // Extra space for heap and arrows if enabled

    svg.attr("width", width).attr("height", height);

    // Create hierarchy data for D3
    const createHierarchy = (node: BTreeNode, level: number = 0): any => {
      const hierarchyNode = {
        data: node,
        level,
        children: node.type === "internal" ? node.children.map((child) => createHierarchy(child, level + 1)) : [],
      };
      return hierarchyNode;
    };

    const hierarchyRoot = createHierarchy(tree);

    // Calculate positions for nodes with tighter leaf spacing
    const positionNodes = (node: any, leftBound: number, rightBound: number, y: number): void => {
      const centerX = (leftBound + rightBound) / 2;
      node.x = centerX;
      node.y = y;

      if (node.children && node.children.length > 0) {
        // Universal approach: collect all leaf descendants and space them evenly
        const collectLeaves = (n: any): any[] => {
          if (!n.children || n.children.length === 0) {
            return [n];
          }
          let leaves: any[] = [];
          n.children.forEach((child: any) => {
            leaves = leaves.concat(collectLeaves(child));
          });
          return leaves;
        };

        const allLeaves = collectLeaves(node);
        const startX = padding; // Start from left padding

        // Position all leaves with consistent spacing
        allLeaves.forEach((leaf: any, i: number) => {
          leaf.x = startX + i * leafSpacing;
          leaf.y = y + levelHeight * (4 - 1); // All leaves go to the bottom level
        });

        // Now position internal nodes above their leaf ranges
        const positionInternalNodes = (n: any, currentLevel: number): void => {
          if (!n.children || n.children.length === 0) return; // Skip leaves

          // Find the range of leaves under this node
          const leavesUnder = collectLeaves(n);
          const leftmostLeaf = leavesUnder[0];
          const rightmostLeaf = leavesUnder[leavesUnder.length - 1];

          // Position this internal node centered over its leaves, but ensure it doesn't go beyond left padding
          const centeredX = (leftmostLeaf.x + rightmostLeaf.x) / 2;
          const minX = padding + nodeWidth / 2; // Ensure node doesn't extend beyond left padding
          n.x = Math.max(minX, centeredX);
          n.y = y + levelHeight * currentLevel;

          // Position child internal nodes
          n.children.forEach((child: any) => {
            positionInternalNodes(child, currentLevel + 1);
          });
        };

        // Position all internal nodes starting from level 0
        positionInternalNodes(node, 0);
      }
    };

    // Start positioning - width is now calculated to fit perfectly
    positionNodes(hierarchyRoot, 0, width, 80);

    // Collect all nodes for rendering
    const allNodes: any[] = [];
    const collectNodes = (node: any): void => {
      allNodes.push(node);
      if (node.children) {
        node.children.forEach(collectNodes);
      }
    };
    collectNodes(hierarchyRoot);

    // Draw connections
    const links = svg.append("g").attr("class", "links");
    allNodes.forEach((node) => {
      if (node.children) {
        node.children.forEach((child: any) => {
          links
            .append("line")
            .attr("x1", node.x)
            .attr("y1", node.y + nodeHeight / 2)
            .attr("x2", child.x)
            .attr("y2", child.y - nodeHeight / 2)
            .attr("stroke", "#666")
            .attr("stroke-width", 2);
        });
      }
    });

    // Draw bidirectional arrows between leaf nodes
    const leafArrows = svg.append("g").attr("class", "leaf-arrows");
    const leafNodes = allNodes.filter((node) => node.data.type === "leaf");

    for (let i = 0; i < leafNodes.length - 1; i++) {
      const currentLeaf = leafNodes[i];
      const nextLeaf = leafNodes[i + 1];

      const arrowY = currentLeaf.y; // Exact vertical center of the leaf box
      const startX = currentLeaf.x + nodeWidth / 2; // Right edge of current leaf
      const endX = nextLeaf.x - nodeWidth / 2; // Left edge of next leaf

      // Main line
      leafArrows
        .append("line")
        .attr("x1", startX)
        .attr("y1", arrowY)
        .attr("x2", endX)
        .attr("y2", arrowY)
        .attr("stroke", "#333")
        .attr("stroke-width", 1.5);

      // Left arrow head (pointing left)
      leafArrows
        .append("polygon")
        .attr("points", `${startX + 8},${arrowY - 4} ${startX},${arrowY} ${startX + 8},${arrowY + 4}`)
        .attr("fill", "#333");

      // Right arrow head (pointing right)
      leafArrows
        .append("polygon")
        .attr("points", `${endX - 8},${arrowY - 4} ${endX},${arrowY} ${endX - 8},${arrowY + 4}`)
        .attr("fill", "#333");
    }

    // Draw nodes
    const nodes = svg.append("g").attr("class", "nodes");

    allNodes.forEach((node) => {
      const nodeGroup = nodes.append("g").attr("transform", `translate(${node.x - nodeWidth / 2}, ${node.y - nodeHeight / 2})`);

      // Node rectangle
      nodeGroup
        .append("rect")
        .attr("width", nodeWidth)
        .attr("height", nodeHeight)
        .attr("fill", node.data.type === "leaf" ? "#E3F2FD" : "#FFF3E0")
        .attr("stroke", node.data.type === "leaf" ? "#2196F3" : "#FF9800")
        .attr("stroke-width", 2)
        .attr("rx", 5);

      if (node.data.type === "leaf") {
        // Leaf node label
        nodeGroup
          .append("text")
          .attr("x", nodeWidth / 2)
          .attr("y", 15)
          .attr("text-anchor", "middle")
          .attr("font-family", "Arial, sans-serif")
          .attr("font-size", "10px")
          .attr("font-weight", "bold")
          .text("Leaf");

        // Display tuples in leaf nodes
        node.data.records.forEach((record: any, i: number) => {
          // Format key columns and include columns
          const keyValues = indexConfig.keyColumns.map((col) => record[col]);
          const includeValues = indexConfig.includeColumns.map((col) => `"${record[col]}"`);
          const allValues = [...keyValues, ...includeValues];

          nodeGroup
            .append("text")
            .attr("x", nodeWidth / 2)
            .attr("y", 28 + i * 12)
            .attr("text-anchor", "middle")
            .attr("font-family", "Arial, sans-serif")
            .attr("font-size", "9px")
            .text(`[${allValues.join(", ")}]`);
        });
      } else {
        // Internal node label
        nodeGroup
          .append("text")
          .attr("x", nodeWidth / 2)
          .attr("y", 20)
          .attr("text-anchor", "middle")
          .attr("font-family", "Arial, sans-serif")
          .attr("font-size", "12px")
          .attr("font-weight", "bold")
          .text("Node");

        // Keys for internal nodes
        const hasStringKeys = node.data.keys.some((key: any) =>
          Array.isArray(key) ? key.some((k) => typeof k === "string") : typeof key === "string"
        );

        if (hasStringKeys) {
          // Display keys vertically for better readability
          node.data.keys.forEach((key: any, i: number) => {
            const keyText = Array.isArray(key) ? `[${key.map((k) => (typeof k === "string" ? `"${k}"` : k)).join(", ")}]` : key;
            nodeGroup
              .append("text")
              .attr("x", nodeWidth / 2)
              .attr("y", 32 + i * 12)
              .attr("text-anchor", "middle")
              .attr("font-family", "Arial, sans-serif")
              .attr("font-size", "9px")
              .text(keyText);
          });
        } else {
          // Display keys horizontally for numbers
          const keyTexts = node.data.keys.map((key: any) => (Array.isArray(key) ? `[${key.join(", ")}]` : key));
          nodeGroup
            .append("text")
            .attr("x", nodeWidth / 2)
            .attr("y", 37)
            .attr("text-anchor", "middle")
            .attr("font-family", "Arial, sans-serif")
            .attr("font-size", "11px")
            .text(`[${keyTexts.join(", ")}]`);
        }
      }
    });

    // Conditionally draw heap visualization
    if (SHOW_HEAP) {
      // Draw heap below the tree, aligned with leaf nodes
      const heapY = height - heapHeight - 20;
      const leafNodesForAlignment = allNodes.filter((node) => node.data.type === "leaf");
      const leftmostLeaf = leafNodesForAlignment[0];
      const rightmostLeaf = leafNodesForAlignment[leafNodesForAlignment.length - 1];

      const heapX = leftmostLeaf.x - nodeWidth / 2;
      const heapWidth = rightmostLeaf.x + nodeWidth / 2 - (leftmostLeaf.x - nodeWidth / 2);

      // Draw simple oval heap
      const heap = svg.append("g").attr("class", "heap");

      // Create oval shape
      const ovalCenterX = heapX + heapWidth / 2;
      const ovalCenterY = heapY + heapHeight / 2;
      const ovalRadiusX = heapWidth / 2;
      const ovalRadiusY = heapHeight / 2;

      heap
        .append("ellipse")
        .attr("cx", ovalCenterX)
        .attr("cy", ovalCenterY)
        .attr("rx", ovalRadiusX)
        .attr("ry", ovalRadiusY)
        .attr("fill", "#f5f5f5")
        .attr("stroke", "#999")
        .attr("stroke-width", 2);

      // Add "Heap" label
      heap
        .append("text")
        .attr("x", ovalCenterX)
        .attr("y", ovalCenterY + 8) // Slight adjustment for better centering
        .attr("text-anchor", "middle")
        .attr("font-family", "Arial, sans-serif")
        .attr("font-size", "24px")
        .attr("font-weight", "bold")
        .attr("fill", "#666")
        .text("Heap");

      // Draw arrows from each leaf to random points in the heap
      const heapArrows = svg.append("g").attr("class", "heap-arrows");
      const leafNodesForHeap = allNodes.filter((node) => node.data.type === "leaf");

      leafNodesForHeap.forEach((leafNode) => {
        const numArrows = leafNode.data.records.length;

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

          heapArrows.append("path").attr("d", arrowPath).attr("stroke", "#666").attr("stroke-width", 1.5).attr("fill", "none");

          // Add arrowhead at end
          const angle = Math.atan2(endY - controlY, endX - controlX);
          const arrowSize = 6;

          heapArrows
            .append("polygon")
            .attr(
              "points",
              `${endX},${endY} 
               ${endX - arrowSize * Math.cos(angle - Math.PI / 6)},${endY - arrowSize * Math.sin(angle - Math.PI / 6)} 
               ${endX - arrowSize * Math.cos(angle + Math.PI / 6)},${endY - arrowSize * Math.sin(angle + Math.PI / 6)}`
            )
            .attr("fill", "#666");
        }
      });
    }
  }, [tree]);

  return <svg ref={svgRef}></svg>;
};

function App() {
  const tree = createBTreeFromData(indexConfig);

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
