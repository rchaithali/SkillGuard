export type ExtractedProfileLinks = {
  githubUsername: string | null;
  githubUrl: string | null;
  leetCodeUsername: string | null;
  leetCodeUrl: string | null;
};

const extractLinks = (text: string): ExtractedProfileLinks => {
  const normalizedText = text.replace(/\s+/g, " ");

  const githubMatch = normalizedText.match(
    /https?:\/\/(?:www\.)?github\.com\/([a-zA-Z0-9-]+)\/?/i
  );

  const leetCodeMatch = normalizedText.match(
    /https?:\/\/(?:www\.)?leetcode\.com\/(?:u\/)?([a-zA-Z0-9_-]+)\/?/i
  );

  return {
    githubUsername: githubMatch?.[1] || null,
    githubUrl: githubMatch?.[0] || null,
    leetCodeUsername: leetCodeMatch?.[1] || null,
    leetCodeUrl: leetCodeMatch?.[0] || null
  };
};

export const extractProfileLinksFromText = (
  resumeText: string
): ExtractedProfileLinks => {
  return extractLinks(resumeText);
};

export const extractProfileLinksFromPdfBuffer = (
  pdfBuffer: Buffer
): ExtractedProfileLinks => {
  const rawPdfContent = pdfBuffer.toString("latin1");

  return extractLinks(rawPdfContent);
};