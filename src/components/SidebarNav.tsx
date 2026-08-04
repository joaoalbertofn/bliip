import React from 'react';
import {
  LayoutDashboard,
  GalleryHorizontalEnd,
  Film,
  Smartphone,
  MonitorPlay,
  BrainCircuit,
  UserCog,
  Plug,
  ChevronLeft,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { BliipLogo } from './BliipLogo';

export type CreatorViewMode = 'dashboard' | 'editor' | 'planner' | 'vertical_video' | 'stories' | 'long_video';

interface SidebarNavProps {
  currentView: CreatorViewMode;
  onNavigate: (view: CreatorViewMode) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenProfile: () => void;
  onOpenIntegrations: () => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  currentView,
  onNavigate,
  isCollapsed,
  onToggleCollapse,
  onOpenProfile,
  onOpenIntegrations,
}) => {
  return (
    <>
      {/* Backdrop transparente para fechar ao clicar fora quando aberta no modo overlay */}
      {!isCollapsed && (
        <div
          onClick={onToggleCollapse}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity"
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 bg-slate-900/98 border-r border-slate-800/80 flex flex-col justify-between py-4 transition-all duration-300 backdrop-blur-xl shadow-2xl ${
          isCollapsed ? 'w-16 px-2' : 'w-64 px-4 ring-1 ring-slate-700/50'
        }`}
      >
        {/* Top Section: Header com Logo e Botão de Toggle Fixo no Topo */}
        <div className="flex flex-col gap-5 w-full overflow-y-auto scrollbar-none">
          <div className="flex items-center justify-between w-full h-10 px-0.5 shrink-0">
            <div
              onClick={() => {
                onNavigate('dashboard');
                if (!isCollapsed) onToggleCollapse();
              }}
              className="flex items-center cursor-pointer group truncate"
            >
              <BliipLogo
                size={isCollapsed ? 'md' : 'lg'}
                showText={!isCollapsed}
                textVersion="v2.0"
                subtitle="Estúdio & IA Strategist"
              />
            </div>

            {/* Botão de Toggle Fixo no Topo Direito (Sempre na mesma posição) */}
            <button
              onClick={onToggleCollapse}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700/80 transition shrink-0 ml-1 shadow-sm"
              title={isCollapsed ? 'Expandir Menu Lateral' : 'Recolher Menu Lateral'}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Items de Navegação */}
          <nav className="flex flex-col gap-1.5 w-full">
            {/* Item 1: Dashboard */}
            <button
              onClick={() => {
                onNavigate('dashboard');
                if (!isCollapsed) onToggleCollapse();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs transition ${
                currentView === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-glow'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
              title="Dashboard de Conteúdos"
            >
              <LayoutDashboard className="w-4 h-4 shrink-0 text-indigo-400" />
              {!isCollapsed && <span>Dashboard</span>}
            </button>

            {/* Divisor de Seção de Criação */}
            {!isCollapsed && (
              <div className="px-3 pt-2 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                Ferramentas de Criação
              </div>
            )}

            {/* 1. Criador de Carrossel / Post */}
            <button
              onClick={() => {
                onNavigate('editor');
                if (!isCollapsed) onToggleCollapse();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs transition ${
                currentView === 'editor'
                  ? 'bg-indigo-600 text-white shadow-glow'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
              title="Criador de Carrossel & Posts Estáticos"
            >
              <GalleryHorizontalEnd className="w-4 h-4 shrink-0 text-amber-400" />
              {!isCollapsed && (
                <div className="flex items-center justify-between w-full">
                  <span>Criador de Carrossel/Post</span>
                </div>
              )}
            </button>

            {/* 2. Criador de Vídeos Verticais */}
            <button
              onClick={() => {
                onNavigate('vertical_video');
                if (!isCollapsed) onToggleCollapse();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs transition ${
                currentView === 'vertical_video'
                  ? 'bg-indigo-600 text-white shadow-glow'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
              title="Criador de Vídeos Verticais (Reels / TikTok / Shorts)"
            >
              <Film className="w-4 h-4 shrink-0 text-pink-400" />
              {!isCollapsed && (
                <div className="flex items-center justify-between w-full">
                  <span>Vídeos Verticais</span>
                  <span className="text-[9px] bg-pink-500/20 text-pink-300 border border-pink-500/30 px-1.5 py-0.5 rounded font-mono">
                    9:16
                  </span>
                </div>
              )}
            </button>

            {/* 3. Criador de Stories */}
            <button
              onClick={() => {
                onNavigate('stories');
                if (!isCollapsed) onToggleCollapse();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs transition ${
                currentView === 'stories'
                  ? 'bg-indigo-600 text-white shadow-glow'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
              title="Criador de Stories (Efêmero 24h)"
            >
              <Smartphone className="w-4 h-4 shrink-0 text-rose-400" />
              {!isCollapsed && (
                <div className="flex items-center justify-between w-full">
                  <span>Criador de Stories</span>
                  <span className="text-[9px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-1.5 py-0.5 rounded font-mono">
                    24h
                  </span>
                </div>
              )}
            </button>

            {/* 4. Criador de Vídeos Longos */}
            <button
              onClick={() => {
                onNavigate('long_video');
                if (!isCollapsed) onToggleCollapse();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs transition ${
                currentView === 'long_video'
                  ? 'bg-indigo-600 text-white shadow-glow'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
              title="Criador de Vídeos Longos (YouTube / LinkedIn)"
            >
              <MonitorPlay className="w-4 h-4 shrink-0 text-red-400" />
              {!isCollapsed && (
                <div className="flex items-center justify-between w-full">
                  <span>Vídeos Longos</span>
                  <span className="text-[9px] bg-red-500/20 text-red-300 border border-red-500/30 px-1.5 py-0.5 rounded font-mono">
                    16:9
                  </span>
                </div>
              )}
            </button>

            {/* Divisor de Estratégia */}
            {!isCollapsed && (
              <div className="px-3 pt-2 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                Estratégia & IA
              </div>
            )}

            {/* Item 5: Planejador & Calendário IA */}
            <button
              onClick={() => {
                onNavigate('planner');
                if (!isCollapsed) onToggleCollapse();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs transition ${
                currentView === 'planner'
                  ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-600 text-white shadow-glow'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
              title="Planejador Estratégico IA"
            >
              <BrainCircuit className="w-4 h-4 shrink-0 text-purple-400" />
              {!isCollapsed && (
                <div className="flex items-center justify-between w-full">
                  <span>Planejador IA</span>
                  <span className="text-[9px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 py-0.5 rounded font-mono flex items-center gap-0.5">
                    <Zap className="w-2.5 h-2.5 text-purple-300" />
                    <span>Novo</span>
                  </span>
                </div>
              )}
            </button>
          </nav>
        </div>

        {/* Bottom Section: Profile & Integrations */}
        <div className="flex flex-col gap-2 w-full pt-4 border-t border-slate-800/80">
          <button
            onClick={() => {
              onOpenProfile();
              if (!isCollapsed) onToggleCollapse();
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 transition ${
              isCollapsed ? 'justify-center px-0' : ''
            }`}
            title="Perfil do Usuário & Perfil do Negócio"
          >
            <UserCog className="w-4 h-4 text-indigo-400 shrink-0" />
            {!isCollapsed && <span>Perfil & Quiz do Negócio</span>}
          </button>

          <button
            onClick={() => {
              onOpenIntegrations();
              if (!isCollapsed) onToggleCollapse();
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 transition ${
              isCollapsed ? 'justify-center px-0' : ''
            }`}
            title="Integrações Buffer & Webhook"
          >
            <Plug className="w-4 h-4 text-emerald-400 shrink-0" />
            {!isCollapsed && <span>Integrações API</span>}
          </button>
        </div>
      </aside>
    </>
  );
};


