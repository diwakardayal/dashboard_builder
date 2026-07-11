import React, { useCallback } from "react";
import GridLayout from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { useAllWidgetIds, useLayout, useDashboardStore, useWidgetRefs } from "../store/dashboardStore";
import { listWidgetDefinitions } from "../widgets/registry";
import { WidgetContainer } from "./WidgetContainer";
import { WidgetDataProvider } from "./WidgetDataProvider";
import { LayoutItem } from "../types";

const COLS = 12;
const ROW_HEIGHT = 60;

export function DashboardShell() {
  const widgetIds = useAllWidgetIds();
  const widgetRefs = useWidgetRefs();
  const layout = useLayout();
  const setLayout = useDashboardStore((s) => s.setLayout);
  const addWidget = useDashboardStore((s) => s.addWidget);

  const handleLayoutChangeStop = useCallback(
    (newLayout: LayoutItem[]) => setLayout(newLayout),
    [setLayout]
  );

  return (
    <div className="dashboard-shell">
      <div className="dashboard-toolbar">
        <span>Add widget:</span>
        {listWidgetDefinitions().map((def) => (
          <button key={def.type} onClick={() => addWidget(def.type as any)}>
            + {def.label}
          </button>
        ))}
      </div>

      {widgetIds.length === 0 ? (
        <div className="dashboard-empty">No widgets yet — add one above to get started.</div>
      ) : (
        <WidgetDataProvider widgets={widgetRefs}>
          <GridLayout
            className="layout"
            layout={layout}
            cols={COLS}
            rowHeight={ROW_HEIGHT}
            width={1200}
            onDragStop={handleLayoutChangeStop}
            onResizeStop={handleLayoutChangeStop}
            draggableHandle=".widget-header"
            draggableCancel=".widget-header-actions"
          >
            {widgetIds.map((id) => (
              <div key={id}>
                <WidgetContainer id={id} />
              </div>
            ))}
          </GridLayout>
        </WidgetDataProvider>
      )}
    </div>
  );
}
