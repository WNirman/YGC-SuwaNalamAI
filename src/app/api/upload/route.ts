import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

export const runtime = 'nodejs';
export const maxDuration = 60;

// Groq vision enforces a 4 MB base64 limit (~3 MB raw image)
const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
const MAX_PDF_BYTES = 10 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No files uploaded' },
        { status: 400 }
      );
    }

    const uploadedFiles = [];
    const rejectedErrors: string[] = [];

    const validTypes = [
      'application/pdf',
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/webp',
    ];

    for (const file of files) {
      if (!validTypes.includes(file.type)) {
        rejectedErrors.push(`${file.name}: unsupported file type (${file.type || 'unknown'})`);
        continue;
      }

      const isPdf = file.type === 'application/pdf';
      const maxBytes = isPdf ? MAX_PDF_BYTES : MAX_IMAGE_BYTES;
      if (file.size > maxBytes) {
        const limitMb = Math.round(maxBytes / (1024 * 1024));
        rejectedErrors.push(`${file.name}: exceeds ${limitMb} MB size limit`);
        continue;
      }

      const fileId = randomUUID();
      const ext = file.name.split('.').pop() || (isPdf ? 'pdf' : 'jpg');
      const storedName = `${fileId}.${ext}`;

      const arrayBuffer = await file.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');

      uploadedFiles.push({
        id: fileId,
        fileName: file.name,
        storedName,
        fileSize: file.size,
        fileType: file.type,
        base64,
        uploadedAt: new Date().toISOString(),
      });
    }

    if (uploadedFiles.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            rejectedErrors.length > 0
              ? rejectedErrors.join('; ')
              : 'No valid files found. Accepted: PDF (<=10 MB), PNG, JPG, WebP (<=3 MB)',
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      files: uploadedFiles,
      warnings: rejectedErrors.length > 0 ? rejectedErrors : undefined,
      message: `Successfully uploaded ${uploadedFiles.length} file(s)`,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload files' },
      { status: 500 }
    );
  }
}
