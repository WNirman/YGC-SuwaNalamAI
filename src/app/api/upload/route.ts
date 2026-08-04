import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

export const runtime = 'nodejs';
export const maxDuration = 60;

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

    for (const file of files) {
      const validTypes = [
        'application/pdf',
        'image/png',
        'image/jpeg',
        'image/jpg',
        'image/webp',
      ];

      if (!validTypes.includes(file.type)) {
        continue;
      }

      const fileId = randomUUID();
      const ext = file.name.split('.').pop() || 'pdf';
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
        { success: false, error: 'No valid files found. Accepted: PDF, PNG, JPG, WebP' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      files: uploadedFiles,
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
