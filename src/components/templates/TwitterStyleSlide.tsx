import React from 'react';
import { Slide, UserProfile } from '@/types/carousel';
import { TemplateHeader } from './TemplateHeader';
import { getSlideTheme } from '@/lib/themes';
import { InteractiveImageContainer } from '../InteractiveImageContainer';

interface TwitterStyleSlideProps {
  slide: Slide;
  profile: UserProfile;
  onImageTransform?: (imageIndex: number, transform: { scale?: number; offsetX?: number; offsetY?: number }) => void;
  onSelectImage?: (imageIndex: number) => void;
}

export const TwitterStyleSlide: React.FC<TwitterStyleSlideProps> = ({ slide, profile, onImageTransform, onSelectImage }) => {
  const textLayer = slide.layers.text?.[0];
  const content = textLayer?.content || '';
  const images = slide.layers.images || [];

  const isHorizontal = slide.imageLayout === 'horizontal';
  const contentType = slide.contentType || 'text_1_image';

  // Obter o tema de cores ativo
  const theme = getSlideTheme(slide.theme, slide.background);

  // Customizar tags <mark> in-line para harmonizar com o tema ativo
  const processMarkTags = (htmlText: string) => {
    if (!htmlText) return htmlText;
    return htmlText.replace(
      /<mark([^>]*)>/g,
      `<mark style="background-color: ${theme.markBg}; color: ${theme.markText}; padding: 2px 6px; border-radius: 4px; font-weight: 600;">`
    );
  };

  const customFontSize = slide.fontSize ?? 20;

  // Formatação de Diálogo / Parágrafo estilo Tweet Bruno Perini / Pedro Moreira
  const renderFormattedText = (rawText: string) => {
    if (!rawText) {
      return (
        <span className="italic text-base opacity-60" style={{ color: theme.textSecondary }}>
          Escreva o conteúdo do slide aqui...
        </span>
      );
    }

    const processedHtml = processMarkTags(rawText);
    const paragraphs = processedHtml.split('\n\n');

    return paragraphs.map((p, idx) => {
      const dialogueMatch = p.match(/^([A-Za-z0-9_À-ÿ\s]+):\s*([\s\S]*)/);
      if (dialogueMatch) {
        const speaker = dialogueMatch[1];
        const dialogueBody = dialogueMatch[2];
        return (
          <div key={idx} className="mb-4 last:mb-0">
            <span
              className="font-extrabold px-2 py-0.5 rounded mr-2 inline-block"
              style={{ backgroundColor: theme.speakerBg, color: theme.speakerText, fontSize: `${Math.max(14, customFontSize * 0.9)}px` }}
            >
              {speaker}:
            </span>
            <span
              className="leading-relaxed font-medium"
              style={{ color: theme.text, fontSize: `${customFontSize}px` }}
              dangerouslySetInnerHTML={{ __html: dialogueBody }}
            />
          </div>
        );
      }

      return (
        <p
          key={idx}
          className="mb-4 last:mb-0 leading-relaxed font-normal text-left"
          style={{ color: theme.text, fontSize: `${customFontSize}px` }}
          dangerouslySetInnerHTML={{ __html: p }}
        />
      );
    });
  };

  const isTextOnly = contentType === 'text_only';

  return (
    <div
      className="w-full h-full flex flex-col justify-between p-6 transition-colors duration-200"
      style={{ backgroundColor: theme.bg }}
    >
      {isTextOnly ? (
        <div className="my-auto flex flex-col justify-center w-full max-w-lg mx-auto py-4">
          <TemplateHeader profile={profile} themeConfig={theme} className="px-0 pb-4" />
          <div className="w-full pt-1">{renderFormattedText(content)}</div>
        </div>
      ) : (
        /* Layouts com Imagens: Header no topo, texto e fotos em seguida */
        <>
          <TemplateHeader profile={profile} themeConfig={theme} />

          <div className="flex-1 flex flex-col px-4 py-2 overflow-hidden justify-start gap-3">
            {/* Bloco de Texto Superior */}
            <div className="shrink-0">{renderFormattedText(content)}</div>

            {/* Renderização de 1 Imagem com Zoom & Pan Interativo */}
            {contentType === 'text_1_image' && (
              <InteractiveImageContainer
                imageLayer={images[0]}
                imageIndex={0}
                onImageTransform={onImageTransform}
                onSelect={onSelectImage}
                className="flex-1 min-h-[240px] max-h-[650px] w-full group"
                cardBg={theme.cardBg}
                borderColor={theme.borderColor}
                textSecondary={theme.textSecondary}
              />
            )}

            {/* Renderização de 2 Imagens com Zoom & Pan Interativo */}
            {contentType === 'text_2_images' && (
              <div
                className={`flex-1 min-h-0 w-full flex ${
                  isHorizontal ? 'flex-row gap-2' : 'flex-col gap-2'
                }`}
              >
                <InteractiveImageContainer
                  imageLayer={images[0]}
                  imageIndex={0}
                  onImageTransform={onImageTransform}
                  onSelect={onSelectImage}
                  className="flex-1 min-h-[120px] w-full group"
                  fallbackText="Imagem 1"
                  cardBg={theme.cardBg}
                  borderColor={theme.borderColor}
                  textSecondary={theme.textSecondary}
                />
                <InteractiveImageContainer
                  imageLayer={images[1]}
                  imageIndex={1}
                  onImageTransform={onImageTransform}
                  onSelect={onSelectImage}
                  className="flex-1 min-h-[120px] w-full group"
                  fallbackText="Imagem 2"
                  cardBg={theme.cardBg}
                  borderColor={theme.borderColor}
                  textSecondary={theme.textSecondary}
                />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
