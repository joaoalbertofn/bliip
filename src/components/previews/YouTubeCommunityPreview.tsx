import React, { useState } from 'react';
import { Carousel, UserProfile } from '@/types/carousel';
import { SlideCanvas } from '../SlideCanvas';
import { ThumbsUp, ThumbsDown, MessageSquare, Share2, ChevronLeft, ChevronRight } from 'lucide-react';

interface YouTubeCommunityPreviewProps {
  carousel: Carousel;
  profile: UserProfile;
}

export const YouTubeCommunityPreview: React.FC<YouTubeCommunityPreviewProps> = ({ carousel, profile }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const slides = carousel.slides || [];
  const currentSlide = slides[activeIndex] || slides[0];

  const handlePrev = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : slides.length - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev < slides.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="w-full max-w-[460px] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto transition-all animate-in fade-in duration-200">
      {/* CABEÇALHO DO YOUTUBE COMUNIDADE */}
      <div className="p-4 flex items-center justify-between border-b border-slate-800/80 bg-slate-900">
        <div className="flex items-center gap-3">
          <img
            src={profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
            alt={profile.name}
            className="w-10 h-10 rounded-full object-cover border border-slate-700 shadow"
          />
          <div className="flex flex-col">
            <span className="text-sm font-bold text-slate-100 leading-tight flex items-center gap-1">
              {profile.name}
              <span className="text-[10px] font-semibold bg-red-600/30 text-red-400 border border-red-500/40 px-1.5 py-0.5 rounded-full">
                YouTube
              </span>
            </span>
            <span className="text-[11px] text-slate-400">há 2 horas (Aba Comunidade)</span>
          </div>
        </div>
      </div>

      {/* TEXTO DA POSTAGEM DA COMUNIDADE DO YOUTUBE */}
      <div className="p-4 bg-slate-900 text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-wrap max-h-40 overflow-y-auto scrollbar-thin">
        {carousel.caption || (
          <span className="italic text-slate-500">
            Escreva a legenda para a postagem da comunidade do YouTube na barra lateral...
          </span>
        )}
      </div>

      {/* ÁREA DO SLIDE / ANEXO DE IMAGEM */}
      <div className="relative w-full aspect-[4/5] bg-black flex items-center justify-center overflow-hidden group">
        {currentSlide && (
          <div className="w-full h-full scale-[0.95]">
            <SlideCanvas
              slide={currentSlide}
              profile={profile}
              aspectRatio={carousel.aspectRatio || '4:5'}
            />
          </div>
        )}

        {/* Setas de Navegação */}
        {slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white flex items-center justify-center shadow-lg border border-slate-700/60 opacity-80 group-hover:opacity-100 transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white flex items-center justify-center shadow-lg border border-slate-700/60 opacity-80 group-hover:opacity-100 transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* BARRA DE AÇÕES DO YOUTUBE */}
      <div className="p-3 border-t border-slate-800 bg-slate-900 flex items-center justify-between text-slate-400">
        <div className="flex items-center gap-4">
          <button type="button" className="flex items-center gap-1 hover:text-white transition text-xs">
            <ThumbsUp className="w-4 h-4" />
            <span>124</span>
          </button>
          <button type="button" className="hover:text-white transition">
            <ThumbsDown className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button type="button" className="flex items-center gap-1 hover:text-white transition text-xs">
            <Share2 className="w-4 h-4" />
          </button>
          <button type="button" className="flex items-center gap-1 hover:text-white transition text-xs">
            <MessageSquare className="w-4 h-4" />
            <span>18</span>
          </button>
        </div>
      </div>
    </div>
  );
};
