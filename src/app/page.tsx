'use client';

import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, ContentType, LayoutStyle } from '@/types/carousel';
import { loadUserProfile, saveUserProfile, DEFAULT_USER_PROFILE } from '@/lib/storage';
import { useCarouselState } from '@/hooks/useCarouselState';

import { SLIDE_THEMES, SlideTheme, getSlideTheme } from '@/lib/themes';

import { Dashboard } from '@/components/Dashboard';
import { Navbar } from '@/components/Navbar';
import { SlideCanvas } from '@/components/SlideCanvas';
import { SlideReorderBar } from '@/components/SlideReorderBar';
import { TemplateSelector } from '@/components/TemplateSelector';
import { HighlightTextEditor } from '@/components/HighlightTextEditor';
import { UserProfileModal } from '@/components/UserProfileModal';
import { IntegrationsModal } from '@/components/IntegrationsModal';
import { ExportModal } from '@/components/ExportModal';
import { MediaTray } from '@/components/MediaTray';
import { CollapsibleSection } from '@/components/CollapsibleSection';

import { Upload, Palette, Layers, Plus, Sliders, Image as ImageIcon, Quote, Check, RotateCcw, ZoomIn, Move, Type, Trash2 } from 'lucide-react';

export default function BliipApp() {
  const [viewMode, setViewMode] = useState<'dashboard' | 'editor'>('dashboard');
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [canvasZoom, setCanvasZoom] = useState<number>(100);

  // Modais de UI
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isIntegrationsModalOpen, setIsIntegrationsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isNewCarouselModalOpen, setIsNewCarouselModalOpen] = useState(false);
  const [newCarouselSlideCount, setNewCarouselSlideCount] = useState(4);

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
  } = useCarouselState(profile);

  // Refs de captura para exportação
  const activeSlideRef = useRef<HTMLDivElement>(null);
  const hiddenSlideRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    async function initProfile() {
      const savedProfile = await loadUserProfile();
      setProfile(savedProfile);
    }
    initProfile();
  }, []);

  const handleSaveProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    saveUserProfile(newProfile);
  };

  const handleCreateNewCarouselSubmit = () => {
    const newCarousel = handleCreateNewCarousel(newCarouselSlideCount);
    setIsNewCarouselModalOpen(false);
    setViewMode('editor');
  };

  if (!activeCarousel || !activeSlide) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-slate-950 text-slate-400">
        Carregando o Bliip...
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
        <div className="fixed top-0 left-[-9999px] pointer-events-none -z-50 flex flex-col gap-4">
          {activeCarousel.slides.map((s, idx) => (
            <div key={s.id} className="w-[540px]">
              <SlideCanvas
                ref={(el) => {
                  hiddenSlideRefs.current[idx] = el;
                }}
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
                  onClick={handleCreateNewCarouselSubmit}
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

  // RENDERIZAÇÃO 2: Tela de Editor em Tela Cheia
  const maxImagesAllowed =
    activeSlide.contentType === 'text_2_images'
      ? 2
      : activeSlide.contentType === 'text_1_image'
      ? 1
      : 0;

  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden bg-slate-950">
      {/* Top Header Navbar com botão Voltar ao Dashboard */}
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

      {/* Main Workspace Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side Panel: Editor Controls (Organizado em Acordeões Sanfonados) */}
        <aside className="w-[420px] bg-slate-950 border-r border-slate-800 flex flex-col overflow-y-auto p-4 pb-16 gap-4 shrink-0 scrollbar-thin">
          {/* GRUPO 1: Fotos da História (Bandeja de Mídias) */}
          <CollapsibleSection
            icon={<ImageIcon className="w-4 h-4" />}
            title="Fotos da História"
            badgeText={`${activeCarousel.mediaLibrary?.length || 0}`}
            defaultOpen={true}
          >
            <MediaTray
              mediaLibrary={activeCarousel.mediaLibrary}
              onUploadMedia={handleUploadMediaToTray}
              onRemoveMedia={handleRemoveMediaFromTray}
              onCreateSlideFromMedia={handleCreateSlideFromMedia}
            />
          </CollapsibleSection>

          {/* GRUPO 2: Estilo Visual & Tipo de Conteúdo */}
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

            {maxImagesAllowed === 2 && (
              <div className="flex items-center justify-between bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60 mt-2">
                <span className="text-xs font-medium text-slate-300">Orientação das Fotos:</span>
                <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg">
                  <button
                    onClick={() => {
                      handleSelectContentType('text_2_images');
                      updateActiveSlide((prev) => ({ ...prev, imageLayout: 'vertical' }));
                    }}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition ${
                      activeSlide.imageLayout === 'vertical'
                        ? 'bg-indigo-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Vertical (2 Linhas)
                  </button>
                  <button
                    onClick={() => {
                      handleSelectContentType('text_2_images');
                      updateActiveSlide((prev) => ({ ...prev, imageLayout: 'horizontal' }));
                    }}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition ${
                      activeSlide.imageLayout !== 'vertical'
                        ? 'bg-indigo-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Horizontal (2 Colunas)
                  </button>
                </div>
              </div>
            )}
          </CollapsibleSection>

          {/* GRUPO 3: Conteúdo do Slide (Título, Texto, Assinatura e Tamanho) */}
          <CollapsibleSection
            icon={<Layers className="w-4 h-4" />}
            title={`Conteúdo do Slide #${activeSlideIndex + 1}`}
            defaultOpen={true}
          >
            {activeSlide.layoutStyle === 'immersive' ? (
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Quote className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Frase / Citação Principal</span>
                  </label>
                  <HighlightTextEditor
                    value={activeSlide.layers.text?.find((t) => t.role === 'quote' || t.role === 'body')?.content || ''}
                    onChange={handleQuoteTextChange}
                    placeholder="Digite a citação inspiracional..."
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Assinatura / Autor
                  </label>
                  <input
                    type="text"
                    value={activeSlide.layers.text?.find((t) => t.role === 'signature')?.content || ''}
                    onChange={(e) => handleSignatureChange(e.target.value)}
                    placeholder="Nome do autor..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {(activeSlide.layoutStyle === 'news_article' || activeSlide.layoutStyle === 'comparison') && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Título / Manchete (Caixa Alta / Destaque)
                    </label>
                    <input
                      type="text"
                      value={activeSlide.title || ''}
                      onChange={(e) => updateActiveSlide((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder={
                        activeSlide.layoutStyle === 'news_article'
                          ? 'MAS O PROCESSO NÃO SE RESUME A CORTAR.'
                          : 'Digite o título da comparação...'
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm font-semibold text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Texto Principal (Suporta Diálogo e Destaques)
                  </label>
                  <HighlightTextEditor
                    value={activeSlide.layers.text?.[0]?.content || ''}
                    onChange={(text) => handleTextChange(0, text)}
                    placeholder="Escreva seu post aqui... Use formato 'Pessoa: Fala' para diálogos."
                    rows={activeSlide.layoutStyle === 'news_article' ? 4 : 5}
                  />
                </div>
              </div>
            )}

            {/* Controle de Tamanho da Fonte do Texto */}
            <div className="flex flex-col gap-2 pt-3 border-t border-slate-800/80">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Tamanho da Fonte</span>
                </label>
                <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full">
                  {activeSlide.fontSize || 20}px
                </span>
              </div>

              {/* Presets de Tamanho */}
              <div className="grid grid-cols-5 gap-1">
                {[
                  { label: 'P', size: 16 },
                  { label: 'M', size: 20 },
                  { label: 'G', size: 24 },
                  { label: 'GG', size: 30 },
                  { label: 'XG', size: 38 },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handleFontSizeChange(preset.size)}
                    className={`py-1 rounded-lg text-xs font-bold transition ${
                      (activeSlide.fontSize || 20) === preset.size
                        ? 'bg-indigo-600 text-white shadow-glow'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Slider de Ajuste Fino */}
              <input
                type="range"
                min="14"
                max="48"
                step="1"
                value={activeSlide.fontSize || 20}
                onChange={(e) => handleFontSizeChange(Number(e.target.value))}
                className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer mt-1"
              />
            </div>
          </CollapsibleSection>

          {/* GRUPO 4: Presets de Temas de Cores */}
          <CollapsibleSection
            icon={<Palette className="w-4 h-4" />}
            title="Tema de Cores do Slide"
            badgeText={getSlideTheme(activeSlide.theme, activeSlide.background).name}
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
                    onClick={() => handleThemeChange(themeId)}
                    className={`h-10 rounded-lg border-2 transition-all flex flex-col items-center justify-center relative shadow group ${
                      isActive ? 'border-indigo-500 scale-105 ring-2 ring-indigo-500/50' : 'border-slate-700 hover:border-slate-500'
                    }`}
                    style={{ backgroundColor: themeItem.bg }}
                    title={themeItem.name}
                  >
                    <span
                      className="text-xs font-bold"
                      style={{ color: themeItem.text }}
                    >
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
        </aside>

        {/* Middle Main Preview Center Canvas Area */}
        <main className="flex-1 bg-slate-950 flex flex-col items-center justify-between p-6 overflow-hidden relative">
          {/* BARRA FLUTUANTE SUPERIOR: Proporção, Zoom de Tela e Controles da Foto Ativa */}
          <div className="flex flex-wrap items-center justify-center gap-3 bg-slate-900/90 border border-slate-800 px-4 py-2 rounded-2xl shadow-2xl backdrop-blur mb-2 z-20">
            {/* Proporção */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-400">Proporção:</span>
              <button
                onClick={() => handleToggleAspectRatio('4:5')}
                className={`px-2.5 py-1 text-xs font-bold rounded-full transition ${
                  (activeCarousel.aspectRatio || '4:5') === '4:5'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                4:5
              </button>
              <button
                onClick={() => handleToggleAspectRatio('1:1')}
                className={`px-2.5 py-1 text-xs font-bold rounded-full transition ${
                  activeCarousel.aspectRatio === '1:1'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                1:1
              </button>
            </div>

            <div className="w-px h-4 bg-slate-800 hidden sm:block" />

            {/* Zoom do Canvas de Tela */}
            <div className="flex items-center gap-1.5">
              <ZoomIn className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px] font-semibold text-slate-400">Zoom Tela:</span>
              {[80, 100, 120, 150].map((zoomVal) => (
                <button
                  key={zoomVal}
                  onClick={() => setCanvasZoom(zoomVal)}
                  className={`px-2 py-0.5 text-xs font-bold rounded-md transition ${
                    canvasZoom === zoomVal
                      ? 'bg-slate-700 text-indigo-300 border border-indigo-500/40 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {zoomVal}%
                </button>
              ))}
            </div>

            {/* CONTROLES DA FOTO SELECIONADA (EXIBIDO SE HOUVER IMAGEM NA FOTO ATIVA) */}
            {activeSlide.layers.images?.[selectedImageIndex]?.source?.url && (
              <>
                <div className="w-px h-4 bg-slate-800 hidden sm:block" />
                <div className="flex items-center gap-2 bg-slate-950 px-3 py-1 rounded-xl border border-indigo-500/30">
                  <span className="text-[11px] font-bold text-indigo-300">
                    Foto #{selectedImageIndex + 1}:
                  </span>

                  {/* Slider de Zoom da Foto */}
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.05"
                    value={activeSlide.layers.images[selectedImageIndex].scale ?? 1}
                    onChange={(e) =>
                      handleImageTransform(selectedImageIndex, { scale: parseFloat(e.target.value) })
                    }
                    className="w-20 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    title="Zoom da Foto"
                  />
                  <span className="text-[11px] font-mono text-indigo-400 font-bold w-10">
                    {Math.round((activeSlide.layers.images[selectedImageIndex].scale ?? 1) * 100)}%
                  </span>

                  <button
                    onClick={() => handleImageTransform(selectedImageIndex, { scale: 1, offsetX: 0, offsetY: 0 })}
                    className="p-1 text-slate-400 hover:text-white bg-slate-800 rounded transition"
                    title="Resetar Zoom e Posição"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      const updatedImages = [...(activeSlide.layers.images || [])];
                      if (updatedImages[selectedImageIndex]) {
                        updatedImages[selectedImageIndex] = {
                          ...updatedImages[selectedImageIndex],
                          source: { type: 'upload', url: '' },
                        };
                        updateActiveSlide((prev) => ({
                          ...prev,
                          layers: { ...prev.layers, images: updatedImages },
                        }));
                      }
                    }}
                    className="p-1 text-red-400 hover:text-red-300 bg-red-950/60 rounded transition border border-red-800/40"
                    title="Remover foto do slide"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Visual Canvas Display Container com Zoom Aplicado */}
          <div className="flex-1 w-full flex items-center justify-center overflow-auto py-2 transition-transform duration-150">
            <div
              className="flex items-center justify-center transition-all duration-200"
              style={{
                transform: `scale(${canvasZoom / 100})`,
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

          {/* Bottom Interactive Slide Reorder Toolbar Bar */}
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
        </main>
      </div>

      {/* Hidden Slide Elements para Captura do Carrossel Inteiro */}
      <div className="fixed top-0 left-[-9999px] pointer-events-none -z-50 flex flex-col gap-4">
        {activeCarousel.slides.map((s, idx) => (
          <div key={s.id} className="w-[540px]">
            <SlideCanvas
              ref={(el) => {
                hiddenSlideRefs.current[idx] = el;
              }}
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
                onClick={handleCreateNewCarouselSubmit}
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
