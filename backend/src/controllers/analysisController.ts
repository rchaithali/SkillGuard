import type { Request, Response } from "express";
import { analyzeResumeSkills } from "../services/resumeAnalyzer.js";
import { matchSkillsToRole } from "../services/roleMatcher.js";
import { calculateRoleFitScore } from "../services/scoringEngine.js";

// Handles POST /api/analyze
export const analyzeCandidate = (req: Request, res: Response) => {
  const { resumeText, targetRole } = req.body;

  // Resume text is required because SkillGuard analyzes candidate evidence from it
  if (!resumeText || typeof resumeText !== "string") {
    return res.status(400).json({
      message: "Resume text is required and must be a string"
    });
  }

  // Target role is required because SkillGuard gives role-specific readiness
  if (!targetRole || typeof targetRole !== "string") {
    return res.status(400).json({
      message: "Target role is required and must be a string"
    });
  }

  const detectedSkills = analyzeResumeSkills(resumeText);
  const roleMatch = matchSkillsToRole(detectedSkills, targetRole);
  const roleFitScore = calculateRoleFitScore(roleMatch);

  return res.status(200).json({
    message: "SkillGuard resume analysis completed",
    targetRole,
    detectedSkills,
    roleMatch,
    roleFitScore
  });
};