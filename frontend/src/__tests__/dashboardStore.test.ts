import { describe, it, expect, beforeEach } from "vitest";
import { useDashboardStore } from "../store/dashboardStore";
import "../widgets";

describe("dashboardStore layout persistence", () => {
  beforeEach(() => {
    useDashboardStore.setState({ widgets: {}, layout: [] });
  });

  it("never assigns a non-finite y position to a new widget", () => {
    useDashboardStore.getState().addWidget("categorical");
    const layout = useDashboardStore.getState().layout;
    expect(layout).toHaveLength(1);
    expect(Number.isFinite(layout[0].y)).toBe(true);
  });

  it("survives a JSON serialize/deserialize round trip without producing null fields", () => {
    useDashboardStore.getState().addWidget("categorical");
    useDashboardStore.getState().addWidget("temporal");

    const serialized = JSON.stringify(useDashboardStore.getState().layout);
    const roundTripped = JSON.parse(serialized);

    roundTripped.forEach((item: any) => {
      expect(item.y).not.toBeNull();
      expect(typeof item.y).toBe("number");
    });
  });

  it("stacks widgets vertically rather than overlapping at y=0", () => {
    useDashboardStore.getState().addWidget("categorical");
    useDashboardStore.getState().addWidget("temporal");
    const layout = useDashboardStore.getState().layout;
    expect(layout[1].y).toBeGreaterThanOrEqual(layout[0].y + layout[0].h);
  });
});
