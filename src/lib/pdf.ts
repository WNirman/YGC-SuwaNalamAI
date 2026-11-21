// ============================================================
// MediScan AI — Server-side PDF Text Extraction Helper
// Kept separate from openai.ts so non-upload routes don't load pdf-parse
// ============================================================

import { PDFParse } from 'pdf-parse';

export async function extractPdfText(fileBuffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: fileBuffer });
  try {
    const parsed = await parser.getText();
    return parsed.text?.trim() || '';
  } finally {
    await parser.destroy();
  }
}
