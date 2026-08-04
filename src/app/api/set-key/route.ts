import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey } = body as { apiKey: string };

    if (apiKey === 'reset' || !apiKey || !apiKey.trim()) {
      delete process.env.OPENAI_API_KEY;
      return NextResponse.json({
        success: true,
        message: 'API key cleared successfully',
      });
    }

    // Store OpenAI key in process environment for this session
    process.env.OPENAI_API_KEY = apiKey.trim();

    return NextResponse.json({
      success: true,
      message: 'API key set successfully',
    });
  } catch (error) {
    console.error('Set key error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to set API key' },
      { status: 500 }
    );
  }
}
