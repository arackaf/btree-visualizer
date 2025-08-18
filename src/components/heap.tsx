import { useMemo } from "react";
import type { HeapVisualizationProps } from "../types";
import { HEAP_HEIGHT, NODE_HEIGHT } from "../util/constants";

export const HeapVisualization: React.FC<HeapVisualizationProps> = ({ x, y, width, leafNodes, highlightedItems = [] }) => {
  // Calculate oval dimensions and center
  const ovalCenterX = x + width / 2;
  const ovalCenterY = y + HEAP_HEIGHT / 2;
  const ovalRadiusX = width / 2;
  const ovalRadiusY = HEAP_HEIGHT / 2;

  // Generate arrows data
  const arrows = useMemo(() => {
    const arrowsData: Array<{
      path: string;
      arrowHead: { x: number; y: number; angle: number };
    }> = [];

    leafNodes.forEach((leafNode) => {
      const numArrows = leafNode.data.type === "leaf" ? leafNode.data.records.length : 0;

      for (let i = 0; i < numArrows; i++) {
        // Start point: bottom of leaf node
        const startX = leafNode.x + (i - (numArrows - 1) / 2) * 15; // Spread arrows horizontally
        const startY = leafNode.y + NODE_HEIGHT / 2;

        // End point: random location inside the oval heap
        // Generate random point within the ellipse bounds
        const heapAngle = Math.random() * 2 * Math.PI;
        const radiusScale = Math.sqrt(Math.random()) * 0.8; // Keep arrows well inside the oval
        const endX = ovalCenterX + radiusScale * ovalRadiusX * Math.cos(heapAngle);
        const endY = ovalCenterY + radiusScale * ovalRadiusY * Math.sin(heapAngle);

        // Control point for curved arrow
        const controlX = (startX + endX) / 2;
        const controlY = startY + (endY - startY) * 0.7;

        // Draw curved arrow path
        const arrowPath = `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`;

        // Calculate angle for arrowhead
        const angle = Math.atan2(endY - controlY, endX - controlX);

        arrowsData.push({
          path: arrowPath,
          arrowHead: { x: endX, y: endY, angle },
        });
      }
    });

    return arrowsData;
  }, [leafNodes, ovalCenterX, ovalCenterY, ovalRadiusX, ovalRadiusY]);

  return (
    <g className="heap">
      <ellipse cx={ovalCenterX} cy={ovalCenterY} rx={ovalRadiusX} ry={ovalRadiusY} fill="#f5f5f5" stroke="#999" strokeWidth={2} />

      <g className="heap-arrows">
        {arrows.map((arrow, index) => {
          const isHighlighted = highlightedItems.some((item) => item.type === "HEAP_ARROW" && item.value === index);
          const arrowColor = isHighlighted ? "#ff0000" : "#666";

          return (
            <g key={index}>
              {/* Arrow path */}
              <path d={arrow.path} stroke={arrowColor} strokeWidth={1.5} fill="none" />
              {/* Arrowhead */}
              <polygon
                points={`${arrow.arrowHead.x},${arrow.arrowHead.y} 
                         ${arrow.arrowHead.x - 6 * Math.cos(arrow.arrowHead.angle - Math.PI / 6)},${
                  arrow.arrowHead.y - 6 * Math.sin(arrow.arrowHead.angle - Math.PI / 6)
                } 
                         ${arrow.arrowHead.x - 6 * Math.cos(arrow.arrowHead.angle + Math.PI / 6)},${
                  arrow.arrowHead.y - 6 * Math.sin(arrow.arrowHead.angle + Math.PI / 6)
                }`}
                fill={arrowColor}
              />
            </g>
          );
        })}
      </g>

      <text x={ovalCenterX} y={ovalCenterY + 18} textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="72px" fontWeight="bold">
        Heap
      </text>
    </g>
  );
};
