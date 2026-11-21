import { NextRequest, NextResponse } from 'next/server';
import { answerQuestion } from '@/lib/openai';
import type { ExtractedData, ChatMessage, UrgencyHint } from '@/types/medical';
import { randomUUID } from 'crypto';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, documents, chatHistory, language } = body as {
      question: string;
      documents: ExtractedData[];
      chatHistory: ChatMessage[];
      language?: string;
    };

    if (!question || question.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'No question provided' },
        { status: 400 }
      );
    }

    if (!documents || documents.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No documents available. Please upload and analyze documents first.',
        },
        { status: 400 }
      );
    }

    const result = await answerQuestion(
      question,
      documents,
      chatHistory || [],
      language || 'en'
    );

    const validUrgency: UrgencyHint | undefined =
      result.urgencyHint === 'immediate' ||
        result.urgencyHint === 'this_week' ||
        result.urgencyHint === 'routine'
        ? result.urgencyHint
        : undefined;

    const message: ChatMessage = {
      id: randomUUID(),
      role: 'assistant',
      content: result.answer,
      timestamp: new Date().toISOString(),
      confidenceScore: result.confidenceScore,
      confidenceLevel: result.confidenceLevel,
      sourceDocuments: result.sourceDocuments,
      shouldConsultDoctor: result.shouldConsultDoctor,
      isHighRisk: result.isHighRisk,
      suggestedSpecialty: result.suggestedSpecialty || undefined,
      urgencyHint: validUrgency,
    };

    const suggestedQuestions = (result.suggestedFollowUp || []).map(
      (text: string) => ({
        text,
        category: 'general' as const,
      })
    );

    return NextResponse.json({
      success: true,
      message,
      suggestedQuestions,
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Failed to process question';
    console.error('Chat error:', error);
    return NextResponse.json(
      { success: false, error: errMsg },
      { status: 500 }
    );
  }
}
