import { ComponentType } from "react";
import { WidgetType } from "../types";

export interface WidgetComponentProps<T = unknown> {
  data: T;
  config: Record<string, unknown>;
}

export interface ConfigField {
  key: string;
  label: string;
  type: "color" | "boolean" | "number";
  default: unknown;
  min?: number;
  max?: number;
  step?: number;
}

export interface WidgetDefinition<T = unknown> {
  type: WidgetType | string;
  label: string;
  component: ComponentType<WidgetComponentProps<T>>;
  defaultConfig: Record<string, unknown>;
  defaultLayout: { w: number; h: number; minW?: number; minH?: number };
  configFields?: ConfigField[];
}

const registry = new Map<string, WidgetDefinition<any>>();

export function registerWidget<T>(def: WidgetDefinition<T>): void {
  if (registry.has(def.type)) {
    console.warn(`Widget type "${def.type}" is already registered — overwriting.`);
  }
  registry.set(def.type, def);
}

export function getWidgetDefinition(type: string): WidgetDefinition | undefined {
  return registry.get(type);
}

export function listWidgetDefinitions(): WidgetDefinition[] {
  return Array.from(registry.values());
}
