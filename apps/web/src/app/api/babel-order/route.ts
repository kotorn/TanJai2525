import { NextRequest, NextResponse } from 'next/server';
import { apiGuard } from '@/lib/api-auth';
import { translateText } from '@/lib/translate';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  // Security Guard
  const guardResult = apiGuard(req);
  if (guardResult) return guardResult;

  try {
    const { text, targetLang } = await req.json();

    if (!text || !targetLang) {
      return NextResponse.json({ error: 'Missing text or targetLang' }, { status: 400 });
    }

    // Use Real Translation Service
    const translatedText = await translateText(text, targetLang);

    logger.info('Babel Translation Successful', { original: text, translated: translatedText, targetLang });

    return NextResponse.json({ original: text, translated: translatedText, targetLang });
  } catch (error: any) {
    logger.error('Translation error', { error: error.message });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
