import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { extractDocumentData } from '@/lib/openai';
import type { ExtractedData, TimelineEvent } from '@/types/medical';
import { randomUUID } from 'crypto';

export const runtime = 'nodejs';
export const maxDuration = 120;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { files, language } = body as {
      language?: string;
      files: {
        id: string;
        fileName: string;
        storedName: string;
        fileType: string;
        filePath?: string;
        base64?: string;
      }[];
    };

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No files to analyze' },
        { status: 400 }
      );
    }

    const extractedDocuments: ExtractedData[] = [];
    const errors: string[] = [];

    // Process each file with AI
    for (const file of files) {
      try {
        let fileBuffer: Buffer;

        if (file.base64) {
          fileBuffer = Buffer.from(file.base64, 'base64');
        } else {
          const uploadsDir = path.join(process.cwd(), 'uploads');
          const filePath = path.join(uploadsDir, file.storedName);
          fileBuffer = await readFile(filePath);
        }

        const extracted = await extractDocumentData(
          fileBuffer,
          file.fileType,
          file.fileName,
          language || 'en'
        );

        extractedDocuments.push({
          ...extracted,
          rawSummary: extracted.rawSummary || `Data extracted from ${file.fileName}`,
        });
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Error processing ${file.fileName}:`, errMsg);
        errors.push(`${file.fileName}: ${errMsg}`);
      }
    }

    if (extractedDocuments.length === 0) {
      const isKeyError = errors.some((err) => {
        const lower = err.toLowerCase();
        return (
          lower.includes('api key') ||
          lower.includes('api_key_invalid') ||
          lower.includes('unauthenticated') ||
          lower.includes('authentication') ||
          lower.includes('credentials') ||
          lower.includes('no ai api key found')
        );
      });

      return NextResponse.json(
        {
          success: false,
          error: isKeyError
            ? 'API Key is invalid, expired, or missing in Vercel environment variables.'
            : 'Failed to extract data from the uploaded document(s).',
          details: errors,
        },
        { status: 500 }
      );
    }

    const timeline: TimelineEvent[] = extractedDocuments.map((doc, index) => ({
      id: randomUUID(),
      date: doc.date || 'Unknown date',
      documentType: doc.documentType,
      title: `${formatDocType(doc.documentType)} - ${doc.provider || doc.facility || 'Unknown Provider'}`,
      provider: doc.provider || 'Unknown',
      facility: doc.facility,
      summary: doc.rawSummary,
      medications: doc.medications || [],
      labResults: doc.labResults || [],
      allergies: doc.allergies || [],
      diagnoses: doc.diagnoses || [],
      documentId: files[index]?.id || randomUUID(),
    }));

    timeline.sort((a, b) => {
      if (a.date === 'Unknown date') return 1;
      if (b.date === 'Unknown date') return -1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    const patient = extractedDocuments.reduce<{
      name: string;
      age?: string;
      gender?: string;
      patientId?: string;
      bloodGroup?: string;
    }>(
      (best, doc) => {
        if (!best.name && doc.patient?.name) return doc.patient;
        if (doc.patient?.name && doc.patient.name.length > (best.name?.length || 0)) {
          return { ...best, ...doc.patient };
        }
        return best;
      },
      { name: '' }
    );

    return NextResponse.json({
      success: true,
      documents: extractedDocuments,
      timeline,
      patient,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Analyze error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to analyze documents' },
      { status: 500 }
    );
  }
}

function formatDocType(type: string): string {
  const map: Record<string, string> = {
    lab_report: 'Lab Report',
    prescription: 'Prescription',
    discharge_summary: 'Discharge Summary',
    doctor_notes: "Doctor's Notes",
    unknown: 'Medical Document',
  };
  return map[type] || 'Medical Document';
}
