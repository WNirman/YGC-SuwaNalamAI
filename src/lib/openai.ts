// ============================================================
// MediScan AI — AI Client (Groq primary, OpenAI secondary, Gemini failover)
// Uses OpenAI-compatible SDK with Groq's endpoint + automatic Gemini failover
// ============================================================

import OpenAI from 'openai';
import {
  DOCUMENT_EXTRACTION_PROMPT,
  CROSS_CHECK_PROMPT,
  TREND_ANALYSIS_PROMPT,
  QA_PROMPT,
  SYSTEM_INSTRUCTION,
} from './prompts';
import * as geminiClient from './gemini';
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

// ============================================================
// Client Factory — Groq primary, OpenAI secondary, Gemini failover
// ============================================================

type ProviderKind = 'groq' | 'openai';

interface ModelClient {
  client: OpenAI;
  model: string;
  provider: ProviderKind;
}

function hasOpenAICompatibleKey(): boolean {
  return !!(process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY);
}

function hasGeminiKey(): boolean {
  return !!process.env.GEMINI_API_KEY;
}

function getVisionClient(): ModelClient {
  const groqKey = process.env.GROQ_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (groqKey) {
    return {
      client: new OpenAI({
        apiKey: groqKey,
        baseURL: 'https://api.groq.com/openai/v1',
        timeout: 25_000,
        maxRetries: 0,
      }),
      model: process.env.GROQ_VISION_MODEL || 'qwen/qwen3.8-27b',
      provider: 'groq',
    };
  }

  if (openaiKey) {
    return {
      client: new OpenAI({
        apiKey: openaiKey,
        timeout: 25_000,
        maxRetries: 0,
      }),
      model: process.env.OPENAI_VISION_MODEL || 'gpt-6.1-terra',
      provider: 'openai',
    };
  }

  throw new Error(
    'No AI API key found. Please set GROQ_API_KEY, OPENAI_API_KEY, or GEMINI_API_KEY in environment variables.'
  );
}

function getTextClient(): ModelClient {
  const groqKey = process.env.GROQ_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (groqKey) {
    return {
      client: new OpenAI({
        apiKey: groqKey,
        baseURL: 'https://api.groq.com/openai/v1',
        timeout: 25_000,
        maxRetries: 0,
      }),
      model: process.env.GROQ_TEXT_MODEL || 'openai/gpt-oss-120b',
      provider: 'groq',
    };
  }

  if (openaiKey) {
    return {
      client: new OpenAI({
        apiKey: openaiKey,
        timeout: 25_000,
        maxRetries: 0,
      }),
      model: process.env.OPENAI_TEXT_MODEL || 'gpt-6-luna',
      provider: 'openai',
    };
  }

  throw new Error(
    'No AI API key found. Please set GROQ_API_KEY, OPENAI_API_KEY, or GEMINI_API_KEY in environment variables.'
  );
}

/**
 * Run AI task with bidirectional failover:
 * - For Sinhala ('si') & Tamil ('ta') when GEMINI_API_KEY is available, prefer Gemini first
 *   (superior multilingual tokenization & native JSON mode, avoids repetition loops),
 *   failing over to Groq/OpenAI if Gemini fails.
 * - For English ('en'), prefer Groq/OpenAI first, failing over to Gemini on 429/5xx/parse errors.
 */
async function withProviderFailover<T>(
  taskName: string,
  language: string,
  primaryFn: () => Promise<T>,
  geminiFn: () => Promise<T>
): Promise<T> {
  const preferGemini = (language === 'si' || language === 'ta') && hasGeminiKey();

  if (preferGemini) {
    try {
      return await geminiFn();
    } catch (geminiError) {
      if (hasOpenAICompatibleKey()) {
        const reason = geminiError instanceof Error ? geminiError.message : String(geminiError);
        console.warn(`[AI] Gemini failed for ${taskName} (${reason}); failing over to Groq/OpenAI.`);
        return await primaryFn();
      }
      throw geminiError;
    }
  }

  if (!hasOpenAICompatibleKey()) {
    if (hasGeminiKey()) {
      return geminiFn();
    }
    throw new Error(
      'No AI API key found. Please set GROQ_API_KEY, OPENAI_API_KEY, or GEMINI_API_KEY in environment variables.'
    );
  }

  try {
    return await primaryFn();
  } catch (primaryError) {
    if (hasGeminiKey()) {
      const reason = primaryError instanceof Error ? primaryError.message : String(primaryError);
      console.warn(`[AI] Primary provider failed for ${taskName} (${reason}); failing over to Gemini.`);
      return await geminiFn();
    }
    throw primaryError;
  }
}

/**
 * Build provider/model-safe reasoning & temperature options.
 * - Groq qwen3.8-27b & OpenAI gpt-6.1-terra / gpt-6-luna support reasoning_effort: 'none' with temperature.
 * - Groq openai/gpt-oss-* only supports 'low' | 'medium' | 'high' (rejects 'none').
 */
function buildCompletionParams(
  provider: ProviderKind,
  model: string,
  temperature: number,
  maxCompletionTokens: number,
  jsonMode: boolean = true
): Record<string, unknown> {
  const lower = model.toLowerCase();
  const jsonOpt = jsonMode ? { response_format: { type: 'json_object' } } : {};

  if (provider === 'groq') {
    if (lower.includes('gpt-oss')) {
      return {
        model,
        max_completion_tokens: Math.max(maxCompletionTokens, 4096),
        temperature,
        frequency_penalty: 0.3,
        reasoning_effort: 'low',
        ...jsonOpt,
      };
    }
    if (lower.includes('qwen3')) {
      return {
        model,
        max_completion_tokens: maxCompletionTokens,
        temperature,
        reasoning_effort: 'none',
        ...jsonOpt,
      };
    }
    return {
      model,
      max_completion_tokens: maxCompletionTokens,
      temperature,
      ...jsonOpt,
    };
  }

  // OpenAI GPT-6+ models require reasoning_effort: 'none' to accept temperature
  if (lower.startsWith('gpt-6')) {
    return {
      model,
      max_completion_tokens: maxCompletionTokens,
      temperature,
      reasoning_effort: 'none',
      ...jsonOpt,
    };
  }

  return {
    model,
    max_completion_tokens: maxCompletionTokens,
    temperature,
    ...jsonOpt,
  };
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

  const langName =
    targetLanguage === 'si'
      ? 'Sinhala (සිංහල)'
      : targetLanguage === 'ta'
        ? 'Tamil (தமிழ்)'
        : 'English';

  try {
    return await withProviderFailover(
      'translateText',
      targetLanguage,
      async () => {
        const { client, model, provider } = getTextClient();
        const params = buildCompletionParams(provider, model, 0.1, 1024, false);
        const response = await client.chat.completions.create({
          ...(params as unknown as OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming),
          messages: [
            {
              role: 'system',
              content: `You are a professional medical translator. Translate the given text into ${langName}. Preserve medical terms, numbers, and drug names. Output ONLY the translated text without extra explanation.`,
            },
            { role: 'user', content: text },
          ],
        });
        return response.choices[0]?.message?.content?.trim() || text;
      },
      () => geminiClient.translateText(text, targetLanguage)
    );
  } catch (err) {
    console.error('Translation error:', err);
    return text;
  }
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
// Document Extraction (Images via Vision, PDFs via pdf-parse / Gemini)
// ============================================================

export async function extractDocumentData(
  fileBuffer: Buffer,
  mimeType: string,
  fileName: string,
  language: string = 'en',
  extractedPdfText?: string
): Promise<ExtractedData> {
  const langPrompt = getLanguageInstruction(language);

  return withProviderFailover(
    `extractDocumentData(${fileName})`,
    language,
    async () => {
      // Handle PDFs properly — neither Groq nor OpenAI image_url accepts application/pdf
      if (mimeType === 'application/pdf') {
        const pdfText = extractedPdfText?.trim() || '';

        if (pdfText.length >= 20) {
          const { client, model, provider } = getTextClient();
          console.log(
            `[AI] Extracting PDF text: ${fileName} (${pdfText.length} chars) using ${provider}/${model} (language: ${language})`
          );

          const params = buildCompletionParams(provider, model, 0.0, 4096);
          const response = await client.chat.completions.create({
            ...(params as unknown as OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming),
            messages: [
              {
                role: 'system',
                content:
                  'You are a medical JSON extraction engine. Output ONLY valid JSON matching the requested schema. DO NOT output <think> tags, reasoning, or explanations. Start your output directly with { and end with }.' +
                  langPrompt,
              },
              {
                role: 'user',
                content: `${DOCUMENT_EXTRACTION_PROMPT}${langPrompt}\n\nEXTRACTED PDF DOCUMENT TEXT:\n${pdfText.slice(0, 60000)}\n\nCRITICAL INSTRUCTION: Return ONLY the JSON object. Zero reasoning text. Zero <think> tags.`,
              },
            ],
          });

          const text = response.choices[0]?.message?.content ?? '';
          try {
            return parseAIResponse<ExtractedData>(text);
          } catch {
            console.error('Failed to parse PDF extraction response:', text.slice(0, 500));
            throw new Error(
              `Failed to parse document: ${fileName}. AI response was not valid JSON.`
            );
          }
        }

        // Scanned (image-only) PDF — throw so withGeminiFailover delegates to Gemini if configured
        throw new Error(
          `PDF "${fileName}" contains scanned images without selectable text. Please upload a PNG/JPG photo of the document, or configure GEMINI_API_KEY for scanned PDF support.`
        );
      }

      // Image extraction via Vision model
      const { client, model, provider } = getVisionClient();
      const base64Data = fileBuffer.toString('base64');
      const imageUrl = `data:${mimeType};base64,${base64Data}`;

      console.log(
        `[AI] Extracting document image: ${fileName} using ${provider}/${model} (language: ${language})`
      );

      const params = buildCompletionParams(provider, model, 0.0, 4096);
      const response = await client.chat.completions.create({
        ...(params as unknown as OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming),
        messages: [
          {
            role: 'system',
            content:
              'You are a medical JSON extraction engine. Output ONLY valid JSON matching the requested schema. DO NOT output <think> tags, reasoning, or explanations. Start your output directly with { and end with }.' +
              langPrompt,
          },
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: { url: imageUrl, detail: 'high' },
              },
              {
                type: 'text',
                text:
                  DOCUMENT_EXTRACTION_PROMPT +
                  langPrompt +
                  '\n\nCRITICAL INSTRUCTION: Return ONLY the JSON object. Zero reasoning text. Zero <think> tags.',
              },
            ],
          },
        ],
      });

      const text = response.choices[0]?.message?.content ?? '';
      console.log(`[AI] Raw extraction response for ${fileName}:`, text.slice(0, 300));

      try {
        return parseAIResponse<ExtractedData>(text);
      } catch {
        console.error('Failed to parse extraction response:', text.slice(0, 500));
        throw new Error(
          `Failed to parse document: ${fileName}. AI response was not valid JSON.`
        );
      }
    },
    () => geminiClient.extractDocumentData(fileBuffer, mimeType, fileName, language)
  );
}

// ============================================================
// Cross-Check Prescriptions (Text)
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
  const langPrompt = getLanguageInstruction(language);

  return withProviderFailover(
    'crossCheckPrescriptions',
    language,
    async () => {
      const { client, model, provider } = getTextClient();

      const prompt =
        CROSS_CHECK_PROMPT.replace('{PATIENT_DATA}', patientInfo)
          .replace('{MEDICATIONS_DATA}', JSON.stringify(allMedications, null, 2))
          .replace('{ALLERGIES_DATA}', JSON.stringify(allergies))
          .replace('{DIAGNOSES_DATA}', JSON.stringify(diagnoses)) + langPrompt;

      const params = buildCompletionParams(provider, model, 0.2, 4096);
      const response = await client.chat.completions.create({
        ...(params as unknown as OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming),
        messages: [
          { role: 'system', content: SYSTEM_INSTRUCTION + langPrompt },
          { role: 'user', content: prompt },
        ],
      });

      const text = response.choices[0]?.message?.content ?? '';
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
        console.error('Failed to parse cross-check response:', text.slice(0, 500));
        throw new Error('Unable to parse prescription cross-check response from AI. Please try again.');
      }
    },
    () =>
      geminiClient.crossCheckPrescriptions(
        allMedications,
        allergies,
        diagnoses,
        patientInfo,
        language
      )
  );
}

// ============================================================
// Lab Trend Analysis (Text)
// ============================================================

export async function analyzeLabTrends(
  labResults: { date: string; results: LabResult[] }[],
  language: string = 'en'
): Promise<{
  trends: LabTrend[];
  overallSummary: string;
}> {
  const langPrompt = getLanguageInstruction(language);

  return withProviderFailover(
    'analyzeLabTrends',
    language,
    async () => {
      const { client, model, provider } = getTextClient();

      const prompt =
        TREND_ANALYSIS_PROMPT.replace('{LAB_DATA}', JSON.stringify(labResults, null, 2)) +
        langPrompt;

      const params = buildCompletionParams(provider, model, 0.2, 4096);
      const response = await client.chat.completions.create({
        ...(params as unknown as OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming),
        messages: [
          { role: 'system', content: SYSTEM_INSTRUCTION + langPrompt },
          { role: 'user', content: prompt },
        ],
      });

      const text = response.choices[0]?.message?.content ?? '';
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
        console.error('Failed to parse trend analysis response:', text.slice(0, 500));
        throw new Error('Unable to parse lab trend analysis response from AI. Please try again.');
      }
    },
    () => geminiClient.analyzeLabTrends(labResults, language)
  );
}

// ============================================================
// Multi-Document Q&A (Text)
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
  const langPrompt = getLanguageInstruction(language);

  return withProviderFailover(
    'answerQuestion',
    language,
    async () => {
      const { client, model, provider } = getTextClient();

      const historyText = chatHistory
        .slice(-6)
        .map((msg) => `${msg.role}: ${msg.content}`)
        .join('\n');

      const prompt =
        QA_PROMPT.replace('{DOCUMENTS_DATA}', JSON.stringify(documentsData, null, 2))
          .replace('{QUESTION}', question)
          .replace('{CHAT_HISTORY}', historyText || 'No previous conversation') + langPrompt;

      const params = buildCompletionParams(provider, model, 0.3, 4096);
      const response = await client.chat.completions.create({
        ...(params as unknown as OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming),
        messages: [
          { role: 'system', content: SYSTEM_INSTRUCTION + langPrompt },
          { role: 'user', content: prompt },
        ],
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
          suggestedSpecialty?: string | null;
          urgencyHint?: UrgencyHint | 'not_applicable' | null;
        }>(text);
      } catch {
        console.error('Failed to parse Q&A response:', text.slice(0, 500));
        throw new Error('Unable to parse AI answer.');
      }
    },
    () => geminiClient.answerQuestion(question, documentsData, chatHistory, language)
  );
}
