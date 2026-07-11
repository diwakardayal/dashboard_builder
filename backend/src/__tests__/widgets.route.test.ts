import request from "supertest";
import { createApp } from "../server";

const app = createApp();

describe("GET /api/widgets/:type", () => {
  it("returns schema-valid data for a known type", async () => {
    const res = await request(app).get("/api/widgets/categorical");
    expect(res.status).toBe(200);
    expect(res.body.widgetType).toBe("categorical");
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("400s for an unknown widget type", async () => {
    const res = await request(app).get("/api/widgets/pie3d");
    expect(res.status).toBe(400);
  });
});

describe("POST /api/widgets/batch", () => {
  it("resolves multiple widget types concurrently", async () => {
    const res = await request(app)
      .post("/api/widgets/batch")
      .send({ types: ["categorical", "temporal", "hierarchical", "relational"] });
    expect(res.status).toBe(200);
    expect(res.body.results).toHaveLength(4);
    expect(res.body.results.every((r: any) => r.ok)).toBe(true);
  });

  it("400s when types is missing", async () => {
    const res = await request(app).post("/api/widgets/batch").send({});
    expect(res.status).toBe(400);
  });
});
