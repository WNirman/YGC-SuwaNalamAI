import { NextRequest, NextResponse } from 'next/server';
import { answerQuestion } from '@/lib/openai';
import type { ExtractedData, ChatMessage } from '@/types/medical';
import { randomUUID } from 'crypto';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, documents, chatHistory } = body as {
      question: string;
      documents: ExtractedData[];
      chatHistory: ChatMessage[];
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
      chatHistory || []
    );

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
    console.error('Chat error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process question' },
      { status: 500 }
    );
  }
}
