import type { Request, Response } from "express";
import { analyzeResumeSkills } from "../services/resumeAnalyzer.js";

// Controller function for handling SkillGuard analysis requests
export const analyzeCandidate = (req: Request, res: Response) => {
  const { resumeText, targetRole } = req.body;

  // Basic validation: resume text is required for V1 analysis
  if (!resumeText || typeof resumeText !== "string") {
    return res.status(400).json({
      message: "Resume text is required and must be a string"
    });
  }

  const detectedSkills = analyzeResumeSkills(resumeText);

  return res.status(200).json({
    message: "SkillGuard resume analysis completed",
    targetRole: targetRole || "Not provided",
    detectedSkills
  });
};