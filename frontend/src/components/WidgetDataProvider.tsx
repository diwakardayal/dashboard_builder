import React, { createContext, useContext, useEffect, useRef, useSyncExternalStore, useCallback } from "react";
import { WidgetType } from "../types";
import { parseWidgetPayload } from "../schemas";

type Status = "idle" | "loading" | "success" | "error";

interface WidgetDataEntry {
  status: Status;
  data: unknown;
  error: string | null;
}

const IDLE_ENTRY: WidgetDataEntry = { status: "idle", data: null, error: null };

interface WidgetRef {
  id: string;
  type: WidgetType;
}

const API_BASE = (import.meta as any).env?.VITE_API_BASE ?? "http://localhost:4000";

class WidgetDataStore {
  private entries = new Map<string, WidgetDataEntry>();
  private listeners = new Map<string, Set<() => void>>();

  getSnapshot = (id: string): WidgetDataEntry => this.entries.get(id) ?? IDLE_ENTRY;

  hasEntry = (id: string): boolean => this.entries.has(id);

  keys = (): string[] => Array.from(this.entries.keys());

  subscribe = (id: string) => (listener: () => void) => {
    if (!this.listeners.has(id)) this.listeners.set(id, new Set());
    this.listeners.get(id)!.add(listener);
    return () => this.listeners.get(id)?.delete(listener);
  };

  set(id: string, entry: WidgetDataEntry) {
    this.entries.set(id, entry);
    this.listeners.get(id)?.forEach((l) => l());
  }

  remove(id: string) {
    this.entries.delete(id);
    this.listeners.get(id)?.forEach((l) => l());
    this.listeners.delete(id);
  }
}

const store = new WidgetDataStore();

async function fetchBatch(targets: WidgetRef[], signal: AbortSignal) {
  if (targets.length === 0) return;

  targets.forEach((w) => store.set(w.id, { status: "loading", data: null, error: null }));

  const revertToIdleIfAborted = () => {
    if (signal.aborted) {
      targets.forEach((w) => {
        if (store.getSnapshot(w.id).status === "loading") store.set(w.id, IDLE_ENTRY);
      });
    }
  };
  signal.addEventListener("abort", revertToIdleIfAborted);

  try {
    const res = await fetch(`${API_BASE}/api/widgets/batch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ types: targets.map((w) => w.type) }),
      signal,
    });

    if (!res.ok) {
      targets.forEach((w) => store.set(w.id, { status: "error", data: null, error: `Batch request failed with ${res.status}` }));
      return;
    }

    const body: { results: Array<{ ok: boolean; result?: unknown; error?: string }> } = await res.json();
    body.results.forEach((r, i) => {
      const target = targets[i];
      if (!target) return;
      if (!r.ok) {
        store.set(target.id, { status: "error", data: null, error: r.error ?? "Request failed" });
        return;
      }
      try {
        const parsed = parseWidgetPayload(r.result);
        store.set(target.id, { status: "success", data: parsed.data, error: null });
      } catch (validationErr) {
        store.set(target.id, {
          status: "error",
          data: null,
          error: validationErr instanceof Error ? validationErr.message : "Invalid data shape",
        });
      }
    });
  } catch (err: any) {
    if (err?.name === "AbortError" || signal.aborted) {
      return;
    }
    targets.forEach((w) => store.set(w.id, { status: "error", data: null, error: err?.message ?? "Network error" }));
  } finally {
    signal.removeEventListener("abort", revertToIdleIfAborted);
  }
}

const WidgetDataActionsContext = createContext<{ retryWidget: (id: string) => void } | null>(null);

export function WidgetDataProvider({
  widgets,
  children,
}: {
  widgets: WidgetRef[];
  children: React.ReactNode;
}) {
  const widgetsRef = useRef(widgets);
  widgetsRef.current = widgets;
  const widgetsKey = widgets.map((w) => `${w.id}:${w.type}`).join(",");

  useEffect(() => {
    const controller = new AbortController();
    const currentIds = new Set(widgets.map((w) => w.id));

    store.keys().forEach((id) => {
      if (!currentIds.has(id)) store.remove(id);
    });

    const targetsNeedingFetch = widgets.filter((w) => store.getSnapshot(w.id).status === "idle");
    fetchBatch(targetsNeedingFetch, controller.signal);

    return () => controller.abort();
  }, [widgetsKey]);

  const retryWidget = (id: string) => {
    const target = widgetsRef.current.find((w) => w.id === id);
    if (target) fetchBatch([target], new AbortController().signal);
  };

  return (
    <WidgetDataActionsContext.Provider value={{ retryWidget }}>
      {children}
    </WidgetDataActionsContext.Provider>
  );
}

export function useWidgetDataEntry(id: string): WidgetDataEntry & { retry: () => void } {
  const ctx = useContext(WidgetDataActionsContext);
  if (!ctx) throw new Error("useWidgetDataEntry must be used within a WidgetDataProvider");
  const subscribe = useCallback((listener: () => void) => store.subscribe(id)(listener), [id]);
  const getSnapshot = useCallback(() => store.getSnapshot(id), [id]);
  const entry = useSyncExternalStore(subscribe, getSnapshot);
  return { ...entry, retry: () => ctx.retryWidget(id) };
}
