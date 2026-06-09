import express from "express";
import {
  analyzeBatchCandidates,
  analyzeCandidate
} from "../controllers/analysisController.js";

const router = express.Router();

// POST /api/analyze
router.post("/analyze", analyzeCandidate);

// POST /api/analyze/batch
router.post("/analyze/batch", analyzeBatchCandidates);

export default router;