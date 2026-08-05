import { BliipVideoTemplate } from '@/types/video';

export const DEFAULT_VIDEO_TEMPLATES: BliipVideoTemplate[] = [
  // 1. ÍTALO NOBRE (Preto & Branco Invertido com Sombra de Profundidade)
  {
    id: 'italo_black_white',
    version: '1.0',
    category: 'hook_3s',
    name: 'Ítalo Nobre (Preto & Branco)',
    description: 'Barras duplas invertidas em Preto e Branco de alto contraste com sombra',
    defaultDurationSec: 4.0,
    layout: {
      defaultPositionX: 50,
      defaultPositionY: 30,
      defaultWidth: 90,
      defaultScale: 1.0,
    },
    style: {
      fontFamily: 'Impact, sans-serif',
      fontSize: 28,
      fontWeight: 900,
      color: '#FFFFFF',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.75)',
    },
    animation: {
      enter: 'zoom_in',
      exit: 'fade_in',
      durationMs: 300,
    },
  },

  // 2. CACOARTFILM (Amarelo Neon & Branco - "PRODUÇÃO DE CONTEÚDO")
  {
    id: 'caco_yellow_white',
    version: '1.0',
    category: 'title_preset',
    name: 'cacoartfilm (Amarelo & Branco)',
    description: 'Barras duplas Amarela e Branca estilo PRODUÇÃO DE CONTEÚDO',
    defaultDurationSec: 5.0,
    layout: {
      defaultPositionX: 50,
      defaultPositionY: 35,
      defaultWidth: 88,
      defaultScale: 1.0,
    },
    style: {
      fontFamily: 'Impact, sans-serif',
      fontSize: 28,
      fontWeight: 900,
      color: '#0F172A',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.75)',
    },
    animation: {
      enter: 'slide_up',
      exit: 'fade_in',
      durationMs: 350,
    },
  },

  // 3. LEANDRO LADEIRA (Vermelho Alerta & Branco)
  {
    id: 'ladeira_red_white',
    version: '1.0',
    category: 'hook_3s',
    name: 'Ladeira (Vermelho & Branco)',
    description: 'Barras duplas Vermelha e Branca de alta urgência/retenção',
    defaultDurationSec: 4.0,
    layout: {
      defaultPositionX: 50,
      defaultPositionY: 30,
      defaultWidth: 88,
      defaultScale: 1.0,
    },
    style: {
      fontFamily: 'Impact, sans-serif',
      fontSize: 28,
      fontWeight: 900,
      color: '#FFFFFF',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.75)',
    },
    animation: {
      enter: 'bounce',
      exit: 'fade_in',
      durationMs: 400,
    },
  },

  // 4. ALI ABDAAL MARCA-TEXTO ("and how to fix it.")
  {
    id: 'ali_abdaal_highlight',
    version: '1.0',
    category: 'title_preset',
    name: 'Ali Abdaal (Marca-Texto)',
    description: 'Palavra-chave em destaque com Marca-Texto Amarelo Neon',
    defaultDurationSec: 5.0,
    layout: {
      defaultPositionX: 50,
      defaultPositionY: 40,
      defaultWidth: 85,
      defaultScale: 1.0,
    },
    style: {
      fontFamily: 'Montserrat, sans-serif',
      fontSize: 26,
      fontWeight: 900,
      color: '#FFFFFF',
    },
    animation: {
      enter: 'zoom_in',
      exit: 'fade_in',
      durationMs: 300,
    },
  },

  // 5. SABRINA RIGUETTE NEON BADGES ("R$ 1 MM -> R$ 3.6 MM")
  {
    id: 'neon_badges',
    version: '1.0',
    category: 'hook_3s',
    name: 'Neon Badges (R$ 1 MM)',
    description: 'Pílulas Neon Vermelho & Verde com brilho para comparações',
    defaultDurationSec: 5.0,
    layout: {
      defaultPositionX: 50,
      defaultPositionY: 25,
      defaultWidth: 90,
      defaultScale: 1.0,
    },
    style: {
      fontFamily: 'Montserrat, sans-serif',
      fontSize: 20,
      fontWeight: 900,
      color: '#FFFFFF',
    },
    animation: {
      enter: 'bounce',
      exit: 'fade_in',
      durationMs: 350,
    },
  },

  // 6. WAGNNER CAVALCANTE (Azul Conversão & Branco)
  {
    id: 'wagnner_blue_white',
    version: '1.0',
    category: 'title_preset',
    name: 'Wagnner (Azul & Branco)',
    description: 'Barras duplas Azul e Branca estilo estudo de caso',
    defaultDurationSec: 6.0,
    layout: {
      defaultPositionX: 50,
      defaultPositionY: 20,
      defaultWidth: 92,
      defaultScale: 1.0,
    },
    style: {
      fontFamily: 'Montserrat, sans-serif',
      fontSize: 24,
      fontWeight: 800,
      color: '#FFFFFF',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.75)',
    },
    animation: {
      enter: 'slide_up',
      exit: 'fade_in',
      durationMs: 350,
    },
  },

  // 7. STICKER OUTLINED (Rocket Sloth "delisted.")
  {
    id: 'sticker_outlined',
    version: '1.0',
    category: 'title_preset',
    name: 'Sticker Outlined (delisted.)',
    description: 'Texto bold branco com contorno preto espesso estilo adesivo',
    defaultDurationSec: 5.0,
    layout: {
      defaultPositionX: 50,
      defaultPositionY: 45,
      defaultWidth: 90,
      defaultScale: 1.1,
    },
    style: {
      fontFamily: 'Impact, sans-serif',
      fontSize: 34,
      fontWeight: 900,
      color: '#FFFFFF',
      textStroke: '3px #000000',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.7)',
    },
    animation: {
      enter: 'zoom_in',
      exit: 'fade_in',
      durationMs: 300,
    },
  },

  // 8. LOWER THIRD PROFISSIONAL
  {
    id: 'title_lower_third',
    version: '1.0',
    category: 'lower_third',
    name: 'Lower Third Profissional',
    description: 'Tarja discreta de rodapé para identificação de criador',
    defaultDurationSec: 5.0,
    layout: {
      defaultPositionX: 50,
      defaultPositionY: 78,
      defaultWidth: 80,
      defaultScale: 1.0,
    },
    style: {
      fontFamily: 'Montserrat, sans-serif',
      fontSize: 15,
      fontWeight: 700,
      color: '#F1F5F9',
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      borderRadius: '8px',
      padding: '10px 18px',
      borderLeft: '4px solid #6366F1',
    },
    animation: {
      enter: 'slide_up',
      exit: 'fade_in',
      durationMs: 300,
    },
  },

  // 9. LEGENDAS HORMOZI (AMARELO)
  {
    id: 'sub_style_hormozi_yellow',
    version: '1.0',
    category: 'subtitle_style',
    name: 'Legendas Hormozi (Amarelo)',
    description: 'Palavra ativa destacada em Amarelo Neon centralizada no vídeo',
    defaultDurationSec: 60.0,
    layout: {
      defaultPositionX: 50,
      defaultPositionY: 68,
      defaultWidth: 80,
      defaultScale: 1.0,
    },
    style: {
      fontFamily: 'Outfit, sans-serif',
      fontSize: 24,
      fontWeight: 900,
      color: '#FFFFFF',
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      borderRadius: '10px',
      padding: '10px 16px',
    },
  },
];
