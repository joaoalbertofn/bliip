import React from 'react';
import { Slide, UserProfile } from '@/types/carousel';
import { TemplateHeader } from './TemplateHeader';

interface TemplateBProps {
  slide: Slide;
  profile: UserProfile;
}

export const TemplateB: React.FC<TemplateBProps> = ({ slide, profile }) => {
  const textLayer = slide.layers.text?.[0];
  const imageLayer = slide.layers.images?.[0];
  const imageUrl = imageLayer?.source.url;

  return (
    <div
      className="w-full h-full flex flex-col justify-between"
      style={{ backgroundColor: slide.background || '#ffffff' }}
    >
      <TemplateHeader profile={profile} />

      <div className="flex-1 flex flex-col px-4 py-1 overflow-hidden justify-start gap-3">
        {/* Bloco de Texto Superior */}
        {textLayer?.content ? (
          <div
            className="text-gray-900 text-xl leading-relaxed font-normal"
            dangerouslySetInnerHTML={{ __html: textLayer.content }}
          />
        ) : (
          <p className="text-gray-400 italic text-lg">
            Insira o texto explicativo da história ou notícia...
          </p>
        )}

        {/* Imagem Central */}
        <div className="flex-1 min-h-[320px] max-h-[780px] w-full flex items-center justify-center overflow-hidden rounded-xl bg-gray-50 border border-gray-100 shadow-sm relative">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Conteúdo do slide"
              className="w-full h-full object-cover rounded-xl"
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-gray-400">
              <svg className="w-12 h-12 mb-2 stroke-current" fill="none" viewBox="0 0 24 24">
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" strokeWidth="1.5" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path strokeWidth="1.5" d="m21 15-5-5L5 21" />
              </svg>
              <span className="text-sm font-medium">Faça upload de uma imagem</span>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 pb-3 text-right">
        <span className="text-xs text-gray-300 font-semibold tracking-wider uppercase">
          Bliip Slide
        </span>
      </div>
    </div>
  );
};
