import React from 'react';
import { UserProfile, Carousel } from '@/types/carousel';
import { Sparkles, User, Webhook, Download, Plus, Save } from 'lucide-react';
import { BliipLogo } from './BliipLogo';

interface NavbarProps {
  carouselName: string;
  onUpdateCarouselName: (name: string) => void;
  carousels: Carousel[];
  activeCarouselId: string;
  onSelectCarousel: (id: string) => void;
  onCreateNewCarousel: () => void;
  profile: UserProfile;
  onOpenProfileModal: () => void;
  onOpenIntegrationsModal: () => void;
  onOpenExportModal: () => void;
  onBackToDashboard: () => void;
  isSaving: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  carouselName,
  onUpdateCarouselName,
  carousels,
  activeCarouselId,
  onSelectCarousel,
  onCreateNewCarousel,
  profile,
  onOpenProfileModal,
  onOpenIntegrationsModal,
  onOpenExportModal,
  onBackToDashboard,
  isSaving,
}) => {
  return (
    <header className="w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-6 py-3.5 flex items-center justify-between z-30 shrink-0">
      {/* Brand Logo & Back to Dashboard Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBackToDashboard}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 text-xs font-bold transition shadow-sm"
          title="Voltar para a página principal do Dashboard"
        >
          <span className="text-indigo-400 font-extrabold text-sm">‹</span>
          <span>Dashboard</span>
        </button>

        <div className="h-5 w-px bg-slate-800 hidden md:block" />

        <div onClick={onBackToDashboard} className="cursor-pointer group">
          <BliipLogo size="sm" showText={true} />
        </div>
      </div>

      {/* Center: Title Editing */}
      <div className="flex-1 max-w-sm mx-4">
        <div className="relative flex items-center">
          <input
            type="text"
            value={carouselName}
            onChange={(e) => onUpdateCarouselName(e.target.value)}
            className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-1.5 text-center font-bold text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
            placeholder="Nome do Carrossel..."
          />
          {isSaving && (
            <span className="absolute right-3 text-[10px] text-slate-400 flex items-center gap-1 font-mono">
              <Save className="w-3 h-3 animate-pulse text-indigo-400" />
              <span>salvando...</span>
            </span>
          )}
        </div>
      </div>

      {/* Right Action Controls */}
      <div className="flex items-center gap-2.5">
        {/* Profile Avatar Button */}
        <button
          onClick={onOpenProfileModal}
          className="flex items-center gap-2 p-1.5 pr-3 bg-slate-800 hover:bg-slate-700 border border-slate-700/80 rounded-xl text-slate-200 text-xs font-semibold transition"
          title="Configuração de Perfil"
        >
          <img
            src={profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
            alt="Perfil"
            className="w-6 h-6 rounded-full object-cover border border-indigo-400"
          />
          <span className="hidden sm:inline max-w-[100px] truncate">{profile.name}</span>
        </button>

        {/* Integrations Button */}
        <button
          onClick={onOpenIntegrationsModal}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition"
          title="Integrações Make.com / Buffer"
        >
          <Webhook className="w-4 h-4 text-indigo-400" />
        </button>

        {/* Export Button */}
        <button
          onClick={onOpenExportModal}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl shadow-glow font-bold text-xs transition"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Exportar</span>
        </button>
      </div>
    </header>
  );
};
