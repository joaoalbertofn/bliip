import { Slide, ContentType, LayoutStyle } from '@/types/carousel';

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
    name: 'Estilo Twitter (Perini)',
    description: 'Fundo claro com cabeçalho de perfil, selo azul e visual de post de rede social.',
  },
  immersive: {
    id: 'immersive',
    name: 'Estilo Imersivo (Sadhguru)',
    description: 'Imagens ou fundo em tela cheia, círculo de perfil badge e tipografia marcante.',
  },
  comparison: {
    id: 'comparison',
    name: 'Estilo Comparativo (Pedro Moreira)',
    description: 'Ideal para comparações (Antes/Depois ou Primeiro/Depois) com rótulos de fotos.',
  },
  news_article: {
    id: 'news_article',
    name: 'Estilo Notícias (Kraken / Bitcoin)',
    description: 'Visual editorial estilo manchete de notícias de mercado com destaques.',
  },
};

// Aliases para compatibilidade
export const TEMPLATES: Record<string, { id: string; name: string; maxImages: number }> = {
  template_a: { id: 'template_a', name: 'Somente Texto', maxImages: 0 },
  template_b: { id: 'template_b', name: 'Texto + 1 Imagem', maxImages: 1 },
  template_c: { id: 'template_c', name: 'Texto + 2 Imagens', maxImages: 2 },
  template_d: { id: 'template_d', name: 'Citação / Imersivo', maxImages: 1 },
};

export function createSlide(contentType: ContentType = 'text_1_image', layoutStyle: LayoutStyle = 'twitter'): Slide {
  const slideId = `slide_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  if (contentType === 'text_only') {
    return {
      id: slideId,
      contentType: 'text_only',
      layoutStyle,
      background: layoutStyle === 'immersive' ? '#0f172a' : '#ffffff',
      layers: {
        text: [
          {
            id: `text_1`,
            role: 'body',
            content: `Você: Como posso criar conteúdo visual marcante no Instagram de forma rápida?\n\nBliip: Basta inserir seu texto e fotos. O layout, tipografia e sua marca pessoal são aplicados automaticamente!`,
          },
          {
            id: `text_sig`,
            role: 'signature',
            content: `Bruno Perini`,
          }
        ],
        images: []
      }
    };
  }

  if (contentType === 'text_2_images') {
    return {
      id: slideId,
      contentType: 'text_2_images',
      layoutStyle,
      imageLayout: 'vertical',
      background: '#ffffff',
      layers: {
        text: [
          {
            id: `text_1`,
            role: 'body',
            content: `Enquanto um país estimula o empreendedorismo, o outro cria barreiras.\n\n<mark class="bg-yellow-300 px-1 rounded">Brasil piora e é o 3º país mais complexo para negócios</mark>, aponta ranking global.`,
          }
        ],
        images: [
          {
            id: `img_1`,
            position: 'top',
            source: {
              type: 'upload',
              url: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80'
            }
          },
          {
            id: `img_2`,
            position: 'bottom',
            source: {
              type: 'upload',
              url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80'
            }
          }
        ]
      }
    };
  }

  // Padrão: text_1_image
  return {
    id: slideId,
    contentType: 'text_1_image',
    layoutStyle,
    background: '#ffffff',
    layers: {
      text: [
        {
          id: `text_1`,
          role: 'body',
          content: `Um garoto de 13 anos abriu uma <mark class="bg-yellow-300 px-1 rounded">barraca de cachorro-quente</mark> em frente à sua casa em Minnesota.\n\nEle só queria ganhar um dinheiro nas férias de verão.`,
        }
      ],
      images: [
        {
          id: `img_1`,
          position: 'center',
          source: {
            type: 'upload',
            url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1000&q=80'
          }
        }
      ]
    }
  };
}

export function createSlideFromTemplate(templateId: string): Slide {
  if (templateId === 'template_d') return createSlide('text_1_image', 'immersive');
  if (templateId === 'template_a') return createSlide('text_only', 'twitter');
  if (templateId === 'template_c') return createSlide('text_2_images', 'twitter');
  return createSlide('text_1_image', 'twitter');
}
