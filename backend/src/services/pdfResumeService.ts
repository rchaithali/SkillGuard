import { PDFParse } from "pdf-parse";

export type ExtractedResumePdf = {
  resumeText: string;
  pageCount: number;
};

export const extractResumeTextFromPdf = async (
  pdfBuffer: Buffer
): Promise<ExtractedResumePdf> => {
  const parser = new PDFParse({ data: pdfBuffer });
  const parsedPdf = await parser.getText();

  return {
    resumeText: parsedPdf.text.trim(),
    pageCount: parsedPdf.total
  };
};