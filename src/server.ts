import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import type { Request, Response } from "express";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "SkillGuard API running", mode: "TypeScript" });
});

const PORT = process.env.PORT || 5050;

app.listen(PORT, () => {
  console.log(`SkillGuard server running on port ${PORT}`);
});