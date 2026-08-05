import { BusinessProfileQuiz, UserProfile } from '@/types/carousel';

export interface GenerateCaptionParams {
  contentType?: string;
  contextText: string;
  mediaUrls?: string[];
  businessProfile?: BusinessProfileQuiz;
  userProfile?: UserProfile;
  apiKey?: string;
}

export async function generateCaptionWithAI(params: GenerateCaptionParams): Promise<string> {
  const response = await fetch('/api/ai/caption', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Erro ${response.status} ao comunicar com a IA de legendas.`);
  }

  const data = await response.json();
  if (!data.caption) {
    throw new Error('Retorno inválido da IA de legendas.');
  }

  return data.caption;
}
