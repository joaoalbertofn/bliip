export type SlideTheme = 'light' | 'dark' | 'navy' | 'sepia' | 'emerald';

export interface ThemeConfig {
  id: SlideTheme;
  name: string;
  bg: string;             // Cor de fundo do slide
  text: string;           // Cor do texto principal (corpo)
  textSecondary: string;  // Cor do handle (@perfil) e marcas d'água
  speakerBg: string;      // Fundo do nome do locutor em diálogos
  speakerText: string;    // Cor do texto do locutor
  markBg: string;         // Cor do fundo do marcador <mark>
  markText: string;       // Cor do texto dentro do marcador <mark>
  cardBg: string;         // Cor de fundo do card interno ou container de foto
  borderColor: string;    // Cor de bordas sutis
}

export const SLIDE_THEMES: Record<SlideTheme, ThemeConfig> = {
  light: {
    id: 'light',
    name: 'Claro Clássico',
    bg: '#ffffff',
    text: '#0f172a',
    textSecondary: '#64748b',
    speakerBg: '#e0e7ff',
    speakerText: '#3730a3',
    markBg: '#fef08a',
    markText: '#0f172a',
    cardBg: '#f8fafc',
    borderColor: '#e2e8f0',
  },
  dark: {
    id: 'dark',
    name: 'Escuro Profundo',
    bg: '#0f172a',
    text: '#f8fafc',
    textSecondary: '#94a3b8',
    speakerBg: '#1e293b',
    speakerText: '#818cf8',
    markBg: '#fef08a',
    markText: '#0f172a',
    cardBg: '#1e293b',
    borderColor: '#334155',
  },
  navy: {
    id: 'navy',
    name: 'Azul Noturno',
    bg: '#1e293b',
    text: '#f1f5f9',
    textSecondary: '#94a3b8',
    speakerBg: '#0f172a',
    speakerText: '#93c5fd',
    markBg: '#38bdf8',
    markText: '#0f172a',
    cardBg: '#0f172a',
    borderColor: '#334155',
  },
  sepia: {
    id: 'sepia',
    name: 'Sépia Editorial',
    bg: '#fef3c7',
    text: '#78350f',
    textSecondary: '#b45309',
    speakerBg: '#fde68a',
    speakerText: '#92400e',
    markBg: '#fde047',
    markText: '#78350f',
    cardBg: '#fef3c7',
    borderColor: '#fcd34d',
  },
  emerald: {
    id: 'emerald',
    name: 'Verde Minimalista',
    bg: '#022c22',
    text: '#ecfdf5',
    textSecondary: '#6ee7b7',
    speakerBg: '#064e3b',
    speakerText: '#a7f3d0',
    markBg: '#34d399',
    markText: '#022c22',
    cardBg: '#064e3b',
    borderColor: '#065f46',
  },
};

export function getSlideTheme(themeId?: SlideTheme | string, fallbackBg?: string): ThemeConfig {
  if (themeId && themeId in SLIDE_THEMES) {
    return SLIDE_THEMES[themeId as SlideTheme];
  }
  // Mapeamento defensivo se `background` antigo for hexadecimal
  if (fallbackBg) {
    const bgLower = fallbackBg.toLowerCase();
    if (bgLower === '#0f172a' || bgLower === '#000000' || bgLower === '#111827') return SLIDE_THEMES.dark;
    if (bgLower === '#1e293b' || bgLower === '#1d4ed8') return SLIDE_THEMES.navy;
    if (bgLower === '#fef3c7' || bgLower === '#fffbeb') return SLIDE_THEMES.sepia;
    if (bgLower === '#022c22' || bgLower === '#064e3b') return SLIDE_THEMES.emerald;
  }
  return SLIDE_THEMES.light;
}
