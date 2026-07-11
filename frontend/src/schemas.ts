import { z } from "zod";

export const CategoricalDataSchema = z.array(
  z.object({ label: z.string(), value: z.number() })
);

export const TemporalDataSchema = z.object({
  series: z.array(z.object({ timestamp: z.string().datetime({ offset: true }), value: z.number() })),
  trend: z.enum(["up", "down", "flat"]),
});

export interface HierarchicalNode {
  name: string;
  value?: number;
  children?: HierarchicalNode[];
}
export const HierarchicalDataSchema: z.ZodType<HierarchicalNode> = z.lazy(() =>
  z.object({
    name: z.string(),
    value: z.number().optional(),
    children: z.array(HierarchicalDataSchema).optional(),
  })
);

export const RelationalDataSchema = z.array(
  z.object({ x: z.number(), y: z.number(), group: z.string().optional() })
);

export const WidgetTypeSchema = z.enum(["categorical", "temporal", "hierarchical", "relational"]);
export type WidgetType = z.infer<typeof WidgetTypeSchema>;

export const SchemaByType: Record<WidgetType, z.ZodTypeAny> = {
  categorical: CategoricalDataSchema,
  temporal: TemporalDataSchema,
  hierarchical: HierarchicalDataSchema,
  relational: RelationalDataSchema,
};

export const WidgetEnvelopeSchema = z.object({
  widgetType: WidgetTypeSchema,
  requestId: z.string(),
  generatedAt: z.string(),
  data: z.unknown(),
});

export function parseWidgetPayload(raw: unknown): { widgetType: WidgetType; data: unknown } {
  const envelope = WidgetEnvelopeSchema.parse(raw);
  const schema = SchemaByType[envelope.widgetType];
  const result = schema.safeParse(envelope.data);
  if (!result.success) {
    throw new Error(
      `Payload for "${envelope.widgetType}" failed validation: ${result.error.issues[0]?.message ?? "unknown shape mismatch"}`
    );
  }
  return { widgetType: envelope.widgetType, data: result.data };
}
