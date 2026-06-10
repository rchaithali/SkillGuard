import type {
  ExperienceScore,
  FinalScoreResult,
  FundamentalsScore,
  JdRoleFitScore,
  ProjectDepthScore,
  RoleFitScore
} from "./scoringEngine.js";

type ScoreStatus = "STRONG" | "MODERATE" | "LOW";

type FrontendScoreCard = {
  label: string;
  score: number;
  maxScore: number;
  percentage: number;
  status: ScoreStatus;
  reason: string;
};

type FrontendReportInput = {
  targetRole: string;
  roleFitScore: RoleFitScore | JdRoleFitScore;
  projectDepthScore: ProjectDepthScore;
  experienceScore: ExperienceScore;
  fundamentalsScore: FundamentalsScore;
  finalScore: FinalScoreResult;
  githubSignals?: {
    username: string;
    githubProjectSignals?: {
      hasPublicProjects: boolean;
      hasRecentActivity: boolean;
      hasBackendSignals: boolean;
      hasFrontendSignals: boolean;
      detectedGitHubStack: string[];
      strongRepositories: string[];
    };
  } | null;
};

const calculatePercentage = (score: number, maxScore: number): number => {
  if (maxScore === 0) return 0;
  return Math.round((score / maxScore) * 100);
};

const getScoreStatus = (percentage: number): ScoreStatus => {
  if (percentage >= 75) return "STRONG";
  if (percentage >= 45) return "MODERATE";
  return "LOW";
};

const formatRecommendationLabel = (
  recommendation: FinalScoreResult["recommendation"]
): string => {
  if (recommendation === "DIRECT_INTERVIEW") return "Direct Interview";
  if (recommendation === "PHONE_SCREEN") return "Phone Screen";
  if (recommendation === "ASSESSMENT") return "Assessment";
  return "Not Ready";
};

const getReadinessLabel = (finalScore: number): string => {
  if (finalScore >= 80) return "Strong Fit";
  if (finalScore >= 60) return "Moderate Fit";
  if (finalScore >= 40) return "Needs Assessment";
  return "Not Ready";
};

const buildScoreCard = (
  label: string,
  scoreObject: {
    score: number;
    maxScore: number;
    reason: string;
  }
): FrontendScoreCard => {
  const percentage = calculatePercentage(scoreObject.score, scoreObject.maxScore);

  return {
    label,
    score: scoreObject.score,
    maxScore: scoreObject.maxScore,
    percentage,
    status: getScoreStatus(percentage),
    reason: scoreObject.reason
  };
};

export const buildFrontendReport = (input: FrontendReportInput) => {
  const roleFitMissingSkills =
    "missingSkills" in input.roleFitScore ? input.roleFitScore.missingSkills : [];

  const roleFitMatchedSkills =
    "matchedSkills" in input.roleFitScore ? input.roleFitScore.matchedSkills : [];

  const githubProjectSignals = input.githubSignals?.githubProjectSignals || null;

  const scoreCards = [
    buildScoreCard("Role Fit", input.roleFitScore),
    buildScoreCard("Project Depth", input.projectDepthScore),
    buildScoreCard("Experience", input.experienceScore),
    buildScoreCard("Fundamentals", input.fundamentalsScore)
  ];

  const mainConcerns = roleFitMissingSkills.slice(0, 5);

  const topStrengths: string[] = [];

  if (input.projectDepthScore.score >= input.projectDepthScore.maxScore * 0.75) {
    topStrengths.push("Strong project/work-backed skill evidence");
  }

  if (input.experienceScore.score >= input.experienceScore.maxScore * 0.75) {
    topStrengths.push("Experience level appears aligned with the role");
  }

  if (githubProjectSignals?.strongRepositories.length) {
    topStrengths.push("GitHub repositories support resume project claims");
  }

  if (roleFitMatchedSkills.length > 0) {
    topStrengths.push(
      `Matches key role skill(s): ${roleFitMatchedSkills.slice(0, 5).join(", ")}`
    );
  }

  return {
    targetRole: input.targetRole,
    finalScore: input.finalScore.finalScore,
    maxScore: input.finalScore.maxScore,
    recommendation: input.finalScore.recommendation,
    recommendationLabel: formatRecommendationLabel(
      input.finalScore.recommendation
    ),
    readinessLabel: getReadinessLabel(input.finalScore.finalScore),
    scoreCards,
    topStrengths,
    mainConcerns,
    proofSignals: {
      githubVerified: Boolean(input.githubSignals),
      githubUsername: input.githubSignals?.username || null,
      hasRecentGitHubActivity:
        githubProjectSignals?.hasRecentActivity || false,
      hasBackendGitHubSignals:
        githubProjectSignals?.hasBackendSignals || false,
      hasFrontendGitHubSignals:
        githubProjectSignals?.hasFrontendSignals || false,
      detectedGitHubStack: githubProjectSignals?.detectedGitHubStack || [],
      strongRepositories: githubProjectSignals?.strongRepositories || []
    }
  };
};