import { skillDictionary } from "../data/skillDictionary.js";

export type SkillLevel = "MENTIONED" | "USED" | "STRONG";

export type DetectedSkill = {
  name: string;
  category: string;
  matchedAlias: string;
  level: SkillLevel;
};

// Converts text into lowercase so matching becomes case-insensitive
const normalizeText = (text: string): string => {
  return text.toLowerCase();
};

// Escapes special regex characters like +, ., #, / so regex treats them as normal text
const escapeRegex = (value: string): string => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// Checks whether a skill alias appears as a clean standalone phrase
const hasAliasMatch = (text: string, alias: string): boolean => {
  const normalizedAlias = alias.toLowerCase();
  const escapedAlias = escapeRegex(normalizedAlias);

  // Short aliases like js, ts, go, c can cause false positives.
  // Example: "js" should not match inside "node.js" or "express.js".
  if (normalizedAlias.length <= 2) {
    const shortAliasRegex = new RegExp(
      `(?:^|[^a-z0-9.+#])${escapedAlias}(?:[^a-z0-9.+#]|$)`,
      "i"
    );

    return shortAliasRegex.test(text);
  }

  // Longer aliases are matched as standalone phrases.
  // This safely handles C++, C#, Node.js, Express.js, CI/CD, etc.
  const regex = new RegExp(
    `(?:^|[^a-z0-9])${escapedAlias}(?:[^a-z0-9]|$)`,
    "i"
  );

  return regex.test(text);
};

// Counts how many times a skill alias appears in the resume text
const countAliasOccurrences = (text: string, alias: string): number => {
  const normalizedAlias = alias.toLowerCase();
  const escapedAlias = escapeRegex(normalizedAlias);

  const regex = new RegExp(
    `(?:^|[^a-z0-9])${escapedAlias}(?:[^a-z0-9]|$)`,
    "gi"
  );

  return text.match(regex)?.length || 0;
};

// Extracts the project/work-heavy part of a resume if common section headers exist
const extractEvidenceSection = (text: string): string => {
  const sectionStartRegex =
    /(projects|project experience|work experience|professional experience|experience)/i;

  const match = text.match(sectionStartRegex);

  if (!match || match.index === undefined) {
    return "";
  }

  return text.slice(match.index);
};

// Checks whether a skill appears inside project/work evidence section
const appearsInEvidenceSection = (text: string, alias: string): boolean => {
  const evidenceSection = extractEvidenceSection(text);

  if (!evidenceSection) {
    return false;
  }

  return hasAliasMatch(evidenceSection, alias);
};

// Checks if a skill appears near practical build/implementation context
const hasUsedContext = (text: string, alias: string): boolean => {
  const usedPhrases = [
    "used",
    "built",
    "implemented",
    "developed",
    "worked on",
    "created",
    "integrated"
  ];

  return usedPhrases.some((phrase) => {
    const regex = new RegExp(
      `${phrase}.{0,100}${escapeRegex(alias)}|${escapeRegex(alias)}.{0,100}${phrase}`,
      "i"
    );

    return regex.test(text);
  });
};
// Checks if a skill appears in the same sentence as ownership/depth/impact context
const hasStrongContext = (text: string, alias: string): boolean => {
  const strongPhrases = [
    "owned",
    "designed",
    "architected",
    "optimized",
    "scaled",
    "refactored",
    "migrated",
    "led",
    "improved",
    "built end-to-end",
    "built from scratch",
    "end-to-end",
    "full ownership",
    "multiple features",
    "reduced latency",
    "improved performance"
  ];

  // Split resume into smaller sentence-like chunks.
  // This prevents one strong verb from upgrading unrelated nearby skills.
 const sentences = text.split(/(?<=[!?])|\n|\. /);

  return sentences.some((sentence) => {
    const hasSkill = hasAliasMatch(sentence, alias);
    const hasStrongPhrase = strongPhrases.some((phrase) =>
      sentence.includes(phrase)
    );

    return hasSkill && hasStrongPhrase;
  });
};

// Classifies detected skill based on evidence strength.
// Priority: STRONG > USED > MENTIONED
const classifySkillLevel = (text: string, alias: string): SkillLevel => {
  const occurrenceCount = countAliasOccurrences(text, alias);

  if (hasStrongContext(text, alias) || occurrenceCount > 3) {
    return "STRONG";
  }

  if (appearsInEvidenceSection(text, alias) || hasUsedContext(text, alias)) {
    return "USED";
  }

  return "MENTIONED";
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
        matchedAlias,
        level: classifySkillLevel(normalizedResume, matchedAlias)
      });
    }
  }

  return detectedSkills;
};