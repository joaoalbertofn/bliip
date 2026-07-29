import React from 'react';
import { LayoutDashboard, Sparkles, Calendar, User, Webhook, ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import { BliipLogo } from './BliipLogo';

interface SidebarNavProps {
  currentView: 'dashboard' | 'editor' | 'planner';
  onNavigate: (view: 'dashboard' | 'editor' | 'planner') => void;
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
        <div className="flex flex-col gap-6 w-full">
          <div className="flex items-center justify-between w-full h-10 px-0.5">
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

            {/* Item 2: Bliip Studio (Editor Visual) */}
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
              title="Studio Criador de Posts"
            >
              <Sparkles className="w-4 h-4 shrink-0 text-amber-400" />
              {!isCollapsed && (
                <div className="flex items-center justify-between w-full">
                  <span>Criador de Posts</span>
                  <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded font-mono">
                    Studio
                  </span>
                </div>
              )}
            </button>

            {/* Item 3: Planejador & Calendário IA */}
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
              <Calendar className="w-4 h-4 shrink-0 text-purple-400" />
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
            <User className="w-4 h-4 text-indigo-400 shrink-0" />
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
            <Webhook className="w-4 h-4 text-emerald-400 shrink-0" />
            {!isCollapsed && <span>Integrações API</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

