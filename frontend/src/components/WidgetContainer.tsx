import React, { memo, useState } from "react";
import { useWidgetInstance, useDashboardStore } from "../store/dashboardStore";
import { getWidgetDefinition } from "../widgets/registry";
import { useWidgetDataEntry } from "./WidgetDataProvider";
import { WidgetErrorBoundary } from "./WidgetErrorBoundary";
import { ConfigPanel } from "./ConfigPanel";

interface Props {
  id: string;
}

function stopDragPropagation(e: React.SyntheticEvent) {
  e.stopPropagation();
}

function WidgetContainerImpl({ id }: Props) {
  const instance = useWidgetInstance(id);
  const removeWidget = useDashboardStore((s) => s.removeWidget);
  const updateWidgetConfig = useDashboardStore((s) => s.updateWidgetConfig);
  const [configOpen, setConfigOpen] = useState(false);

  const { status, data, error, retry } = useWidgetDataEntry(id);

  if (!instance) return null;

  const def = getWidgetDefinition(instance.type);

  if (!def) {
    return (
      <div className="widget-frame">
        <div className="widget-error">
          Unknown widget type "{instance.type}" — was it unregistered?
        </div>
      </div>
    );
  }

  const Component = def.component;

  return (
    <div className="widget-frame">
      <div className="widget-header">
        <span>{instance.title}</span>
        <div
          className="widget-header-actions"
          onMouseDown={stopDragPropagation}
          onTouchStart={stopDragPropagation}
        >
          <button
            onClick={() => setConfigOpen((v) => !v)}
            aria-label="Configure widget"
            aria-pressed={configOpen}
          >
            ⚙
          </button>
          <button onClick={() => removeWidget(id)} aria-label="Remove widget">
            ✕
          </button>
        </div>
      </div>

      {configOpen && (
        <ConfigPanel
          fields={def.configFields ?? []}
          config={instance.config}
          onChange={(patch) => updateWidgetConfig(id, patch)}
        />
      )}

      <div className="widget-body">
        {(status === "idle" || status === "loading") && <div className="widget-loading">Loading…</div>}
        {status === "error" && (
          <div className="widget-error">
            Failed to load data: {error}
            <button onClick={retry}>Retry</button>
          </div>
        )}
        {status === "success" && (
          <WidgetErrorBoundary widgetTitle={instance.title}>
            <Component data={data} config={instance.config} />
          </WidgetErrorBoundary>
        )}
      </div>
    </div>
  );
}

export const WidgetContainer = memo(WidgetContainerImpl);
