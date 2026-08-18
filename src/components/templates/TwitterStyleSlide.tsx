import React from 'react';
import { Slide, UserProfile, ImageMask } from '@/types/carousel';
import { TemplateHeader } from './TemplateHeader';
import { getSlideTheme } from '@/lib/themes';
import { InteractiveImageContainer } from '../InteractiveImageContainer';

interface TwitterStyleSlideProps {
  slide: Slide;
  profile: UserProfile;
  onImageTransform?: (imageIndex: number, transform: { scale?: number; offsetX?: number; offsetY?: number }) => void;
  onUpdateMasks?: (imageIndex: number, masks: ImageMask[]) => void;
  onSelectImage?: (imageIndex: number) => void;
}

export const TwitterStyleSlide: React.FC<TwitterStyleSlideProps> = ({ slide, profile, onImageTransform, onUpdateMasks, onSelectImage }) => {
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
    let formatted = htmlText.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    return formatted.replace(
      /<mark[^>]*>([\s\S]*?)<\/mark>/gi,
      (match, innerText) => {
        let cleanInner = innerText
          .replace(/^["'\s]*(?:bg-[a-z0-9-]+|text-[a-z0-9-]+|px-\d+|rounded|font-[a-z]+|inline|\[box-decoration-break:clone\]|\[-webkit-box-decoration-break:clone\]|class=)*["'\s>]*/gi, '')
          .replace(/<\/?(div|p)[^>]*>/gi, '');
        const textOnly = cleanInner.replace(/<[^>]*>/g, '').trim();
        if (!textOnly) {
          return cleanInner;
        }

        let prefixBr = '';
        let suffixBr = '';
        cleanInner = cleanInner.replace(/^(?:\s*<br\s*\/?>\s*)+/gi, (m: string) => {
          prefixBr = m;
          return '';
        });
        cleanInner = cleanInner.replace(/(?:\s*<br\s*\/?>\s*)+$/gi, (m: string) => {
          suffixBr = m;
          return '';
        });

        if (!cleanInner.trim()) {
          return `${prefixBr}${suffixBr}`;
        }

        return `${prefixBr}<mark style="background-color: ${theme.markBg}; color: ${theme.markText}; padding: 2px 6px; border-radius: 4px; font-weight: 600; display: inline; -webkit-box-decoration-break: clone; box-decoration-break: clone;">${cleanInner}</mark>${suffixBr}`;
      }
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
      className="w-full h-full flex flex-col justify-between transition-colors duration-200 overflow-hidden relative"
      style={{ backgroundColor: theme.bg }}
    >
      {isTextOnly ? (
        <div className="my-auto flex flex-col justify-center w-full max-w-lg mx-auto p-6">
          <TemplateHeader profile={profile} themeConfig={theme} className="px-0 pb-4" />
          <div className="w-full pt-1">{renderFormattedText(content)}</div>
        </div>
      ) : (
        /* Layouts com Imagens: Header e Texto no topo (com padding), Mídia(s) sangradas na base */
        <>
          <div className="px-6 pt-6 pb-2 flex flex-col gap-3 shrink-0">
            <TemplateHeader profile={profile} themeConfig={theme} />
            <div className="w-full">{renderFormattedText(content)}</div>
          </div>

          {/* Área de Mídia (Sangrada até as laterais e base do slide) */}
          <div className="flex-1 min-h-0 w-full flex flex-col justify-end overflow-hidden">
            {/* Renderização de 1 Imagem Sangrada nas laterais e base */}
            {contentType === 'text_1_image' && (
              <InteractiveImageContainer
                imageLayer={images[0]}
                imageIndex={0}
                onImageTransform={onImageTransform}
                onUpdateMasks={onUpdateMasks}
                onSelect={onSelectImage}
                className="w-full h-full flex-1 group"
                cardBg={theme.cardBg}
                borderColor={theme.borderColor}
                textSecondary={theme.textSecondary}
                roundedClassName="rounded-t-2xl rounded-b-none border-x-0 border-b-0"
              />
            )}

            {/* Renderização de 2 Imagens Sangradas com Rótulos Flutuantes e Gap de 2px */}
            {contentType === 'text_2_images' && (() => {
              const label1 = slide.imageLabels?.[0] !== undefined ? slide.imageLabels[0] : (images[0]?.title !== undefined ? images[0].title : 'Antes');
              const label2 = slide.imageLabels?.[1] !== undefined ? slide.imageLabels[1] : (images[1]?.title !== undefined ? images[1].title : 'Depois');
              const labelAlign = slide.imageLabelAlignment || 'left';
              const badgePosClass =
                labelAlign === 'center'
                  ? 'left-1/2 -translate-x-1/2'
                  : labelAlign === 'right'
                  ? 'right-3 left-auto'
                  : 'left-3';

              return (
                <div
                  className={`w-full h-full flex-1 flex ${
                    isHorizontal ? 'flex-row gap-[2px]' : 'flex-col gap-[2px]'
                  }`}
                  style={{ backgroundColor: theme.bg }}
                >
                  {/* Imagem 1 */}
                  <div className="flex-1 min-h-0 h-full w-full relative group flex flex-col">
                    {label1 && label1.trim() !== '' && (
                      <div className={`absolute top-3 ${badgePosClass} z-30 pointer-events-none transition-all duration-150`}>
                        <span className="text-[11px] font-black px-2.5 py-1 rounded-md shadow-lg bg-white/95 text-slate-900 border border-slate-200/90 backdrop-blur-md">
                          {label1}
                        </span>
                      </div>
                    )}
                    <InteractiveImageContainer
                      imageLayer={images[0]}
                      imageIndex={0}
                      onImageTransform={onImageTransform}
                      onUpdateMasks={onUpdateMasks}
                      onSelect={onSelectImage}
                      className="w-full h-full flex-1 group"
                      fallbackText="Imagem 1"
                      cardBg={theme.cardBg}
                      borderColor={theme.borderColor}
                      textSecondary={theme.textSecondary}
                      roundedClassName={
                        isHorizontal
                          ? 'rounded-tl-2xl rounded-tr-none rounded-b-none border-l-0 border-b-0 border-t-0'
                          : 'rounded-t-2xl rounded-b-none border-x-0 border-t-0'
                      }
                    />
                  </div>

                  {/* Imagem 2 */}
                  <div className="flex-1 min-h-0 h-full w-full relative group flex flex-col">
                    {label2 && label2.trim() !== '' && (
                      <div className={`absolute top-3 ${badgePosClass} z-30 pointer-events-none transition-all duration-150`}>
                        <span className="text-[11px] font-black px-2.5 py-1 rounded-md shadow-lg bg-white/95 text-slate-900 border border-slate-200/90 backdrop-blur-md">
                          {label2}
                        </span>
                      </div>
                    )}
                    <InteractiveImageContainer
                      imageLayer={images[1]}
                      imageIndex={1}
                      onImageTransform={onImageTransform}
                      onUpdateMasks={onUpdateMasks}
                      onSelect={onSelectImage}
                      className="w-full h-full flex-1 group"
                      fallbackText="Imagem 2"
                      cardBg={theme.cardBg}
                      borderColor={theme.borderColor}
                      textSecondary={theme.textSecondary}
                      roundedClassName={
                        isHorizontal
                          ? 'rounded-tr-2xl rounded-tl-none rounded-b-none border-r-0 border-b-0 border-t-0'
                          : 'rounded-none border-x-0 border-b-0 border-t-0'
                      }
                    />
                  </div>
                </div>
              );
            })()}
          </div>
        </>
      )}
    </div>
  );
};
