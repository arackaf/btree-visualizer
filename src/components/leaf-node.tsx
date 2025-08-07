import type { FC } from "react";
import { NODE_WIDTH } from "../util/constants";
import type { BTreeConfig, BTreeLeafNode } from "../types";
import { quoteValue } from "../util/misc";

export const LeafNodeContents: FC<{ node: BTreeLeafNode; config: BTreeConfig; isHighlighted: boolean }> = ({ node, config, isHighlighted }) => {
  return (
    <>
      <text
        x={NODE_WIDTH / 2}
        y={15}
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontSize="10px"
        fontWeight="bold"
        fill={isHighlighted ? "#0D47A1" : "#333"}
      >
        Leaf
      </text>

      {node.records.map((record: any, i: number) => {
        const keyValues = config.keyColumns.map((col) => quoteValue(record[col]));
        const includeValues = config.includeColumns.map((col) => quoteValue(record[col]));
        const allValues = [...keyValues, ...includeValues];

        return (
          <text
            key={i}
            x={NODE_WIDTH / 2}
            y={28 + i * 12}
            textAnchor="middle"
            fontFamily="Arial, sans-serif"
            fontSize="9px"
            fill={isHighlighted ? "#0D47A1" : "#333"}
          >
            {`[${allValues.join(", ")}]`}
          </text>
        );
      })}
    </>
  );
};
