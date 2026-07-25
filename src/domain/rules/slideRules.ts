import { ContentType, LayoutStyle } from '@/types/carousel';

export const FONT_SIZE_LIMITS = {
  MIN: 14,
  MAX: 48,
  DEFAULT: 20,
};

/**
 * Retorna a quantidade máxima de imagens permitidas para um tipo de conteúdo.
 */
export function getMaxImagesForContentType(contentType: ContentType): number {
  switch (contentType) {
    case 'text_2_images':
      return 2;
    case 'text_1_image':
      return 1;
    case 'text_only':
    default:
      return 0;
  }
}

/**
 * Valida se um estilo de layout permite a alteração de tipo de conteúdo.
 * Exemplo: O estilo 'comparison' (Comparativo) exige estritamente 'text_2_images'.
 */
export function canChangeContentType(layoutStyle: LayoutStyle, targetContentType: ContentType): boolean {
  if (layoutStyle === 'comparison' && targetContentType !== 'text_2_images') {
    return false;
  }
  return true;
}

/**
 * Clampa o tamanho da fonte em limites seguros (14px a 48px).
 */
export function validateFontSize(fontSize: number): number {
  if (typeof fontSize !== 'number' || isNaN(fontSize)) {
    return FONT_SIZE_LIMITS.DEFAULT;
  }
  return Math.max(FONT_SIZE_LIMITS.MIN, Math.min(FONT_SIZE_LIMITS.MAX, Math.round(fontSize)));
}
