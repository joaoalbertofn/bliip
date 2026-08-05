import React, { useState, useRef } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  Share2,
  Smile,
  Hash,
  Play,
  Pause,
  Eye,
  Check,
} from 'lucide-react';
import { SocialChannel, UserProfile } from '@/types/carousel';
import { VerticalVideoProject } from '@/types/video';

interface VideoSocialPostPreviewPanelProps {
  project: VerticalVideoProject;
  profile: UserProfile;
  selectedChannels: SocialChannel[];
  caption: string;
  onCaptionChange: (caption: string) => void;
  onToggleChannel: (channel: SocialChannel) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export const VideoSocialPostPreviewPanel: React.FC<VideoSocialPostPreviewPanelProps> = ({
  project,
  profile,
  selectedChannels,
  caption,
  onCaptionChange,
  onToggleChannel,
  isOpen,
  onToggleOpen,
}) => {
  const popularEmojis = ['🔥', '💡', '📌', '🚀', '👇', '🎯', '✨', '🎥', '👏'];
  const popularTags = ['#dica', '#conteudo', '#estrategia', '#marketing', '#reels', '#tiktok'];

  const handleAddEmoji = (emoji: string) => {
    onCaptionChange(caption + emoji);
  };

  const handleAddTag = (tag: string) => {
    onCaptionChange(caption + (caption.endsWith(' ') || !caption ? '' : ' ') + tag);
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggleOpen}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-purple-600 hover:bg-purple-500 text-white p-2.5 rounded-l-2xl shadow-2xl transition border border-r-0 border-purple-400 flex items-center justify-center"
        title="Abrir Painel de Pré-Visualização Social"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
    );
  }

  return (
    <aside className="w-[360px] sm:w-[400px] h-full bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 z-30 overflow-hidden shadow-2xl relative">
      {/* HEADER DO PAINEL DIREITO */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onToggleOpen}
            className="p-1.5 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-200 transition"
            title="Recolher Painel"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <div>
            <h3 className="text-xs font-extrabold text-slate-100 flex items-center gap-2">
              <span>SOCIAL POST PREVIEW</span>
              <span className="px-2 py-0.5 rounded-full bg-purple-950 border border-purple-500/40 text-purple-300 text-[10px] font-mono">
                {selectedChannels.length} ativa(s)
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">Mockups em tempo real das redes ativas</p>
          </div>
        </div>
      </div>

      {/* PAINEL SCROLLABLE COM LEGENDA E MOCKUPS EMPILHADOS */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin">
        {/* 1. SELEÇÃO DE REDES SOCIAIS DE DESTINO */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5 text-purple-400" />
              <span>Redes Sociais de Destino</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">{selectedChannels.length} conectadas</span>
          </label>

          <div className="flex flex-wrap gap-2">
            {[
              { id: 'instagram', label: 'Instagram Reels' },
              { id: 'tiktok', label: 'TikTok' },
              { id: 'youtube', label: 'YouTube Shorts' },
              { id: 'linkedin', label: 'LinkedIn Video' },
            ].map((channel) => {
              const isSelected = selectedChannels.includes(channel.id as SocialChannel);
              return (
                <button
                  key={channel.id}
                  onClick={() => onToggleChannel(channel.id as SocialChannel)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-purple-600 text-white border-purple-400 shadow-md'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                  <span>{channel.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. LEGENDA GLOBAL DA PUBLICAÇÃO */}
        <div className="space-y-2 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-200">Legenda Global da Publicação</label>
            <span className="text-[10px] font-mono text-slate-400 font-bold">{caption.length} caracteres</span>
          </div>

          <textarea
            rows={4}
            value={caption}
            onChange={(e) => onCaptionChange(e.target.value)}
            placeholder="Escreva a legenda geral do post (usada no Instagram, TikTok, Shorts, LinkedIn)... Ex: Você já se perguntou como criar um Reels viral? #conteudo #video"
            className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:border-purple-500 outline-none resize-none leading-relaxed"
          />

          {/* Quick Emojis & Tags Bar */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] text-slate-400 flex items-center gap-1 font-bold">
                <Smile className="w-3 h-3 text-amber-400" /> Emojis:
              </span>
              {popularEmojis.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => handleAddEmoji(e)}
                  className="px-1.5 py-0.5 bg-slate-900 hover:bg-slate-800 rounded border border-slate-800 text-xs transition"
                >
                  {e}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] text-slate-400 flex items-center gap-1 font-bold">
                <Hash className="w-3 h-3 text-purple-400" /> Tags:
              </span>
              {popularTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleAddTag(tag)}
                  className="px-2 py-0.5 bg-purple-950/60 hover:bg-purple-900/60 border border-purple-500/40 text-purple-300 text-[10px] font-bold rounded-lg transition"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3. MOCKUPS REALISTAS EMPILHADOS DAS REDES ATIVAS */}
        <div className="space-y-6 pt-2">
          {selectedChannels.includes('instagram') && (
            <InstagramReelsMockupCard project={project} profile={profile} caption={caption} />
          )}

          {selectedChannels.includes('tiktok') && (
            <TikTokMockupCard project={project} profile={profile} caption={caption} />
          )}

          {selectedChannels.includes('youtube') && (
            <YouTubeShortsMockupCard project={project} profile={profile} caption={caption} />
          )}

          {selectedChannels.includes('linkedin') && (
            <LinkedInVideoMockupCard project={project} profile={profile} caption={caption} />
          )}
        </div>
      </div>
    </aside>
  );
};

/* MOCKUP 1: INSTAGRAM REELS (Legenda sobreposta na base + Play individual) */
const InstagramReelsMockupCard: React.FC<{
  project: VerticalVideoProject;
  profile: UserProfile;
  caption: string;
}> = ({ project, profile, caption }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-3xl p-3 shadow-xl space-y-2">
      <div className="flex items-center justify-between text-xs font-bold text-slate-300 px-1">
        <span className="flex items-center gap-1.5 text-pink-400">
          <span>📸 Instagram Reels</span>
        </span>
        <span className="text-[10px] font-mono text-slate-500">9:16</span>
      </div>

      <div className="relative w-full aspect-[9/16] bg-black rounded-2xl overflow-hidden group shadow-2xl">
        {project.videoUrl ? (
          <video
            ref={videoRef}
            src={project.videoUrl}
            loop
            muted={project.trimConfig.muted}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 text-xs font-mono p-4 text-center">
            Nenhum vídeo carregado no canvas
          </div>
        )}

        {/* Botão de Play Individual */}
        {project.videoUrl && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-slate-900/70 border border-white/30 text-white flex items-center justify-center shadow-2xl backdrop-blur-md opacity-80 group-hover:opacity-100 transition hover:scale-110 z-30"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>
        )}

        {/* Native Overlays (Right Actions Bar) */}
        <div className="absolute right-3 bottom-16 flex flex-col items-center gap-3 text-white/90 text-[10px] z-20">
          <div className="w-7 h-7 rounded-full bg-black/40 backdrop-blur border border-white/20 flex items-center justify-center">❤️</div>
          <div className="w-7 h-7 rounded-full bg-black/40 backdrop-blur border border-white/20 flex items-center justify-center">💬</div>
          <div className="w-7 h-7 rounded-full bg-black/40 backdrop-blur border border-white/20 flex items-center justify-center">✈️</div>
        </div>

        {/* Native Overlays (Bottom Overlay Caption with "...mais") */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-3 text-white z-20 pt-8">
          <div className="flex items-center gap-2 mb-1">
            <img
              src={profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
              alt="Avatar"
              className="w-6 h-6 rounded-full border border-white/40 object-cover"
            />
            <span className="text-[11px] font-bold text-white">{profile.handle || '@joaoalbertofn'}</span>
            <span className="px-2 py-0.5 border border-white/40 text-[9px] font-bold rounded-full">Seguir</span>
          </div>

          <div className="text-[11px] leading-snug text-white/90">
            <p className={isExpanded ? '' : 'line-clamp-2'}>
              {caption || 'A legenda geral da publicação aparecerá aqui no Reels com hashtags...'}
            </p>
            {caption.length > 50 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-slate-400 font-bold text-[10px] mt-0.5 inline-block"
              >
                {isExpanded ? 'ver menos' : '...mais'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* MOCKUP 2: TIKTOK (Legenda sobreposta no rodapé + Play individual) */
const TikTokMockupCard: React.FC<{
  project: VerticalVideoProject;
  profile: UserProfile;
  caption: string;
}> = ({ project, profile, caption }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-3xl p-3 shadow-xl space-y-2">
      <div className="flex items-center justify-between text-xs font-bold text-slate-300 px-1">
        <span className="flex items-center gap-1.5 text-cyan-400">
          <span>🎵 TikTok</span>
        </span>
        <span className="text-[10px] font-mono text-slate-500">9:16</span>
      </div>

      <div className="relative w-full aspect-[9/16] bg-black rounded-2xl overflow-hidden group shadow-2xl">
        {project.videoUrl ? (
          <video
            ref={videoRef}
            src={project.videoUrl}
            loop
            muted={project.trimConfig.muted}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 text-xs font-mono p-4 text-center">
            Nenhum vídeo carregado no canvas
          </div>
        )}

        {/* Play Individual */}
        {project.videoUrl && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-slate-900/70 border border-white/30 text-white flex items-center justify-center shadow-2xl backdrop-blur-md opacity-80 group-hover:opacity-100 transition hover:scale-110 z-30"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>
        )}

        {/* TikTok Native Right Bar */}
        <div className="absolute right-2.5 bottom-12 flex flex-col items-center gap-3 text-white/90 text-[10px] z-20">
          <img
            src={profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
            alt="Avatar"
            className="w-8 h-8 rounded-full border-2 border-white object-cover"
          />
          <div className="flex flex-col items-center">❤️ <span className="text-[9px]">1.2k</span></div>
          <div className="flex flex-col items-center">💬 <span className="text-[9px]">84</span></div>
          <div className="flex flex-col items-center">🔖 <span className="text-[9px]">210</span></div>
        </div>

        {/* TikTok Bottom Caption */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-3 text-white z-20 pt-8 pr-12">
          <h4 className="text-xs font-bold text-white mb-0.5">{profile.handle || '@joaoalbertofn'}</h4>
          <div className="text-[11px] leading-snug text-white/90">
            <p className={isExpanded ? '' : 'line-clamp-2'}>
              {caption || 'A legenda aparecerá aqui no formato TikTok...'}
            </p>
            {caption.length > 50 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-cyan-400 font-bold text-[10px] mt-0.5 inline-block"
              >
                {isExpanded ? 'ver menos' : '...mais'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* MOCKUP 3: YOUTUBE SHORTS (Layout nativo do Shorts + Play individual) */
const YouTubeShortsMockupCard: React.FC<{
  project: VerticalVideoProject;
  profile: UserProfile;
  caption: string;
}> = ({ project, profile, caption }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-3xl p-3 shadow-xl space-y-2">
      <div className="flex items-center justify-between text-xs font-bold text-slate-300 px-1">
        <span className="flex items-center gap-1.5 text-red-500">
          <span>🔴 YouTube Shorts</span>
        </span>
        <span className="text-[10px] font-mono text-slate-500">9:16</span>
      </div>

      <div className="relative w-full aspect-[9/16] bg-black rounded-2xl overflow-hidden group shadow-2xl">
        {project.videoUrl ? (
          <video
            ref={videoRef}
            src={project.videoUrl}
            loop
            muted={project.trimConfig.muted}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 text-xs font-mono p-4 text-center">
            Nenhum vídeo carregado no canvas
          </div>
        )}

        {/* Play Individual */}
        {project.videoUrl && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-slate-900/70 border border-white/30 text-white flex items-center justify-center shadow-2xl backdrop-blur-md opacity-80 group-hover:opacity-100 transition hover:scale-110 z-30"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>
        )}

        {/* Shorts Overlay Bottom */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-3 text-white z-20 pt-8">
          <div className="flex items-center gap-2 mb-1.5">
            <img
              src={profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
              alt="Avatar"
              className="w-6 h-6 rounded-full border border-white/40 object-cover"
            />
            <span className="text-xs font-bold text-white">{profile.name || 'João Alberto'}</span>
            <span className="px-2 py-0.5 bg-red-600 text-white font-bold text-[9px] rounded-full">INSCREVER-SE</span>
          </div>

          <p className="text-[11px] font-bold line-clamp-2 text-white">
            {caption || 'Título e legenda do Shorts com hashtag #Shorts'}
          </p>
        </div>
      </div>
    </div>
  );
};

/* MOCKUP 4: LINKEDIN VIDEO (Legenda posicionada ACIMA do vídeo + Play individual) */
const LinkedInVideoMockupCard: React.FC<{
  project: VerticalVideoProject;
  profile: UserProfile;
  caption: string;
}> = ({ project, profile, caption }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-3xl p-3 shadow-xl space-y-2">
      <div className="flex items-center justify-between text-xs font-bold text-slate-300 px-1">
        <span className="flex items-center gap-1.5 text-blue-400">
          <span>💼 LinkedIn Video (Vertical)</span>
        </span>
        <span className="text-[10px] font-mono text-slate-500">9:16 Mobile</span>
      </div>

      {/* LinkedIn Post Box Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 space-y-3">
        {/* Author Header */}
        <div className="flex items-center gap-2.5">
          <img
            src={profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
            alt="Avatar"
            className="w-9 h-9 rounded-full border border-slate-700 object-cover"
          />
          <div>
            <h4 className="text-xs font-bold text-slate-100 leading-tight">{profile.name || 'João Alberto'}</h4>
            <p className="text-[10px] text-slate-400">Estrategista de Conteúdo • 1h • 🌐</p>
          </div>
        </div>

        {/* Legenda/Descrição Posicionada ACIMA do Vídeo (Layout nativo do LinkedIn) */}
        <div className="text-xs text-slate-200 leading-relaxed">
          <p className={isExpanded ? '' : 'line-clamp-3'}>
            {caption || 'Escreva o texto do post profissional para o LinkedIn aqui...'}
          </p>
          {caption.length > 80 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-blue-400 font-bold text-[11px] mt-1 inline-block"
            >
              {isExpanded ? 'ver menos' : '...ver mais'}
            </button>
          )}
        </div>

        {/* Video Player Box 9:16 */}
        <div className="relative w-full aspect-[9/16] bg-black rounded-xl overflow-hidden group shadow-lg">
          {project.videoUrl ? (
            <video
              ref={videoRef}
              src={project.videoUrl}
              loop
              muted={project.trimConfig.muted}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 text-xs font-mono p-4 text-center">
              Nenhum vídeo carregado no canvas
            </div>
          )}

          {/* Play Individual */}
          {project.videoUrl && (
            <button
              onClick={togglePlay}
              className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-slate-900/70 border border-white/30 text-white flex items-center justify-center shadow-2xl backdrop-blur-md opacity-80 group-hover:opacity-100 transition hover:scale-110 z-30"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>
          )}
        </div>

        {/* LinkedIn Bottom Actions Bar */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/80">
          <button className="hover:text-blue-400 font-bold">👍 Gostei</button>
          <button className="hover:text-blue-400 font-bold">💬 Comentar</button>
          <button className="hover:text-blue-400 font-bold">🔄 Publicar</button>
          <button className="hover:text-blue-400 font-bold">✈️ Enviar</button>
        </div>
      </div>
    </div>
  );
};
