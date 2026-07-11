import React, { memo, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { WidgetComponentProps } from "./registry";

interface TemporalDatum {
  timestamp: string;
  value: number;
}
interface TemporalData {
  series: TemporalDatum[];
  trend: "up" | "down" | "flat";
}

const trendColor: Record<TemporalData["trend"], string> = {
  up: "#16a34a",
  down: "#dc2626",
  flat: "#6b7280",
};

function TemporalWidgetImpl({ data, config }: WidgetComponentProps<TemporalData>) {
  const color = (config.lineColor as string) ?? "#0891b2";

  const chartData = useMemo(() => {
    if (!data?.series) return [];
    return data.series
      .map((d) => {
        const t = new Date(d.timestamp);
        if (isNaN(t.getTime())) return null;
        return { ...d, label: t.toLocaleDateString(undefined, { month: "short", day: "numeric" }) };
      })
      .filter((d): d is NonNullable<typeof d> => d !== null);
  }, [data]);

  if (chartData.length === 0) {
    return <div className="widget-empty">No time-series data to display</div>;
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <span style={{ fontSize: 11, color: trendColor[data.trend], fontWeight: 600 }}>
        Trend: {data.trend}
      </span>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip labelFormatter={(_, p) => p?.[0]?.payload?.timestamp ?? ""} />
          <Line type="monotone" dataKey="value" stroke={color} dot={false} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export const TemporalWidget = memo(TemporalWidgetImpl);
