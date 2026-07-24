import { SlideTheme } from '@/lib/themes';

export type ImageSource = 
  | { type: "upload"; url: string }
  | { type: "ai_generated"; provider: string; prompt: string; url: string }
  | { type: "meme"; templateId: string; url: string };

export type TextLayer = {
  id: string;
  content: string; // Suporta HTML com <mark> ou texto simples
  highlights?: { start: number; end: number }[];
  role: "body" | "quote" | "signature" | "dialogue" | "title";
};

export type ImageLayer = {
  id: string;
  source: ImageSource;
  position: "top" | "bottom" | "center" | "background";
  scale?: number;     // Fator de zoom: 1.0 a 3.0 (default: 1.0)
  offsetX?: number;   // Deslocamento X em % (default: 0)
  offsetY?: number;   // Deslocamento Y em % (default: 0)
};

export type ContentType = "text_only" | "text_1_image" | "text_2_images";
export type LayoutStyle = "twitter" | "immersive" | "comparison" | "news_article";

export type Slide = {
  id: string;
  contentType: ContentType;
  layoutStyle: LayoutStyle;
  imageLayout?: "vertical" | "horizontal"; // Orientação para 2 imagens
  templateId?: string; // compatibilidade
  theme?: SlideTheme;
  title?: string;
  fontSize?: number; // Tamanho da fonte em px (ex: 14 a 48)
  layers: {
    text?: TextLayer[];
    images?: ImageLayer[];
  };
  background?: string;
};

export type Carousel = {
  id: string;
  name: string;
  slides: Slide[];
  createdAt: string;
  updatedAt: string;
  status?: "draft" | "sent";
  aspectRatio?: "4:5" | "1:1";
};

export type UserProfile = {
  name: string;
  avatarUrl: string;
  handle?: string;
};

export type IntegrationConfig = {
  bufferApiKey?: string;
  bufferProfileId?: string;
  bufferWebhookUrl?: string;
  makeWebhookUrl?: string;
  apiKey?: string;
};
