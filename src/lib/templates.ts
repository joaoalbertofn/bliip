import { Slide, ContentType, LayoutStyle } from '@/types/carousel';
import { DEFAULT_STUDENT_FRAMEWORKS } from '@/config/defaultContent';

export interface ContentTypeDefinition {
  id: ContentType;
  name: string;
  description: string;
  maxImages: number;
}

export interface LayoutStyleDefinition {
  id: LayoutStyle;
  name: string;
  description: string;
}

export const CONTENT_TYPES: Record<ContentType, ContentTypeDefinition> = {
  text_only: {
    id: 'text_only',
    name: 'Apenas Texto',
    description: 'Sem imagens, foco em parágrafos, diálogos ou citações.',
    maxImages: 0,
  },
  text_1_image: {
    id: 'text_1_image',
    name: 'Texto + 1 Imagem',
    description: '1 foto ou print com texto explicativo.',
    maxImages: 1,
  },
  text_2_images: {
    id: 'text_2_images',
    name: 'Texto + 2 Imagens',
    description: 'Até 2 imagens/gráficos (dispostas na vertical ou horizontal).',
    maxImages: 2,
  },
};

export const LAYOUT_STYLES: Record<LayoutStyle, LayoutStyleDefinition> = {
  twitter: {
    id: 'twitter',
    name: 'Twitter',
    description: 'Fundo claro com cabeçalho de perfil, selo azul e suporte a texto, 1 ou 2 imagens.',
  },
  immersive: {
    id: 'immersive',
    name: 'Immersive',
    description: 'Imagens ou fundo em tela cheia, círculo de perfil badge e tipografia marcante.',
  },
  news_article: {
    id: 'news_article',
    name: 'Notícia',
    description: 'Visual editorial estilo manchete de notícias de mercado com destaques.',
  },
  comparison: {
    id: 'comparison',
    name: 'Comparativo',
    description: 'Ideal para comparações (Antes/Depois ou Primeiro/Depois) com rótulos de fotos.',
  },
};

// Aliases para compatibilidade
export const TEMPLATES: Record<string, { id: string; name: string; maxImages: number }> = {
  template_a: { id: 'template_a', name: 'Somente Texto', maxImages: 0 },
  template_b: { id: 'template_b', name: 'Texto + 1 Imagem', maxImages: 1 },
  template_c: { id: 'template_c', name: 'Texto + 2 Imagens', maxImages: 2 },
  template_d: { id: 'template_d', name: 'Citação / Imersivo', maxImages: 1 },
};

export function createSlide(
  contentType: ContentType = 'text_1_image',
  layoutStyle: LayoutStyle = 'twitter',
  referenceSlide?: Partial<Slide>
): Slide {
  const slideId = `slide_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const inheritedTheme = referenceSlide?.theme;
  const inheritedBackground = referenceSlide?.background;
  const inheritedFontSize = referenceSlide?.fontSize;
  const inheritedImageLayout = referenceSlide?.imageLayout;

  // 1. FORMATO NOTÍCIA (Estudo do Google - manchete + foto de relatório/mercado)
  if (layoutStyle === 'news_article') {
    const isTextOnly = contentType === 'text_only';
    return {
      id: slideId,
      contentType: isTextOnly ? 'text_only' : 'text_1_image',
      layoutStyle: 'news_article',
      background: inheritedBackground || '#ffffff',
      theme: inheritedTheme,
      fontSize: inheritedFontSize,
      layers: {
        text: [
          {
            id: `text_1`,
            role: 'body',
            content: DEFAULT_STUDENT_FRAMEWORKS.googleNewsStudy.bodyText,
          },
        ],
        images: isTextOnly
          ? []
          : [
              {
                id: `img_1`,
                position: 'center',
                source: {
                  type: 'upload',
                  url: DEFAULT_STUDENT_FRAMEWORKS.googleNewsStudy.imageUrl,
                },
              },
            ],
      },
    };
  }

  // 2. FORMATO COMPARATIVO (Profissional Visível vs Invisível - 2 fotos)
  if (layoutStyle === 'comparison') {
    return {
      id: slideId,
      contentType: 'text_2_images',
      layoutStyle: 'comparison',
      imageLayout: inheritedImageLayout || 'vertical',
      background: inheritedBackground || '#ffffff',
      theme: inheritedTheme,
      fontSize: inheritedFontSize,
      layers: {
        text: [
          {
            id: `text_1`,
            role: 'body',
            content: DEFAULT_STUDENT_FRAMEWORKS.visibilityComparison.bodyText,
          },
        ],
        images: [
          {
            id: `img_1`,
            position: 'top',
            title: 'Antes',
            source: {
              type: 'upload',
              url: DEFAULT_STUDENT_FRAMEWORKS.visibilityComparison.imageUrl1!,
            },
          },
          {
            id: `img_2`,
            position: 'bottom',
            title: 'Depois',
            source: {
              type: 'upload',
              url: DEFAULT_STUDENT_FRAMEWORKS.visibilityComparison.imageUrl2!,
            },
          },
        ],
      },
    };
  }

  // 3. FORMATO IMERSIVO (Citação em tela cheia)
  if (layoutStyle === 'immersive') {
    const isWithImage = contentType === 'text_1_image';
    return {
      id: slideId,
      contentType: isWithImage ? 'text_1_image' : 'text_only',
      layoutStyle: 'immersive',
      background: inheritedBackground || '#0f172a',
      theme: inheritedTheme,
      fontSize: inheritedFontSize,
      layers: {
        text: [
          {
            id: `text_1`,
            role: 'quote',
            content: DEFAULT_STUDENT_FRAMEWORKS.immersiveQuotes[0].quote,
          },
          {
            id: `text_sig`,
            role: 'signature',
            content: DEFAULT_STUDENT_FRAMEWORKS.immersiveQuotes[0].signature || '',
          },
        ],
        images: isWithImage
          ? [
              {
                id: `img_1`,
                position: 'center',
                source: {
                  type: 'upload',
                  url: DEFAULT_STUDENT_FRAMEWORKS.twitterPerfectionism.imageUrl,
                },
              },
            ]
          : [],
      },
    };
  }

  // 4. FORMATO TWITTER OU OUTROS
  if (contentType === 'text_only') {
    return {
      id: slideId,
      contentType: 'text_only',
      layoutStyle: layoutStyle || 'twitter',
      background: inheritedBackground || '#ffffff',
      theme: inheritedTheme,
      fontSize: inheritedFontSize,
      layers: {
        text: [
          {
            id: `text_1`,
            role: 'body',
            content: DEFAULT_STUDENT_FRAMEWORKS.twitterPerfectionism.bodyText,
          },
        ],
        images: [],
      },
    };
  }

  if (contentType === 'text_2_images') {
    return {
      id: slideId,
      contentType: 'text_2_images',
      layoutStyle: layoutStyle || 'twitter',
      imageLayout: inheritedImageLayout || 'horizontal',
      background: inheritedBackground || '#ffffff',
      theme: inheritedTheme,
      fontSize: inheritedFontSize,
      layers: {
        text: [
          {
            id: `text_1`,
            role: 'body',
            content: DEFAULT_STUDENT_FRAMEWORKS.visibilityComparison.bodyText,
          },
        ],
        images: [
          {
            id: `img_1`,
            position: 'top',
            source: {
              type: 'upload',
              url: DEFAULT_STUDENT_FRAMEWORKS.visibilityComparison.imageUrl1!,
            },
          },
          {
            id: `img_2`,
            position: 'bottom',
            source: {
              type: 'upload',
              url: DEFAULT_STUDENT_FRAMEWORKS.visibilityComparison.imageUrl2!,
            },
          },
        ],
      },
    };
  }

  // Default: Twitter (Text + 1 Image)
  return {
    id: slideId,
    contentType: 'text_1_image',
    layoutStyle: layoutStyle || 'twitter',
    background: inheritedBackground || '#ffffff',
    theme: inheritedTheme,
    fontSize: inheritedFontSize,
    layers: {
      text: [
        {
          id: `text_1`,
          role: 'body',
          content: DEFAULT_STUDENT_FRAMEWORKS.twitterPerfectionism.bodyText,
        },
      ],
      images: [
        {
          id: `img_1`,
          position: 'center',
          source: {
            type: 'upload',
            url: DEFAULT_STUDENT_FRAMEWORKS.twitterPerfectionism.imageUrl,
          },
        },
      ],
    },
  };
}

export function createSlideFromTemplate(templateId: string): Slide {
  if (templateId === 'template_d') return createSlide('text_1_image', 'immersive');
  if (templateId === 'template_a') return createSlide('text_only', 'twitter');
  if (templateId === 'template_c') return createSlide('text_2_images', 'twitter');
  return createSlide('text_1_image', 'twitter');
}

// Utilitário para formatar texto de slide de forma inteligente (Estilo Referência: Pílula topo, Negrito nas palavras e Marca-texto no desfecho)
export function formatSmartSlideText(rawText: string, slideTitle?: string): string {
  if (!rawText) return '';
  let text = rawText.trim()
    .replace(/<mark[^>]*>/gi, '<mark>')
    .replace(/["'\s]*(?:bg-[a-z0-9-]+|text-[a-z0-9-]+|px-\d+|rounded|font-[a-z]+|inline|\[box-decoration-break:clone\]|\[-webkit-box-decoration-break:clone\]|class=)+["'\s>]*/gi, '');

  // Se já tiver marcações <mark> ou **negrito**, retorna o texto sanitizado
  if (text.includes('<mark>') || text.includes('**')) {
    return text;
  }

  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

  if (lines.length > 1) {
    const formattedLines: string[] = [];

    lines.forEach((line, idx) => {
      let l = line;

      // 1. Se a primeira linha for um aviso/pergunta de abertura, ajusta para pílula no topo
      if (idx === 0 && (l.endsWith(':') || l.includes('comum') || l.includes('pessoas') || l.includes('viés') || l.includes('regra'))) {
        const cleanTitle = l.replace(/:$/, '');
        l = `${cleanTitle}:`;
      }
      // 2. Se for item de lista (- ... ou * ...), aplica negrito na palavra de destaque final/chave
      else if (l.startsWith('-') || l.startsWith('*')) {
        if (!l.includes('**')) {
          l = l.replace(/([-\*]\s*.*?)\b([A-Za-z0-9_À-ÿ"]{3,20})\b([.!?"]*)$/, '$1**$2**$3');
        }
      }
      // 3. Se for a última linha de desfecho/conclusão, envolve com <mark>
      else if (idx === lines.length - 1 && !l.includes('<mark>')) {
        l = `<mark>${l}</mark>`;
      }

      formattedLines.push(l);
    });

    return formattedLines.join('\n\n');
  }

  // Para textos de parágrafo único longos:
  const quoteMatch = text.match(/(["'“][^"'”]+["'”])/);
  if (quoteMatch && !text.includes('<mark>')) {
    text = text.replace(quoteMatch[1], `<mark>${quoteMatch[1]}</mark>`);
  } else if (!text.includes('<mark>')) {
    // Aplica negrito em conceitos-chave e marca-texto na última frase
    const sentences = text.split(/(?<=[.!?])\s+/);
    if (sentences.length > 1) {
      const lastSentence = sentences.pop()!;
      const body = sentences.join(' ');
      const boldBody = body.replace(/\b(nicho|equipamento|plano|idéias|recursos|networking|viés de ação|falhar rápido|preço|autoridade|executar)\b/gi, '**$1**');
      return `${boldBody}\n\n<mark>${lastSentence}</mark>`;
    }
  }

  return text;
}

// Utilitário para detectar os dois lados da comparação e extrair rótulos adequados (ex: ['Antes', 'Depois'])
export function detectComparisonLabels(slideText: string, ideaTitle: string): [string, string] {
  const combined = `${ideaTitle} ${slideText}`.toLowerCase();

  if (combined.includes('invisível') || combined.includes('aparece')) {
    return ['Profissional Invisível', 'Profissional que Aparece'];
  }
  if (combined.includes('antes') || combined.includes('depois')) {
    return ['Antes', 'Depois'];
  }
  if (combined.includes('erro') || combined.includes('certo') || combined.includes('solução')) {
    return ['O Erro Comum', 'A Solução'];
  }
  if (combined.includes('antigo') || combined.includes('novo')) {
    return ['Jeito Antigo', 'Novo Método'];
  }
  if (combined.includes('caos') || combined.includes('método')) {
    return ['Sem Método (Caos)', 'Com Método (Previsível)'];
  }

  return ['Opção A', 'Opção B'];
}
