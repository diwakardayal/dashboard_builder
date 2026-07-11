import React, { memo } from "react";
import { Treemap, ResponsiveContainer, Tooltip } from "recharts";
import { WidgetComponentProps } from "./registry";

interface HierarchicalNode {
  name: string;
  value?: number;
  children?: HierarchicalNode[];
}

const PALETTE = ["#6366f1", "#0891b2", "#16a34a", "#d97706", "#dc2626", "#7c3aed"];

function HierarchicalWidgetImpl({ data, config }: WidgetComponentProps<HierarchicalNode>) {
  const showLabels = config.showLabels !== false;

  if (!data || !data.children || data.children.length === 0) {
    return <div className="widget-empty">No hierarchy to display</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <Treemap
        data={data.children}
        dataKey="value"
        nameKey="name"
        stroke="#fff"
        fill="#6366f1"
        content={
          ((props: any) => {
            const { x, y, width, height, index, name } = props;
            if (width < 2 || height < 2) return <g />;
            return (
              <g>
                <rect
                  x={x}
                  y={y}
                  width={width}
                  height={height}
                  style={{ fill: PALETTE[index % PALETTE.length], stroke: "#fff" }}
                />
                {showLabels && width > 40 && height > 20 && (
                  <text x={x + 4} y={y + 14} fontSize={11} fill="#fff">
                    {name}
                  </text>
                )}
              </g>
            );
          }) as unknown as React.ReactElement
        }
      >
        <Tooltip />
      </Treemap>
    </ResponsiveContainer>
  );
}

export const HierarchicalWidget = memo(HierarchicalWidgetImpl);
