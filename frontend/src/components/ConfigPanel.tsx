import React from "react";
import { ConfigField } from "../widgets/registry";

interface Props {
  fields: ConfigField[];
  config: Record<string, unknown>;
  onChange: (patch: Record<string, unknown>) => void;
}

export function ConfigPanel({ fields, config, onChange }: Props) {
  if (fields.length === 0) {
    return <div className="config-panel-empty">No configurable options for this widget.</div>;
  }

  return (
    <div className="config-panel">
      {fields.map((field) => {
        const value = config[field.key] ?? field.default;
        return (
          <label key={field.key} className="config-field">
            <span>{field.label}</span>
            {field.type === "color" && (
              <input
                type="color"
                value={value as string}
                onChange={(e) => onChange({ [field.key]: e.target.value })}
              />
            )}
            {field.type === "boolean" && (
              <input
                type="checkbox"
                checked={Boolean(value)}
                onChange={(e) => onChange({ [field.key]: e.target.checked })}
              />
            )}
            {field.type === "number" && (
              <input
                type="number"
                value={value as number}
                min={field.min}
                max={field.max}
                step={field.step}
                onChange={(e) => onChange({ [field.key]: Number(e.target.value) })}
              />
            )}
          </label>
        );
      })}
    </div>
  );
}
