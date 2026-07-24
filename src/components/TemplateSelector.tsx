import React from 'react';
import { ContentType, LayoutStyle } from '@/types/carousel';
import { CONTENT_TYPES, LAYOUT_STYLES } from '@/lib/templates';
import { Layout, FileText, Image as ImageIcon, Layers, Sparkles, Twitter } from 'lucide-react';

interface TemplateSelectorProps {
  currentContentType: ContentType;
  currentLayoutStyle: LayoutStyle;
  onSelectContentType: (contentType: ContentType) => void;
  onSelectLayoutStyle: (layoutStyle: LayoutStyle) => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  currentContentType,
  currentLayoutStyle,
  onSelectContentType,
  onSelectLayoutStyle,
}) => {
  const getContentIcon = (type: ContentType) => {
    switch (type) {
      case 'text_only':
        return <FileText className="w-4 h-4 text-indigo-400" />;
      case 'text_1_image':
        return <ImageIcon className="w-4 h-4 text-amber-400" />;
      case 'text_2_images':
        return <Layers className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* BLOCO 1: Seletor de Estilo Visual */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Estilo Visual do Slide</span>
        </label>

        <div className="grid grid-cols-2 gap-2">
          {Object.values(LAYOUT_STYLES).map((style) => {
            const isSelected = style.id === currentLayoutStyle;
            return (
              <button
                key={style.id}
                type="button"
                onClick={() => onSelectLayoutStyle(style.id)}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between gap-1.5 transition ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-950/40 shadow-glow ring-1 ring-indigo-500/50'
                    : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                    {style.id === 'twitter' ? (
                      <Twitter className="w-3.5 h-3.5 text-sky-400" />
                    ) : style.id === 'comparison' ? (
                      <Layers className="w-3.5 h-3.5 text-emerald-400" />
                    ) : style.id === 'news_article' ? (
                      <FileText className="w-3.5 h-3.5 text-amber-400" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                    )}
                    <span>{style.name}</span>
                  </span>
                  {isSelected && <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />}
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-2 leading-tight">
                  {style.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* BLOCO 2: Seletor de Tipo de Conteúdo (Template) */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <Layout className="w-3.5 h-3.5 text-amber-400" />
          <span>Tipo de Conteúdo (Imagens)</span>
        </label>

        <div className="grid grid-cols-3 gap-1.5">
          {Object.values(CONTENT_TYPES).map((type) => {
            const isSelected = type.id === currentContentType;
            const isDisabled = currentLayoutStyle === 'comparison' && type.id !== 'text_2_images';

            return (
              <button
                key={type.id}
                type="button"
                disabled={isDisabled}
                onClick={() => !isDisabled && onSelectContentType(type.id)}
                className={`p-2.5 rounded-xl border text-center flex flex-col items-center justify-center gap-1 transition ${
                  isDisabled
                    ? 'opacity-30 border-slate-800 bg-slate-950 text-slate-600 cursor-not-allowed'
                    : isSelected
                    ? 'border-amber-500 bg-amber-950/30 shadow-glow ring-1 ring-amber-500/50 text-white font-bold'
                    : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-400'
                }`}
                title={isDisabled ? 'O estilo comparativo requer 2 imagens' : type.name}
              >
                {getContentIcon(type.id)}
                <span className="text-[11px] leading-tight">{type.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
