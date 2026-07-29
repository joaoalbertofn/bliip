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
 * Valida se um tipo de conteúdo é permitido para o estilo de layout atual.
 * - 'comparison': Permite APENAS 'text_2_images'.
 * - Outros estilos ('twitter', 'immersive', 'news_article'): Permite apenas 'text_only' e 'text_1_image'.
 */
export function isContentTypeAllowed(layoutStyle: LayoutStyle, targetContentType: ContentType): boolean {
  if (layoutStyle === 'comparison') {
    return targetContentType === 'text_2_images';
  }
  return targetContentType !== 'text_2_images';
}

export function canChangeContentType(layoutStyle: LayoutStyle, targetContentType: ContentType): boolean {
  return isContentTypeAllowed(layoutStyle, targetContentType);
}

/**
 * Valida se o seletor de orientação das imagens (Horizontal vs Vertical) deve ficar ativo.
 * Ativo apenas para o estilo 'comparison' ou quando o conteúdo tiver 2 imagens ('text_2_images').
 */
export function canChangeOrientation(layoutStyle: LayoutStyle, contentType: ContentType): boolean {
  return layoutStyle === 'comparison' || contentType === 'text_2_images';
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
