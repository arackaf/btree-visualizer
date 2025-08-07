import type { FC } from "react";
import { NODE_WIDTH } from "../util/constants";
import type { BTreeInternalNode } from "../types";

export const NonLeafNodeContents: FC<{ node: BTreeInternalNode }> = ({ node }) => {
  const hasMultipleKeys = node.keys.some((key: any) => Array.isArray(key) && key.length > 1);
  const keysJoined = node.keys.map((key: any) => (Array.isArray(key) && key.length > 1 ? `[${key.join(", ")}]` : key)).join(", ");

  return (
    <>
      <text x={NODE_WIDTH / 2} y={20} textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="12px" fontWeight="bold">
        Node
      </text>

      {hasMultipleKeys ? (
        node.keys.map((key: any, i: number) => {
          const keyText = Array.isArray(key) ? `[${key.map((k) => (typeof k === "string" ? `"${k}"` : k)).join(", ")}]` : key;
          return (
            <text key={i} x={NODE_WIDTH / 2} y={32 + i * 12} textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="9px">
              {keyText}
            </text>
          );
        })
      ) : (
        <text x={NODE_WIDTH / 2} y={37} textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="11px">
          {`[${keysJoined}]`}
        </text>
      )}
    </>
  );
};
