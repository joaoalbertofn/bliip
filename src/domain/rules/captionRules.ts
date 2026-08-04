import { SocialChannel } from '@/types/carousel';

export const SOCIAL_CAPTION_LIMITS: Record<SocialChannel, number> = {
  instagram: 2200,
  linkedin: 3000,
  facebook: 63206,
  tiktok: 2200,
  youtube: 5000,
  twitter: 280,
};

export interface CaptionValidationResult {
  isValid: boolean;
  length: number;
  limit: number;
  exceededBy: number;
}

/**
 * Valida a legenda para uma rede social específica.
 */
export function validateCaptionForChannel(caption: string, channel: SocialChannel): CaptionValidationResult {
  const text = caption || '';
  const limit = SOCIAL_CAPTION_LIMITS[channel] || 2200;
  const length = text.length;
  const exceededBy = Math.max(0, length - limit);

  return {
    isValid: length <= limit,
    length,
    limit,
    exceededBy,
  };
}

/**
 * Extrai hashtags válidas de um texto de legenda.
 */
export function extractHashtags(caption: string): string[] {
  if (!caption) return [];
  const matches = caption.match(/#[a-zA-Z0-9_áàâãéèêíïóôõöúçÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇ]+/g);
  if (!matches) return [];
  return Array.from(new Set(matches));
}
