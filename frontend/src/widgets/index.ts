import { registerWidget } from "./registry";
import { CategoricalWidget } from "./CategoricalWidget";
import { TemporalWidget } from "./TemporalWidget";
import { HierarchicalWidget } from "./HierarchicalWidget";
import { RelationalWidget } from "./RelationalWidget";

registerWidget({
  type: "categorical",
  label: "Bar Chart (Categorical)",
  component: CategoricalWidget,
  defaultConfig: { barColor: "#6366f1" },
  defaultLayout: { w: 4, h: 3, minW: 2, minH: 2 },
  configFields: [{ key: "barColor", label: "Bar color", type: "color", default: "#6366f1" }],
});

registerWidget({
  type: "temporal",
  label: "Line Chart (Temporal)",
  component: TemporalWidget,
  defaultConfig: { lineColor: "#0891b2" },
  defaultLayout: { w: 6, h: 3, minW: 3, minH: 2 },
  configFields: [{ key: "lineColor", label: "Line color", type: "color", default: "#0891b2" }],
});

registerWidget({
  type: "hierarchical",
  label: "Treemap (Hierarchical)",
  component: HierarchicalWidget,
  defaultConfig: { showLabels: true },
  defaultLayout: { w: 5, h: 4, minW: 3, minH: 2 },
  configFields: [{ key: "showLabels", label: "Show tile labels", type: "boolean", default: true }],
});

registerWidget({
  type: "relational",
  label: "Scatter Plot (Relational)",
  component: RelationalWidget,
  defaultConfig: { pointOpacity: 0.8 },
  defaultLayout: { w: 5, h: 4, minW: 3, minH: 2 },
  configFields: [
    { key: "pointOpacity", label: "Point opacity", type: "number", default: 0.8, min: 0.1, max: 1, step: 0.1 },
  ],
});
