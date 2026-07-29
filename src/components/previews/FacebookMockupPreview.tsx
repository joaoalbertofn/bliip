import React, { useState } from 'react';
import { Carousel, UserProfile } from '@/types/carousel';
import { SlideCanvas } from '../SlideCanvas';
import { ThumbsUp, MessageCircle, Share2, Globe, ChevronLeft, ChevronRight } from 'lucide-react';

interface FacebookMockupPreviewProps {
  carousel: Carousel;
  profile: UserProfile;
}

export const FacebookMockupPreview: React.FC<FacebookMockupPreviewProps> = ({ carousel, profile }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const slides = carousel.slides || [];
  const currentSlide = slides[activeIndex] || slides[0];

  const handlePrev = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : slides.length - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev < slides.length - 1 ? prev + 1 : 0));
  };

  const renderCaption = (text: string) => {
    if (!text) {
      return (
        <span className="italic text-slate-500">
          Escreva a legenda do post no Facebook para ver o resultado aqui...
        </span>
      );
    }
    return text;
  };

  const isSquare = carousel.aspectRatio === '1:1';
  const aspectClass = isSquare ? 'aspect-square' : 'aspect-[4/5]';

  return (
    <div className="w-full max-w-[420px] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto transition-all animate-in fade-in duration-200">
      {/* CABEÇALHO DO FACEBOOK */}
      <div className="p-3.5 flex items-center justify-between border-b border-slate-800/80 bg-slate-900">
        <div className="flex items-center gap-3">
          <img
            src={profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
            alt={profile.name}
            className="w-10 h-10 rounded-full object-cover border border-slate-700 shadow"
          />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-100 leading-tight">{profile.name}</span>
            <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
              <span>Agora mesmo</span>
              <span>•</span>
              <Globe className="w-3 h-3 text-slate-400" />
            </div>
          </div>
        </div>
      </div>

      {/* LEGENDA DO POST DO FACEBOOK */}
      <div className="p-3 bg-slate-900 text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-wrap max-h-36 overflow-y-auto scrollbar-thin">
        {renderCaption(carousel.caption || '')}
      </div>

      {/* ÁREA DE SLIDE / CARROSSEL DE IMAGENS DO FACEBOOK */}
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

        {/* CONTADOR E NAVEGAÇÃO DE SLIDES */}
        {slides.length > 1 && (
          <>
            <div className="absolute top-2 right-2 bg-slate-950/80 backdrop-blur px-2.5 py-0.5 rounded-full text-[10px] font-mono text-white border border-slate-700/60 z-10">
              {activeIndex + 1} / {slides.length}
            </div>

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

      {/* BARRA INFERIOR DE REAÇÕES DO FACEBOOK */}
      <div className="p-2 px-4 border-t border-slate-800 bg-slate-900 flex items-center justify-around">
        <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-blue-400 transition text-xs font-semibold">
          <ThumbsUp className="w-4 h-4 text-blue-500" />
          <span>Curtir</span>
        </button>
        <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition text-xs font-semibold">
          <MessageCircle className="w-4 h-4 text-slate-400" />
          <span>Comentar</span>
        </button>
        <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition text-xs font-semibold">
          <Share2 className="w-4 h-4 text-slate-400" />
          <span>Compartilhar</span>
        </button>
      </div>
    </div>
  );
};
