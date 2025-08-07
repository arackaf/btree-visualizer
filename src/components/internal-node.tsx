import type { FC } from "react";
import { NODE_WIDTH } from "../util/constants";
import type { BTreeConfig, BTreeInternalNode } from "../types";
import { quoteValue } from "../util/misc";

const displayKey = (key: any | any[]) => {
  if (Array.isArray(key)) {
    if (key.length > 1) {
      return `[${key.map((k) => quoteValue(k)).join(", ")}]`;
    }
    return quoteValue(key[0]);
  }
  return key;
};

export const NonLeafNodeContents: FC<{ node: BTreeInternalNode; config: BTreeConfig }> = ({ node, config }) => {
  const hasMultipleKeys = config.keyColumns.length > 1;

  return (
    <>
      <text x={NODE_WIDTH / 2} y={20} textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="12px" fontWeight="bold">
        Node
      </text>

      {hasMultipleKeys ? (
        node.keys.map((key: any, i: number) => (
          <text key={i} x={NODE_WIDTH / 2} y={32 + i * 12} textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="9px">
            {displayKey(key)}
          </text>
        ))
      ) : (
        <text x={NODE_WIDTH / 2} y={37} textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="11px">
          {displayKey(node.keys)}
        </text>
      )}
    </>
  );
};
