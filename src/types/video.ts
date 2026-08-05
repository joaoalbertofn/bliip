import { SocialChannel } from './carousel';

export type TrackType = "video" | "subtitles" | "title_overlay" | "image_overlay" | "audio";

export type AnimationType = "fade_in" | "slide_up" | "zoom_in" | "typewriter" | "bounce" | "none";

export type BliipVideoTemplateCategory = 
  | "title_preset" 
  | "lower_third" 
  | "neon_banner" 
  | "tweet_card" 
  | "hook_3s" 
  | "subtitle_style";

export type BliipVideoTemplate = {
  id: string;
  version: "1.0";
  category: BliipVideoTemplateCategory;
  name: string;
  description?: string;
  thumbnailUrl?: string;
  defaultDurationSec: number;
  layout: {
    defaultPositionX: number; // % da largura (0 a 100)
    defaultPositionY: number; // % da altura (0 a 100)
    defaultWidth?: number;    // % da largura
    defaultScale?: number;
  };
  style: {
    fontFamily: string;
    fontSize: number;
    fontWeight?: string | number;
    color: string;
    backgroundColor?: string;
    borderRadius?: string;
    padding?: string;
    border?: string;
    borderLeft?: string;
    borderRight?: string;
    boxShadow?: string;
    backdropFilter?: string;
    textStroke?: string; // Ex: '2px #000000' para estilo Sticker (delisted.)
    highlightBg?: string; // Cor do marca-texto/caixa de destaque (ex: '#EF4444' ou '#FACC15')
    highlightTextColor?: string;
  };
  animation?: {
    enter: AnimationType;
    exit: AnimationType;
    durationMs: number;
  };
  assets?: {
    iconSvg?: string;
    backgroundImageUrl?: string;
  };
};

export type OverlayPosition = {
  x: number; // % na largura do canvas (0 a 100)
  y: number; // % na altura do canvas (0 a 100)
  scale: number; // Escala (0.5 a 3.0)
  width?: number; // Largura do container em px ou % para quebra de texto
  rotation?: number; // Rotação em graus
};

export type SubtitleWord = {
  id: string;
  word: string;
  start: number; // segundo inicial
  end: number;   // segundo final
};

export type MultiBarPresetStyle = 
  | "italo_black_white"   // Preto & Branco Invertido (Ítalo Nobre)
  | "caco_yellow_white"   // Amarelo Neon & Branco (cacoartfilm "PRODUÇÃO DE CONTEÚDO")
  | "ladeira_red_white"   // Vermelho Alerta & Branco (Leandro Ladeira)
  | "wagnner_blue_white"  // Azul Conversão & Branco (Wagnner Cavalcante)
  | "sticker_outlined";   // Contorno Sticker (delisted)

export type TrackItem = {
  id: string;
  trackType: TrackType;
  startTime: number; // Entrada em segundos (ex: 4.5)
  endTime: number;   // Saída em segundos (ex: 12.0)
  position: OverlayPosition;
  content: {
    text?: string;
    imageUrl?: string;
    presetStyle?: string;
    templateId?: string;
    multiBarPreset?: MultiBarPresetStyle;
    fontFamily?: string;
    tiltAngle?: number; // Ex: -3, 0, 3
    wordTimestamps?: SubtitleWord[];
    colors?: { primary: string; secondary: string; text: string };
    bgOpacity?: number; // Porcentagem de opacidade da camada escura de fundo (0 a 100)
  };
};

export type VerticalVideoProject = {
  id: string;
  name: string;
  videoUrl: string; // Blob URL ou URL do vídeo
  duration: number; // Duração total em segundos
  trimConfig: {
    startTime: number;
    endTime: number;
    muted: boolean;
  };
  hookConfig?: {
    enabled: boolean;
    text: string;
    style: "neon" | "bold_yellow" | "minimal";
    durationSec: number; // Padrão 3.0s
  };
  activeTrackItems: TrackItem[];
  postCaption: string; // Descrição/Legenda externa do post para redes sociais
  selectedChannels: SocialChannel[];
  aspectRatio: "9:16";
  createdAt: string;
  updatedAt: string;
};
