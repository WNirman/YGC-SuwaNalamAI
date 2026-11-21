import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

// Return true if any supported AI provider key is configured
export async function GET() {
  const providers = {
    groq: !!process.env.GROQ_API_KEY,
    openai: !!process.env.OPENAI_API_KEY,
    gemini: !!process.env.GEMINI_API_KEY,
    googleMaps: !!process.env.GOOGLE_MAPS_API_KEY,
  };
  const hasKey = providers.groq || providers.openai || providers.gemini;
  return NextResponse.json({ hasKey, providers });
}
