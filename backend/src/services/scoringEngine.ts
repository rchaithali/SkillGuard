import type { DetectedSkill } from "./resumeAnalyzer.js";
import type { RoleMatchResult } from "./roleMatcher.js";

export type RoleFitScore = {
  score: number;
  maxScore: number;
  matchedSkillsCount: number;
  totalRequiredSkills: number;
  reason: string;
};

export type ProjectDepthScore = {
  score: number;
  maxScore: number;
  usedSkills: string[];
  strongSkills: string[];
  reason: string;
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

  // Safety check for unsupported roles or empty role configs
  if (totalRequiredSkills === 0) {
    return {
      score: 0,
      maxScore,
      matchedSkillsCount: 0,
      totalRequiredSkills: 0,
      reason: "No required skills found for this role, so role fit could not be calculated."
    };
  }

  const score = Math.round((matchedSkillsCount / totalRequiredSkills) * maxScore);

  return {
    score,
    maxScore,
    matchedSkillsCount,
    totalRequiredSkills,
    reason: `Matched ${matchedSkillsCount}/${totalRequiredSkills} required skills for ${roleMatch.targetRole}.`
  };
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
      reason: "No recognizable required skills were detected from the job description."
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
    .filter((skill) => skill.level === "USED")
    .map((skill) => skill.name);

  const strongSkills = detectedSkills
    .filter((skill) => skill.level === "STRONG")
    .map((skill) => skill.name);

  const rawScore = usedSkills.length * 2 + strongSkills.length * 5;
  const score = Math.min(rawScore, maxScore);

 return {
  score,
  maxScore,
  usedSkills,
  strongSkills,
  reason: `Found ${usedSkills.length + strongSkills.length} project/work-backed skills, including ${strongSkills.length} strong skills and ${usedSkills.length} used-only skills.`
};
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

  // 1. Level Fit score: max 7
  const levelFitScore = calculateLevelFitScore(
    expectedLevel,
    detectedYears,
    detectedMonths,
    resumeText
  );

  // 2. Relevant Experience Evidence score: max 8
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

  // 3. Practical Proof score: max 5
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