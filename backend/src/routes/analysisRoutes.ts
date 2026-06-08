import express from "express";
import { analyzeCandidate } from "../controllers/analysisController.js";

const router = express.Router();

// POST /api/analyze
router.post("/analyze", analyzeCandidate);

export default router;