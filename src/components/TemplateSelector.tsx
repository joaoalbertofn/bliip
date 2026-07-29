import React from 'react';
import { ContentType, LayoutStyle } from '@/types/carousel';
import { CONTENT_TYPES, LAYOUT_STYLES } from '@/lib/templates';
import { Layout, FileText, Image as ImageIcon, Layers, Sparkles, Twitter } from 'lucide-react';

import { canChangeContentType, canChangeOrientation } from '@/domain';

interface TemplateSelectorProps {
  currentContentType: ContentType;
  currentLayoutStyle: LayoutStyle;
  currentImageLayout?: 'vertical' | 'horizontal';
  onSelectContentType: (contentType: ContentType) => void;
  onSelectLayoutStyle: (layoutStyle: LayoutStyle) => void;
  onSelectImageLayout?: (orientation: 'vertical' | 'horizontal') => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  currentContentType,
  currentLayoutStyle,
  currentImageLayout = 'horizontal',
  onSelectContentType,
  onSelectLayoutStyle,
  onSelectImageLayout,
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

  const getStyleShortName = (id: LayoutStyle) => {
    switch (id) {
      case 'twitter': return 'Twitter';
      case 'immersive': return 'Imersivo';
      case 'comparison': return 'Comparativo';
      case 'news_article': return 'Notícias';
      default: return 'Estilo';
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
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
                className={`p-2.5 rounded-xl border text-left flex flex-col justify-between gap-1 transition ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-950/40 shadow-glow ring-1 ring-indigo-500/50'
                    : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-bold text-slate-100 flex items-center gap-1.5 truncate">
                    {style.id === 'twitter' ? (
                      <Twitter className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    ) : style.id === 'comparison' ? (
                      <Layers className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : style.id === 'news_article' ? (
                      <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    )}
                    <span className="truncate">{getStyleShortName(style.id)}</span>
                  </span>
                  {isSelected && <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse shrink-0 ml-1" />}
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-1 leading-tight">
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
            const isDisabled = !canChangeContentType(currentLayoutStyle, type.id);

            return (
              <button
                key={type.id}
                type="button"
                disabled={isDisabled}
                onClick={() => !isDisabled && onSelectContentType(type.id)}
                className={`py-2 px-1.5 rounded-xl border text-center flex flex-col items-center justify-center gap-1 transition ${
                  isDisabled
                    ? 'opacity-30 border-slate-800 bg-slate-950 text-slate-600 cursor-not-allowed'
                    : isSelected
                    ? 'border-amber-500 bg-amber-950/30 shadow-glow ring-1 ring-amber-500/50 text-white font-bold'
                    : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-400'
                }`}
                title={isDisabled ? 'O estilo comparativo exige 2 imagens, e os outros estilos exigem 1 ou 0 imagens.' : type.name}
              >
                {getContentIcon(type.id)}
                <span className="text-[10px] font-medium leading-tight">{type.name}</span>
              </button>
            );
          })}
        </div>

        {/* SELETOR DE ORIENTAÇÃO DAS IMAGENS (Horizontal vs Vertical) */}
        {canChangeOrientation(currentLayoutStyle, currentContentType) && (
          <div className="mt-2.5 pt-2.5 border-t border-slate-800/80 flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
              <span>Orientação das Imagens</span>
              <span className="text-[10px] font-mono text-indigo-400">
                {currentImageLayout === 'horizontal' ? 'Lado a Lado' : 'Empilhado'}
              </span>
            </label>

            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => onSelectImageLayout?.('vertical')}
                className={`py-1.5 px-2 rounded-lg border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  currentImageLayout !== 'horizontal'
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                <span>📱 Vertical</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectImageLayout?.('horizontal')}
                className={`py-1.5 px-2 rounded-lg border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  currentImageLayout === 'horizontal'
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                <span>🖥️ Horizontal</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
