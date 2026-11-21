// ============================================================
// MediScan AI — Gemini AI Client
// Supports multimodal extraction (including native PDFs) & text analysis
// ============================================================

import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import {
  DOCUMENT_EXTRACTION_PROMPT,
  CROSS_CHECK_PROMPT,
  TREND_ANALYSIS_PROMPT,
  QA_PROMPT,
  SYSTEM_INSTRUCTION,
} from './prompts';
import type {
  ExtractedData,
  DrugInteraction,
  LabTrend,
  ChatMessage,
  Medication,
  LabResult,
  AlertSeverity,
  UrgencyHint,
} from '@/types/medical';

// Initialize Gemini client (standard API key including AIza... and AQ... keys)
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set in environment variables');
  }

  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      timeout: 40_000,
    },
  });
}

const GEMINI_MODELS = Array.from(
  new Set([
    process.env.GEMINI_MODEL || 'gemini-3.5-flash',
    'gemini-3.5-flash-lite',
    'gemini-3.8-flash',
  ])
);

async function generateWithFallback(
  ai: GoogleGenAI,
  params: Omit<Parameters<GoogleGenAI['models']['generateContent']>[0], 'model'>
) {
  let lastError: unknown;
  for (const model of GEMINI_MODELS) {
    try {
      return await ai.models.generateContent({
        ...params,
        model,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
          ...params.config,
        },
      });
    } catch (err) {
      lastError = err;
      const msg = (err instanceof Error ? err.message : String(err)).toLowerCase();
      const isTransient =
        msg.includes('503') ||
        msg.includes('504') ||
        msg.includes('unavailable') ||
        msg.includes('deadline_exceeded') ||
        msg.includes('429') ||
        msg.includes('resource_exhausted') ||
        msg.includes('high demand') ||
        msg.includes('timeout') ||
        msg.includes('timed out') ||
        msg.includes('aborted') ||
        msg.includes('fetch failed');
      if (!isTransient) throw err;
      console.warn(`[Gemini] ${model} failed (${msg.slice(0, 120)}), trying next fallback model...`);
    }
  }
  throw lastError;
}

function getLanguageInstruction(language?: string): string {
  if (language === 'si') {
    return '\n\nCRITICAL LANGUAGE INSTRUCTION: Provide ALL human-readable descriptions, explanations, summaries, notes, and recommendations strictly in Sinhala (සිංහල). Keep ALL JSON property keys and schema enum values (such as severity, type, urgencyHint, status, documentType, trendDirection, confidenceLevel, overallRiskLevel) strictly in English, and keep medication/lab names in standard medical form.';
  }
  if (language === 'ta') {
    return '\n\nCRITICAL LANGUAGE INSTRUCTION: Provide ALL human-readable descriptions, explanations, summaries, notes, and recommendations strictly in Tamil (தமிழ்). Keep ALL JSON property keys and schema enum values (such as severity, type, urgencyHint, status, documentType, trendDirection, confidenceLevel, overallRiskLevel) strictly in English, and keep medication/lab names in standard medical form.';
  }
  return '\n\nCRITICAL LANGUAGE INSTRUCTION: Provide all human-readable text in clear, patient-friendly English.';
}

export async function translateText(
  text: string,
  targetLanguage: string
): Promise<string> {
  if (!text || !text.trim() || targetLanguage === 'en') return text;
  const ai = getGeminiClient();
  const langName =
    targetLanguage === 'si'
      ? 'Sinhala (සිංහල)'
      : targetLanguage === 'ta'
        ? 'Tamil (தமிழ்)'
        : 'English';

  try {
    const response = await generateWithFallback(ai, {
      contents: [{ role: 'user', parts: [{ text }] }],
      config: {
        systemInstruction: `You are a professional medical translator. Translate the given text into ${langName}. Preserve medical terms, numbers, and drug names. Output ONLY the translated text without extra explanation.`,
        temperature: 0.1,
      },
    });
    return response.text?.trim() || text;
  } catch (err) {
    console.error('Gemini translation error:', err);
    return text;
  }
}

/**
 * Parse JSON from AI response, handling potential markdown code blocks or <think> tags
 */
function parseAIResponse<T>(text: string): T {
  let cleaned = text.trim();
  cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }

  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  cleaned = cleaned.trim();
  return JSON.parse(cleaned) as T;
}

// ============================================================
// Document Extraction (supports Images & PDFs natively)
// ============================================================

export async function extractDocumentData(
  fileBuffer: Buffer,
  mimeType: string,
  fileName: string,
  language: string = 'en'
): Promise<ExtractedData> {
  const ai = getGeminiClient();
  const langPrompt = getLanguageInstruction(language);
  const base64Data = fileBuffer.toString('base64');

  const response = await generateWithFallback(ai, {
    contents: [
      {
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType,
              data: base64Data,
            },
          },
          {
            text: DOCUMENT_EXTRACTION_PROMPT + langPrompt,
          },
        ],
      },
    ],
    config: {
      systemInstruction: SYSTEM_INSTRUCTION + langPrompt,
      temperature: 0.1,
      responseMimeType: 'application/json',
    },
  });

  const text = response.text ?? '';
  try {
    return parseAIResponse<ExtractedData>(text);
  } catch {
    console.error('Failed to parse Gemini extraction response:', text.slice(0, 500));
    throw new Error(`Failed to parse document: ${fileName}. The AI response was not valid JSON.`);
  }
}

// ============================================================
// Cross-Check Prescriptions
// ============================================================

export async function crossCheckPrescriptions(
  allMedications: Medication[],
  allergies: string[],
  diagnoses: string[],
  patientInfo: string,
  language: string = 'en'
): Promise<{
  interactions: DrugInteraction[];
  overallRiskLevel: AlertSeverity;
  summary: string;
}> {
  const ai = getGeminiClient();
  const langPrompt = getLanguageInstruction(language);

  const prompt =
    CROSS_CHECK_PROMPT.replace('{PATIENT_DATA}', patientInfo)
      .replace('{MEDICATIONS_DATA}', JSON.stringify(allMedications, null, 2))
      .replace('{ALLERGIES_DATA}', JSON.stringify(allergies))
      .replace('{DIAGNOSES_DATA}', JSON.stringify(diagnoses)) + langPrompt;

  const response = await generateWithFallback(ai, {
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ],
    config: {
      systemInstruction: SYSTEM_INSTRUCTION + langPrompt,
      temperature: 0.2,
      responseMimeType: 'application/json',
    },
  });

  const text = response.text ?? '';
  try {
    const parsed = parseAIResponse<{
      interactions?: DrugInteraction[];
      overallRiskLevel?: AlertSeverity;
      summary?: string;
    }>(text);

    const interactions = Array.isArray(parsed.interactions)
      ? parsed.interactions.map((interaction, index) => ({
        ...interaction,
        id: `interaction-${index}`,
        affectedDocuments: interaction.affectedDocuments || [],
      }))
      : [];

    return {
      interactions,
      overallRiskLevel: parsed.overallRiskLevel || 'info',
      summary: parsed.summary || 'Cross-check analysis complete.',
    };
  } catch {
    console.error('Failed to parse Gemini cross-check response:', text.slice(0, 500));
    throw new Error('Failed to parse prescription cross-check response from AI.');
  }
}

// ============================================================
// Lab Trend Analysis
// ============================================================

export async function analyzeLabTrends(
  labResults: { date: string; results: LabResult[] }[],
  language: string = 'en'
): Promise<{
  trends: LabTrend[];
  overallSummary: string;
}> {
  const ai = getGeminiClient();
  const langPrompt = getLanguageInstruction(language);

  const prompt =
    TREND_ANALYSIS_PROMPT.replace('{LAB_DATA}', JSON.stringify(labResults, null, 2)) + langPrompt;

  const response = await generateWithFallback(ai, {
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ],
    config: {
      systemInstruction: SYSTEM_INSTRUCTION + langPrompt,
      temperature: 0.2,
      responseMimeType: 'application/json',
    },
  });

  const text = response.text ?? '';
  try {
    const parsed = parseAIResponse<{
      trends?: LabTrend[];
      overallSummary?: string;
    }>(text);
    return {
      trends: Array.isArray(parsed.trends) ? parsed.trends : [],
      overallSummary: parsed.overallSummary || 'Lab trend analysis complete.',
    };
  } catch {
    console.error('Failed to parse Gemini trend analysis response:', text.slice(0, 500));
    throw new Error('Failed to parse lab trend analysis response from AI.');
  }
}

// ============================================================
// Multi-Document Q&A
// ============================================================

export async function answerQuestion(
  question: string,
  documentsData: ExtractedData[],
  chatHistory: ChatMessage[],
  language: string = 'en'
): Promise<{
  answer: string;
  confidenceScore: number;
  confidenceLevel: 'high' | 'medium' | 'low';
  sourceDocuments: string[];
  shouldConsultDoctor: boolean;
  isHighRisk: boolean;
  suggestedFollowUp: string[];
  suggestedSpecialty?: string | null;
  urgencyHint?: UrgencyHint | 'not_applicable' | null;
}> {
  const ai = getGeminiClient();
  const langPrompt = getLanguageInstruction(language);

  const historyText = chatHistory
    .slice(-6)
    .map((msg) => `${msg.role}: ${msg.content}`)
    .join('\n');

  const prompt =
    QA_PROMPT.replace('{DOCUMENTS_DATA}', JSON.stringify(documentsData, null, 2))
      .replace('{QUESTION}', question)
      .replace('{CHAT_HISTORY}', historyText || 'No previous conversation') + langPrompt;

  const response = await generateWithFallback(ai, {
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ],
    config: {
      systemInstruction: SYSTEM_INSTRUCTION + langPrompt,
      temperature: 0.3,
      responseMimeType: 'application/json',
    },
  });

  const text = response.text ?? '';
  try {
    return parseAIResponse<{
      answer: string;
      confidenceScore: number;
      confidenceLevel: 'high' | 'medium' | 'low';
      sourceDocuments: string[];
      shouldConsultDoctor: boolean;
      isHighRisk: boolean;
      suggestedFollowUp: string[];
      suggestedSpecialty?: string | null;
      urgencyHint?: UrgencyHint | 'not_applicable' | null;
    }>(text);
  } catch {
    console.error('Failed to parse Gemini Q&A response:', text.slice(0, 500));
    return {
      answer: 'I was unable to process your question. Please try rephrasing it.',
      confidenceScore: 0,
      confidenceLevel: 'low',
      sourceDocuments: [],
      shouldConsultDoctor: true,
      isHighRisk: false,
      suggestedFollowUp: [],
    };
  }
}
