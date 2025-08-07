import type { FC } from "react";
import type { BTreeConfig, VisualNode } from "../types";
import { NODE_HEIGHT, NODE_WIDTH } from "../util/constants";
import { LeafNodeContents } from "./leaf-node";
import { NonLeafNodeContents } from "./internal-node";

export const Node: FC<{ node: VisualNode; config: BTreeConfig }> = ({ node, config }) => {
  const fillColor = node.data.type === "leaf" ? "#E3F2FD" : "#FFF3E0";
  const strokeColor = node.data.type === "leaf" ? "#2196F3" : "#FF9800";

  return (
    <g key={node.id} transform={`translate(${node.x - NODE_WIDTH / 2}, ${node.y - NODE_HEIGHT / 2})`}>
      <rect width={NODE_WIDTH} height={NODE_HEIGHT} fill={fillColor} stroke={strokeColor} strokeWidth={2} rx={5} />

      {node.data.type === "leaf" ? <LeafNodeContents node={node.data} config={config} /> : <NonLeafNodeContents node={node.data} config={config} />}
    </g>
  );
};
