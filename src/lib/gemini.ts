// ============================================================
// MediScan AI — Gemini AI Client
// ============================================================

import { GoogleGenAI } from '@google/genai';
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
} from '@/types/medical';

// Initialize Gemini client
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set in environment variables');
  }

  // If it's a Google Cloud OAuth access token (starts with AQ.), initialize with custom Authorization header
  if (apiKey.startsWith('AQ.')) {
    return new GoogleGenAI({
      apiKey: '', // Empty API key to avoid x-goog-api-key injection
      httpOptions: {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      },
    });
  }

  return new GoogleGenAI({ apiKey });
}

const MODEL_ID = 'gemini-1.5-flash';

/**
 * Parse JSON from AI response, handling potential markdown code blocks
 */
function parseAIResponse<T>(text: string): T {
  // Remove markdown code blocks if present
  let cleaned = text.trim();
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
// Document Extraction
// ============================================================

/**
 * Extract structured data from a medical document using Gemini's multimodal capabilities
 */
export async function extractDocumentData(
  fileBuffer: Buffer,
  mimeType: string,
  fileName: string
): Promise<ExtractedData> {
  const ai = getGeminiClient();

  // Convert buffer to base64 for Gemini
  const base64Data = fileBuffer.toString('base64');

  const response = await ai.models.generateContent({
    model: MODEL_ID,
    contents: [
      {
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data,
            },
          },
          {
            text: DOCUMENT_EXTRACTION_PROMPT,
          },
        ],
      },
    ],
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.1, // Low temperature for accurate extraction
    },
  });

  const text = response.text ?? '';
  try {
    return parseAIResponse<ExtractedData>(text);
  } catch {
    console.error('Failed to parse extraction response:', text);
    throw new Error(`Failed to parse document: ${fileName}. The AI response was not valid JSON.`);
  }
}

// ============================================================
// Cross-Check Prescriptions
// ============================================================

/**
 * Cross-check medications across all documents for interactions, duplicates, and conflicts
 */
export async function crossCheckPrescriptions(
  allMedications: Medication[],
  allergies: string[],
  diagnoses: string[],
  patientInfo: string
): Promise<{
  interactions: DrugInteraction[];
  overallRiskLevel: AlertSeverity;
  summary: string;
}> {
  const ai = getGeminiClient();

  const prompt = CROSS_CHECK_PROMPT
    .replace('{PATIENT_DATA}', patientInfo)
    .replace('{MEDICATIONS_DATA}', JSON.stringify(allMedications, null, 2))
    .replace('{ALLERGIES_DATA}', JSON.stringify(allergies))
    .replace('{DIAGNOSES_DATA}', JSON.stringify(diagnoses));

  const response = await ai.models.generateContent({
    model: MODEL_ID,
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ],
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.2,
    },
  });

  const text = response.text ?? '';
  try {
    const parsed = parseAIResponse<{
      interactions: DrugInteraction[];
      overallRiskLevel: AlertSeverity;
      summary: string;
    }>(text);

    // Add IDs to interactions
    parsed.interactions = parsed.interactions.map((interaction, index) => ({
      ...interaction,
      id: `interaction-${index}`,
      affectedDocuments: interaction.affectedDocuments || [],
    }));

    return parsed;
  } catch {
    console.error('Failed to parse cross-check response:', text);
    return {
      interactions: [],
      overallRiskLevel: 'info',
      summary: 'Unable to complete cross-check analysis. Please try again.',
    };
  }
}

// ============================================================
// Lab Trend Analysis
// ============================================================

/**
 * Analyze lab result trends across multiple visits
 */
export async function analyzeLabTrends(
  labResults: { date: string; results: LabResult[] }[]
): Promise<{
  trends: LabTrend[];
  overallSummary: string;
}> {
  const ai = getGeminiClient();

  const prompt = TREND_ANALYSIS_PROMPT
    .replace('{LAB_DATA}', JSON.stringify(labResults, null, 2));

  const response = await ai.models.generateContent({
    model: MODEL_ID,
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ],
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.2,
    },
  });

  const text = response.text ?? '';
  try {
    return parseAIResponse<{
      trends: LabTrend[];
      overallSummary: string;
    }>(text);
  } catch {
    console.error('Failed to parse trend analysis response:', text);
    return {
      trends: [],
      overallSummary: 'Unable to complete trend analysis. Please try again.',
    };
  }
}

// ============================================================
// Multi-Document Q&A
// ============================================================

/**
 * Answer follow-up questions using multi-document reasoning
 */
export async function answerQuestion(
  question: string,
  documentsData: ExtractedData[],
  chatHistory: ChatMessage[]
): Promise<{
  answer: string;
  confidenceScore: number;
  confidenceLevel: 'high' | 'medium' | 'low';
  sourceDocuments: string[];
  shouldConsultDoctor: boolean;
  isHighRisk: boolean;
  suggestedFollowUp: string[];
}> {
  const ai = getGeminiClient();

  // Build conversation history for context
  const historyText = chatHistory
    .slice(-6) // Last 6 messages for context
    .map((msg) => `${msg.role}: ${msg.content}`)
    .join('\n');

  const prompt = QA_PROMPT
    .replace('{DOCUMENTS_DATA}', JSON.stringify(documentsData, null, 2))
    .replace('{QUESTION}', question)
    .replace('{CHAT_HISTORY}', historyText || 'No previous conversation');

  const response = await ai.models.generateContent({
    model: MODEL_ID,
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ],
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.3,
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
    }>(text);
  } catch {
    console.error('Failed to parse Q&A response:', text);
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
