import type { Request, Response } from "express";
import { analyzeResumeSkills } from "../services/resumeAnalyzer.js";
import { matchSkillsToRole } from "../services/roleMatcher.js";
import {
  calculateExperienceScore,
  calculateFundamentalsScore,
  calculateJdRoleFitScore,
  calculateProjectDepthScore,
  calculateRoleFitScore
} from "../services/scoringEngine.js";

// Handles POST /api/analyze
export const analyzeCandidate = (req: Request, res: Response) => {
  const { resumeText, targetRole, jobDescription } = req.body;

  // Resume text is required because SkillGuard analyzes candidate evidence from it
  if (!resumeText || typeof resumeText !== "string") {
    return res.status(400).json({
      message: "Resume text is required and must be a string"
    });
  }

  // Target role is still required as fallback when JD is not provided
  if (!targetRole || typeof targetRole !== "string") {
    return res.status(400).json({
      message: "Target role is required and must be a string"
    });
  }

  // Job description is optional, but if provided, it must be text
  if (jobDescription && typeof jobDescription !== "string") {
    return res.status(400).json({
      message: "Job description must be a string when provided"
    });
  }

  // Candidate skills detected from resume
  const detectedSkills = analyzeResumeSkills(resumeText);

  // JD skills detected from job description, if provided
  const jdDetectedSkills = jobDescription
    ? analyzeResumeSkills(jobDescription)
    : [];

  // Default role-map comparison, used as fallback and supporting explanation
  const roleMatch = matchSkillsToRole(detectedSkills, targetRole);

  // If JD has recognizable skills, use JD-based role fit.
  // Otherwise, fall back to default role-map scoring.
  const roleFitScore =
    jdDetectedSkills.length > 0
      ? calculateJdRoleFitScore(detectedSkills, jdDetectedSkills)
      : calculateRoleFitScore(roleMatch);

  // Project depth checks USED and STRONG project/work-backed skills
  const projectDepthScore = calculateProjectDepthScore(detectedSkills);

  // Experience score checks level fit, relevant experience evidence, and practical proof
  const experienceScore = calculateExperienceScore(
    resumeText,
    targetRole,
    jobDescription,
    detectedSkills,
    jdDetectedSkills
  );
  const fundamentalsScore = calculateFundamentalsScore(detectedSkills);

  return res.status(200).json({
    message: "SkillGuard resume analysis completed",
    targetRole,
    scoringSource: jdDetectedSkills.length > 0 ? "JOB_DESCRIPTION" : "ROLE_MAP",
    detectedSkills,
    jdDetectedSkills,
    roleMatch,
    roleFitScore,
    projectDepthScore,
    experienceScore,
    fundamentalsScore
  });
};