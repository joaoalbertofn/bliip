export const CAROUSEL_LIMITS = {
  MIN_SLIDES: 1,
  MAX_SLIDES: 15,
};

/**
 * Valida se um slide pode ser excluído (um carrossel precisa manter ao menos 1 slide).
 */
export function canDeleteSlide(currentSlideCount: number): boolean {
  return currentSlideCount > CAROUSEL_LIMITS.MIN_SLIDES;
}

/**
 * Valida se um novo slide pode ser adicionado ao carrossel.
 */
export function canAddSlide(currentSlideCount: number): boolean {
  return currentSlideCount < CAROUSEL_LIMITS.MAX_SLIDES;
}
