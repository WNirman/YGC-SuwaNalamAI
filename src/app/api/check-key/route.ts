import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

// Return true if either Groq or OpenAI key is configured
export async function GET() {
  const hasKey = !!(process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY);
  return NextResponse.json({ hasKey });
}
