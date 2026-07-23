import React from 'react';
import { Slide, UserProfile } from '@/types/carousel';
import { TemplateHeader } from './TemplateHeader';

interface TemplateAProps {
  slide: Slide;
  profile: UserProfile;
}

export const TemplateA: React.FC<TemplateAProps> = ({ slide, profile }) => {
  const textLayer = slide.layers.text?.[0];
  const content = textLayer?.content || '';

  // Processamento simples para destacar prefixos de diálogo como "Você:", "Governo:", "Bliip:"
  const renderFormattedText = (rawText: string) => {
    if (!rawText) {
      return (
        <span className="text-gray-400 italic">
          Clique no editor ao lado para adicionar o conteúdo de texto...
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
          <div key={idx} className="mb-6 last:mb-0">
            <span className="font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded mr-2 inline-block">
              {speaker}:
            </span>
            <span
              className="text-gray-800 leading-relaxed text-2xl font-medium"
              dangerouslySetInnerHTML={{ __html: dialogueBody }}
            />
          </div>
        );
      }

      return (
        <p
          key={idx}
          className="mb-6 last:mb-0 text-gray-900 text-2xl leading-relaxed font-normal"
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
      <TemplateHeader profile={profile} />

      <div className="flex-1 flex flex-col justify-center px-5 py-3 overflow-hidden">
        {renderFormattedText(content)}
      </div>

      <div className="px-4 pb-3 text-right">
        <span className="text-xs text-gray-300 font-semibold tracking-wider uppercase">
          Bliip Slide
        </span>
      </div>
    </div>
  );
};
