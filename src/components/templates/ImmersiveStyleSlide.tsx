import React from 'react';
import { Slide, UserProfile, ImageMask } from '@/types/carousel';
import { getSlideTheme } from '@/lib/themes';
import { InteractiveImageContainer } from '../InteractiveImageContainer';

interface ImmersiveStyleSlideProps {
  slide: Slide;
  profile: UserProfile;
  onImageTransform?: (imageIndex: number, transform: { scale?: number; offsetX?: number; offsetY?: number }) => void;
  onUpdateMasks?: (imageIndex: number, masks: ImageMask[]) => void;
  onSelectImage?: (imageIndex: number) => void;
}

export const ImmersiveStyleSlide: React.FC<ImmersiveStyleSlideProps> = ({ slide, profile, onImageTransform, onUpdateMasks, onSelectImage }) => {
  const quoteLayer = slide.layers.text?.find((t) => t.role === 'quote' || t.role === 'body');
  const signatureLayer = slide.layers.text?.find((t) => t.role === 'signature');
  const images = slide.layers.images || [];

  const quoteText = quoteLayer?.content || '';
  const isLongText = quoteText.length > 140;
  const isHorizontal = slide.imageLayout === 'horizontal';
  const contentType = slide.contentType || (slide.templateId === 'template_a' ? 'text_only' : slide.templateId === 'template_c' ? 'text_2_images' : 'text_1_image');

  // Obter o tema de cores ativo
  const theme = getSlideTheme(slide.theme, slide.background);

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

  const customFontSize = slide.fontSize ?? (isLongText ? 22 : 26);

  // CASO 1: Apenas Texto no Estilo Imersivo
  if (contentType === 'text_only') {
    return (
      <div
        className="w-full h-full flex flex-col items-center justify-between text-center px-10 py-10 relative overflow-hidden transition-colors duration-200"
        style={{ backgroundColor: theme.bg }}
      >
        {/* Avatar no topo (sem nome duplicado abaixo) */}
        <div className="pt-2 flex flex-col items-center z-10">
          <div
            className="w-20 h-20 rounded-full p-1 shadow-2xl border flex items-center justify-center"
            style={{ backgroundColor: theme.cardBg, borderColor: theme.borderColor }}
          >
            <img
              src={profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
              alt={profile.name}
              className="w-full h-full rounded-full object-cover"
            />
          </div>
        </div>

        {/* Citação no meio */}
        <div className="my-auto max-w-lg z-10 w-full py-4">
          {quoteText ? (
            <p
              className="leading-relaxed font-serif font-medium"
              style={{ color: theme.text, fontSize: `${customFontSize}px` }}
              dangerouslySetInnerHTML={{ __html: processMarkTags(quoteText) }}
            />
          ) : (
            <p className="italic text-xl font-serif opacity-50" style={{ color: theme.textSecondary }}>
              "Digite a citação imersiva..."
            </p>
          )}
        </div>

        {/* Assinatura do autor na parte inferior */}
        {!isLongText && (
          <div className="pb-2 z-10">
            <span className="font-handwriting text-3xl tracking-wider font-semibold italic" style={{ color: theme.text }}>
              {signatureLayer?.content || profile.name}
            </span>
          </div>
        )}
      </div>
    );
  }

  // CASO 2: Texto + 1 ou 2 Imagens no Estilo Imersivo
  return (
    <div
      className="w-full h-full flex flex-col relative overflow-hidden transition-colors duration-200"
      style={{ backgroundColor: theme.bg }}
    >
      {/* Top Image Section (~58% height) */}
      <div className="h-[58%] w-full relative bg-gray-900 overflow-hidden shrink-0">
        {contentType === 'text_1_image' && (
          <InteractiveImageContainer
            imageLayer={images[0]}
            imageIndex={0}
            onImageTransform={onImageTransform}
            onUpdateMasks={onUpdateMasks}
            onSelect={onSelectImage}
            className="w-full h-full rounded-none border-none group"
            cardBg="#0f172a"
          />
        )}

        {contentType === 'text_2_images' && (
          <div className={`w-full h-full flex ${isHorizontal ? 'flex-row' : 'flex-col'} gap-1`}>
            <InteractiveImageContainer
              imageLayer={images[0]}
              imageIndex={0}
              onImageTransform={onImageTransform}
              onUpdateMasks={onUpdateMasks}
              onSelect={onSelectImage}
              className="flex-1 h-full rounded-none border-none group"
              fallbackText="Foto 1"
              cardBg="#0f172a"
            />
            <InteractiveImageContainer
              imageLayer={images[1]}
              imageIndex={1}
              onImageTransform={onImageTransform}
              onUpdateMasks={onUpdateMasks}
              onSelect={onSelectImage}
              className="flex-1 h-full rounded-none border-none group"
              fallbackText="Foto 2"
              cardBg="#0f172a"
            />
          </div>
        )}
      </div>

      {/* Profile Badge na linha divisória */}
      <div className="absolute top-[58%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
        <div
          className="w-20 h-20 rounded-full p-1.5 shadow-xl border flex items-center justify-center"
          style={{ backgroundColor: theme.cardBg, borderColor: theme.borderColor }}
        >
          <img
            src={profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
            alt={profile.name}
            className="w-full h-full rounded-full object-cover"
          />
        </div>
      </div>

      {/* Bottom Section */}
      <div
        className="flex-1 w-full pt-12 pb-4 px-6 flex flex-col justify-between items-center text-center"
        style={{ backgroundColor: theme.bg }}
      >
        {/* Quote Content */}
        <div className="my-auto max-w-lg">
          {quoteText ? (
            <p
              className="leading-relaxed font-serif font-medium"
              style={{ color: theme.text, fontSize: `${customFontSize}px` }}
              dangerouslySetInnerHTML={{ __html: processMarkTags(quoteText) }}
            />
          ) : (
            <p className="italic text-xl font-serif opacity-50" style={{ color: theme.textSecondary }}>
              "Digite o texto explicativo ou citação..."
            </p>
          )}
        </div>

        {/* Signature */}
        {!isLongText && (
          <div className="pt-1">
            <span className="font-handwriting text-3xl tracking-wider font-semibold italic" style={{ color: theme.text }}>
              {signatureLayer?.content || profile.name}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
