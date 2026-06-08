import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import type { Request, Response } from "express";
import analysisRoutes from "./routes/analysisRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Root route to confirm API is reachable
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Welcome to SkillGuard API",
    version: "v1.0.0",
    health: "/health"
  });
});

// Health route to check backend status
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "SkillGuard API running",
    mode: "TypeScript"
  });
});

// Analysis routes
app.use("/api", analysisRoutes);

const PORT = process.env.PORT || 5050;

app.listen(PORT, () => {
  console.log(`SkillGuard server running on port ${PORT}`);
  console.log(`Local URL: http://localhost:${PORT}`);
});