import type { WidgetType } from "./schemas";
export type { WidgetType } from "./schemas";

export interface WidgetInstance {
  id: string;
  type: WidgetType;
  title: string;
  config: Record<string, unknown>;
}

export interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
}

export interface WidgetDataEnvelope<T = unknown> {
  widgetType: WidgetType;
  requestId: string;
  generatedAt: string;
  data: T;
}
