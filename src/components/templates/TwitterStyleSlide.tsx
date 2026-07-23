import React from 'react';
import { Slide, UserProfile } from '@/types/carousel';
import { TemplateHeader } from './TemplateHeader';

interface TwitterStyleSlideProps {
  slide: Slide;
  profile: UserProfile;
}

export const TwitterStyleSlide: React.FC<TwitterStyleSlideProps> = ({ slide, profile }) => {
  const textLayer = slide.layers.text?.[0];
  const content = textLayer?.content || '';
  const images = slide.layers.images || [];

  const isHorizontal = slide.imageLayout === 'horizontal';
  const contentType = slide.contentType || 'text_1_image';

  // Formatação de Diálogo / Parágrafo estilo Tweet Bruno Perini
  const renderFormattedText = (rawText: string) => {
    if (!rawText) {
      return (
        <span className="text-gray-400 italic text-base">
          Escreva o conteúdo do slide aqui...
        </span>
      );
    }

    const paragraphs = rawText.split('\n\n');
    return paragraphs.map((p, idx) => {
      const dialogueMatch = p.match(/^([A-Za-z0-9_À-ÿ\s]+):\s*([\s\S]*)/);
      if (dialogueMatch) {
        const speaker = dialogueMatch[1];
        const dialogueBody = dialogueMatch[2];
        return (
          <div key={idx} className="mb-3 last:mb-0">
            <span className="font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded mr-2 inline-block text-lg">
              {speaker}:
            </span>
            <span
              className="text-gray-800 leading-relaxed text-lg font-medium"
              dangerouslySetInnerHTML={{ __html: dialogueBody }}
            />
          </div>
        );
      }

      return (
        <p
          key={idx}
          className="mb-3 last:mb-0 text-gray-900 text-lg leading-relaxed font-normal"
          dangerouslySetInnerHTML={{ __html: p }}
        />
      );
    });
  };

  return (
    <div
      className="w-full h-full flex flex-col justify-between"
      style={{ backgroundColor: slide.background || '#ffffff' }}
    >
      {/* Header Fixo do Twitter (Avatar + Nome + Handle + Selo Azul) */}
      <TemplateHeader profile={profile} />

      <div className="flex-1 flex flex-col px-5 py-2 overflow-hidden justify-start gap-3">
        {/* Bloco de Texto Superior */}
        <div className="shrink-0">{renderFormattedText(content)}</div>

        {/* Renderização de Imagem 1 (Texto + 1 Imagem) */}
        {contentType === 'text_1_image' && (
          <div className="flex-1 min-h-[260px] max-h-[700px] w-full flex items-center justify-center overflow-hidden rounded-xl bg-gray-50 border border-gray-100 shadow-sm relative">
            {images[0]?.source.url ? (
              <img
                src={images[0].source.url}
                alt="Foto"
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-6 text-gray-400">
                <span className="text-sm font-medium">Faça upload de uma imagem</span>
              </div>
            )}
          </div>
        )}

        {/* Renderização de 2 Imagens (Texto + 2 Imagens) */}
        {contentType === 'text_2_images' && (
          <div
            className={`flex-1 min-h-0 w-full flex ${
              isHorizontal ? 'flex-row gap-2' : 'flex-col gap-2'
            }`}
          >
            <div className="flex-1 min-h-[130px] w-full rounded-xl bg-gray-50 border border-gray-100 shadow-sm overflow-hidden relative flex items-center justify-center">
              {images[0]?.source.url ? (
                <img src={images[0].source.url} alt="Imagem 1" className="w-full h-full object-cover" />
              ) : (
                <div className="text-gray-400 text-xs font-medium">Imagem 1</div>
              )}
            </div>

            <div className="flex-1 min-h-[130px] w-full rounded-xl bg-gray-50 border border-gray-100 shadow-sm overflow-hidden relative flex items-center justify-center">
              {images[1]?.source.url ? (
                <img src={images[1].source.url} alt="Imagem 2" className="w-full h-full object-cover" />
              ) : (
                <div className="text-gray-400 text-xs font-medium">Imagem 2</div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="px-5 pb-3 text-right shrink-0">
        <span className="text-xs text-gray-300 font-semibold tracking-wider uppercase">
          Bliip Slide
        </span>
      </div>
    </div>
  );
};
