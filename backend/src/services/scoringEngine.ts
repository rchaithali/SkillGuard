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