import type { FC } from "react";
import type { BTreeConfig, BTreeLeafNode } from "../types";
import { quoteValue } from "../util/misc";
import { NODE_WIDTH } from "../util/constants";

const hasStringValues = (record: any, config: BTreeConfig): boolean => {
  const keyValues = config.keyColumns.map(col => record[col]);
  const includeValues = config.includeColumns.map(col => record[col]);
  const allValues = [...keyValues, ...includeValues];
  return allValues.some(value => typeof value === "string");
};

export const LeafNodeContents: FC<{ node: BTreeLeafNode; config: BTreeConfig; isHighlighted: boolean }> = ({
  node,
  config,
  isHighlighted,
}) => {
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
        const keyValues = config.keyColumns.map(col => quoteValue(record[col]));
        const includeValues = config.includeColumns.map(col => quoteValue(record[col]));
        const allValues = [...keyValues, ...includeValues];
        const isLeftAligned = hasStringValues(record, config);

        return (
          <text
            key={i}
            x={isLeftAligned ? 10 : NODE_WIDTH / 2}
            y={28 + i * 12}
            textAnchor={isLeftAligned ? "start" : "middle"}
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
