import React, { useState } from 'react';
import { Carousel, UserProfile } from '@/types/carousel';
import { SlideCanvas } from '../SlideCanvas';
import { Heart, MessageCircle, Repeat2, Send, Bookmark, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';

interface InstagramMockupPreviewProps {
  carousel: Carousel;
  profile: UserProfile;
}

export const InstagramMockupPreview: React.FC<InstagramMockupPreviewProps> = ({ carousel, profile }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const slides = carousel.slides || [];
  const currentSlide = slides[activeIndex] || slides[0];

  const handlePrev = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : slides.length - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev < slides.length - 1 ? prev + 1 : 0));
  };

  const formattedHandle = profile.handle || profile.name.toLowerCase().replace(/\s+/g, '');
  const isSquare = carousel.aspectRatio === '1:1';
  const aspectClass = isSquare ? 'aspect-square' : 'aspect-[4/5]';

  const renderCaptionWithHashtags = (text: string) => {
    if (!text) {
      return (
        <span className="italic text-slate-500">
          Escreva a legenda geral do post na barra lateral para ver o resultado aqui...
        </span>
      );
    }

    const parts = text.split(/(\s+)/);
    return parts.map((part, idx) => {
      if (part.startsWith('#')) {
        return (
          <span key={idx} className="text-sky-400 font-medium hover:underline cursor-pointer">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="w-full max-w-[420px] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto transition-all animate-in fade-in duration-200">
      {/* Cabeçalho do Perfil do Instagram */}
      <div className="flex items-center justify-between p-3.5 border-b border-slate-800/80 bg-slate-900/90">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full p-[2px] bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600">
            <img
              src={profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
              alt={profile.name}
              className="w-full h-full rounded-full object-cover border border-slate-900"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-100 flex items-center gap-1">
              {formattedHandle}
            </span>
            <span className="text-[10px] text-slate-400">Original Audio</span>
          </div>
        </div>

        <button type="button" className="text-slate-400 hover:text-white p-1">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* ÁREA DO SLIDE / CARROSSEL COM CONTROLES LATERAIS */}
      <div className={`relative w-full ${aspectClass} bg-black flex items-center justify-center overflow-hidden group`}>
        {currentSlide && (
          <div className="w-full h-full flex items-center justify-center p-0 scale-[0.78] sm:scale-[0.82] transition-transform">
            <SlideCanvas
              slide={currentSlide}
              profile={profile}
              aspectRatio={carousel.aspectRatio || '4:5'}
            />
          </div>
        )}

        {/* Setas de Navegação de Slides */}
        {slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white flex items-center justify-center shadow-lg border border-slate-700/60 opacity-80 group-hover:opacity-100 transition z-10"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white flex items-center justify-center shadow-lg border border-slate-700/60 opacity-80 group-hover:opacity-100 transition z-10"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* BARRA DE AÇÕES (LIKE, COMENTAR, ENVIAR, PONTINHOS DO CARROSSEL) */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-t border-slate-800/40">
        <div className="flex items-center gap-4 text-slate-200">
          <button type="button" className="hover:text-red-500 transition">
            <Heart className="w-5 h-5" />
          </button>
          <button type="button" className="hover:text-indigo-400 transition">
            <MessageCircle className="w-5 h-5" />
          </button>
          <button type="button" className="hover:text-emerald-400 transition">
            <Repeat2 className="w-5 h-5" />
          </button>
          <button type="button" className="hover:text-amber-400 transition">
            <Send className="w-5 h-5" />
          </button>
        </div>

        {/* Pontinhos do Carrossel */}
        {slides.length > 1 && (
          <div className="flex items-center gap-1">
            {slides.map((_, idx) => (
              <span
                key={idx}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  idx === activeIndex ? 'bg-sky-400 scale-125' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>
        )}

        <button type="button" className="text-slate-400 hover:text-white">
          <Bookmark className="w-5 h-5" />
        </button>
      </div>

      {/* ÁREA DA LEGENDA DO POST COM SUPORTE A HASHTAGS */}
      <div className="px-4 pb-4 flex flex-col gap-1 bg-slate-900 text-xs text-slate-200 leading-relaxed max-h-36 overflow-y-auto scrollbar-thin">
        <div className="text-slate-300 whitespace-pre-wrap font-sans">
          <strong className="text-white font-bold mr-1.5">{formattedHandle}</strong>
          {renderCaptionWithHashtags(carousel.caption || '')}
        </div>
      </div>
    </div>
  );
};
