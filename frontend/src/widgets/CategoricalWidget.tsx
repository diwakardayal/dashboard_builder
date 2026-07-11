import React, { memo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { WidgetComponentProps } from "./registry";

interface CategoricalDatum {
  label: string;
  value: number;
}

function CategoricalWidgetImpl({ data, config }: WidgetComponentProps<CategoricalDatum[]>) {
  const color = (config.barColor as string) ?? "#6366f1";

  if (!Array.isArray(data) || data.length === 0) {
    return <div className="widget-empty">No data to display</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip />
        <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export const CategoricalWidget = memo(CategoricalWidgetImpl);
