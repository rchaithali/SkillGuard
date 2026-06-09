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

type CandidateInput = {
  candidateName: string;
  resumeText: string;
};

type JobInput = {
  targetRole: string;
  jobDescription: string;
};

// Shared helper: analyzes one candidate against one role/JD
const runSingleAnalysis = (
  resumeText: string,
  targetRole: string,
  jobDescription?: string
) => {
  const detectedSkills = analyzeResumeSkills(resumeText);

  const jdDetectedSkills = jobDescription
    ? analyzeResumeSkills(jobDescription)
    : [];

  // This is the general/default role-map comparison.
  // It is useful for explanation, but when JD exists, final role fit uses JD skills.
  const generalRoleMatch = matchSkillsToRole(detectedSkills, targetRole);

  const roleFitScore =
    jdDetectedSkills.length > 0
      ? calculateJdRoleFitScore(detectedSkills, jdDetectedSkills)
      : calculateRoleFitScore(generalRoleMatch);

  const projectDepthScore = calculateProjectDepthScore(detectedSkills);

  const experienceScore = calculateExperienceScore(
    resumeText,
    targetRole,
    jobDescription,
    detectedSkills,
    jdDetectedSkills
  );

  const fundamentalsScore = calculateFundamentalsScore(detectedSkills);

  const finalScore = calculateFinalScore(
    roleFitScore,
    projectDepthScore,
    experienceScore,
    fundamentalsScore
  );

  const improvementInsights = generateImprovementInsights(
    roleFitScore,
    projectDepthScore,
    experienceScore,
    fundamentalsScore
  );

  return {
    scoringSource: jdDetectedSkills.length > 0 ? "JOB_DESCRIPTION" : "ROLE_MAP",
    detectedSkills,
    jdDetectedSkills,
    generalRoleMatch,
    roleFitScore,
    projectDepthScore,
    experienceScore,
    fundamentalsScore,
    finalScore,
    improvementInsights
  };
};

// Handles POST /api/analyze
export const analyzeCandidate = (req: Request, res: Response) => {
  const { resumeText, targetRole, jobDescription, viewerType } = req.body;

  if (!resumeText || typeof resumeText !== "string") {
    return res.status(400).json({
      message: "Resume text is required and must be a string"
    });
  }

  if (!targetRole || typeof targetRole !== "string") {
    return res.status(400).json({
      message: "Target role is required and must be a string"
    });
  }

  if (jobDescription && typeof jobDescription !== "string") {
    return res.status(400).json({
      message: "Job description must be a string when provided"
    });
  }

  const normalizedViewerType: ViewerType =
    viewerType === "CANDIDATE" ? "CANDIDATE" : "RECRUITER";

  const analysis = runSingleAnalysis(resumeText, targetRole, jobDescription);

  const baseResponse = {
    message: "SkillGuard resume analysis completed",
    viewerType: normalizedViewerType,
    targetRole,
    scoringSource: analysis.scoringSource,

    detectedSkills: analysis.detectedSkills,
    jdDetectedSkills: analysis.jdDetectedSkills,

    // General role-map comparison, separate from active scoring when JD exists
    generalRoleMatchSource: "ROLE_MAP",
    generalRoleMatch: analysis.generalRoleMatch,

    roleFitScore: analysis.roleFitScore,
    projectDepthScore: analysis.projectDepthScore,
    experienceScore: analysis.experienceScore,
    fundamentalsScore: analysis.fundamentalsScore,
    finalScore: analysis.finalScore
  };

  if (normalizedViewerType === "CANDIDATE") {
    return res.status(200).json({
      ...baseResponse,
      improvementInsights: analysis.improvementInsights
    });
  }

  return res.status(200).json({
    ...baseResponse,
    candidateFeedbackAvailable: true
  });
};

// Handles POST /api/analyze/batch
export const analyzeBatchCandidates = (req: Request, res: Response) => {
  const { jobs, candidates } = req.body;

  if (!Array.isArray(jobs) || jobs.length === 0) {
    return res.status(400).json({
      message: "Jobs must be a non-empty array"
    });
  }

  if (!Array.isArray(candidates) || candidates.length === 0) {
    return res.status(400).json({
      message: "Candidates must be a non-empty array"
    });
  }

  const invalidJob = jobs.find(
    (job: JobInput) =>
      !job.targetRole ||
      typeof job.targetRole !== "string" ||
      !job.jobDescription ||
      typeof job.jobDescription !== "string"
  );

  if (invalidJob) {
    return res.status(400).json({
      message: "Each job must have targetRole and jobDescription as strings"
    });
  }

  const invalidCandidate = candidates.find(
    (candidate: CandidateInput) =>
      !candidate.candidateName ||
      typeof candidate.candidateName !== "string" ||
      !candidate.resumeText ||
      typeof candidate.resumeText !== "string"
  );

  if (invalidCandidate) {
    return res.status(400).json({
      message: "Each candidate must have candidateName and resumeText as strings"
    });
  }

  const roleGroups = jobs.map((job: JobInput) => {
    const rankedCandidates = candidates
      .map((candidate: CandidateInput) => {
        const analysis = runSingleAnalysis(
          candidate.resumeText,
          job.targetRole,
          job.jobDescription
        );

        return {
          candidateName: candidate.candidateName,
          targetRole: job.targetRole,
          scoringSource: analysis.scoringSource,
          finalScore: analysis.finalScore.finalScore,
          recommendation: analysis.finalScore.recommendation,
          matchedSkills:
            "matchedSkills" in analysis.roleFitScore
              ? analysis.roleFitScore.matchedSkills
              : [],
          missingSkills:
            "missingSkills" in analysis.roleFitScore
              ? analysis.roleFitScore.missingSkills
              : [],
          breakdown: analysis.finalScore.breakdown
        };
      })
      .sort((a, b) => b.finalScore - a.finalScore)
      .map((candidate, index) => ({
        rank: index + 1,
        ...candidate
      }));

    return {
      targetRole: job.targetRole,
      rankedCandidates
    };
  });

  return res.status(200).json({
    message: "SkillGuard batch recruiter analysis completed",
    mode: "MULTI_ROLE_CANDIDATE_RANKING",
    roleGroups
  });
};