import { generators } from "../data/mockEngine";
import { SchemaByType, WidgetType } from "../types/schemas";

describe("mockEngine generators", () => {
  const types: WidgetType[] = ["categorical", "temporal", "hierarchical", "relational"];

  it.each(types)("generates schema-valid data for %s", (type) => {
    const data = generators[type]();
    const result = SchemaByType[type].safeParse(data);
    expect(result.success).toBe(true);
  });

  it("temporal generator's trend matches the actual delta direction", () => {
    const data = generators.temporal() as { series: { value: number }[]; trend: string };
    const delta = data.series[data.series.length - 1].value - data.series[0].value;
    if (Math.abs(delta) < 5) expect(data.trend).toBe("flat");
    else expect(data.trend).toBe(delta > 0 ? "up" : "down");
  });

  it("hierarchical generator produces a tree with no cycles-breaking shape", () => {
    const data = generators.hierarchical() as any;
    expect(data.children.length).toBeGreaterThan(0);
    data.children.forEach((c: any) => expect(c.children.length).toBeGreaterThan(0));
  });
});
