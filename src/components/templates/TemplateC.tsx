import React from 'react';
import { Slide, UserProfile } from '@/types/carousel';
import { TemplateHeader } from './TemplateHeader';

interface TemplateCProps {
  slide: Slide;
  profile: UserProfile;
}

export const TemplateC: React.FC<TemplateCProps> = ({ slide, profile }) => {
  const textLayer = slide.layers.text?.[0];
  const images = slide.layers.images || [];
  const img1 = images[0]?.source.url;
  const img2 = images[1]?.source.url;

  const isHorizontal = slide.imageLayout === 'horizontal';

  return (
    <div
      className="w-full h-full flex flex-col justify-between"
      style={{ backgroundColor: slide.background || '#ffffff' }}
    >
      <TemplateHeader profile={profile} />

      <div className="flex-1 flex flex-col px-4 py-1 overflow-hidden justify-start gap-2.5">
        {/* Bloco de Texto Explicativo */}
        {textLayer?.content ? (
          <div
            className="text-gray-900 text-lg leading-relaxed font-normal shrink-0"
            dangerouslySetInnerHTML={{ __html: textLayer.content }}
          />
        ) : (
          <p className="text-gray-400 italic text-base shrink-0">
            Escreva o texto explicativo ou análise com dados...
          </p>
        )}

        {/* 2 Imagens: Disposição Vertical ou Horizontal */}
        <div
          className={`flex-1 min-h-0 w-full flex ${
            isHorizontal ? 'flex-row gap-2' : 'flex-col gap-2'
          }`}
        >
          {/* Imagem 1 */}
          <div className="flex-1 min-h-[140px] w-full rounded-xl bg-gray-50 border border-gray-100 shadow-sm overflow-hidden relative flex items-center justify-center">
            {img1 ? (
              <img src={img1} alt="Print 1" className="w-full h-full object-cover" />
            ) : (
              <div className="text-gray-400 text-xs font-medium">Imagem 1 (Upload no painel)</div>
            )}
          </div>

          {/* Imagem 2 */}
          <div className="flex-1 min-h-[140px] w-full rounded-xl bg-gray-50 border border-gray-100 shadow-sm overflow-hidden relative flex items-center justify-center">
            {img2 ? (
              <img src={img2} alt="Print 2" className="w-full h-full object-cover" />
            ) : (
              <div className="text-gray-400 text-xs font-medium">Imagem 2 (Upload no painel)</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
