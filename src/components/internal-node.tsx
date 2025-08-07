import type { FC } from "react";
import { NODE_WIDTH } from "../util/constants";
import type { VisualNode } from "../types";

export const NonLeafNodeContents: FC<{ node: VisualNode }> = ({ node }) => {
  return (
    <>
      <text x={NODE_WIDTH / 2} y={20} textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="12px" fontWeight="bold">
        Node
      </text>

      {/* Keys for internal nodes */}
      {(() => {
        const hasStringKeys = node.data.keys.some((key: any) =>
          Array.isArray(key) ? key.some((k) => typeof k === "string") : typeof key === "string"
        );

        if (hasStringKeys) {
          // Display keys vertically for better readability
          return node.data.keys.map((key: any, i: number) => {
            const keyText = Array.isArray(key) ? `[${key.map((k) => (typeof k === "string" ? `"${k}"` : k)).join(", ")}]` : key;
            return (
              <text key={i} x={NODE_WIDTH / 2} y={32 + i * 12} textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="9px">
                {keyText}
              </text>
            );
          });
        } else {
          // Display keys horizontally for numbers
          const keyTexts = node.data.keys.map((key: any) => (Array.isArray(key) && key.length > 1 ? `[${key.join(", ")}]` : key));
          return (
            <text x={NODE_WIDTH / 2} y={37} textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="11px">
              {`[${keyTexts.join(", ")}]`}
            </text>
          );
        }
      })()}
    </>
  );
};
