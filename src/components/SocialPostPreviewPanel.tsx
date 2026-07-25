import React from 'react';
import { Carousel, UserProfile } from '@/types/carousel';
import { InstagramMockupPreview } from './previews/InstagramMockupPreview';
import { LinkedInMockupPreview } from './previews/LinkedInMockupPreview';
import { YouTubeCommunityPreview } from './previews/YouTubeCommunityPreview';
import {
  Instagram,
  Linkedin,
  Youtube,
  Video,
  ChevronRight,
  ChevronLeft,
  Eye
} from 'lucide-react';

interface SocialPostPreviewPanelProps {
  carousel: Carousel;
  profile: UserProfile;
  selectedChannels: string[];
  onToggleChannel: (channelId: any) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export const SocialPostPreviewPanel: React.FC<SocialPostPreviewPanelProps> = ({
  carousel,
  profile,
  selectedChannels,
  isOpen,
  onToggleOpen,
}) => {
  if (!isOpen) {
    return (
      <div className="w-12 bg-slate-900 border-l border-slate-800 flex flex-col items-center py-4 gap-4 shrink-0 z-20">
        <button
          onClick={onToggleOpen}
          className="p-2 bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition shadow-sm"
          title="Expandir Social Post Preview"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="writing-mode-vertical text-xs font-bold text-slate-400 tracking-wider uppercase flex items-center gap-2 mt-4">
          <Eye className="w-3.5 h-3.5 text-indigo-400" />
          <span>Social Preview</span>
        </div>
      </div>
    );
  }

  return (
    <aside className="w-[380px] xl:w-[420px] bg-slate-900 border-l border-slate-800 flex flex-col overflow-hidden shrink-0 z-20 transition-all duration-300">
      {/* Header do Painel Direito */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 backdrop-blur shrink-0">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onToggleOpen}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
            title="Recolher Painel"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <div>
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
              <span>➡️ Social Post Preview</span>
            </h3>
            <p className="text-[10px] text-slate-400">Mockups em tempo real das redes ativas</p>
          </div>
        </div>

        <span className="text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-mono">
          {selectedChannels.length} ativa(s)
        </span>
      </div>

      {/* Feed Vertical Empilhado de Mockups Realistas (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6 scrollbar-thin scrollbar-thumb-slate-800">
        {selectedChannels.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 gap-2">
            <Eye className="w-8 h-8 text-slate-600 animate-pulse" />
            <p className="text-xs font-medium">Nenhuma rede ativa.</p>
            <p className="text-[10px]">Ative os canais nas "Redes Sociais de Destino" no painel central.</p>
          </div>
        ) : (
          selectedChannels.map((channelId) => {
            if (channelId === 'instagram') {
              return (
                <div key="instagram" className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs font-bold text-pink-400">
                    <div className="flex items-center gap-1.5">
                      <Instagram className="w-3.5 h-3.5" />
                      <span>Instagram Feed Preview</span>
                    </div>
                    <span className="text-[10px] font-normal text-slate-400 font-mono">
                      {carousel.aspectRatio || '4:5'}
                    </span>
                  </div>
                  <InstagramMockupPreview carousel={carousel} profile={profile} />
                </div>
              );
            }

            if (channelId === 'linkedin') {
              return (
                <div key="linkedin" className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs font-bold text-blue-400">
                    <div className="flex items-center gap-1.5">
                      <Linkedin className="w-3.5 h-3.5" />
                      <span>LinkedIn Document Post Preview</span>
                    </div>
                    <span className="text-[10px] font-normal text-slate-400 font-mono">
                      {carousel.aspectRatio || '4:5'}
                    </span>
                  </div>
                  <LinkedInMockupPreview carousel={carousel} profile={profile} />
                </div>
              );
            }

            if (channelId === 'youtube') {
              return (
                <div key="youtube" className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs font-bold text-red-400">
                    <div className="flex items-center gap-1.5">
                      <Youtube className="w-3.5 h-3.5" />
                      <span>YouTube Community Post Preview</span>
                    </div>
                    <span className="text-[10px] font-normal text-slate-400 font-mono">
                      {carousel.aspectRatio || '4:5'}
                    </span>
                  </div>
                  <YouTubeCommunityPreview carousel={carousel} profile={profile} />
                </div>
              );
            }

            if (channelId === 'tiktok') {
              return (
                <div key="tiktok" className="flex flex-col gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-teal-400">
                    <Video className="w-3.5 h-3.5" />
                    <span>TikTok Photo Mode Preview</span>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center text-xs text-slate-400">
                    <p className="font-semibold text-white mb-1">TikTok Modo Fotos</p>
                    <p className="text-[11px]">{carousel.slides.length} slides prontos para carrossel no TikTok.</p>
                  </div>
                </div>
              );
            }

            return null;
          })
        )}
      </div>
    </aside>
  );
};
