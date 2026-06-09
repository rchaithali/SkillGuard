export type CodingPlatform = "LEETCODE" | "CODECHEF" | "CODEFORCES" | "OTHER";

export type CodingProfileInput = {
  platform: CodingPlatform;
  username?: string;
  totalSolved?: number;
  easySolved?: number;
  mediumSolved?: number;
  hardSolved?: number;
  contestRating?: number;
};

export type CodingProfileSignals = {
  platform: CodingPlatform;
  username: string | null;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  contestRating: number | null;
  hasCodingProfile: boolean;
  hasProblemSolvingEvidence: boolean;
  hasIntermediateDSAEvidence: boolean;
  hasAdvancedDSAEvidence: boolean;
  proofLevel: "NONE" | "BASIC" | "INTERMEDIATE" | "ADVANCED";
};

export const analyzeCodingProfileSignals = (
  codingProfile?: CodingProfileInput | null
): CodingProfileSignals | null => {
  if (!codingProfile) {
    return null;
  }

  const totalSolved = codingProfile.totalSolved || 0;
  const easySolved = codingProfile.easySolved || 0;
  const mediumSolved = codingProfile.mediumSolved || 0;
  const hardSolved = codingProfile.hardSolved || 0;
  const contestRating = codingProfile.contestRating || null;

  const hasCodingProfile = Boolean(codingProfile.username) || totalSolved > 0;

  // Basic proof: candidate has some consistent problem-solving practice.
  const hasProblemSolvingEvidence = totalSolved >= 20;

  // Intermediate proof: candidate has enough total breadth AND medium-level practice,
  // or enough medium problems directly.
  const hasIntermediateDSAEvidence =
    (totalSolved >= 75 && mediumSolved >= 20) ||
    mediumSolved >= 30 ||
    Boolean(contestRating && contestRating >= 1400);

  // Advanced proof: candidate must show difficulty depth.
  // Total solved alone is not enough because 150 easy problems should not be advanced.
  const hasAdvancedDSAEvidence =
    (totalSolved >= 150 && mediumSolved >= 50 && hardSolved >= 5) ||
    (mediumSolved >= 70 && hardSolved >= 10) ||
    Boolean(contestRating && contestRating >= 1700);

  let proofLevel: CodingProfileSignals["proofLevel"] = "NONE";

  if (hasAdvancedDSAEvidence) {
    proofLevel = "ADVANCED";
  } else if (hasIntermediateDSAEvidence) {
    proofLevel = "INTERMEDIATE";
  } else if (hasProblemSolvingEvidence) {
    proofLevel = "BASIC";
  }

  return {
    platform: codingProfile.platform,
    username: codingProfile.username || null,
    totalSolved,
    easySolved,
    mediumSolved,
    hardSolved,
    contestRating,
    hasCodingProfile,
    hasProblemSolvingEvidence,
    hasIntermediateDSAEvidence,
    hasAdvancedDSAEvidence,
    proofLevel
  };
};