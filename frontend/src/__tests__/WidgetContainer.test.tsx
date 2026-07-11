import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import React from "react";
import { WidgetContainer } from "../components/WidgetContainer";
import { WidgetDataProvider } from "../components/WidgetDataProvider";
import { useDashboardStore } from "../store/dashboardStore";
import "../widgets";

describe("WidgetContainer — remove/configure buttons don't get swallowed by the drag handle", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    useDashboardStore.setState({ widgets: {}, layout: [] });
    globalThis.fetch = vi.fn(async (_url: any, init: any) => {
      const body = JSON.parse(init.body);
      return {
        ok: true,
        json: async () => ({
          results: body.types.map((t: string) => ({
            ok: true,
            result: {
              widgetType: t,
              requestId: "req-1",
              generatedAt: new Date().toISOString(),
              data: [{ label: "A", value: 1 }],
            },
          })),
        }),
      } as any;
    }) as any;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("stops mousedown propagation on the action button group so react-grid-layout's drag handler never sees it", () => {
    useDashboardStore.getState().addWidget("categorical");
    const id = Object.keys(useDashboardStore.getState().widgets)[0];

    render(
      <WidgetDataProvider widgets={[{ id, type: "categorical" }]}>
        <WidgetContainer id={id} />
      </WidgetDataProvider>
    );

    const actionsGroup = screen.getByLabelText("Remove widget").closest(".widget-header-actions")!;
    const mouseDownEvent = new MouseEvent("mousedown", { bubbles: true, cancelable: true });
    const stopPropagationSpy = vi.spyOn(mouseDownEvent, "stopPropagation");
    actionsGroup.dispatchEvent(mouseDownEvent);

    expect(stopPropagationSpy).toHaveBeenCalled();
  });

  it("clicking the remove button removes the widget from the store", async () => {
    useDashboardStore.getState().addWidget("categorical");
    const id = Object.keys(useDashboardStore.getState().widgets)[0];
    expect(useDashboardStore.getState().widgets[id]).toBeDefined();

    render(
      <WidgetDataProvider widgets={[{ id, type: "categorical" }]}>
        <WidgetContainer id={id} />
      </WidgetDataProvider>
    );

    await act(async () => {
      fireEvent.click(screen.getByLabelText("Remove widget"));
      await new Promise((r) => setTimeout(r, 20));
    });

    expect(useDashboardStore.getState().widgets[id]).toBeUndefined();
  });

  it("clicking the remove button repeatedly (simulating a fast double-click) still removes exactly once without throwing", async () => {
    useDashboardStore.getState().addWidget("categorical");
    const id = Object.keys(useDashboardStore.getState().widgets)[0];

    render(
      <WidgetDataProvider widgets={[{ id, type: "categorical" }]}>
        <WidgetContainer id={id} />
      </WidgetDataProvider>
    );

    const removeBtn = screen.getByLabelText("Remove widget");
    await act(async () => {
      fireEvent.click(removeBtn);
      await new Promise((r) => setTimeout(r, 20));
    });
    expect(() => fireEvent.click(removeBtn)).not.toThrow();
    expect(useDashboardStore.getState().widgets[id]).toBeUndefined();
  });
});
