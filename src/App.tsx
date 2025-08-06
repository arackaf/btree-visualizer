import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import "./App.css";

// B+ Tree data structures
interface BTreeRecord {
  id: number;
  title: string;
}

interface BTreeLeafNode {
  type: "leaf";
  keys: number[];
  records: BTreeRecord[];
  next?: BTreeLeafNode;
}

interface BTreeInternalNode {
  type: "internal";
  keys: number[];
  children: (BTreeInternalNode | BTreeLeafNode)[];
}

type BTreeNode = BTreeInternalNode | BTreeLeafNode;

// Hardcoded B+ tree with 3 levels of internal nodes + leaf level
const createSampleBTree = (): BTreeNode => {
  // Leaf nodes (level 4 - bottom layer)
  const leaf1: BTreeLeafNode = {
    type: "leaf",
    keys: [1, 3, 5],
    records: [
      { id: 1, title: "Apple" },
      { id: 3, title: "Banana" },
      { id: 5, title: "Cherry" },
    ],
  };

  const leaf2: BTreeLeafNode = {
    type: "leaf",
    keys: [7, 9, 11],
    records: [
      { id: 7, title: "Date" },
      { id: 9, title: "Elderberry" },
      { id: 11, title: "Fig" },
    ],
  };

  const leaf3: BTreeLeafNode = {
    type: "leaf",
    keys: [13, 15, 17],
    records: [
      { id: 13, title: "Grape" },
      { id: 15, title: "Honeydew" },
      { id: 17, title: "Kiwi" },
    ],
  };

  const leaf4: BTreeLeafNode = {
    type: "leaf",
    keys: [19, 21, 23],
    records: [
      { id: 19, title: "Lemon" },
      { id: 21, title: "Mango" },
      { id: 23, title: "Orange" },
    ],
  };

  const leaf5: BTreeLeafNode = {
    type: "leaf",
    keys: [25, 27, 29],
    records: [
      { id: 25, title: "Papaya" },
      { id: 27, title: "Quince" },
      { id: 29, title: "Raspberry" },
    ],
  };

  const leaf6: BTreeLeafNode = {
    type: "leaf",
    keys: [31, 33, 35],
    records: [
      { id: 31, title: "Strawberry" },
      { id: 33, title: "Tangerine" },
      { id: 35, title: "Watermelon" },
    ],
  };

  // Link leaf nodes
  leaf1.next = leaf2;
  leaf2.next = leaf3;
  leaf3.next = leaf4;
  leaf4.next = leaf5;
  leaf5.next = leaf6;

  // Level 3 internal nodes
  const internal3_1: BTreeInternalNode = {
    type: "internal",
    keys: [7],
    children: [leaf1, leaf2],
  };

  const internal3_2: BTreeInternalNode = {
    type: "internal",
    keys: [19],
    children: [leaf3, leaf4],
  };

  const internal3_3: BTreeInternalNode = {
    type: "internal",
    keys: [31],
    children: [leaf5, leaf6],
  };

  // Level 2 internal nodes
  const internal2_1: BTreeInternalNode = {
    type: "internal",
    keys: [13],
    children: [internal3_1, internal3_2],
  };

  const internal2_2: BTreeInternalNode = {
    type: "internal",
    keys: [25],
    children: [internal3_3],
  };

  // Level 1 root node
  const root: BTreeInternalNode = {
    type: "internal",
    keys: [20],
    children: [internal2_1, internal2_2],
  };

  return root;
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

    const width = 1200;
    const height = 600;
    const nodeWidth = 120;
    const nodeHeight = 60;
    const levelHeight = 120;

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

    // Calculate positions for nodes
    const positionNodes = (node: any, x: number = width / 2, y: number = 50): void => {
      node.x = x;
      node.y = y;

      if (node.children && node.children.length > 0) {
        const totalWidth = node.children.length * (nodeWidth + 40);
        const startX = x - totalWidth / 2 + (nodeWidth + 40) / 2;

        node.children.forEach((child: any, i: number) => {
          const childX = startX + i * (nodeWidth + 40);
          positionNodes(child, childX, y + levelHeight);
        });
      }
    };

    positionNodes(hierarchyRoot);

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

    // Draw leaf node connections (next pointers)
    const leafConnections = svg.append("g").attr("class", "leaf-connections");
    allNodes
      .filter((node) => node.data.type === "leaf")
      .forEach((node) => {
        if (node.data.next) {
          const nextNode = allNodes.find((n) => n.data === node.data.next);
          if (nextNode) {
            leafConnections
              .append("line")
              .attr("x1", node.x + nodeWidth / 2)
              .attr("y1", node.y + nodeHeight + 10)
              .attr("x2", nextNode.x - nodeWidth / 2)
              .attr("y2", nextNode.y + nodeHeight + 10)
              .attr("stroke", "#4CAF50")
              .attr("stroke-width", 2)
              .attr("stroke-dasharray", "5,5");
          }
        }
      });

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

      // Node label
      nodeGroup
        .append("text")
        .attr("x", nodeWidth / 2)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .attr("font-family", "Arial, sans-serif")
        .attr("font-size", "12px")
        .attr("font-weight", "bold")
        .text(node.data.type === "leaf" ? "LEAF" : "INTERNAL");

      // Keys
      nodeGroup
        .append("text")
        .attr("x", nodeWidth / 2)
        .attr("y", 35)
        .attr("text-anchor", "middle")
        .attr("font-family", "Arial, sans-serif")
        .attr("font-size", "11px")
        .text(`Keys: [${node.data.keys.join(", ")}]`);

      // Records for leaf nodes
      if (node.data.type === "leaf") {
        nodeGroup
          .append("text")
          .attr("x", nodeWidth / 2)
          .attr("y", 50)
          .attr("text-anchor", "middle")
          .attr("font-family", "Arial, sans-serif")
          .attr("font-size", "9px")
          .text(`Records: ${node.data.records.length}`);
      }
    });
  }, [tree]);

  return <svg ref={svgRef}></svg>;
};

function App() {
  const tree = createSampleBTree();

  return (
    <div className="App">
      <header style={{ padding: "20px", textAlign: "center" }}>
        <h1>B+ Tree Visualizer</h1>
        <p>Interactive visualization of a B+ tree with (id, title) records</p>
      </header>
      <main style={{ padding: "20px" }}>
        <TreeVisualization tree={tree} />
      </main>
    </div>
  );
}

export default App;
