import type { FC } from "react";
import { NODE_WIDTH } from "../util/constants";
import type { BTreeConfig, BTreeLeafNode } from "../types";

export const LeafNodeContents: FC<{ node: BTreeLeafNode; config: BTreeConfig }> = ({ node, config }) => {
  return (
    <>
      <text x={NODE_WIDTH / 2} y={15} textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="10px" fontWeight="bold">
        Leaf
      </text>

      {node.records.map((record: any, i: number) => {
        const keyValues = config.keyColumns.map((col) => record[col]);
        const includeValues = config.includeColumns.map((col) => `"${record[col]}"`);
        const allValues = [...keyValues, ...includeValues];

        return (
          <text key={i} x={NODE_WIDTH / 2} y={28 + i * 12} textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="9px">
            {`[${allValues.join(", ")}]`}
          </text>
        );
      })}
    </>
  );
};
