import {
  WidgetType,
  CategoricalData,
  TemporalData,
  HierarchicalData,
  RelationalData,
} from "../types/schemas";

type Generator = () => unknown;

function randBetween(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function generateCategorical(): CategoricalData {
  const labels = ["Product A", "Product B", "Product C", "Product D", "Product E"];
  return labels.map((label) => ({ label, value: randBetween(10, 500) }));
}

function generateTemporal(): TemporalData {
  const points = 30;
  const now = Date.now();
  const series = Array.from({ length: points }).map((_, i) => ({
    timestamp: new Date(now - (points - i) * 86_400_000).toISOString(),
    value: randBetween(50, 150) + i * randBetween(-1, 3),
  }));
  const delta = series[series.length - 1].value - series[0].value;
  const trend: TemporalData["trend"] =
    Math.abs(delta) < 5 ? "flat" : delta > 0 ? "up" : "down";
  return { series, trend };
}

function generateHierarchical(): HierarchicalData {
  const makeLeaf = (name: string) => ({ name, value: randBetween(5, 100) });
  return {
    name: "Organization",
    children: [
      {
        name: "Engineering",
        children: [makeLeaf("Frontend"), makeLeaf("Backend"), makeLeaf("Platform")],
      },
      {
        name: "Sales",
        children: [makeLeaf("Enterprise"), makeLeaf("SMB")],
      },
      {
        name: "Ops",
        children: [makeLeaf("Support"), makeLeaf("Success")],
      },
    ],
  };
}

function generateRelational(): RelationalData {
  const groups = ["cohort-1", "cohort-2", "cohort-3"];
  return Array.from({ length: 60 }).map(() => ({
    x: randBetween(0, 100),
    y: randBetween(0, 100),
    group: groups[Math.floor(Math.random() * groups.length)],
  }));
}

export const generators: Record<WidgetType, Generator> = {
  categorical: generateCategorical,
  temporal: generateTemporal,
  hierarchical: generateHierarchical,
  relational: generateRelational,
};

export function generateWithLatency(type: WidgetType): Promise<unknown> {
  const delay = randBetween(50, 400);
  return new Promise((resolve) => {
    setTimeout(() => resolve(generators[type]()), delay);
  });
}
