import { registerWidget, getWidgetDefinition, listWidgetDefinitions } from "../widgets/registry";
import "../widgets";

describe("widget registry", () => {
  it("has all four core widget types registered", () => {
    const types = listWidgetDefinitions().map((d) => d.type);
    expect(types).toEqual(
      expect.arrayContaining(["categorical", "temporal", "hierarchical", "relational"])
    );
  });

  it("returns undefined for an unregistered type (shell must handle this gracefully)", () => {
    expect(getWidgetDefinition("nonexistent-type")).toBeUndefined();
  });

  it("supports registering a 5th widget type without touching existing ones", () => {
    const Dummy = () => null;
    registerWidget({
      type: "custom-test-widget",
      label: "Custom",
      component: Dummy as any,
      defaultConfig: {},
      defaultLayout: { w: 2, h: 2 },
    });

    expect(getWidgetDefinition("custom-test-widget")?.label).toBe("Custom");

    expect(getWidgetDefinition("categorical")).toBeDefined();
  });
});
