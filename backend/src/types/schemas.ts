import { z } from "zod";

export const CategoricalDatumSchema = z.object({
  label: z.string(),
  value: z.number(),
});
export const CategoricalDataSchema = z.array(CategoricalDatumSchema);
export type CategoricalData = z.infer<typeof CategoricalDataSchema>;

export const TemporalDatumSchema = z.object({
  timestamp: z.string().datetime({ offset: true }),
  value: z.number(),
});
export const TemporalDataSchema = z.object({
  series: z.array(TemporalDatumSchema),
  trend: z.enum(["up", "down", "flat"]),
});
export type TemporalData = z.infer<typeof TemporalDataSchema>;

export interface HierarchicalNode {
  name: string;
  value?: number;
  children?: HierarchicalNode[];
}
export const HierarchicalNodeSchema: z.ZodType<HierarchicalNode> = z.lazy(() =>
  z.object({
    name: z.string(),
    value: z.number().optional(),
    children: z.array(HierarchicalNodeSchema).optional(),
  })
);
export const HierarchicalDataSchema = HierarchicalNodeSchema;
export type HierarchicalData = HierarchicalNode;

export const RelationalDatumSchema = z.object({
  x: z.number(),
  y: z.number(),
  group: z.string().optional(),
});
export const RelationalDataSchema = z.array(RelationalDatumSchema);
export type RelationalData = z.infer<typeof RelationalDataSchema>;

export const WidgetTypeSchema = z.enum([
  "categorical",
  "temporal",
  "hierarchical",
  "relational",
]);
export type WidgetType = z.infer<typeof WidgetTypeSchema>;

export const SchemaByType: Record<WidgetType, z.ZodTypeAny> = {
  categorical: CategoricalDataSchema,
  temporal: TemporalDataSchema,
  hierarchical: HierarchicalDataSchema,
  relational: RelationalDataSchema,
};

export const WidgetResponseSchema = z.object({
  widgetType: WidgetTypeSchema,
  requestId: z.string(),
  generatedAt: z.string().datetime({ offset: true }),
  data: z.unknown(),
});
export type WidgetResponse = z.infer<typeof WidgetResponseSchema>;
