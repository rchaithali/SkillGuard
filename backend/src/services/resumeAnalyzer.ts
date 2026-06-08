import { skillDictionary } from "../data/skillDictionary.js";

export type DetectedSkill = {
  name: string;
  category: string;
  matchedAlias: string;
};

// Converts text into lowercase so matching becomes case-insensitive
const normalizeText = (text: string): string => {
  return text.toLowerCase();
};

// Escapes special regex characters like +, ., #, / so they are treated as normal text
const escapeRegex = (value: string): string => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// Checks whether a skill alias appears as a clean standalone phrase
const hasAliasMatch = (text: string, alias: string): boolean => {
  const normalizedAlias = alias.toLowerCase();
  const escapedAlias = escapeRegex(normalizedAlias);

  // Very short aliases like js, ts, go, c can cause false positives.
  // Example: "js" should not match inside "node.js" or "express.js".
  if (normalizedAlias.length <= 2) {
    const shortAliasRegex = new RegExp(
      `(?:^|[^a-z0-9.+#])${escapedAlias}(?:[^a-z0-9.+#]|$)`,
      "i"
    );

    return shortAliasRegex.test(text);
  }

  // Longer aliases are matched as standalone phrases.
  // This safely handles skills like C++, C#, Node.js, Express.js, and CI/CD.
  const regex = new RegExp(
    `(?:^|[^a-z0-9])${escapedAlias}(?:[^a-z0-9]|$)`,
    "i"
  );

  return regex.test(text);
};

export const analyzeResumeSkills = (resumeText: string): DetectedSkill[] => {
  const normalizedResume = normalizeText(resumeText);
  const detectedSkills: DetectedSkill[] = [];

  for (const skill of skillDictionary) {
    const matchedAlias = skill.aliases.find((alias) =>
      hasAliasMatch(normalizedResume, alias)
    );

    if (matchedAlias) {
      detectedSkills.push({
        name: skill.name,
        category: skill.category,
        matchedAlias
      });
    }
  }

  return detectedSkills;
};