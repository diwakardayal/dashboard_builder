import React, { memo, useMemo } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { WidgetComponentProps } from "./registry";

interface RelationalDatum {
  x: number;
  y: number;
  group?: string;
}

const PALETTE = ["#6366f1", "#0891b2", "#16a34a", "#d97706"];

function RelationalWidgetImpl({ data, config }: WidgetComponentProps<RelationalDatum[]>) {
  const pointOpacity = typeof config.pointOpacity === "number" ? config.pointOpacity : 0.8;

  const grouped = useMemo(() => {
    if (!Array.isArray(data)) return {};
    return data.reduce<Record<string, RelationalDatum[]>>((acc, d) => {
      const key = d.group ?? "default";
      (acc[key] ??= []).push(d);
      return acc;
    }, {});
  }, [data]);

  const groupNames = Object.keys(grouped);
  if (groupNames.length === 0) {
    return <div className="widget-empty">No relational data to display</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart>
        <XAxis type="number" dataKey="x" tick={{ fontSize: 11 }} />
        <YAxis type="number" dataKey="y" tick={{ fontSize: 11 }} />
        <Tooltip cursor={{ strokeDasharray: "3 3" }} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        {groupNames.map((name, i) => (
          <Scatter key={name} name={name} data={grouped[name]} fill={PALETTE[i % PALETTE.length]} fillOpacity={pointOpacity} />
        ))}
      </ScatterChart>
    </ResponsiveContainer>
  );
}

export const RelationalWidget = memo(RelationalWidgetImpl);
