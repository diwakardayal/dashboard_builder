import express from "express";
import cors from "cors";
import { widgetsRouter } from "./routes/widgets";

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.use("/api/widgets", widgetsRouter);

  app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  });

  return app;
}

if (require.main === module) {
  const app = createApp();
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => console.log(`Dashboard API listening on :${PORT}`));
}
