import { NextRequest, NextResponse } from 'next/server';
import { analyzeLabTrends } from '@/lib/openai';
import type { LabResult } from '@/types/medical';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { labData } = body as {
      labData: { date: string; results: LabResult[] }[];
    };

    if (!labData || labData.length === 0) {
      return NextResponse.json({
        success: true,
        trends: [],
        summary: 'No lab results found to analyze trends.',
      });
    }

    const validData = labData.filter(
      (entry) => entry.results && entry.results.length > 0
    );

    if (validData.length === 0) {
      return NextResponse.json({
        success: true,
        trends: [],
        summary: 'No lab results with data found to analyze.',
      });
    }

    const result = await analyzeLabTrends(validData);

    return NextResponse.json({
      success: true,
      trends: result.trends || [],
      summary: result.overallSummary || 'Analysis complete.',
    });
  } catch (error) {
    console.error('Trends analysis error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to analyze lab trends' },
      { status: 500 }
    );
  }
}
