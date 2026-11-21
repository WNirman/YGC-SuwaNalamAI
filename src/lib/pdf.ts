// ============================================================
// MediScan AI — Server-side PDF Text Extraction Helper
// Loaded dynamically so pdf-parse / pdfjs-dist / @napi-rs/canvas
// are never initialized on image uploads or Vercel cold starts.
// ============================================================

export async function extractPdfText(fileBuffer: Buffer): Promise<string> {
  const { PDFParse } = await import('pdf-parse');
  const parser = new PDFParse({ data: fileBuffer });
  try {
    const parsed = await parser.getText();
    return parsed.text?.trim() || '';
  } finally {
    await parser.destroy();
  }
}
