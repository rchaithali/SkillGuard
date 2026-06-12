export type ScoreCardData = {
  label: string;
  score: number;
  maxScore: number;
  percentage: number;
  status: "STRONG" | "MODERATE" | "LOW";
  reason: string;
};

export type FrontendReport = {
  targetRole: string;
  finalScore: number;
  maxScore: number;
  recommendation: string;
  recommendationLabel: string;
  readinessLabel: string;
  scoreCards: ScoreCardData[];
  topStrengths: string[];
  mainConcerns: string[];
  proofSignals: {
    githubVerified: boolean;
    githubUsername: string | null;
    hasRecentGitHubActivity: boolean;
    hasBackendGitHubSignals: boolean;
    hasFrontendGitHubSignals: boolean;
    detectedGitHubStack: string[];
    strongRepositories: string[];
  };
};

export type AnalysisResponse = {
  message: string;
  targetRole: string;
  scoringSource: string;
  prioritizeFundamentals: boolean;
  resolvedGitHubUsername: string | null;
  resolvedLeetCodeUsername: string | null;
  roleFitScore?: {
    matchedSkills?: string[];
    missingSkills?: string[];
  };
  frontendReport: FrontendReport;
};

type AnalyzeResumePdfInput = {
  resumeFile: File;
  targetRole: string;
  jobDescription: string;
};

const API_BASE_URL = "http://localhost:5050";

// Sends resume PDF + role inputs to the backend analysis endpoint.
export const analyzeResumePdf = async ({
  resumeFile,
  targetRole,
  jobDescription
}: AnalyzeResumePdfInput): Promise<AnalysisResponse> => {
  const formData = new FormData();

  formData.append("resumeFile", resumeFile);
  formData.append("targetRole", targetRole);
  formData.append("jobDescription", jobDescription);
  formData.append("viewerType", "RECRUITER");

  const response = await fetch(`${API_BASE_URL}/api/analyze/pdf`, {
    method: "POST",
    body: formData
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Resume analysis failed.");
  }

  return data;
};