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

// Configuration: Data records to be indexed
const DATA_RECORDS: BTreeRecord[] = [
  { id: 1, title: "Apple" },
  { id: 3, title: "Apricot" },
  { id: 5, title: "Avocado" },
  { id: 7, title: "Banana" },
  { id: 9, title: "Blackberry" },
  { id: 11, title: "Blueberry" },
  { id: 13, title: "Cherry" },
  { id: 15, title: "Coconut" },
  { id: 17, title: "Cranberry" },
  { id: 19, title: "Date" },
  { id: 21, title: "Dragonfruit" },
  { id: 23, title: "Elderberry" },
  { id: 25, title: "Fig" },
  { id: 27, title: "Grape" },
  { id: 29, title: "Grapefruit" },
  { id: 31, title: "Guava" },
  { id: 33, title: "Honeydew" },
  { id: 35, title: "Jackfruit" },
  { id: 37, title: "Kiwi" },
  { id: 39, title: "Lemon" },
  { id: 41, title: "Lime" },
  { id: 43, title: "Mango" },
  { id: 45, title: "Nectarine" },
  { id: 47, title: "Orange" },
  { id: 49, title: "Papaya" },
  { id: 51, title: "Passionfruit" },
  { id: 53, title: "Peach" },
  { id: 55, title: "Pear" },
  { id: 57, title: "Pineapple" },
  { id: 59, title: "Plum" },
  { id: 61, title: "Pomegranate" },
  { id: 63, title: "Quince" },
  { id: 65, title: "Raspberry" },
  { id: 67, title: "Starfruit" },
  { id: 69, title: "Strawberry" },
  { id: 71, title: "Tangerine" },
  { id: 73, title: "Watermelon" },
  { id: 75, title: "Cantaloupe" },
  { id: 77, title: "Persimmon" },
  { id: 79, title: "Pomelo" },
];

// Configuration: B+ tree parameters
const BTREE_CONFIG = {
  maxKeysPerLeaf: 3, // Maximum keys in a leaf node
  maxKeysPerInternal: 2, // Maximum keys in an internal node
  minKeysPerLeaf: 1, // Minimum keys in a leaf node (except root)
  minKeysPerInternal: 1, // Minimum keys in an internal node (except root)
};

// Build B+ tree from data records
const createBTreeFromData = (records: BTreeRecord[]): BTreeNode => {
  // Sort records by id
  const sortedRecords = [...records].sort((a, b) => a.id - b.id);

  // Create leaf nodes
  const leaves: BTreeLeafNode[] = [];
  for (let i = 0; i < sortedRecords.length; i += BTREE_CONFIG.maxKeysPerLeaf) {
    const leafRecords = sortedRecords.slice(i, i + BTREE_CONFIG.maxKeysPerLeaf);
    const leaf: BTreeLeafNode = {
      type: "leaf",
      keys: leafRecords.map((r) => r.id),
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
      const keys: number[] = [];
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

    const width = 1600;
    const height = 700;
    const nodeWidth = 120;
    const nodeHeight = 60;
    const levelHeight = 140;

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
        const leafSpacing = 160; // Consistent spacing for ALL leaves
        const totalWidth = (allLeaves.length - 1) * leafSpacing;
        const startX = node.x - totalWidth / 2;

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

          // Position this internal node centered over its leaves
          n.x = (leftmostLeaf.x + rightmostLeaf.x) / 2;
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

    // Start positioning - let the algorithm determine its own width
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
  const tree = createBTreeFromData(DATA_RECORDS);

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
