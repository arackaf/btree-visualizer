import type { FC } from "react";
import type { BTreeConfig, VisualNode } from "../types";
import { NODE_HEIGHT, NODE_WIDTH } from "../util/constants";
import { LeafNodeContents } from "./leaf-node";
import { NonLeafNodeContents } from "./internal-node";

export const Node: FC<{ node: VisualNode; config: BTreeConfig; isHighlighted: boolean }> = ({ node, config, isHighlighted }) => {
  // Determine colors based on node type and highlighting
  const isLeaf = node.data.type === "leaf";

  const fillColor = isHighlighted
    ? isLeaf
      ? "#90CAF9"
      : "#FFCC80" // Much brighter colors for highlighted nodes
    : isLeaf
    ? "#E3F2FD"
    : "#FFF3E0"; // Default colors

  const strokeColor = isHighlighted
    ? isLeaf
      ? "#0D47A1"
      : "#E65100" // Much darker stroke colors for highlighted nodes
    : isLeaf
    ? "#2196F3"
    : "#FF9800"; // Default stroke colors

  return (
    <g key={node.id} transform={`translate(${node.x - NODE_WIDTH / 2}, ${node.y - NODE_HEIGHT / 2})`}>
      <rect width={NODE_WIDTH} height={NODE_HEIGHT} fill={fillColor} stroke={strokeColor} strokeWidth={2} rx={5} />

      {node.data.type === "leaf" ? (
        <LeafNodeContents node={node.data} config={config} isHighlighted={isHighlighted} />
      ) : (
        <NonLeafNodeContents node={node.data} config={config} isHighlighted={isHighlighted} />
      )}
    </g>
  );
};
