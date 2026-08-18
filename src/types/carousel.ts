import { SlideTheme } from '@/lib/themes';

export type ImageSource = 
  | { type: "upload"; url: string; mediaType?: "image" | "video" }
  | { type: "ai_generated"; provider: string; prompt: string; url: string; mediaType?: "image" | "video" }
  | { type: "meme"; templateId: string; url: string; mediaType?: "image" | "video" };

export type TextLayer = {
  id: string;
  content: string; // Suporta HTML com <mark> ou texto simples
  highlights?: { start: number; end: number }[];
  role: "body" | "quote" | "signature" | "dialogue" | "title";
};

export type VideoConfig = {
  duration?: number;
  startTime?: number;
  endTime?: number;
  muted?: boolean;
  loop?: boolean;
};

export type ImageMask = {
  id: string;
  x: number;       // Posição X em % (0 a 100)
  y: number;       // Posição Y em % (0 a 100)
  width: number;   // Largura em % (0 a 100)
  height: number;  // Altura em % (0 a 100)
  color: string;   // Cor de fundo da tarja (Hex/RGB/HSL)
  borderRadius?: number;
};

export type ImageLayer = {
  id: string;
  source: ImageSource;
  position: "top" | "bottom" | "center" | "background";
  title?: string;     // Rótulo da imagem (ex: "Antes", "Depois")
  scale?: number;     // Fator de zoom: 1.0 a 3.0 (default: 1.0)
  offsetX?: number;   // Deslocamento X em % (default: 0)
  offsetY?: number;   // Deslocamento Y em % (default: 0)
  videoConfig?: VideoConfig;
  masks?: ImageMask[];
};

export type ContentType = "text_only" | "text_1_image" | "text_2_images";
export type LayoutStyle = "twitter" | "immersive" | "news_article" | "comparison";

export type SlideStyleData = {
  contentType: ContentType;
  imageLayout?: "vertical" | "horizontal";
  title?: string;
  fontSize?: number;
  textAlignment?: "left" | "center" | "right";
  titleAlignment?: "left" | "center" | "right";
  background?: string;
  layers: {
    text?: TextLayer[];
    images?: ImageLayer[];
  };
};

export type Slide = {
  id: string;
  contentType: ContentType;
  layoutStyle: LayoutStyle;
  imageLayout?: "vertical" | "horizontal"; // Orientação para 2 imagens
  templateId?: string; // compatibilidade
  theme?: SlideTheme;
  title?: string;
  newsTitle?: string; // Manchete/Título de Notícia para layouts como news_article
  imageLabels?: string[]; // Rótulos para comparação (ex: ['Antes', 'Depois'])
  imageLabelAlignment?: "left" | "center" | "right"; // Alinhamento dos rótulos (esquerda, centro, direita)
  fontSize?: number; // Tamanho da fonte em px (ex: 14 a 48)
  textAlignment?: "left" | "center" | "right"; // Alinhamento do texto principal
  titleAlignment?: "left" | "center" | "right"; // Alinhamento do título da notícia
  layers: {
    text?: TextLayer[];
    images?: ImageLayer[];
  };
  background?: string;
  styleCache?: Partial<Record<LayoutStyle, SlideStyleData>>;
};

export type SocialChannel = 'instagram' | 'linkedin' | 'facebook' | 'tiktok' | 'youtube' | 'twitter';

export type SavedSlideTemplate = {
  id: string;
  name: string;
  createdAt: string;
  slide: Slide;
};

export type Carousel = {
  id: string;
  name: string;
  slides: Slide[];
  createdAt: string;
  updatedAt: string;
  status?: "draft" | "scheduled" | "sent" | "published";
  scheduledAt?: string; // Data e hora ISO de agendamento (ex: 2026-07-28T10:00:00.000Z)
  aspectRatio?: "4:5" | "1:1";
  mediaLibrary?: string[];
  caption?: string; // Legenda global do post (usada no Instagram, LinkedIn, etc)
  selectedChannels?: SocialChannel[]; // Canais selecionados para publicação
};

export type BusinessProfileQuiz = {
  niche?: string;                   // Nicho / Especialidade
  resultsDelivered?: string;         // Resultados que entrega
  audiencePainPoints?: string;      // Principais dores da audiência
  contentTypePreferences?: string[]; // Tipos de conteúdo desejados
  socialProofMediaTypes?: string;   // Provas sociais em imagem/vídeo disponíveis
  biggestClientPain?: string;        // Maior dor do cliente
  methodOrToolName?: string;         // Nome do método / framework / ferramenta
  methodHowItWorks?: string;        // Como funciona esse método / framework
  customSystemPrompt?: string;      // Prompt do Sistema Customizado da IA
};

export type PlannedContentIdea = {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  description: string;
  recommendedStyle: LayoutStyle;
  recommendedSlideCount: number;
  slidesContent?: { title?: string; bodyText: string; imageDescription?: string; contentType?: ContentType }[];
  caption?: string;
  status: 'planned' | 'created';
  carouselId?: string;
};

export type UserProfile = {
  name: string;
  avatarUrl: string;
  handle?: string;
  businessProfile?: BusinessProfileQuiz;
};

export type IntegrationConfig = {
  bufferApiKey?: string;
  bufferProfileId?: string;
  bufferWebhookUrl?: string;
  makeWebhookUrl?: string;
  apiKey?: string;
};
