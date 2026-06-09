import type { Request, Response } from "express";
import { analyzeResumeSkills } from "../services/resumeAnalyzer.js";
import { matchSkillsToRole } from "../services/roleMatcher.js";
import {
  calculateExperienceScore,
  calculateFinalScore,
  calculateFundamentalsScore,
  calculateJdRoleFitScore,
  calculateProjectDepthScore,
  calculateRoleFitScore,
  generateImprovementInsights
} from "../services/scoringEngine.js";

type ViewerType = "RECRUITER" | "CANDIDATE";

// Handles POST /api/analyze
export const analyzeCandidate = (req: Request, res: Response) => {
  const { resumeText, targetRole, jobDescription, viewerType } = req.body;

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

  // Viewer type is optional. Default is recruiter because SkillGuard is mainly a hiring intelligence system.
  const normalizedViewerType: ViewerType =
    viewerType === "CANDIDATE" ? "CANDIDATE" : "RECRUITER";

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

  // Fundamentals score checks DSA/CS fundamentals signals
  const fundamentalsScore = calculateFundamentalsScore(detectedSkills);

  // Final score combines all four scoring components
  const finalScore = calculateFinalScore(
    roleFitScore,
    projectDepthScore,
    experienceScore,
    fundamentalsScore
  );

  // Candidate-facing improvement insights
  const improvementInsights = generateImprovementInsights(
    roleFitScore,
    projectDepthScore,
    experienceScore,
    fundamentalsScore
  );

  const baseResponse = {
    message: "SkillGuard resume analysis completed",
    viewerType: normalizedViewerType,
    targetRole,
    scoringSource: jdDetectedSkills.length > 0 ? "JOB_DESCRIPTION" : "ROLE_MAP",
    detectedSkills,
    jdDetectedSkills,
    roleMatch,
    roleFitScore,
    projectDepthScore,
    experienceScore,
    fundamentalsScore,
    finalScore
  };

  // Candidate mode: show improvement/coaching insights
  if (normalizedViewerType === "CANDIDATE") {
    return res.status(200).json({
      ...baseResponse,
      improvementInsights
    });
  }

  // Recruiter mode: do not expose candidate-coaching suggestions by default
  return res.status(200).json({
    ...baseResponse,
    candidateFeedbackAvailable: true
  });
};