'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';
import { UserProfile, ContentType, LayoutStyle, SocialChannel, Slide, IntegrationConfig } from '@/types/carousel';
import { loadUserProfile, saveUserProfile, DEFAULT_USER_PROFILE } from '@/lib/storage';
import { useCarouselState } from '@/hooks/useCarouselState';

import { SLIDE_THEMES, SlideTheme, getSlideTheme } from '@/lib/themes';

import { Dashboard } from '@/components/Dashboard';
import { Navbar } from '@/components/Navbar';
import { SlideCanvas } from '@/components/SlideCanvas';
import { SlideReorderBar } from '@/components/SlideReorderBar';
import { TemplateSelector } from '@/components/TemplateSelector';
import { InlineCanvasEditorRef } from '@/components/InlineCanvasEditor';
import { MediaTray } from '@/components/MediaTray';
import { CollapsibleSection } from '@/components/CollapsibleSection';
import { PostCaptionEditor } from '@/components/PostCaptionEditor';
import { SocialPostPreviewPanel } from '@/components/SocialPostPreviewPanel';
import { NewCarouselModal } from '@/components/NewCarouselModal';
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
const SaveTemplateModal = dynamic(
  () => import('@/components/SaveTemplateModal').then((mod) => mod.SaveTemplateModal),
  { ssr: false }
);
const AddSlideModal = dynamic(
  () => import('@/components/AddSlideModal').then((mod) => mod.AddSlideModal),
  { ssr: false }
);
const ContentPlanner = dynamic(
  () => import('@/components/ContentPlanner').then((mod) => mod.ContentPlanner),
  { ssr: false }
);
const MediaCompatibilityModal = dynamic(
  () => import('@/components/modals/MediaCompatibilityModal').then((mod) => mod.MediaCompatibilityModal),
  { ssr: false }
);

import { SocialMediaValidator, CompatibilityDiagnosis } from '@/lib/validators/SocialMediaValidator';

import { SidebarNav, CreatorViewMode } from '@/components/SidebarNav';
import { VerticalVideoCreatorView } from '@/components/creators/VerticalVideoCreatorView';
import { StoriesCreatorView } from '@/components/creators/StoriesCreatorView';
import { LongVideoCreatorView } from '@/components/creators/LongVideoCreatorView';

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
  ZoomOut,
  Move,
  Type,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Send,
  Eye,
  SlidersHorizontal,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Highlighter
} from 'lucide-react';

export default function BliipApp() {
  const { data: session } = useSession();
  const [viewMode, setViewMode] = useState<CreatorViewMode>('dashboard');
  const [previousView, setPreviousView] = useState<CreatorViewMode>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [canvasZoom, setCanvasZoom] = useState<'fit' | number>('fit');
  const [autoFitScale, setAutoFitScale] = useState<number>(1);

  // Referência do editor de texto ativo no Canvas & campo em foco
  const activeEditorRef = useRef<InlineCanvasEditorRef>(null);
  const [focusedTextField, setFocusedTextField] = useState<'body' | 'title' | 'quote' | 'signature' | null>(null);

  // Estados de Recolhimento dos Painéis Laterais (3 Colunas)
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);

  // Modais de UI
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isIntegrationsModalOpen, setIsIntegrationsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isNewCarouselModalOpen, setIsNewCarouselModalOpen] = useState(false);
  const [newCarouselSlideCount, setNewCarouselSlideCount] = useState(3);
  const [isAddSlideModalOpen, setIsAddSlideModalOpen] = useState(false);
  const [isSaveTemplateModalOpen, setIsSaveTemplateModalOpen] = useState(false);
  const [slideTargetForSaveTemplate, setSlideTargetForSaveTemplate] = useState<Slide | null>(null);

  // Estado do Modal de Compatibilidade de Mídias
  const [compatibilityDiagnosis, setCompatibilityDiagnosis] = useState<CompatibilityDiagnosis | null>(null);
  const [isCompatibilityModalOpen, setIsCompatibilityModalOpen] = useState(false);

  const [integrations, setIntegrations] = useState<IntegrationConfig>({ bufferApiKey: '' });
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
              if (svc.includes('facebook') && !channels.includes('facebook')) channels.push('facebook');
            });
            if (channels.length > 0) {
              setConnectedChannels(channels);
            } else {
              setConnectedChannels(['instagram', 'linkedin', 'facebook']);
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
    handleCreateCarouselFromPresetModel,
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
    handleFontSizeChange,
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
    handleScheduleCarousel,
    handleUpdateImageTitle,
    handleUpdateTextAlignment,
    handleUpdateTitleAlignment,
    handleUpdateNewsTitle,
    handleUpdateImageLayout,
    savedSlideTemplates,
    handleSaveSlideAsTemplate,
    handleDeleteSavedTemplate,
    handleRenameSavedTemplate,
    handleInsertSlideFromTemplate,
    handleCreateCarouselFromPlannedIdea,
  } = useCarouselState(profile);

  // Intercepta e valida quando uma mídia (especialmente vídeo) é atribuída a um slide
  const onAssignMediaWithValidation = (slideId: string, imageIndex: number, url: string) => {
    handleAssignMediaToSlide(slideId, imageIndex, url);

    const isVid = url.startsWith('blob:') || url.startsWith('data:video/') || !!url.match(/\.(mp4|mov|webm)(\?.*)?$/i);
    if (isVid && activeCarousel) {
      // Monta a lista de slides atualizada de forma síncrona para validar imediatamente no SocialMediaValidator
      const updatedSlides = activeCarousel.slides.map((s) => {
        if (s.id !== slideId) return s;
        const images = [...(s.layers.images || [])];
        images[imageIndex] = {
          id: `img_${Date.now()}_${imageIndex}`,
          position: imageIndex === 0 ? 'top' : 'bottom',
          source: { type: 'upload', url, mediaType: 'video' },
        };
        return {
          ...s,
          contentType: s.contentType === 'text_only' ? ('text_1_image' as ContentType) : s.contentType,
          layers: { ...s.layers, images },
        };
      });

      const selectedChannels = activeCarousel.selectedChannels || ['instagram', 'linkedin'];
      const diagnosis = SocialMediaValidator.validateCarousel(updatedSlides, selectedChannels);
      if (!diagnosis.isCompatible) {
        setCompatibilityDiagnosis(diagnosis);
        setIsCompatibilityModalOpen(true);
      }
    }
  };
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

  const maxImagesAllowed =
    activeSlide.contentType === 'text_2_images'
      ? 2
      : activeSlide.contentType === 'text_1_image'
      ? 1
      : 0;

  return (
    <div className="w-screen h-screen flex overflow-hidden bg-slate-950">
      {/* Sidebar Nav Persistente */}
      <SidebarNav
        currentView={viewMode}
        onNavigate={(view) => setViewMode(view)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenIntegrations={() => setIsIntegrationsModalOpen(true)}
      />

      {/* Conteúdo Principal de Acordo com a View (Offset pl-16 para a barra lateral recolhida) */}
      <div className="flex-1 pl-16 h-full overflow-hidden flex flex-col relative">
        {/* VIEW 1: DASHBOARD */}
        {viewMode === 'dashboard' && (
          <Dashboard
            carousels={carousels}
            profile={profile}
            onOpenNewCarouselModal={() => setIsNewCarouselModalOpen(true)}
            onEditCarousel={(id) => {
              setActiveCarouselId(id);
              setActiveSlideIndex(0);
              setPreviousView('dashboard');
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
        )}

        {/* VIEW 2: PLANEJADOR IA & CALENDÁRIO */}
        {viewMode === 'planner' && (
          <ContentPlanner
            profile={profile}
            carousels={carousels}
            apiKey={integrations.apiKey || integrations.bufferApiKey}
            onCreateCarouselFromIdea={async (idea) => {
              setPreviousView('planner');
              await handleCreateCarouselFromPlannedIdea(idea);
              setViewMode('editor');
            }}
          />
        )}

        {/* VIEW: CRIADOR DE VÍDEOS VERTICAIS (9:16) */}
        {viewMode === 'vertical_video' && (
          <VerticalVideoCreatorView onBackToDashboard={() => setViewMode('dashboard')} />
        )}

        {/* VIEW: CRIADOR DE STORIES (24H) */}
        {viewMode === 'stories' && (
          <StoriesCreatorView onBackToDashboard={() => setViewMode('dashboard')} />
        )}

        {/* VIEW: CRIADOR DE VÍDEOS LONGOS (16:9) */}
        {viewMode === 'long_video' && (
          <LongVideoCreatorView onBackToDashboard={() => setViewMode('dashboard')} />
        )}

        {/* VIEW 3: Bliip STUDIO (EDITOR VISUAL CARROSSEL/POST) */}
        {viewMode === 'editor' && (
          <div className="w-full h-full flex flex-col overflow-hidden">
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
        onBackToDashboard={() => setViewMode(previousView)}
        backButtonLabel={previousView === 'planner' ? 'IA Estrategista' : 'Dashboard'}
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


              {/* SEÇÃO 2: Estilo Visual & Layout do Slide */}
              <CollapsibleSection
                icon={<Sliders className="w-4 h-4" />}
                title="Estilo Visual & Layout"
                defaultOpen={true}
              >
                {/* Seção de Proporção de Tela do Carrossel */}
                <div className="flex flex-col gap-2 mb-3 pb-3 border-b border-slate-800/80">
                  <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                    <span>Proporção do Carrossel</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleAspectRatio('4:5')}
                      className={`py-2 text-xs font-bold rounded-xl border transition flex items-center justify-center gap-1.5 ${
                        (activeCarousel.aspectRatio || '4:5') === '4:5'
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                      }`}
                    >
                      <span>Retrato (4:5)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleAspectRatio('1:1')}
                      className={`py-2 text-xs font-bold rounded-xl border transition flex items-center justify-center gap-1.5 ${
                        activeCarousel.aspectRatio === '1:1'
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                      }`}
                    >
                      <span>Quadrado (1:1)</span>
                    </button>
                  </div>
                </div>

                <TemplateSelector
                  currentContentType={activeSlide.contentType || 'text_1_image'}
                  currentLayoutStyle={activeSlide.layoutStyle || 'twitter'}
                  currentImageLayout={activeSlide.imageLayout || 'horizontal'}
                  onSelectContentType={handleSelectContentType}
                  onSelectLayoutStyle={handleSelectLayoutStyle}
                  onSelectImageLayout={handleUpdateImageLayout}
                />

                {/* RÓTULOS DE MÍDIAS SE HOUVER 2 MÍDIAS (ANTES / DEPOIS) */}
                {activeSlide.contentType === 'text_2_images' && (
                  <div className="flex flex-col gap-2 mt-4 pt-3 border-t border-slate-800/80">
                    <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                      <span>Rótulos das Mídias de Comparação</span>
                      <span className="text-[10px] text-slate-500 font-mono">(Limpar remove do slide)</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] text-slate-400 font-medium block mb-1">Rótulo Mídia 1:</span>
                        <input
                          type="text"
                          value={activeSlide.layers.images?.[0]?.title ?? 'Antes'}
                          onChange={(e) => handleUpdateImageTitle(0, e.target.value)}
                          placeholder="Antes"
                          className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-medium block mb-1">Rótulo Mídia 2:</span>
                        <input
                          type="text"
                          value={activeSlide.layers.images?.[1]?.title ?? 'Depois'}
                          onChange={(e) => handleUpdateImageTitle(1, e.target.value)}
                          placeholder="Depois"
                          className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CollapsibleSection>

              {/* SEÇÃO 3: Presets de Temas de Cores */}
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

        {/* COLUNA 2: 🎯 Content Workspace (Painel Central: Header Full-Width + Canvas + Legenda Global + Slides) */}
        <main className="flex-1 bg-slate-950 flex flex-col justify-between overflow-hidden relative min-w-0">
          {/* SUB-HEADER SUPERIOR DE PONTA A PONTA (FULL-WIDTH 100% W) */}
          <header className="w-full bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between shrink-0 z-20 shadow-md">
            {/* GRUPO A (Esquerda): Zoom da Tela & Visualização */}
            <div className="flex items-center gap-2 shrink-0">
              <ZoomIn className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-300">Zoom Tela:</span>
              <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                {(['fit', 80, 100, 120] as const).map((zoomVal) => (
                  <button
                    key={zoomVal}
                    type="button"
                    onClick={() => setCanvasZoom(zoomVal)}
                    className={`px-2.5 py-1 text-xs font-extrabold rounded-md transition ${
                      canvasZoom === zoomVal
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {zoomVal === 'fit' ? 'Fit' : `${zoomVal}%`}
                  </button>
                ))}
              </div>
            </div>

            {/* GRUPO B (Direita): Ferramentas de Formatação e Edição de Texto */}
            <div className="flex items-center gap-3 shrink-0">
              {/* Alinhamento do Texto */}
              <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                {(['left', 'center', 'right'] as const).map((align) => {
                  const isTitleField = focusedTextField === 'title';
                  const currentAlign = isTitleField
                    ? (activeSlide.titleAlignment || 'left')
                    : (activeSlide.textAlignment || 'left');

                  return (
                    <button
                      key={align}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        if (isTitleField) {
                          handleUpdateTitleAlignment(align);
                        } else {
                          handleUpdateTextAlignment(align);
                        }
                      }}
                      className={`p-1.5 rounded-md transition ${
                        currentAlign === align
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                      title={`Alinhar à ${align === 'left' ? 'Esquerda' : align === 'center' ? 'Centro' : 'Direita'}`}
                    >
                      {align === 'left' ? <AlignLeft className="w-3.5 h-3.5" /> : align === 'center' ? <AlignCenter className="w-3.5 h-3.5" /> : <AlignRight className="w-3.5 h-3.5" />}
                    </button>
                  );
                })}
              </div>

              <div className="w-px h-4 bg-slate-800 shrink-0" />

              {/* Botões Marca-Texto, Negrito, Limpar */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    activeEditorRef.current?.applyHighlight();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-extrabold bg-amber-400 text-amber-950 hover:bg-amber-300 rounded-lg transition active:scale-95 shadow-sm"
                  title="Destacar texto selecionado com Marca-Texto"
                >
                  <Highlighter className="w-3.5 h-3.5" />
                  <span>Marca-Texto</span>
                </button>

                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    activeEditorRef.current?.applyBold();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-extrabold bg-slate-800 text-slate-200 hover:bg-slate-700 rounded-lg transition active:scale-95 border border-slate-700"
                  title="Negrito"
                >
                  <span className="font-black px-0.5">B</span>
                  <span>Negrito</span>
                </button>

                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    activeEditorRef.current?.removeFormatting();
                  }}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                  title="Limpar formatação do texto"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="w-px h-4 bg-slate-800 shrink-0" />

              {/* Seletor de Tamanho da Fonte (P, M, G, GG) */}
              <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                {[
                  { label: 'P', size: 16, title: 'Pequeno (16px)' },
                  { label: 'M', size: 20, title: 'Médio (20px - Padrão)' },
                  { label: 'G', size: 24, title: 'Grande (24px)' },
                  { label: 'GG', size: 28, title: 'Extra Grande (28px)' },
                ].map((preset) => (
                  <button
                    key={preset.size}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleFontSizeChange(preset.size);
                    }}
                    className={`px-2.5 py-1 text-xs font-extrabold rounded-md transition ${
                      (activeSlide.fontSize ?? 20) === preset.size
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title={preset.title}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </header>

          {/* ÁREA CENTRAL DE CONTEÚDO */}
          <div className="flex-1 flex flex-col justify-between p-4 overflow-hidden min-h-0">
            {/* ÁREA CENTRAL LADO A LADO: Canvas do Slide (Esquerda) + Editor de Legenda Global (Direita) */}
            <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-6 overflow-hidden min-h-0 w-full">
              {/* Lado Esquerdo do Centro: Slide Canvas */}
              <div className="flex-1 h-full flex flex-col items-center justify-center overflow-hidden min-h-0 relative w-full">
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
                      onAssignMedia={onAssignMediaWithValidation}
                      onTextChange={handleTextChange}
                      onNewsTitleChange={handleUpdateNewsTitle}
                      onQuoteTextChange={handleQuoteTextChange}
                      onSignatureChange={handleSignatureChange}
                      onTextFocus={(field) => setFocusedTextField(field)}
                      onTextBlur={() => setFocusedTextField(null)}
                      activeEditorRef={activeEditorRef}
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

            {/* Rodapé Central: Barra de Reordenação de Slides Intacta */}
            <div className="w-full pt-3 shrink-0">
              <SlideReorderBar
                slides={activeCarousel.slides}
                activeIndex={activeSlideIndex}
                onSelectSlide={(idx) => setActiveSlideIndex(idx)}
                onAddSlide={() => setIsAddSlideModalOpen(true)}
                onInsertSlideAt={(idx) => {
                  setActiveSlideIndex(idx - 1 >= 0 ? idx - 1 : 0);
                  setIsAddSlideModalOpen(true);
                }}
                onDuplicateSlide={handleDuplicateSlide}
                onDeleteSlide={handleDeleteSlide}
                onMoveSlide={handleMoveSlide}
                onOpenSaveTemplateModal={(slide) => {
                  setSlideTargetForSaveTemplate(slide);
                  setIsSaveTemplateModalOpen(true);
                }}
                onAssignMedia={handleAssignMediaToSlide}
                onCreateSlideFromMedia={handleCreateSlideFromMedia}
              />
            </div>
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
          </div>
        )}
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
        carousels={carousels}
        profile={profile}
        activeSlideElement={activeSlideRef.current}
        allSlideElements={hiddenSlideRefs.current.filter(Boolean) as HTMLElement[]}
        onMarkAsSent={handleMarkAsSent}
        onScheduleCarousel={handleScheduleCarousel}
      />

      <NewCarouselModal
        isOpen={isNewCarouselModalOpen}
        onClose={() => setIsNewCarouselModalOpen(false)}
        onCreateByQuantity={(count) => {
          handleCreateNewCarousel(count);
          setViewMode('editor');
        }}
        onCreateByModel={(modelId) => {
          handleCreateCarouselFromPresetModel(modelId);
          setViewMode('editor');
        }}
      />

      <AddSlideModal
        isOpen={isAddSlideModalOpen}
        onClose={() => setIsAddSlideModalOpen(false)}
        savedTemplates={savedSlideTemplates}
        profile={profile}
        onInsertStandardSlide={() => handleAddSlide()}
        onInsertSlideFromTemplate={(template) => handleInsertSlideFromTemplate(template)}
        onDeleteTemplate={handleDeleteSavedTemplate}
        onRenameTemplate={handleRenameSavedTemplate}
      />

      <SaveTemplateModal
        isOpen={isSaveTemplateModalOpen}
        onClose={() => {
          setIsSaveTemplateModalOpen(false);
          setSlideTargetForSaveTemplate(null);
        }}
        onSave={(name) => {
          if (slideTargetForSaveTemplate) {
            handleSaveSlideAsTemplate(name, slideTargetForSaveTemplate);
          }
        }}
      />
      <MediaCompatibilityModal
        isOpen={isCompatibilityModalOpen}
        onClose={() => setIsCompatibilityModalOpen(false)}
        incompatibleChannels={compatibilityDiagnosis?.incompatibleChannels || ['linkedin']}
        onConfirmRemoveIncompatibleChannels={() => {
          if (activeCarousel) {
            const currentChannels = activeCarousel.selectedChannels || ['instagram', 'linkedin'];
            const filtered = currentChannels.filter((c) => c !== 'linkedin' && c !== 'tiktok');
            handleToggleChannel(filtered[0] || 'instagram');
          }
          setIsCompatibilityModalOpen(false);
        }}
        onConfirmUseCoverImageForLinkedIn={() => {
          setIsCompatibilityModalOpen(false);
        }}
      />
    </div>
  );
}
