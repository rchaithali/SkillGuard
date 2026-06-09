import type { DetectedSkill } from "./resumeAnalyzer.js";
import type { RoleMatchResult } from "./roleMatcher.js";

export type RoleFitScore = {
  score: number;
  maxScore: number;
  matchedSkillsCount: number;
  totalRequiredSkills: number;
  reason: string;
};

export type JdRoleFitScore = {
  score: number;
  maxScore: number;
  matchedSkillsCount: number;
  totalRequiredSkills: number;
  matchedSkills: string[];
  missingSkills: string[];
  additionalCandidateSkills: string[];
  reason: string;
};

export type ProjectDepthScore = {
  score: number;
  maxScore: number;
  usedSkills: string[];
  strongSkills: string[];
  reason: string;
};

export type ExperienceLevel =
  | "FRESHER"
  | "JUNIOR"
  | "MID_LEVEL"
  | "SENIOR"
  | "LEAD"
  | "UNKNOWN";

export type ExperienceScore = {
  score: number;
  maxScore: number;
  expectedLevel: ExperienceLevel;
  detectedYears: number;
  detectedMonths: number;
  levelFitScore: number;
  relevantEvidenceScore: number;
  practicalProofScore: number;
  detectedRelevantSignals: string[];
  detectedPracticalSignals: string[];
  reason: string;
};

export type FundamentalsScore = {
  score: number;
  maxScore: number;
  detectedFundamentals: string[];
  detectedCount: number;
  reason: string;
};

export type FinalRecommendation =
  | "DIRECT_INTERVIEW"
  | "PHONE_SCREEN"
  | "ASSESSMENT"
  | "NOT_READY";

export type FinalScoreResult = {
  finalScore: number;
  maxScore: number;
  recommendation: FinalRecommendation;
  breakdown: {
    roleFit: number;
    projectDepth: number;
    experience: number;
    fundamentals: number;
  };
  reason: string;
};

export type ImprovementInsights = {
  strengths: string[];
  recommendations: string[];
};

// Calculates Role Fit score according to SCORING_LOGIC.txt
export const calculateRoleFitScore = (
  roleMatch: RoleMatchResult
): RoleFitScore => {
  const maxScore = 40;

  const matchedSkillsCount =
    roleMatch.matchedCoreSkills.length + roleMatch.matchedSecondarySkills.length;

  const totalRequiredSkills =
    roleMatch.totalCoreSkills + roleMatch.totalSecondarySkills;

  if (totalRequiredSkills === 0) {
    return {
      score: 0,
      maxScore,
      matchedSkillsCount: 0,
      totalRequiredSkills: 0,
      reason:
        "No required skills found for this role, so role fit could not be calculated."
    };
  }

  const score = Math.round((matchedSkillsCount / totalRequiredSkills) * maxScore);

  return {
    score,
    maxScore,
    matchedSkillsCount,
    totalRequiredSkills,
    reason: `Matched ${matchedSkillsCount}/${totalRequiredSkills} required skills using the ${roleMatch.normalizedRole} role map.`
  };
};

// Calculates Role Fit score using JD skills when job description is provided
export const calculateJdRoleFitScore = (
  detectedSkills: DetectedSkill[],
  jdDetectedSkills: DetectedSkill[]
): JdRoleFitScore => {
  const maxScore = 40;

  const candidateSkillNames = detectedSkills.map((skill) => skill.name);
  const jdRequiredSkillNames = jdDetectedSkills.map((skill) => skill.name);

  const matchedSkills = jdRequiredSkillNames.filter((skill) =>
    candidateSkillNames.includes(skill)
  );

  const missingSkills = jdRequiredSkillNames.filter(
    (skill) => !candidateSkillNames.includes(skill)
  );

  const additionalCandidateSkills = candidateSkillNames.filter(
    (skill) => !jdRequiredSkillNames.includes(skill)
  );

  const totalRequiredSkills = jdRequiredSkillNames.length;
  const matchedSkillsCount = matchedSkills.length;

  if (totalRequiredSkills === 0) {
    return {
      score: 0,
      maxScore,
      matchedSkillsCount: 0,
      totalRequiredSkills: 0,
      matchedSkills: [],
      missingSkills: [],
      additionalCandidateSkills,
      reason:
        "No recognizable required skills were detected from the job description."
    };
  }

  const score = Math.round((matchedSkillsCount / totalRequiredSkills) * maxScore);

  return {
    score,
    maxScore,
    matchedSkillsCount,
    totalRequiredSkills,
    matchedSkills,
    missingSkills,
    additionalCandidateSkills,
    reason: `Matched ${matchedSkillsCount}/${totalRequiredSkills} skills required by the job description.`
  };
};

// Calculates Project Depth score based on USED and STRONG skill evidence
export const calculateProjectDepthScore = (
  detectedSkills: DetectedSkill[]
): ProjectDepthScore => {
  const maxScore = 25;

  const usedSkills = detectedSkills
    .filter((skill) => skill.level === "USED" && skill.category !== "dsa")
    .map((skill) => skill.name);

  const strongSkills = detectedSkills
    .filter((skill) => skill.level === "STRONG" && skill.category !== "dsa")
    .map((skill) => skill.name);

  const rawScore = usedSkills.length * 2 + strongSkills.length * 5;
  const score = Math.min(rawScore, maxScore);

  const totalProjectBackedSkills = usedSkills.length + strongSkills.length;

  const evidenceBreakdown: string[] = [];

  if (strongSkills.length > 0) {
    evidenceBreakdown.push(`${strongSkills.length} strong skill(s)`);
  }

  if (usedSkills.length > 0) {
    evidenceBreakdown.push(`${usedSkills.length} used-only skill(s)`);
  }

  const reason =
    evidenceBreakdown.length > 0
      ? `Found ${totalProjectBackedSkills} project/work-backed skills, including ${evidenceBreakdown.join(" and ")}.`
      : "No project/work-backed skills were detected.";

  return {
    score,
    maxScore,
    usedSkills,
    strongSkills,
    reason
  };
};

// Detects expected experience level from JD first, then target role fallback
const detectExpectedExperienceLevel = (
  targetRole: string,
  jobDescription?: string
): ExperienceLevel => {
  const text = `${targetRole} ${jobDescription || ""}`.toLowerCase();

  if (
    text.includes("fresher") ||
    text.includes("fresh graduate") ||
    text.includes("new grad") ||
    text.includes("entry level")
  ) {
    return "FRESHER";
  }

  if (
    text.includes("junior") ||
    text.includes("0-1") ||
    text.includes("0 to 1") ||
    text.includes("1-2") ||
    text.includes("1 to 2") ||
    text.includes("1-3") ||
    text.includes("1 to 3")
  ) {
    return "JUNIOR";
  }

  if (
    text.includes("mid level") ||
    text.includes("mid-level") ||
    text.includes("2-4") ||
    text.includes("2 to 4") ||
    text.includes("3-5") ||
    text.includes("3 to 5")
  ) {
    return "MID_LEVEL";
  }

  if (
    text.includes("senior") ||
    text.includes("sr.") ||
    text.includes("sr ") ||
    text.includes("5+ years") ||
    text.includes("5 years") ||
    text.includes("6+ years")
  ) {
    return "SENIOR";
  }

  if (
    text.includes("lead") ||
    text.includes("staff engineer") ||
    text.includes("principal engineer")
  ) {
    return "LEAD";
  }

  return "UNKNOWN";
};

// Extracts highest year count mentioned in resume text
const detectYears = (text: string): number => {
  const normalizedText = text.toLowerCase();

  const yearMatches =
    normalizedText.match(/(\d+)\+?\s*(year|years|yr|yrs)/g) || [];

  return yearMatches.reduce((maxYears, match) => {
    const numberMatch = match.match(/\d+/);
    const years = numberMatch ? Number(numberMatch[0]) : 0;
    return Math.max(maxYears, years);
  }, 0);
};

// Extracts highest month count mentioned in resume text
const detectMonths = (text: string): number => {
  const normalizedText = text.toLowerCase();

  const monthMatches =
    normalizedText.match(/(\d+)\+?\s*(month|months|mo|mos)/g) || [];

  return monthMatches.reduce((maxMonths, match) => {
    const numberMatch = match.match(/\d+/);
    const months = numberMatch ? Number(numberMatch[0]) : 0;
    return Math.max(maxMonths, months);
  }, 0);
};

// Scores whether candidate experience level fits the expected role level
const calculateLevelFitScore = (
  expectedLevel: ExperienceLevel,
  detectedYears: number,
  detectedMonths: number,
  resumeText: string
): number => {
  const normalizedResume = resumeText.toLowerCase();

  const hasProjectEvidence =
    normalizedResume.includes("projects") ||
    normalizedResume.includes("project");

  const hasInternshipEvidence =
    normalizedResume.includes("internship") ||
    normalizedResume.includes("intern");

  const hasFellowshipOrTrainingEvidence =
    normalizedResume.includes("fellowship") ||
    normalizedResume.includes("training");

  const hasRealExperienceEvidence =
    normalizedResume.includes("experience") ||
    normalizedResume.includes("work experience") ||
    normalizedResume.includes("company") ||
    normalizedResume.includes("professional") ||
    normalizedResume.includes("developer at") ||
    normalizedResume.includes("engineer at");

  // Fresher roles:
  // Projects are enough for a decent score.
  // Internship/fellowship/training improves the score.
  if (expectedLevel === "FRESHER") {
    if (hasInternshipEvidence && hasProjectEvidence) return 7;
    if (hasFellowshipOrTrainingEvidence && hasProjectEvidence) return 6;
    if (hasProjectEvidence) return 5;
    if (hasInternshipEvidence || hasFellowshipOrTrainingEvidence) return 4;
    return 2;
  }

  // Junior roles:
  // Projects alone are not enough.
  // Needs around 9-12 months minimum real/company experience.
  // 1-3 years is ideal.
  if (expectedLevel === "JUNIOR") {
    if (detectedYears >= 1 && detectedYears <= 3) return 7;
    if (detectedMonths >= 9 && hasRealExperienceEvidence) return 6;
    if (detectedMonths >= 6 && hasRealExperienceEvidence) return 4;
    if (hasRealExperienceEvidence) return 3;
    if (hasProjectEvidence) return 2;
    return 0;
  }

  if (expectedLevel === "MID_LEVEL") {
    if (detectedYears >= 2 && detectedYears <= 5) return 7;
    if (detectedYears >= 1) return 4;
    if (hasRealExperienceEvidence) return 3;
    return 0;
  }

  if (expectedLevel === "SENIOR") {
    if (detectedYears >= 5) return 7;
    if (detectedYears >= 3) return 4;
    if (detectedYears >= 1) return 2;
    return 0;
  }

  if (expectedLevel === "LEAD") {
    if (detectedYears >= 7) return 7;
    if (detectedYears >= 5) return 4;
    if (detectedYears >= 3) return 2;
    return 0;
  }

  // Unknown level fallback:
  // Do not punish too hard when JD/title does not clearly say level.
  if (detectedYears >= 1) return 5;
  if (detectedMonths >= 9 && hasRealExperienceEvidence) return 4;
  if (hasProjectEvidence) return 3;
  return 1;
};

// Calculates Experience score using level fit, relevant evidence, and practical proof
export const calculateExperienceScore = (
  resumeText: string,
  targetRole: string,
  jobDescription?: string,
  detectedSkills: DetectedSkill[] = [],
  jdDetectedSkills: DetectedSkill[] = []
): ExperienceScore => {
  const maxScore = 20;
  const normalizedResume = resumeText.toLowerCase();

  const expectedLevel = detectExpectedExperienceLevel(
    targetRole,
    jobDescription
  );

  const detectedYears = detectYears(resumeText);
  const detectedMonths = detectMonths(resumeText);

  const levelFitScore = calculateLevelFitScore(
    expectedLevel,
    detectedYears,
    detectedMonths,
    resumeText
  );

  const candidateSkillNames = detectedSkills.map((skill) => skill.name);
  const jdSkillNames = jdDetectedSkills.map((skill) => skill.name);

  const relevantSkillMatches =
    jdSkillNames.length > 0
      ? jdSkillNames.filter((skill) => candidateSkillNames.includes(skill))
      : candidateSkillNames;

  const detectedRelevantSignals = [
    ...relevantSkillMatches,
    ...(normalizedResume.includes("internship") ? ["Internship"] : []),
    ...(normalizedResume.includes("intern") ? ["Intern"] : []),
    ...(normalizedResume.includes("fellowship") ? ["Fellowship"] : []),
    ...(normalizedResume.includes("training") ? ["Training"] : []),
    ...(normalizedResume.includes("work experience") ? ["Work Experience"] : []),
    ...(normalizedResume.includes("company") ? ["Company Experience"] : []),
    ...(normalizedResume.includes("professional")
      ? ["Professional Experience"]
      : []),
    ...(normalizedResume.includes("projects") ||
    normalizedResume.includes("project")
      ? ["Projects"]
      : [])
  ];

  const relevantEvidenceScore = Math.min(
    detectedRelevantSignals.length * 2,
    8
  );

  const practicalSignals = [
    "built",
    "implemented",
    "developed",
    "designed",
    "optimized",
    "improved",
    "maintained",
    "integrated",
    "collaborated",
    "owned",
    "led",
    "refactored",
    "migrated",
    "scaled",
    "delivered"
  ];

  const detectedPracticalSignals = practicalSignals.filter((signal) =>
    normalizedResume.includes(signal)
  );

  const practicalProofScore = Math.min(detectedPracticalSignals.length, 5);

  const score = levelFitScore + relevantEvidenceScore + practicalProofScore;

  return {
    score,
    maxScore,
    expectedLevel,
    detectedYears,
    detectedMonths,
    levelFitScore,
    relevantEvidenceScore,
    practicalProofScore,
    detectedRelevantSignals,
    detectedPracticalSignals,
    reason: `Experience score is ${score}/20 based on ${expectedLevel.toLowerCase()} level fit, ${detectedYears} detected year(s), ${detectedMonths} detected month(s), ${detectedRelevantSignals.length} relevant evidence signal(s), and ${detectedPracticalSignals.length} practical proof signal(s).`
  };
};

// Calculates Fundamentals/DSA score based on distinct DSA-related signals
export const calculateFundamentalsScore = (
  detectedSkills: DetectedSkill[]
): FundamentalsScore => {
  const maxScore = 15;

  const detectedFundamentals = detectedSkills
    .filter((skill) => skill.category === "dsa")
    .map((skill) => skill.name);

  const uniqueFundamentals = [...new Set(detectedFundamentals)];

  const score = Math.min(uniqueFundamentals.length * 3, maxScore);

  return {
    score,
    maxScore,
    detectedFundamentals: uniqueFundamentals,
    detectedCount: uniqueFundamentals.length,
    reason: `Detected ${uniqueFundamentals.length} distinct DSA/fundamentals signal(s).`
  };
};

// Calculates final readiness score and routing recommendation
export const calculateFinalScore = (
  roleFitScore: { score: number },
  projectDepthScore: { score: number },
  experienceScore: { score: number },
  fundamentalsScore: { score: number }
): FinalScoreResult => {
  const maxScore = 100;

  const finalScore =
    roleFitScore.score +
    projectDepthScore.score +
    experienceScore.score +
    fundamentalsScore.score;

  let recommendation: FinalRecommendation = "NOT_READY";

  if (finalScore >= 80) {
    recommendation = "DIRECT_INTERVIEW";
  } else if (finalScore >= 60) {
    recommendation = "PHONE_SCREEN";
  } else if (finalScore >= 40) {
    recommendation = "ASSESSMENT";
  }

  return {
    finalScore,
    maxScore,
    recommendation,
    breakdown: {
      roleFit: roleFitScore.score,
      projectDepth: projectDepthScore.score,
      experience: experienceScore.score,
      fundamentals: fundamentalsScore.score
    },
    reason: `Final score is ${finalScore}/100. Recommendation: ${recommendation}.`
  };
};

// Generates candidate-facing improvement insights from score outputs
export const generateImprovementInsights = (
  roleFitScore: {
    score: number;
    maxScore: number;
    matchedSkills?: string[];
    missingSkills?: string[];
    additionalCandidateSkills?: string[];
  },
  projectDepthScore: {
    score: number;
    maxScore: number;
    strongSkills: string[];
    usedSkills: string[];
  },
  experienceScore: {
    score: number;
    maxScore: number;
    expectedLevel: string;
    detectedYears: number;
    detectedMonths: number;
  },
  fundamentalsScore: {
    score: number;
    maxScore: number;
    detectedFundamentals: string[];
  }
): ImprovementInsights => {
  const strengths: string[] = [];
  const recommendations: string[] = [];

  // Role Fit insights
  if (roleFitScore.score >= 30) {
    strengths.push("Strong alignment with the required role skills.");
  } else if (roleFitScore.score >= 20) {
    strengths.push("Moderate alignment with the required role skills.");
  } else {
    recommendations.push(
      "Improve role fit by aligning the resume more closely with the required job skills."
    );
  }

  if (roleFitScore.missingSkills && roleFitScore.missingSkills.length > 0) {
    const missingSkillsText = roleFitScore.missingSkills.join(", ");

    recommendations.push(
      `Build or update one role-relevant project to clearly demonstrate ${missingSkillsText}, then mention the implementation details in the resume.`
    );

    recommendations.push(
      "Focus on showing practical usage, not just listing the skill names."
    );
  }

  // Project Depth insights
  if (projectDepthScore.score >= 20) {
    strengths.push("Strong project/work-backed engineering evidence.");
  } else if (projectDepthScore.score >= 10) {
    strengths.push("Some practical project/work evidence is present.");
    recommendations.push(
      "Add more project details showing implementation depth, ownership, and real technical decisions."
    );
  } else {
    recommendations.push(
      "Strengthen project descriptions with what was built, how it was implemented, and what technical problems were solved."
    );
  }

  // Experience insights
  if (experienceScore.score >= 16) {
    strengths.push(
      `Experience level appears suitable for a ${experienceScore.expectedLevel.toLowerCase()} role.`
    );
  } else if (experienceScore.score >= 10) {
    recommendations.push(
      "Make experience evidence clearer by mentioning duration, role context, and relevant responsibilities."
    );
  } else {
    recommendations.push(
      "Make experience evidence clearer by mentioning duration, role context, company/project setting, and relevant responsibilities."
    );
  }

  // Fundamentals insights
  if (fundamentalsScore.score >= 12) {
    strengths.push("Strong DSA/fundamentals signals detected.");
  } else if (fundamentalsScore.score >= 6) {
    recommendations.push(
      "Add stronger DSA/fundamentals evidence such as arrays, hashing, trees, graphs, DP, or time complexity."
    );
  } else {
    recommendations.push(
      "Add clear DSA/fundamentals evidence if the role expects coding rounds."
    );
  }

  // Additional strengths are useful, but keep DSA separate from production skills
  if (
    roleFitScore.additionalCandidateSkills &&
    roleFitScore.additionalCandidateSkills.length > 0
  ) {
    const technicalStrengths = roleFitScore.additionalCandidateSkills.filter(
      (skill) => !fundamentalsScore.detectedFundamentals.includes(skill)
    );

    const fundamentalsStrengths = roleFitScore.additionalCandidateSkills.filter(
      (skill) => fundamentalsScore.detectedFundamentals.includes(skill)
    );

    if (technicalStrengths.length > 0) {
      strengths.push(
        `Additional technical strength(s): ${technicalStrengths.join(", ")}.`
      );
    }

    if (fundamentalsStrengths.length > 0) {
      strengths.push(
        `Additional fundamentals strength(s): ${fundamentalsStrengths.join(", ")}.`
      );
    }
  }

  return {
    strengths,
    recommendations
  };
};