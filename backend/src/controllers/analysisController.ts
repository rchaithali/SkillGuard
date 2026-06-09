import type { Request, Response } from "express";
import { analyzeResumeSkills } from "../services/resumeAnalyzer.js";
import { fetchGitHubSignals } from "../services/githubService.js";
import { matchSkillsToRole } from "../services/roleMatcher.js";
import {
  applyGitHubProjectProofBoost,
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
  githubUsername?: string;
};

type JobInput = {
  targetRole: string;
  jobDescription: string;
};

// Shared helper: analyzes one candidate against one role/JD
const runSingleAnalysis = async (
  resumeText: string,
  targetRole: string,
  jobDescription?: string,
  githubUsername?: string
) => {
  const detectedSkills = analyzeResumeSkills(resumeText);

  const jdDetectedSkills = jobDescription
    ? analyzeResumeSkills(jobDescription)
    : [];

  const githubSignals = githubUsername
    ? await fetchGitHubSignals(githubUsername)
    : null;

  // This is the general/default role-map comparison.
  // It is useful for explanation, but when JD exists, final role fit uses JD skills.
  const generalRoleMatch = matchSkillsToRole(detectedSkills, targetRole);

  const roleFitScore =
    jdDetectedSkills.length > 0
      ? calculateJdRoleFitScore(detectedSkills, jdDetectedSkills)
      : calculateRoleFitScore(generalRoleMatch);

const baseProjectDepthScore = calculateProjectDepthScore(detectedSkills);

const projectDepthScore = applyGitHubProjectProofBoost(
  baseProjectDepthScore,
  detectedSkills,
  githubSignals?.githubProjectSignals
);

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
    githubSignals,
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
export const analyzeCandidate = async (req: Request, res: Response) => {
  const {
    resumeText,
    targetRole,
    jobDescription,
    viewerType,
    githubUsername
  } = req.body;

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

  if (githubUsername && typeof githubUsername !== "string") {
    return res.status(400).json({
      message: "GitHub username must be a string when provided"
    });
  }

  const normalizedViewerType: ViewerType =
    viewerType === "CANDIDATE" ? "CANDIDATE" : "RECRUITER";

  const analysis = await runSingleAnalysis(
    resumeText,
    targetRole,
    jobDescription,
    githubUsername
  );

  const baseResponse = {
    message: "SkillGuard resume analysis completed",
    viewerType: normalizedViewerType,
    targetRole,
    scoringSource: analysis.scoringSource,

    detectedSkills: analysis.detectedSkills,
    jdDetectedSkills: analysis.jdDetectedSkills,
    githubSignals: analysis.githubSignals,

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
export const analyzeBatchCandidates = async (req: Request, res: Response) => {
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

  const roleGroups = await Promise.all(
    jobs.map(async (job: JobInput) => {
      const analyzedCandidates = await Promise.all(
        candidates.map(async (candidate: CandidateInput) => {
          const analysis = await runSingleAnalysis(
            candidate.resumeText,
            job.targetRole,
            job.jobDescription,
            candidate.githubUsername
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
            githubSignals: analysis.githubSignals,
            breakdown: analysis.finalScore.breakdown
          };
        })
      );

      const rankedCandidates = analyzedCandidates
        .sort((a, b) => b.finalScore - a.finalScore)
        .map((candidate, index) => ({
          rank: index + 1,
          ...candidate
        }));

      return {
        targetRole: job.targetRole,
        rankedCandidates
      };
    })
  );

  return res.status(200).json({
    message: "SkillGuard batch recruiter analysis completed",
    mode: "MULTI_ROLE_CANDIDATE_RANKING",
    roleGroups
  });
};