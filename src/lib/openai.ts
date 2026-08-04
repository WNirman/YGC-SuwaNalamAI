// ============================================================
// MediScan AI — AI Client (Groq primary, OpenAI fallback)
// Uses OpenAI-compatible SDK with Groq's endpoint
// ============================================================

import OpenAI from 'openai';
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

// ============================================================
// Client Factory — Groq preferred (free), OpenAI as fallback
// ============================================================

function getVisionClient(): { client: OpenAI; model: string } {
  const groqKey = process.env.GROQ_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  // Use Groq if key is available (free, fast, vision support)
  if (groqKey) {
    return {
      client: new OpenAI({
        apiKey: groqKey,
        baseURL: 'https://api.groq.com/openai/v1',
      }),
      // /no-cot disables Qwen's chain-of-thought <think> blocks
      model: 'qwen/qwen3.6-27b',
    };
  }

  // Fallback to OpenAI GPT-4o
  if (openaiKey) {
    return {
      client: new OpenAI({ apiKey: openaiKey }),
      model: 'gpt-4o',
    };
  }

  throw new Error(
    'No AI API key found. Please set GROQ_API_KEY or OPENAI_API_KEY in .env.local'
  );
}

function getTextClient(): { client: OpenAI; model: string } {
  const groqKey = process.env.GROQ_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (groqKey) {
    return {
      client: new OpenAI({
        apiKey: groqKey,
        baseURL: 'https://api.groq.com/openai/v1',
      }),
      model: 'llama-3.3-70b-versatile',
    };
  }

  if (openaiKey) {
    return {
      client: new OpenAI({ apiKey: openaiKey }),
      model: 'gpt-4o-mini',
    };
  }

  throw new Error(
    'No AI API key found. Please set GROQ_API_KEY or OPENAI_API_KEY in .env.local'
  );
}

// ============================================================
// JSON Parser
// ============================================================

function parseAIResponse<T>(text: string): T {
  let cleaned = text.trim();

  // Strip any closed <think>...</think> blocks
  cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

  // Handle unclosed <think> tag if present
  if (cleaned.includes('<think>')) {
    const thinkStart = cleaned.indexOf('<think>');
    const jsonStart = cleaned.indexOf('{', thinkStart);
    if (jsonStart !== -1) {
      cleaned = cleaned.slice(jsonStart);
    }
  }

  // Isolate outer JSON object ({ ... })
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');

  if (firstBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }

  // Strip markdown code fences if present
  if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
  else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
  if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
  cleaned = cleaned.trim();

  return JSON.parse(cleaned) as T;
}

// ============================================================
// Document Extraction (Vision — reads the actual image)
// ============================================================

export async function extractDocumentData(
  fileBuffer: Buffer,
  mimeType: string,
  fileName: string
): Promise<ExtractedData> {
  const { client, model } = getVisionClient();

  // Convert buffer to base64 inline data URL
  const base64Data = fileBuffer.toString('base64');
  const imageUrl = `data:${mimeType};base64,${base64Data}`;

  console.log(`[AI] Extracting document: ${fileName} using model: ${model}`);

  const response = await client.chat.completions.create({
    model,
    max_tokens: 4096,
    messages: [
      {
        role: 'system',
        content: 'You are a medical JSON extraction engine. Output ONLY valid JSON matching the requested schema. DO NOT output <think> tags, reasoning, or explanations. Start your output directly with { and end with }.',
      },
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: imageUrl, detail: 'low' },
          },
          {
            type: 'text',
            text: DOCUMENT_EXTRACTION_PROMPT + '\n\nCRITICAL INSTRUCTION: Return ONLY the JSON object. Zero reasoning text. Zero <think> tags.',
          },
        ],
      },
    ],
    temperature: 0.0, // Set to 0.0 for deterministic JSON extraction
  });

  const text = response.choices[0]?.message?.content ?? '';
  console.log(`[AI] Raw extraction response for ${fileName}:`, text.slice(0, 300));

  try {
    return parseAIResponse<ExtractedData>(text);
  } catch (err) {
    console.error('Failed to parse extraction response:', text.slice(0, 500));
    throw new Error(
      `Failed to parse document: ${fileName}. AI response was not valid JSON.`
    );
  }
}

// ============================================================
// Cross-Check Prescriptions (Text)
// ============================================================

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
  const { client, model } = getTextClient();

  const prompt = CROSS_CHECK_PROMPT
    .replace('{PATIENT_DATA}', patientInfo)
    .replace('{MEDICATIONS_DATA}', JSON.stringify(allMedications, null, 2))
    .replace('{ALLERGIES_DATA}', JSON.stringify(allergies))
    .replace('{DIAGNOSES_DATA}', JSON.stringify(diagnoses));

  const response = await client.chat.completions.create({
    model,
    max_tokens: 2048,
    messages: [
      { role: 'system', content: SYSTEM_INSTRUCTION },
      { role: 'user', content: prompt },
    ],
    temperature: 0.2,
  });

  const text = response.choices[0]?.message?.content ?? '';
  try {
    const parsed = parseAIResponse<{
      interactions: DrugInteraction[];
      overallRiskLevel: AlertSeverity;
      summary: string;
    }>(text);

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
// Lab Trend Analysis (Text)
// ============================================================

export async function analyzeLabTrends(
  labResults: { date: string; results: LabResult[] }[]
): Promise<{
  trends: LabTrend[];
  overallSummary: string;
}> {
  const { client, model } = getTextClient();

  const prompt = TREND_ANALYSIS_PROMPT
    .replace('{LAB_DATA}', JSON.stringify(labResults, null, 2));

  const response = await client.chat.completions.create({
    model,
    max_tokens: 2048,
    messages: [
      { role: 'system', content: SYSTEM_INSTRUCTION },
      { role: 'user', content: prompt },
    ],
    temperature: 0.2,
  });

  const text = response.choices[0]?.message?.content ?? '';
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
// Multi-Document Q&A (Text)
// ============================================================

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
  const { client, model } = getTextClient();

  const historyText = chatHistory
    .slice(-6)
    .map((msg) => `${msg.role}: ${msg.content}`)
    .join('\n');

  const prompt = QA_PROMPT
    .replace('{DOCUMENTS_DATA}', JSON.stringify(documentsData, null, 2))
    .replace('{QUESTION}', question)
    .replace('{CHAT_HISTORY}', historyText || 'No previous conversation');

  const response = await client.chat.completions.create({
    model,
    max_tokens: 2048,
    messages: [
      { role: 'system', content: SYSTEM_INSTRUCTION },
      { role: 'user', content: prompt },
    ],
    temperature: 0.3,
  });

  const text = response.choices[0]?.message?.content ?? '';
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
