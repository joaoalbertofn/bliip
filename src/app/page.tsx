'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';
import { UserProfile, ContentType, LayoutStyle, SocialChannel } from '@/types/carousel';
import { loadUserProfile, saveUserProfile, DEFAULT_USER_PROFILE } from '@/lib/storage';
import { useCarouselState } from '@/hooks/useCarouselState';

import { SLIDE_THEMES, SlideTheme, getSlideTheme } from '@/lib/themes';

import { Dashboard } from '@/components/Dashboard';
import { Navbar } from '@/components/Navbar';
import { SlideCanvas } from '@/components/SlideCanvas';
import { SlideReorderBar } from '@/components/SlideReorderBar';
import { TemplateSelector } from '@/components/TemplateSelector';
import { HighlightTextEditor } from '@/components/HighlightTextEditor';
import { MediaTray } from '@/components/MediaTray';
import { CollapsibleSection } from '@/components/CollapsibleSection';
import { PostCaptionEditor } from '@/components/PostCaptionEditor';
import { SocialPostPreviewPanel } from '@/components/SocialPostPreviewPanel';
import { triggerLeadSync } from '@/lib/leadSync';

const UserProfileModal = dynamic(
  () => import('@/components/UserProfileModal').then((mod) => mod.UserProfileModal),
  { ssr: false }
);
const IntegrationsModal = dynamic(
  () => import('@/components/IntegrationsModal').then((mod) => mod.IntegrationsModal),
  { ssr: false }
);
const ExportModal = dynamic(
  () => import('@/components/ExportModal').then((mod) => mod.ExportModal),
  { ssr: false }
);

import {
  Upload,
  Palette,
  Layers,
  Plus,
  Sliders,
  Image as ImageIcon,
  Quote,
  Check,
  RotateCcw,
  ZoomIn,
  Move,
  Type,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Send,
  Eye,
  SlidersHorizontal
} from 'lucide-react';

export default function BliipApp() {
  const { data: session } = useSession();
  const [viewMode, setViewMode] = useState<'dashboard' | 'editor'>('dashboard');
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [canvasZoom, setCanvasZoom] = useState<'fit' | number>('fit');
  const [autoFitScale, setAutoFitScale] = useState<number>(1);

  // Estados de Recolhimento dos Painéis Laterais (3 Colunas)
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);

  // Modais de UI
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isIntegrationsModalOpen, setIsIntegrationsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isNewCarouselModalOpen, setIsNewCarouselModalOpen] = useState(false);
  const [newCarouselSlideCount, setNewCarouselSlideCount] = useState(3);

  const [integrations, setIntegrations] = useState<{ bufferApiKey?: string }>({ bufferApiKey: '' });
  const [connectedChannels, setConnectedChannels] = useState<SocialChannel[]>(['instagram', 'linkedin']);
  const [isBufferConnected, setIsBufferConnected] = useState<boolean>(false);

  // Carrega as integrações salvas e busca os canais realmente conectados no Buffer
  useEffect(() => {
    async function fetchBufferChannels() {
      const config = await loadUserProfile();
      const loadedIntegrations = await (await import('@/lib/storage')).loadIntegrations();
      setIntegrations(loadedIntegrations);

      if (loadedIntegrations.bufferApiKey && loadedIntegrations.bufferApiKey.trim() !== '') {
        setIsBufferConnected(true);
        try {
          const res = await fetch('/api/buffer', {
            headers: { Authorization: `Bearer ${loadedIntegrations.bufferApiKey.trim()}` },
          });
          if (res.ok) {
            const data = await res.json();
            const profiles = data.profiles || [];
            const channels: SocialChannel[] = [];
            profiles.forEach((p: any) => {
              const svc = p.service?.toLowerCase() || '';
              if (svc.includes('instagram') && !channels.includes('instagram')) channels.push('instagram');
              if (svc.includes('linkedin') && !channels.includes('linkedin')) channels.push('linkedin');
              if (svc.includes('youtube') && !channels.includes('youtube')) channels.push('youtube');
              if (svc.includes('tiktok') && !channels.includes('tiktok')) channels.push('tiktok');
            });
            if (channels.length > 0) {
              setConnectedChannels(channels);
            } else {
              setConnectedChannels(['instagram', 'linkedin']);
            }
          }
        } catch (e) {
          console.warn('Erro ao buscar canais do Buffer:', e);
        }
      } else {
        setIsBufferConnected(false);
        setConnectedChannels([]);
      }
    }

    fetchBufferChannels();
  }, [isIntegrationsModalOpen]);

  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Carrega o perfil salvo no IndexedDB / localStorage na inicialização
  useEffect(() => {
    async function initProfile() {
      const loaded = await loadUserProfile();
      if (loaded) {
        setProfile(loaded);
      }
    }
    initProfile();
  }, []);

  // Sincroniza dados da sessão do Google preservando o avatar personalizado & Sincroniza Lead
  useEffect(() => {
    if (session?.user) {
      setProfile((prev) => {
        const updated: UserProfile = {
          name: session.user?.name || prev.name,
          avatarUrl: prev.avatarUrl && !prev.avatarUrl.includes('unsplash.com') ? prev.avatarUrl : (session.user?.image || prev.avatarUrl),
          handle: session.user?.email ? `@${session.user.email.split('@')[0]}` : prev.handle,
        };
        saveUserProfile(updated);
        return updated;
      });

      // Dispara a sincronização automática com o Google Sheets
      triggerLeadSync(session.user);
    }
  }, [session]);

  // Custom Hook de Estado dos Carrosséis
  const {
    carousels,
    activeCarouselId,
    setActiveCarouselId,
    activeSlideIndex,
    setActiveSlideIndex,
    activeCarousel,
    activeSlide,
    isSaving,
    updateActiveSlide,
    handleUpdateCarouselName,
    handleToggleAspectRatio,
    handleCreateNewCarousel,
    handleDuplicateCarousel,
    handleDeleteCarousel,
    handleMarkAsSent,
    handleSelectContentType,
    handleSelectLayoutStyle,
    handleTextChange,
    handleQuoteTextChange,
    handleSignatureChange,
    handleImageUpload,
    handleImageTransform,
    handleThemeChange,
    handleBackgroundChange,
    handleAddSlide,
    handleInsertSlideAt,
    handleDuplicateSlide,
    handleDeleteSlide,
    handleMoveSlide,
    handleUploadMediaToTray,
    handleRemoveMediaFromTray,
    handleAssignMediaToSlide,
    handleCreateSlideFromMedia,
    handleCaptionChange,
    handleToggleChannel,
  } = useCarouselState(profile);

  // Refs de captura para exportação
  const activeSlideRef = useRef<HTMLDivElement>(null);
  const hiddenSlideRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Cálculo Dinâmico do Zoom "Fit" baseado na altura do contêiner do Canvas
  useEffect(() => {
    if (!canvasContainerRef.current) return;

    const updateScale = () => {
      if (!canvasContainerRef.current) return;
      const containerHeight = canvasContainerRef.current.clientHeight;
      const targetHeight = activeCarousel?.aspectRatio === '1:1' ? 460 : 575;
      const availableHeight = Math.max(containerHeight - 32, 200);
      const scale = Math.min(availableHeight / targetHeight, 1.2);
      setAutoFitScale(Math.max(scale, 0.35));
    };

    updateScale();
    const resizeObserver = new ResizeObserver(updateScale);
    resizeObserver.observe(canvasContainerRef.current);
    return () => resizeObserver.disconnect();
  }, [activeCarousel?.aspectRatio, viewMode, isLeftPanelOpen, isRightPanelOpen]);

  const effectiveZoomScale =
    canvasZoom === 'fit' ? autoFitScale : (canvasZoom as number) / 100;

  const handleSaveProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    saveUserProfile(newProfile);
  };

  if (!activeCarousel || !activeSlide) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-slate-950 text-slate-400 font-mono">
        Carregando o Bliip Studio...
      </div>
    );
  }

  // RENDERIZAÇÃO 1: Tela de Dashboard
  if (viewMode === 'dashboard') {
    return (
      <>
        <Dashboard
          carousels={carousels}
          profile={profile}
          onOpenNewCarouselModal={() => setIsNewCarouselModalOpen(true)}
          onEditCarousel={(id) => {
            setActiveCarouselId(id);
            setActiveSlideIndex(0);
            setViewMode('editor');
          }}
          onDuplicateCarousel={handleDuplicateCarousel}
          onDeleteCarousel={handleDeleteCarousel}
          onQuickExportCarousel={(carousel) => {
            setActiveCarouselId(carousel.id);
            setActiveSlideIndex(0);
            setIsExportModalOpen(true);
          }}
          onOpenProfileModal={() => setIsProfileModalOpen(true)}
          onOpenIntegrationsModal={() => setIsIntegrationsModalOpen(true)}
        />

        {/* Hidden Canvas Elements para exportação rápida no Dashboard */}
        <div className="fixed top-[-9999px] left-[-9999px] opacity-0 pointer-events-none">
          {activeCarousel.slides.map((s, idx) => (
            <div
              key={s.id}
              ref={(el) => {
                hiddenSlideRefs.current[idx] = el;
              }}
            >
              <SlideCanvas
                slide={s}
                profile={profile}
                aspectRatio={activeCarousel.aspectRatio || '4:5'}
              />
            </div>
          ))}
        </div>

        <UserProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          profile={profile}
          onSave={handleSaveProfile}
        />

        <IntegrationsModal
          isOpen={isIntegrationsModalOpen}
          onClose={() => setIsIntegrationsModalOpen(false)}
        />

        <ExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          carousel={activeCarousel}
          profile={profile}
          activeSlideElement={activeSlideRef.current}
          allSlideElements={hiddenSlideRefs.current.filter(Boolean) as HTMLElement[]}
          onMarkAsSent={handleMarkAsSent}
        />

        {isNewCarouselModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-white mb-1">Criar Novo Conteúdo</h3>
              <p className="text-xs text-slate-400 mb-5">
                Escolha a quantidade inicial de slides para o seu carrossel ou post.
              </p>

              <div className="mb-6">
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Quantidade Inicial de Slides: <span className="text-indigo-400 font-bold">{newCarouselSlideCount}</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={newCarouselSlideCount}
                  onChange={(e) => setNewCarouselSlideCount(Number(e.target.value))}
                  className="w-full accent-indigo-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                  <span>1 slide (Post Único)</span>
                  <span>5 slides</span>
                  <span>10 slides</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  onClick={() => setIsNewCarouselModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>

                <button
                  onClick={() => {
                    handleCreateNewCarousel(newCarouselSlideCount);
                    setIsNewCarouselModalOpen(false);
                    setViewMode('editor');
                  }}
                  className="px-5 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-glow transition flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Criar Conteúdo</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // RENDERIZAÇÃO 2: Tela de Editor com Arquitetura em 3 Colunas
  const maxImagesAllowed =
    activeSlide.contentType === 'text_2_images'
      ? 2
      : activeSlide.contentType === 'text_1_image'
      ? 1
      : 0;

  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden bg-slate-950">
      {/* Top Header Navbar */}
      <Navbar
        carouselName={activeCarousel.name}
        onUpdateCarouselName={handleUpdateCarouselName}
        carousels={carousels}
        activeCarouselId={activeCarousel.id}
        onSelectCarousel={(id) => {
          setActiveCarouselId(id);
          setActiveSlideIndex(0);
        }}
        onCreateNewCarousel={() => setIsNewCarouselModalOpen(true)}
        profile={profile}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onOpenIntegrationsModal={() => setIsIntegrationsModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onBackToDashboard={() => setViewMode('dashboard')}
        isSaving={isSaving}
      />

      {/* Main Workspace Area (3 Colunas de Tela) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* COLUNA 1: ⬅️ Slide Design (Painel Esquerdo - Recolhível) */}
        {!isLeftPanelOpen ? (
          <div className="w-12 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-4 gap-4 shrink-0 z-20">
            <button
              onClick={() => setIsLeftPanelOpen(true)}
              className="p-2 bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition shadow-sm"
              title="Expandir Slide Design Inspector"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <div className="writing-mode-vertical text-xs font-bold text-slate-400 tracking-wider uppercase flex items-center gap-2 mt-4">
              <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
              <span>Slide Design</span>
            </div>
          </div>
        ) : (
          <aside className="w-[360px] xl:w-[400px] bg-slate-900 border-r border-slate-800 flex flex-col overflow-hidden shrink-0 z-20 transition-all duration-300">
            {/* Header do Painel Esquerdo com Botão Recolher */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 backdrop-blur shrink-0">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
                  ⬅️ Slide Design Inspector
                </h3>
              </div>

              <button
                onClick={() => setIsLeftPanelOpen(false)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
                title="Recolher Painel"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Conteúdo de Edição do Slide em Acordeões */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 scrollbar-thin scrollbar-thumb-slate-800">
              {/* SEÇÃO 1: Bandeja de Mídias (Fotos da História) */}
              <CollapsibleSection
                icon={<ImageIcon className="w-4 h-4" />}
                title="Fotos da História"
                badgeText={`${(activeCarousel.mediaLibrary || []).length} mídias`}
                defaultOpen={true}
              >
                <MediaTray
                  mediaLibrary={activeCarousel.mediaLibrary || []}
                  onUploadMedia={handleUploadMediaToTray}
                  onRemoveMedia={handleRemoveMediaFromTray}
                  onCreateSlideFromMedia={handleCreateSlideFromMedia}
                />
              </CollapsibleSection>

              {/* SEÇÃO 2: Estilo Visual & Tipo de Conteúdo */}
              <CollapsibleSection
                icon={<Sliders className="w-4 h-4" />}
                title="Estilo Visual & Layout"
                defaultOpen={true}
              >
                <TemplateSelector
                  currentContentType={activeSlide.contentType || 'text_1_image'}
                  currentLayoutStyle={activeSlide.layoutStyle || 'twitter'}
                  onSelectContentType={handleSelectContentType}
                  onSelectLayoutStyle={handleSelectLayoutStyle}
                />
              </CollapsibleSection>

              {/* SEÇÃO 3: Edição de Texto do Slide */}
              <CollapsibleSection
                icon={<Layers className="w-4 h-4" />}
                title="Texto do Slide"
                defaultOpen={true}
              >
                {activeSlide.layoutStyle === 'immersive' ? (
                  <div className="flex flex-col gap-3">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Quote className="w-3.5 h-3.5 text-amber-400" />
                      <span>Citação Inspiracional</span>
                    </label>
                    <HighlightTextEditor
                      value={
                        activeSlide.layers.text?.find((t) => t.role === 'quote' || t.role === 'body')?.content || ''
                      }
                      onChange={handleQuoteTextChange}
                      rows={4}
                      placeholder="Digite a citação imersiva..."
                    />

                    <div className="flex flex-col gap-1.5 mt-1 pt-3 border-t border-slate-800/80">
                      <label className="text-xs font-semibold text-slate-300">
                        Assinatura (Manuscrito)
                      </label>
                      <input
                        type="text"
                        value={activeSlide.layers.text?.find((t) => t.role === 'signature')?.content || ''}
                        onChange={(e) => handleSignatureChange(e.target.value)}
                        placeholder={`Padrão: ${profile.name}`}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-handwriting text-xl"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                        <Type className="w-3.5 h-3.5 text-amber-400" />
                        <span>Conteúdo do Tweet / Post</span>
                      </label>

                      {activeSlide.contentType === 'text_only' && (
                        <div className="flex items-center gap-1">
                          {['Você:', 'Bliip:'].map((prefix) => (
                            <button
                              key={prefix}
                              type="button"
                              onClick={() => {
                                const current = activeSlide.layers.text?.[0]?.content || '';
                                const newText = current ? `${current}\n\n${prefix} ` : `${prefix} `;
                                handleTextChange(0, newText);
                              }}
                              className="px-2 py-0.5 text-[10px] font-bold bg-indigo-950 border border-indigo-700 text-indigo-300 rounded hover:bg-indigo-900 transition"
                            >
                              +{prefix}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <HighlightTextEditor
                      value={activeSlide.layers.text?.[0]?.content || ''}
                      onChange={(newText) => handleTextChange(0, newText)}
                      rows={5}
                      placeholder="Digite o texto do slide..."
                    />
                  </div>
                )}
              </CollapsibleSection>

              {/* SEÇÃO 4: Presets de Temas de Cores */}
              <CollapsibleSection
                icon={<Palette className="w-4 h-4" />}
                title="Tema de Cores do Slide"
                defaultOpen={true}
              >
                <div className="grid grid-cols-5 gap-2">
                  {(Object.keys(SLIDE_THEMES) as SlideTheme[]).map((themeId) => {
                    const themeItem = SLIDE_THEMES[themeId];
                    const activeThemeConfig = getSlideTheme(activeSlide.theme, activeSlide.background);
                    const isActive = activeThemeConfig.id === themeId;

                    return (
                      <button
                        key={themeId}
                        type="button"
                        onClick={() => handleThemeChange(themeId)}
                        className={`h-10 rounded-lg border-2 transition-all flex flex-col items-center justify-center relative shadow group ${
                          isActive ? 'border-indigo-500 scale-105 ring-2 ring-indigo-500/50' : 'border-slate-700 hover:border-slate-500'
                        }`}
                        style={{ backgroundColor: themeItem.bg }}
                        title={themeItem.name}
                      >
                        <span className="text-xs font-bold" style={{ color: themeItem.text }}>
                          Aa
                        </span>
                        {isActive && (
                          <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-indigo-600 text-white rounded-full flex items-center justify-center text-[10px] shadow">
                            ✓
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </CollapsibleSection>
            </div>
          </aside>
        )}

        {/* COLUNA 2: 🎯 Content Workspace (Painel Central: Canvas + Legenda Global Lado a Lado + Slides) */}
        <main className="flex-1 bg-slate-950 flex flex-col justify-between p-4 overflow-hidden relative min-w-0">
          {/* ÁREA CENTRAL LADO A LADO: Canvas do Slide (Esquerda) + Editor de Legenda Global (Direita) */}
          <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-6 overflow-hidden min-h-0 w-full">
            {/* Lado Esquerdo do Centro: Slide Canvas com Zoom & Controles Flutuantes */}
            <div className="flex-1 h-full flex flex-col items-center justify-center overflow-hidden min-h-0 relative w-full">
              {/* Barra Flutuante de Proporção & Zoom */}
              <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-800 px-3.5 py-1 rounded-2xl shadow-xl backdrop-blur mb-2 z-10 shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-slate-400">Proporção:</span>
                  <button
                    type="button"
                    onClick={() => handleToggleAspectRatio('4:5')}
                    className={`px-2.5 py-0.5 text-xs font-bold rounded-full transition ${
                      (activeCarousel.aspectRatio || '4:5') === '4:5'
                        ? 'bg-indigo-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    4:5
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleAspectRatio('1:1')}
                    className={`px-2.5 py-0.5 text-xs font-bold rounded-full transition ${
                      activeCarousel.aspectRatio === '1:1'
                        ? 'bg-indigo-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    1:1
                  </button>
                </div>

                <div className="w-px h-4 bg-slate-800" />

                <div className="flex items-center gap-1.5">
                  <ZoomIn className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[11px] font-semibold text-slate-400">Zoom Tela:</span>
                  {(['fit', 80, 100, 120] as const).map((zoomVal) => (
                    <button
                      key={zoomVal}
                      type="button"
                      onClick={() => setCanvasZoom(zoomVal)}
                      className={`px-2 py-0.5 text-xs font-bold rounded-md transition ${
                        canvasZoom === zoomVal
                          ? 'bg-slate-700 text-indigo-300 border border-indigo-500/40 shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {zoomVal === 'fit' ? 'Fit' : `${zoomVal}%`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Display do Canvas */}
              <div
                ref={canvasContainerRef}
                className="flex-1 w-full flex items-center justify-center overflow-hidden py-1 transition-all duration-150 min-h-0"
              >
                <div
                  className="flex items-center justify-center transition-all duration-200"
                  style={{
                    transform: `scale(${effectiveZoomScale})`,
                    transformOrigin: 'center center',
                  }}
                >
                  <SlideCanvas
                    ref={activeSlideRef}
                    slide={activeSlide}
                    profile={profile}
                    aspectRatio={activeCarousel.aspectRatio || '4:5'}
                    onImageTransform={handleImageTransform}
                    onAssignMedia={handleAssignMediaToSlide}
                  />
                </div>
              </div>
            </div>

            {/* Lado Direito do Centro: Editor de Legenda Global (Post Caption) */}
            <div className="w-full lg:w-[340px] xl:w-[380px] h-auto max-h-full bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col shrink-0 shadow-card self-center my-auto overflow-y-auto scrollbar-thin">
              <PostCaptionEditor
                caption={activeCarousel.caption || ''}
                selectedChannels={activeCarousel.selectedChannels || ['instagram', 'linkedin']}
                connectedChannels={connectedChannels}
                isBufferConnected={isBufferConnected}
                onCaptionChange={handleCaptionChange}
                onToggleChannel={handleToggleChannel}
                onOpenIntegrations={() => setIsIntegrationsModalOpen(true)}
              />
            </div>
          </div>

          {/* Rodapé Central: Barra de Reordenação de Slides */}
          <div className="w-full pt-3 shrink-0">
            <SlideReorderBar
              slides={activeCarousel.slides}
              activeIndex={activeSlideIndex}
              onSelectSlide={(idx) => setActiveSlideIndex(idx)}
              onAddSlide={handleAddSlide}
              onInsertSlideAt={handleInsertSlideAt}
              onDuplicateSlide={handleDuplicateSlide}
              onDeleteSlide={handleDeleteSlide}
              onMoveSlide={handleMoveSlide}
              onAssignMedia={handleAssignMediaToSlide}
              onCreateSlideFromMedia={handleCreateSlideFromMedia}
            />
          </div>
        </main>

        {/* COLUNA 3: ➡️ Social Post Preview (Painel Direito - Recolhível) */}
        <SocialPostPreviewPanel
          carousel={activeCarousel}
          profile={profile}
          selectedChannels={activeCarousel.selectedChannels || ['instagram', 'linkedin']}
          onToggleChannel={handleToggleChannel}
          isOpen={isRightPanelOpen}
          onToggleOpen={() => setIsRightPanelOpen(!isRightPanelOpen)}
        />
      </div>

      {/* Hidden Slide Elements para Captura */}
      <div className="fixed top-[-9999px] left-[-9999px] opacity-0 pointer-events-none">
        {activeCarousel.slides.map((s, idx) => (
          <div
            key={s.id}
            ref={(el) => {
              hiddenSlideRefs.current[idx] = el;
            }}
          >
            <SlideCanvas
              slide={s}
              profile={profile}
              aspectRatio={activeCarousel.aspectRatio || '4:5'}
            />
          </div>
        ))}
      </div>

      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={profile}
        onSave={handleSaveProfile}
      />

      <IntegrationsModal
        isOpen={isIntegrationsModalOpen}
        onClose={() => setIsIntegrationsModalOpen(false)}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        carousel={activeCarousel}
        profile={profile}
        activeSlideElement={activeSlideRef.current}
        allSlideElements={hiddenSlideRefs.current.filter(Boolean) as HTMLElement[]}
        onMarkAsSent={handleMarkAsSent}
      />

      {isNewCarouselModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Criar Novo Conteúdo</h3>
            <p className="text-xs text-slate-400 mb-5">
              Escolha a quantidade inicial de slides para o seu carrossel ou post.
            </p>

            <div className="mb-6">
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Quantidade Inicial de Slides: <span className="text-indigo-400 font-bold">{newCarouselSlideCount}</span>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={newCarouselSlideCount}
                onChange={(e) => setNewCarouselSlideCount(Number(e.target.value))}
                className="w-full accent-indigo-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>1 slide (Post Único)</span>
                <span>5 slides</span>
                <span>10 slides</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsNewCarouselModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancelar
              </button>

              <button
                onClick={() => {
                  handleCreateNewCarousel(newCarouselSlideCount);
                  setIsNewCarouselModalOpen(false);
                  setViewMode('editor');
                }}
                className="px-5 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-glow transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Criar Conteúdo</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
