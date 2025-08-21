import type { FC } from "react";
import type { BTreeConfig, BTreeInternalNode } from "../types";
import { quoteValue } from "../util/misc";
import { NODE_WIDTH } from "../util/constants";

const hasStringKeys = (keys: any | any[]): boolean => {
  if (Array.isArray(keys)) {
    return keys.flat().some(key => typeof key === "string");
  }
  return typeof keys === "string";
};

const displayKey = (key: any | any[]) => {
  if (Array.isArray(key)) {
    if (key.length > 1) {
      return `[${key.map(k => quoteValue(k)).join(", ")}]`;
    }
    return `[${quoteValue(key[0])}]`;
  }
  return key;
};

export const NonLeafNodeContents: FC<{ node: BTreeInternalNode; config: BTreeConfig; isHighlighted: boolean }> = ({
  node,
  config,
  isHighlighted,
}) => {
  const hasMultipleKeys = config.keyColumns.length > 1;

  return (
    <>
      <text
        x={NODE_WIDTH / 2}
        y={20}
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontSize="12px"
        fontWeight="bold"
        fill={isHighlighted ? "#0D47A1" : "#333"}
      >
        Node
      </text>

      {hasMultipleKeys ? (
        node.keys.map((key: any, i: number) => {
          const isLeftAligned = hasStringKeys(key);
          return (
            <text
              key={i}
              x={isLeftAligned ? 10 : NODE_WIDTH / 2}
              y={32 + i * 12}
              textAnchor={isLeftAligned ? "start" : "middle"}
              fontFamily="Arial, sans-serif"
              fontSize="9px"
              fill={isHighlighted ? "#0D47A1" : "#333"}
            >
              {displayKey(key)}
            </text>
          );
        })
      ) : (
        <text
          x={hasStringKeys(node.keys) ? 10 : NODE_WIDTH / 2}
          y={37}
          textAnchor={hasStringKeys(node.keys) ? "start" : "middle"}
          fontFamily="Arial, sans-serif"
          fontSize="11px"
          fill={isHighlighted ? "#0D47A1" : "#333"}
        >
          {displayKey(node.keys)}
        </text>
      )}
    </>
  );
};
