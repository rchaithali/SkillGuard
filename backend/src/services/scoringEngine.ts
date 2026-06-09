import type { RoleMatchResult } from "./roleMatcher.js";

export type RoleFitScore = {
  score: number;
  maxScore: number;
  matchedSkillsCount: number;
  totalRequiredSkills: number;
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