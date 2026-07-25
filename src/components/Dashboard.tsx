import React, { useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Carousel, UserProfile } from '@/types/carousel';
import { SlideCanvas } from './SlideCanvas';
import {
  Plus,
  Search,
  Folder,
  CheckCircle2,
  Clock,
  Edit3,
  Copy,
  Download,
  Trash2,
  AlertTriangle,
  Sparkles,
  User,
  Webhook,
  LogOut
} from 'lucide-react';

interface DashboardProps {
  carousels: Carousel[];
  profile: UserProfile;
  onOpenNewCarouselModal: () => void;
  onEditCarousel: (id: string) => void;
  onDuplicateCarousel: (id: string) => void;
  onDeleteCarousel: (id: string) => void;
  onQuickExportCarousel: (carousel: Carousel) => void;
  onOpenProfileModal: () => void;
  onOpenIntegrationsModal: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  carousels,
  profile,
  onOpenNewCarouselModal,
  onEditCarousel,
  onDuplicateCarousel,
  onDeleteCarousel,
  onQuickExportCarousel,
  onOpenProfileModal,
  onOpenIntegrationsModal,
}) => {
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'sent'>('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Filtro de Busca e Status
  const filteredCarousels = carousels.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
    const cStatus = c.status || 'draft';
    if (statusFilter === 'draft') return matchesSearch && cStatus === 'draft';
    if (statusFilter === 'sent') return matchesSearch && cStatus === 'sent';
    return matchesSearch;
  });

  // Estatísticas
  const totalCount = carousels.length;
  const draftCount = carousels.filter((c) => (c.status || 'draft') === 'draft').length;
  const sentCount = carousels.filter((c) => c.status === 'sent').length;

  const carouselToDelete = carousels.find((c) => c.id === confirmDeleteId);

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Bar do Dashboard */}
      <header className="w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-extrabold text-xl shadow-glow">
            B
          </div>
          <div>
            <h1 className="font-extrabold text-white text-xl leading-none flex items-center gap-2">
              Bliip Studio <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-mono">v1.0</span>
            </h1>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Seus Posts & Carrosséis para Instagram</p>
          </div>
        </div>

        {/* Busca e Ações Direitas */}
        <div className="flex items-center gap-3">
          {/* Busca por Nome */}
          <div className="relative hidden md:block w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar conteúdo..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Autenticação Google & Perfil */}
          {session ? (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenProfileModal}
                className="flex items-center gap-2 p-1.5 pr-3 bg-slate-800 hover:bg-slate-700 border border-indigo-500/40 rounded-xl text-slate-200 text-xs font-semibold transition"
                title="Sua conta Google conectada"
              >
                <img
                  src={session.user?.image || profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt={session.user?.name || profile.name}
                  className="w-7 h-7 rounded-full object-cover border border-indigo-400"
                />
                <span className="hidden sm:inline max-w-[100px] truncate">{session.user?.name || profile.name}</span>
              </button>
              <button
                onClick={() => signOut()}
                className="p-2 bg-slate-800 hover:bg-red-950/60 text-slate-400 hover:text-red-300 rounded-xl border border-slate-700 hover:border-red-800/50 transition"
                title="Sair da conta Google"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => signIn('google')}
              className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 text-xs font-semibold transition shadow-sm"
              title="Entrar com a conta do Google"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span className="hidden sm:inline">Entrar com Google</span>
            </button>
          )}

          {/* Integrações Webhook */}
          <button
            onClick={onOpenIntegrationsModal}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition"
            title="Integrações Make.com / Buffer"
          >
            <Webhook className="w-4 h-4 text-indigo-400" />
          </button>

          {/* Botão de Ação Primária "+ Novo Conteúdo" */}
          <button
            onClick={onOpenNewCarouselModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl shadow-glow font-bold text-xs transition transform hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Novo Conteúdo</span>
          </button>
        </div>
      </header>

      {/* Conteúdo Principal do Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col gap-8">
        {/* Banner de Estatísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-card">
            <div>
              <span className="text-xs font-semibold text-slate-400">Total de Conteúdos</span>
              <div className="text-2xl font-extrabold text-white mt-1">{totalCount}</div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Folder className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-card">
            <div>
              <span className="text-xs font-semibold text-slate-400">Rascunhos em Edição</span>
              <div className="text-2xl font-extrabold text-amber-400 mt-1">{draftCount}</div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-card">
            <div>
              <span className="text-xs font-semibold text-slate-400">Enviados / Exportados</span>
              <div className="text-2xl font-extrabold text-emerald-400 mt-1">{sentCount}</div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Barra de Filtros por Aba */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
                statusFilter === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Todos ({totalCount})
            </button>
            <button
              onClick={() => setStatusFilter('draft')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
                statusFilter === 'draft'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Rascunhos ({draftCount})</span>
            </button>
            <button
              onClick={() => setStatusFilter('sent')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
                statusFilter === 'sent'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Enviados ({sentCount})</span>
            </button>
          </div>

          <span className="text-xs text-slate-500 font-medium">
            Exibindo {filteredCarousels.length} conteúdo{filteredCarousels.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Grid de Cards de Carrosséis */}
        {filteredCarousels.length === 0 ? (
          <div className="w-full py-16 flex flex-col items-center justify-center text-center bg-slate-900/40 rounded-3xl border border-dashed border-slate-800 p-8">
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 mb-4">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Nenhum conteúdo encontrado</h3>
            <p className="text-xs text-slate-400 max-w-sm mb-6">
              Comece criando seu primeiro post ou carrossel para Instagram no botão abaixo.
            </p>
            <button
              onClick={onOpenNewCarouselModal}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs shadow-glow transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Criar Novo Conteúdo</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCarousels.map((carousel) => {
              const isSent = carousel.status === 'sent';
              const firstSlide = carousel.slides[0];

              return (
                <div
                  key={carousel.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition flex flex-col group shadow-card"
                >
                  {/* Capa com Preview do 1º Slide */}
                  <div
                    onClick={() => onEditCarousel(carousel.id)}
                    className="w-full aspect-[4/3] bg-slate-950 relative overflow-hidden cursor-pointer flex items-center justify-center group-hover:bg-slate-900/60 transition p-2"
                  >
                    <div className="w-full max-w-[240px] pointer-events-none scale-75 origin-center">
                      <SlideCanvas
                        slide={firstSlide}
                        profile={profile}
                        aspectRatio={carousel.aspectRatio || '4:5'}
                      />
                    </div>

                    {/* Tag de Status no canto superior do Card */}
                    <div className="absolute top-3 right-3 z-10">
                      {isSent ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 shadow-sm">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Enviado / Exportado</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 shadow-sm">
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span>Rascunho</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Informações do Carrossel */}
                  <div className="p-4 flex-1 flex flex-col justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-white text-base truncate group-hover:text-indigo-400 transition">
                        {carousel.name}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 font-mono">
                        <span>{carousel.slides.length} slides</span>
                        <span>•</span>
                        <span>{new Date(carousel.updatedAt).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>

                    {/* Ações Rápidas nos Cards */}
                    <div className="grid grid-cols-4 gap-1.5 pt-3 border-t border-slate-800">
                      <button
                        onClick={() => onEditCarousel(carousel.id)}
                        className="p-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white transition font-semibold text-xs flex items-center justify-center gap-1 col-span-1"
                        title="Editar Carrossel"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Editar</span>
                      </button>

                      <button
                        onClick={() => onQuickExportCarousel(carousel)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition font-semibold text-xs flex items-center justify-center gap-1 col-span-1"
                        title="Exportação Rápida"
                      >
                        <Download className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="hidden sm:inline">Baixar</span>
                      </button>

                      <button
                        onClick={() => onDuplicateCarousel(carousel.id)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition font-semibold text-xs flex items-center justify-center gap-1 col-span-1"
                        title="Duplicar Carrossel"
                      >
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span className="hidden sm:inline">Copiar</span>
                      </button>

                      <button
                        onClick={() => setConfirmDeleteId(carousel.id)}
                        className="p-2 rounded-xl bg-red-950/60 hover:bg-red-900/80 text-red-400 transition font-semibold text-xs flex items-center justify-center gap-1 col-span-1"
                        title="Excluir Carrossel"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal de Confirmação de Exclusão de Carrossel */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-red-950/80 border border-red-800 text-red-400 flex items-center justify-center mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-white mb-1">
              Excluir Conteúdo?
            </h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Tem certeza que deseja apagar o carrossel <strong>"{carouselToDelete?.name}"</strong>? Esta ação não poderá ser desfeita.
            </p>

            <div className="flex items-center justify-center gap-3 w-full">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 py-2.5 px-4 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onDeleteCarousel(confirmDeleteId);
                  setConfirmDeleteId(null);
                }}
                className="flex-1 py-2.5 px-4 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-xl shadow-lg transition flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Sim, Excluir</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
