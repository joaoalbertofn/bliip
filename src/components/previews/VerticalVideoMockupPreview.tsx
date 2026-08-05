import React, { useState } from 'react';
import { SocialChannel, UserProfile } from '@/types/carousel';
import { VerticalVideoProject } from '@/types/video';

interface VerticalVideoMockupPreviewProps {
  project: VerticalVideoProject;
  profile: UserProfile;
  currentTime: number;
}

export const VerticalVideoMockupPreview: React.FC<VerticalVideoMockupPreviewProps> = ({
  project,
  profile,
  currentTime,
}) => {
  const [activeChannel, setActiveChannel] = useState<SocialChannel>('instagram');
  const [isCaptionExpanded, setIsCaptionExpanded] = useState<boolean>(false);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-slate-950 text-slate-100">
      {/* Channel Abas Selector */}
      <div className="flex items-center gap-2 mb-4 bg-slate-900 p-1.5 rounded-full border border-slate-800 text-xs font-bold shadow-lg">
        {[
          { id: 'instagram', label: '📸 Reels' },
          { id: 'tiktok', label: '🎵 TikTok' },
          { id: 'youtube', label: '🔴 Shorts' },
          { id: 'linkedin', label: '💼 LinkedIn' },
        ].map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveChannel(c.id as SocialChannel)}
            className={`px-3 py-1.5 rounded-full transition ${
              activeChannel === c.id
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Realistic Phone Container */}
      <div className="relative w-[320px] aspect-[9/16] bg-black border-4 border-slate-800 rounded-[38px] shadow-2xl overflow-hidden flex flex-col justify-between p-4">
        {/* Top Header Mockup */}
        <div className="flex items-center justify-between text-white/80 text-xs z-20 pt-2 px-1">
          <span className="font-bold">{activeChannel === 'instagram' ? 'Reels' : activeChannel.toUpperCase()}</span>
          <span className="font-mono text-[10px]">9:16</span>
        </div>

        {/* Center Video Content Indicator */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {project.videoUrl ? (
            <video src={project.videoUrl} className="w-full h-full object-cover" />
          ) : (
            <div className="text-slate-600 text-xs font-mono">Vídeo 9:16 Preview</div>
          )}
        </div>

        {/* Bottom Post Description & Caption Box ("...mais") */}
        <div className="relative z-20 mt-auto bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 rounded-b-2xl">
          <div className="flex items-center gap-2 mb-1.5">
            <img
              src={profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
              alt="Avatar"
              className="w-7 h-7 rounded-full border border-white/40 object-cover"
            />
            <span className="text-xs font-bold text-white">{profile.handle || '@seu_perfil'}</span>
            <button className="text-[10px] font-bold px-2 py-0.5 border border-white/40 rounded-full text-white">
              Seguir
            </button>
          </div>

          {/* Caption text with "...mais" expansion */}
          <div className="text-[11px] text-white/90 leading-relaxed">
            <p className={isCaptionExpanded ? '' : 'line-clamp-2'}>
              {project.postCaption || 'Escreva a legenda do post no painel lateral de controles...'}
            </p>
            {project.postCaption && project.postCaption.length > 60 && (
              <button
                onClick={() => setIsCaptionExpanded(!isCaptionExpanded)}
                className="text-purple-400 font-bold text-[10px] mt-0.5 inline-block"
              >
                {isCaptionExpanded ? 'ver menos' : '...mais'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
