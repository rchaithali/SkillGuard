import { roleSkillMap } from "../data/roleSkillMap.js"; 
import type { DetectedSkill } from "./resumeAnalyzer.js";

export type RoleMatchResult = {

  targetRole: string;

  matchedCoreSkills: string[];

  missingCoreSkills: string[];

  matchedSecondarySkills: string[];

  missingSecondarySkills: string[];

  totalCoreSkills: number;

  totalSecondarySkills: number;

};

// Finds the selected role configuration from roleSkillMap

const findRoleConfig = (targetRole: string) => {

  return roleSkillMap.find(

    (roleConfig) =>

      roleConfig.role.toLowerCase() === targetRole.toLowerCase()

  );

};

export const matchSkillsToRole = (

  detectedSkills: DetectedSkill[],

  targetRole: string

): RoleMatchResult => {

  const roleConfig = findRoleConfig(targetRole);

  // If role is not supported yet, return empty comparison safely

  if (!roleConfig) {

    return {

      targetRole,

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

    targetRole: roleConfig.role,

    matchedCoreSkills,

    missingCoreSkills,

    matchedSecondarySkills,

    missingSecondarySkills,

    totalCoreSkills: roleConfig.coreSkills.length,

    totalSecondarySkills: roleConfig.secondarySkills.length

  };

};