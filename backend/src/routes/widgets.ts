import { Router, Request, Response } from "express";
import { randomUUID } from "crypto";
import {
  WidgetTypeSchema,
  SchemaByType,
  WidgetResponse,
  WidgetType,
} from "../types/schemas";
import { generateWithLatency } from "../data/mockEngine";

export const widgetsRouter = Router();

async function buildWidgetResponse(type: WidgetType): Promise<WidgetResponse> {
  const rawData = await generateWithLatency(type);

  const parsed = SchemaByType[type].safeParse(rawData);
  if (!parsed.success) {
    throw new Error(`Generated data failed schema validation for "${type}"`);
  }

  return {
    widgetType: type,
    requestId: randomUUID(),
    generatedAt: new Date().toISOString(),
    data: parsed.data,
  };
}

widgetsRouter.get("/:type", async (req: Request, res: Response) => {
  const parseType = WidgetTypeSchema.safeParse(req.params.type);
  if (!parseType.success) {
    return res.status(400).json({
      error: "Unknown widget type",
      allowed: WidgetTypeSchema.options,
    });
  }

  try {
    const payload = await buildWidgetResponse(parseType.data);
    res.json(payload);
  } catch (err) {
    res.status(500).json({ error: "Failed to generate widget data" });
  }
});

widgetsRouter.post("/batch", async (req: Request, res: Response) => {
  const bodySchema = WidgetTypeSchema.array().min(1).max(50);
  const parsed = bodySchema.safeParse(req.body?.types);
  if (!parsed.success) {
    return res.status(400).json({ error: "body.types must be a non-empty array of widget types" });
  }

  const results = await Promise.allSettled(parsed.data.map(buildWidgetResponse));

  const payload = results.map((r, i) =>
    r.status === "fulfilled"
      ? { ok: true, widgetType: parsed.data[i], result: r.value }
      : { ok: false, widgetType: parsed.data[i], error: r.reason?.message ?? "unknown error" }
  );

  res.json({ results: payload });
});
