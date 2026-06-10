import express from "express";
import { uploadResumePdf } from "../middleware/uploadMiddleware.js";
import {
  analyzeBatchCandidates,
  analyzeCandidate,
  analyzeCandidateFromPdf
} from "../controllers/analysisController.js";

const router = express.Router();

// POST /api/analyze
router.post("/analyze", analyzeCandidate);
router.post(
  "/analyze/pdf",
  uploadResumePdf.single("resumeFile"),
  analyzeCandidateFromPdf
);

// POST /api/analyze/batch
router.post("/analyze/batch", analyzeBatchCandidates);

export default router;