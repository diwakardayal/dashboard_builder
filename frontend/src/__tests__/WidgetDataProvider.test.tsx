import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import React from "react";
import { WidgetDataProvider, useWidgetDataEntry } from "../components/WidgetDataProvider";

function Probe({ id, statusLog }: { id: string; statusLog: string[] }) {
  const entry = useWidgetDataEntry(id);
  statusLog.push(entry.status);
  return <div data-testid={`probe-${id}`}>{entry.status}</div>;
}

describe("WidgetDataProvider — no unnecessary refetch/re-render on widget add", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    let call = 0;
    globalThis.fetch = vi.fn(async (url: any, init: any) => {
      call += 1;
      const body = JSON.parse(init.body);
      return {
        ok: true,
        json: async () => ({
          results: body.types.map((t: string) => ({
            ok: true,
            result: {
              widgetType: t,
              requestId: `req-${call}`,
              generatedAt: new Date().toISOString(),
              data: t === "categorical" ? [{ label: "A", value: 1 }] : { series: [], trend: "flat" },
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

  it("does not re-fetch an already-loaded widget when a second widget is added", async () => {
    const logA: string[] = [];
    const logB: string[] = [];

    const { rerender } = render(
      <WidgetDataProvider widgets={[{ id: "a", type: "categorical" }]}>
        <Probe id="a" statusLog={logA} />
      </WidgetDataProvider>
    );

    await waitFor(() => expect(screen.getByTestId("probe-a")).toHaveTextContent("success"));
    const fetchCallsAfterFirstLoad = (globalThis.fetch as any).mock.calls.length;
    const logALengthAfterFirstLoad = logA.length;

    rerender(
      <WidgetDataProvider widgets={[{ id: "a", type: "categorical" }, { id: "b", type: "temporal" }]}>
        <Probe id="a" statusLog={logA} />
        <Probe id="b" statusLog={logB} />
      </WidgetDataProvider>
    );

    await waitFor(() => expect(screen.getByTestId("probe-b")).toHaveTextContent("success"));

    expect((globalThis.fetch as any).mock.calls.length).toBe(fetchCallsAfterFirstLoad + 1);
    const secondCallBody = JSON.parse((globalThis.fetch as any).mock.calls[fetchCallsAfterFirstLoad][1].body);
    expect(secondCallBody.types).toEqual(["temporal"]);

    const newStatusesForA = logA.slice(logALengthAfterFirstLoad);
    expect(newStatusesForA.every((s) => s === "success")).toBe(true);
    expect(screen.getByTestId("probe-a")).toHaveTextContent("success");
  });
});

describe("WidgetDataProvider — survives StrictMode-style double effect invocation", () => {
  const originalFetch = globalThis.fetch;

  function mockAbortAwareFetch() {
    globalThis.fetch = vi.fn((_url: any, init: any) => {
      return new Promise((resolve, reject) => {
        const signal: AbortSignal | undefined = init?.signal;
        if (signal?.aborted) {
          reject(new DOMException("Aborted", "AbortError"));
          return;
        }
        const timer = setTimeout(() => {
          const body = JSON.parse(init.body);
          resolve({
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
          } as any);
        }, 10);
        signal?.addEventListener("abort", () => {
          clearTimeout(timer);
          reject(new DOMException("Aborted", "AbortError"));
        });
      });
    }) as any;
  }

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("does not get stuck loading forever under React 18 StrictMode's double effect invocation on mount (the actual bug reported)", async () => {
    mockAbortAwareFetch();
    const log: string[] = [];

    render(
      <React.StrictMode>
        <WidgetDataProvider widgets={[{ id: "x", type: "categorical" }]}>
          <Probe id="x" statusLog={log} />
        </WidgetDataProvider>
      </React.StrictMode>
    );

    await waitFor(() => expect(screen.getByTestId("probe-x")).toHaveTextContent("success"), {
      timeout: 2000,
    });
  });
});
