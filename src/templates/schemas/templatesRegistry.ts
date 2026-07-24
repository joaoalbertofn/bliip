import { SlideTemplateSchema } from '@/types/templateSchema';

import twitterTextOnly from './twitter/text_only.json';
import twitterText1Image from './twitter/text_1_image.json';
import twitterText2Images from './twitter/text_2_images.json';

import immersiveTextOnly from './immersive/text_only.json';
import immersiveText1Image from './immersive/text_1_image.json';
import immersiveText2Images from './immersive/text_2_images.json';

import comparisonText2Images from './comparison/text_2_images.json';
import newsArticleTextOnly from './news_article/text_only.json';
import newsArticleText1Image from './news_article/text_1_image.json';
import newsArticleText2Images from './news_article/text_2_images.json';

export const ALL_TEMPLATE_SCHEMAS: SlideTemplateSchema[] = [
  twitterTextOnly as SlideTemplateSchema,
  twitterText1Image as SlideTemplateSchema,
  twitterText2Images as SlideTemplateSchema,
  immersiveTextOnly as SlideTemplateSchema,
  immersiveText1Image as SlideTemplateSchema,
  immersiveText2Images as SlideTemplateSchema,
  comparisonText2Images as SlideTemplateSchema,
  newsArticleTextOnly as SlideTemplateSchema,
  newsArticleText1Image as SlideTemplateSchema,
  newsArticleText2Images as SlideTemplateSchema,
];

export function getTemplateSchema(styleGroup: string, contentType: string): SlideTemplateSchema {
  const matched = ALL_TEMPLATE_SCHEMAS.find(
    (s) => s.styleGroup === styleGroup && s.contentType === contentType
  );

  if (matched) return matched;

  // Fallback seguro se o combinação não existir (ex: tenta encontrar pelo styleGroup)
  const fallbackGroup = ALL_TEMPLATE_SCHEMAS.find((s) => s.styleGroup === styleGroup);
  if (fallbackGroup) return fallbackGroup;

  return twitterTextOnly as SlideTemplateSchema;
}
