import { roleSkillMap } from "../data/roleSkillMap.js";
import type { DetectedSkill } from "./resumeAnalyzer.js";

export type RoleMatchResult = {
  targetRole: string;
  normalizedRole: string;
  matchedCoreSkills: string[];
  missingCoreSkills: string[];
  matchedSecondarySkills: string[];
  missingSecondarySkills: string[];
  totalCoreSkills: number;
  totalSecondarySkills: number;
};

// Converts detailed role titles into our supported base role names
const normalizeRoleName = (targetRole: string): string => {
  const role = targetRole.toLowerCase();

  if (role.includes("backend") || role.includes("back end")) {
    return "Backend Developer";
  }

  if (role.includes("frontend") || role.includes("front end")) {
    return "Frontend Developer";
  }

  if (role.includes("full stack") || role.includes("fullstack")) {
    return "Full Stack Developer";
  }

  if (role.includes("mern")) {
    return "MERN Stack Developer";
  }

  if (
    role.includes("ai") ||
    role.includes("ml") ||
    role.includes("machine learning")
  ) {
    return "AI/ML Engineer";
  }

  if (
    role.includes("mobile") ||
    role.includes("android") ||
    role.includes("ios") ||
    role.includes("flutter") ||
    role.includes("react native")
  ) {
    return "Mobile Developer";
  }

  if (
    role.includes("software engineer") ||
    role.includes("software developer") ||
    role.includes("sde") ||
    role.includes("swe")
  ) {
    return "Software Engineer";
  }

  // If no simplification is needed, use the original role
  return targetRole;
};

const findRoleConfig = (targetRole: string) => {
  const normalizedRole = normalizeRoleName(targetRole);

  return roleSkillMap.find(
    (roleConfig) =>
      roleConfig.role.toLowerCase() === normalizedRole.toLowerCase()
  );
};

export const matchSkillsToRole = (
  detectedSkills: DetectedSkill[],
  targetRole: string
): RoleMatchResult => {
  const normalizedRole = normalizeRoleName(targetRole);
  const roleConfig = findRoleConfig(targetRole);

  if (!roleConfig) {
    return {
      targetRole,
      normalizedRole,
      matchedCoreSkills: [],
      missingCoreSkills: [],
      matchedSecondarySkills: [],
      missingSecondarySkills: [],
      totalCoreSkills: 0,
      totalSecondarySkills: 0
    };
  }

  const detectedSkillNames = detectedSkills.map((skill) => skill.name);

  const matchedCoreSkills = roleConfig.coreSkills.filter((skill) =>
    detectedSkillNames.includes(skill)
  );

  const missingCoreSkills = roleConfig.coreSkills.filter(
    (skill) => !detectedSkillNames.includes(skill)
  );

  const matchedSecondarySkills = roleConfig.secondarySkills.filter((skill) =>
    detectedSkillNames.includes(skill)
  );

  const missingSecondarySkills = roleConfig.secondarySkills.filter(
    (skill) => !detectedSkillNames.includes(skill)
  );

  return {
    targetRole,
    normalizedRole: roleConfig.role,
    matchedCoreSkills,
    missingCoreSkills,
    matchedSecondarySkills,
    missingSecondarySkills,
    totalCoreSkills: roleConfig.coreSkills.length,
    totalSecondarySkills: roleConfig.secondarySkills.length
  };
};