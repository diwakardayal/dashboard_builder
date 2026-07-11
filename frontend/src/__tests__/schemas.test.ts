import { describe, it, expect } from "vitest";
import { parseWidgetPayload } from "../schemas";

describe("parseWidgetPayload", () => {
  it("accepts a well-formed categorical envelope", () => {
    const raw = {
      widgetType: "categorical",
      requestId: "abc",
      generatedAt: new Date().toISOString(),
      data: [{ label: "A", value: 1 }],
    };
    const result = parseWidgetPayload(raw);
    expect(result.widgetType).toBe("categorical");
    expect(result.data).toEqual([{ label: "A", value: 1 }]);
  });

  it("rejects a categorical payload with the wrong shape (value as string)", () => {
    const raw = {
      widgetType: "categorical",
      requestId: "abc",
      generatedAt: new Date().toISOString(),
      data: [{ label: "A", value: "not-a-number" }],
    };
    expect(() => parseWidgetPayload(raw)).toThrow(/failed validation/);
  });

  it("rejects a temporal payload with a non-ISO timestamp", () => {
    const raw = {
      widgetType: "temporal",
      requestId: "abc",
      generatedAt: new Date().toISOString(),
      data: { series: [{ timestamp: "not-a-date", value: 1 }], trend: "up" },
    };
    expect(() => parseWidgetPayload(raw)).toThrow();
  });

  it("rejects an envelope with an unknown widgetType outright", () => {
    const raw = {
      widgetType: "pie3d",
      requestId: "abc",
      generatedAt: new Date().toISOString(),
      data: [],
    };
    expect(() => parseWidgetPayload(raw)).toThrow();
  });

  it("accepts a deeply nested hierarchical tree", () => {
    const raw = {
      widgetType: "hierarchical",
      requestId: "abc",
      generatedAt: new Date().toISOString(),
      data: { name: "root", children: [{ name: "child", value: 5 }] },
    };
    expect(() => parseWidgetPayload(raw)).not.toThrow();
  });
});
