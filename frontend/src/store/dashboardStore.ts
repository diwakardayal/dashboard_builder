import { create } from "zustand";
import { persist } from "zustand/middleware";
import { WidgetInstance, LayoutItem, WidgetType } from "../types";
import { getWidgetDefinition } from "../widgets/registry";

interface DashboardState {
  widgets: Record<string, WidgetInstance>;
  layout: LayoutItem[];

  addWidget: (type: WidgetType) => void;
  removeWidget: (id: string) => void;
  updateWidgetConfig: (id: string, config: Record<string, unknown>) => void;
  setLayout: (layout: LayoutItem[]) => void;
}

function makeId() {
  return `w_${Math.random().toString(36).slice(2, 10)}`;
}

function nextY(layout: LayoutItem[]): number {
  if (layout.length === 0) return 0;
  return Math.max(...layout.map((item) => item.y + item.h));
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      widgets: {},
      layout: [],

      addWidget: (type) => {
        const def = getWidgetDefinition(type);
        if (!def) {
          console.warn(`No widget registered for type "${type}"`);
          return;
        }
        const id = makeId();
        const instance: WidgetInstance = {
          id,
          type,
          title: def.label,
          config: { ...def.defaultConfig },
        };
        const layoutItem: LayoutItem = {
          i: id,
          x: 0,
          y: nextY(get().layout),
          w: def.defaultLayout.w,
          h: def.defaultLayout.h,
          minW: def.defaultLayout.minW,
          minH: def.defaultLayout.minH,
        };
        set({
          widgets: { ...get().widgets, [id]: instance },
          layout: [...get().layout, layoutItem],
        });
      },

      removeWidget: (id) => {
        const widgets = { ...get().widgets };
        delete widgets[id];
        set({
          widgets,
          layout: get().layout.filter((l) => l.i !== id),
        });
      },

      updateWidgetConfig: (id, config) => {
        const existing = get().widgets[id];
        if (!existing) return;
        set({
          widgets: {
            ...get().widgets,
            [id]: { ...existing, config: { ...existing.config, ...config } },
          },
        });
      },

      setLayout: (layout) => set({ layout }),
    }),
    {
      name: "dashboard-poc-storage",
      partialize: (state) => ({ widgets: state.widgets, layout: state.layout }),
      merge: (persisted, current) => {
        const state = { ...current, ...(persisted as Partial<DashboardState>) };
        state.layout = (state.layout ?? []).map((item, index) => ({
          ...item,
          x: typeof item.x === "number" ? item.x : 0,
          y: typeof item.y === "number" ? item.y : index,
          w: typeof item.w === "number" ? item.w : 4,
          h: typeof item.h === "number" ? item.h : 3,
        }));
        return state;
      },
    }
  )
);

export const useWidgetInstance = (id: string) =>
  useDashboardStore((s) => s.widgets[id]);

export const useLayout = () => useDashboardStore((s) => s.layout);

export const useAllWidgetIds = () =>
  useDashboardStore((s) => Object.keys(s.widgets));

export const useWidgetRefs = () =>
  useDashboardStore((s) => Object.values(s.widgets).map((w) => ({ id: w.id, type: w.type })));
