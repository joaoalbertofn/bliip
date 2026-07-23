'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Carousel, Slide, UserProfile, ImageSource, ContentType, LayoutStyle } from '@/types/carousel';
import { loadUserProfile, saveUserProfile, loadCarousels, saveCarousels, DEFAULT_USER_PROFILE } from '@/lib/storage';
import { createSlide } from '@/lib/templates';

import { Dashboard } from '@/components/Dashboard';
import { Navbar } from '@/components/Navbar';
import { SlideCanvas } from '@/components/SlideCanvas';
import { SlideReorderBar } from '@/components/SlideReorderBar';
import { TemplateSelector } from '@/components/TemplateSelector';
import { HighlightTextEditor } from '@/components/HighlightTextEditor';
import { UserProfileModal } from '@/components/UserProfileModal';
import { IntegrationsModal } from '@/components/IntegrationsModal';
import { ExportModal } from '@/components/ExportModal';

import { Upload, Palette, Layers, Plus, Sliders, Image as ImageIcon, Quote } from 'lucide-react';

export default function BliipApp() {
  const [viewMode, setViewMode] = useState<'dashboard' | 'editor'>('dashboard');
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [carousels, setCarousels] = useState<Carousel[]>([]);
  const [activeCarouselId, setActiveCarouselId] = useState<string>('');
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);

  // Modais
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isIntegrationsModalOpen, setIsIntegrationsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isNewCarouselModalOpen, setIsNewCarouselModalOpen] = useState(false);
  const [newCarouselSlideCount, setNewCarouselSlideCount] = useState(4);

  // Refs de captura
  const activeSlideRef = useRef<HTMLDivElement>(null);
  const hiddenSlideRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    async function initData() {
      const savedProfile = await loadUserProfile();
      setProfile(savedProfile);

      const savedCarousels = await loadCarousels();
      if (savedCarousels.length > 0) {
        setCarousels(savedCarousels);
        setActiveCarouselId(savedCarousels[0].id);
      } else {
        // Criar Carrossel Inicial de Demonstração com TODAS as 8 permutações de layouts
        const s1 = createSlide('text_1_image', 'twitter');
        s1.layers.text = [{ id: 't1', role: 'body', content: 'Um garoto de 13 anos abriu uma <mark class="bg-yellow-300 px-1 rounded">barraca de cachorro-quente</mark> em frente à sua casa em Minnesota.' }];

        const s2 = createSlide('text_only', 'twitter');
        s2.layers.text = [{ id: 't2', role: 'body', content: 'Você: Como criar um carrossel de alto impacto em minutos?\n\nBliip: Basta definir seu texto e imagem. O layout e sua marca pessoal são aplicados automaticamente!' }];

        const s3 = createSlide('text_2_images', 'twitter');
        s3.imageLayout = 'vertical';
        s3.layers.text = [{ id: 't3', role: 'body', content: '<mark class="bg-yellow-300 px-1 rounded">Brasil piora e é o 3º país mais complexo para negócios</mark>, aponta ranking global.' }];

        const s4 = createSlide('text_2_images', 'twitter');
        s4.imageLayout = 'horizontal';
        s4.layers.text = [{ id: 't4', role: 'body', content: 'Comparativo lado a lado de dados e relatórios de mercado.' }];

        const s5 = createSlide('text_1_image', 'immersive');
        s5.layers.text = [
          { id: 't5_q', role: 'quote', content: 'Quando duas pessoas se unem, deve ser para compartilhar alegria, não para extrair alegria uma da outra.' },
          { id: 't5_s', role: 'signature', content: profile.name }
        ];

        const s6 = createSlide('text_only', 'immersive');
        s6.background = '#0f172a';
        s6.layers.text = [
          { id: 't6_q', role: 'quote', content: 'A clareza de propósito traz uma paz inabalável diante das tempestades.' },
          { id: 't6_s', role: 'signature', content: profile.name }
        ];

        const s7 = createSlide('text_2_images', 'immersive');
        s7.imageLayout = 'vertical';
        s7.layers.text = [
          { id: 't7_q', role: 'quote', content: 'Dois momentos marcantes em um único slide imersivo.' },
          { id: 't7_s', role: 'signature', content: profile.name }
        ];

        const s8 = createSlide('text_2_images', 'immersive');
        s8.imageLayout = 'horizontal';
        s8.layers.text = [
          { id: 't8_q', role: 'quote', content: 'Visão dupla em colunas no formato inspiracional Sadhguru.' },
          { id: 't8_s', role: 'signature', content: profile.name }
        ];

        const demoCarousel: Carousel = {
          id: `carousel_${Date.now()}`,
          name: 'Suíte Completa de Permutações (8 Layouts)',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: 'draft',
          aspectRatio: '4:5',
          slides: [s1, s2, s3, s4, s5, s6, s7, s8]
        };
        setCarousels([demoCarousel]);
        setActiveCarouselId(demoCarousel.id);
        await saveCarousels([demoCarousel]);
      }
    }
    initData();
  }, []);

  const activeCarousel = carousels.find((c) => c.id === activeCarouselId) || carousels[0];
  const activeSlide = activeCarousel?.slides[activeSlideIndex] || activeCarousel?.slides[0];

  const saveCurrentCarouselsState = async (updatedCarousels: Carousel[]) => {
    setCarousels(updatedCarousels);
    setIsSaving(true);
    await saveCarousels(updatedCarousels);
    setTimeout(() => setIsSaving(false), 500);
  };

  const handleUpdateCarouselName = (name: string) => {
    if (!activeCarousel) return;
    const updated = carousels.map((c) => (c.id === activeCarousel.id ? { ...c, name, updatedAt: new Date().toISOString() } : c));
    saveCurrentCarouselsState(updated);
  };

  const handleToggleAspectRatio = (aspectRatio: '4:5' | '1:1') => {
    if (!activeCarousel) return;
    const updated = carousels.map((c) => (c.id === activeCarousel.id ? { ...c, aspectRatio } : c));
    saveCurrentCarouselsState(updated);
  };

  const handleCreateNewCarousel = () => {
    const newSlides: Slide[] = [];
    const contentTypes: ContentType[] = ['text_1_image', 'text_only', 'text_2_images', 'text_1_image'];
    const styles: LayoutStyle[] = ['twitter', 'twitter', 'twitter', 'immersive'];

    for (let i = 0; i < newCarouselSlideCount; i++) {
      newSlides.push(createSlide(contentTypes[i % contentTypes.length], styles[i % styles.length]));
    }

    const newCarousel: Carousel = {
      id: `carousel_${Date.now()}`,
      name: `Carrossel #${carousels.length + 1}`,
      slides: newSlides,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'draft',
      aspectRatio: '4:5',
    };

    const updated = [newCarousel, ...carousels];
    saveCurrentCarouselsState(updated);
    setActiveCarouselId(newCarousel.id);
    setActiveSlideIndex(0);
    setIsNewCarouselModalOpen(false);
    setViewMode('editor');
  };

  const handleDuplicateCarousel = (carouselId: string) => {
    const target = carousels.find((c) => c.id === carouselId);
    if (!target) return;
    const duplicated: Carousel = JSON.parse(JSON.stringify(target));
    duplicated.id = `carousel_${Date.now()}`;
    duplicated.name = `${target.name} (Cópia)`;
    duplicated.createdAt = new Date().toISOString();
    duplicated.updatedAt = new Date().toISOString();
    duplicated.status = 'draft';

    const updated = [duplicated, ...carousels];
    saveCurrentCarouselsState(updated);
  };

  const handleDeleteCarousel = (carouselId: string) => {
    if (carousels.length <= 1) {
      alert('Você precisa ter pelo menos um carrossel na sua conta.');
      return;
    }
    const updated = carousels.filter((c) => c.id !== carouselId);
    saveCurrentCarouselsState(updated);
    if (activeCarouselId === carouselId) {
      setActiveCarouselId(updated[0].id);
    }
  };

  const handleMarkAsSent = () => {
    if (!activeCarousel) return;
    const updated = carousels.map((c) => (c.id === activeCarousel.id ? { ...c, status: 'sent' as const } : c));
    saveCurrentCarouselsState(updated);
  };

  const updateActiveSlide = (updater: (slide: Slide) => Slide) => {
    if (!activeCarousel || !activeSlide) return;
    const updatedSlides = [...activeCarousel.slides];
    updatedSlides[activeSlideIndex] = updater({ ...activeSlide });

    const updatedCarousels = carousels.map((c) =>
      c.id === activeCarousel.id ? { ...c, slides: updatedSlides, updatedAt: new Date().toISOString() } : c
    );
    saveCurrentCarouselsState(updatedCarousels);
  };

  const handleSelectContentType = (contentType: ContentType) => {
    updateActiveSlide((prev) => ({ ...prev, contentType }));
  };

  const handleSelectLayoutStyle = (layoutStyle: LayoutStyle) => {
    updateActiveSlide((prev) => ({ ...prev, layoutStyle }));
  };

  const handleTextChange = (textIndex: number, newContent: string) => {
    updateActiveSlide((prev) => {
      const textLayers = [...(prev.layers.text || [])];
      if (textLayers[textIndex]) {
        textLayers[textIndex] = { ...textLayers[textIndex], content: newContent };
      } else {
        textLayers.push({ id: `text_${Date.now()}`, role: 'body', content: newContent });
      }
      return { ...prev, layers: { ...prev.layers, text: textLayers } };
    });
  };

  const handleQuoteTextChange = (newContent: string) => {
    updateActiveSlide((prev) => {
      const textLayers = [...(prev.layers.text || [])];
      const qIdx = textLayers.findIndex((t) => t.role === 'quote' || t.role === 'body');
      if (qIdx >= 0) {
        textLayers[qIdx] = { ...textLayers[qIdx], content: newContent };
      } else {
        textLayers.unshift({ id: `text_quote`, role: 'quote', content: newContent });
      }
      return { ...prev, layers: { ...prev.layers, text: textLayers } };
    });
  };

  const handleSignatureChange = (newSig: string) => {
    updateActiveSlide((prev) => {
      const textLayers = [...(prev.layers.text || [])];
      const sIdx = textLayers.findIndex((t) => t.role === 'signature');
      if (sIdx >= 0) {
        textLayers[sIdx] = { ...textLayers[sIdx], content: newSig };
      } else {
        textLayers.push({ id: `text_sig`, role: 'signature', content: newSig });
      }
      return { ...prev, layers: { ...prev.layers, text: textLayers } };
    });
  };

  const handleImageUpload = (imageIndex: number, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        const url = e.target.result as string;
        const newSource: ImageSource = { type: 'upload', url };

        updateActiveSlide((prev) => {
          const images = [...(prev.layers.images || [])];
          if (images[imageIndex]) {
            images[imageIndex] = { ...images[imageIndex], source: newSource };
          } else {
            images.push({ id: `img_${Date.now()}`, position: 'center', source: newSource });
          }
          return { ...prev, layers: { ...prev.layers, images } };
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleBackgroundChange = (bg: string) => {
    updateActiveSlide((prev) => ({ ...prev, background: bg }));
  };

  const handleAddSlide = () => {
    if (!activeCarousel) return;
    const newSlide = createSlide('text_1_image', 'twitter');
    const updatedSlides = [...activeCarousel.slides, newSlide];
    const updatedCarousels = carousels.map((c) =>
      c.id === activeCarousel.id ? { ...c, slides: updatedSlides } : c
    );
    saveCurrentCarouselsState(updatedCarousels);
    setActiveSlideIndex(updatedSlides.length - 1);
  };

  const handleInsertSlideAt = (insertIndex: number) => {
    if (!activeCarousel) return;
    const newSlide = createSlide('text_1_image', 'twitter');
    const updatedSlides = [...activeCarousel.slides];
    updatedSlides.splice(insertIndex, 0, newSlide);

    const updatedCarousels = carousels.map((c) =>
      c.id === activeCarousel.id ? { ...c, slides: updatedSlides } : c
    );
    saveCurrentCarouselsState(updatedCarousels);
    setActiveSlideIndex(insertIndex);
  };

  const handleDuplicateSlide = (index: number) => {
    if (!activeCarousel) return;
    const slideToDup = activeCarousel.slides[index];
    const duplicated: Slide = JSON.parse(JSON.stringify(slideToDup));
    duplicated.id = `slide_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const updatedSlides = [...activeCarousel.slides];
    updatedSlides.splice(index + 1, 0, duplicated);

    const updatedCarousels = carousels.map((c) =>
      c.id === activeCarousel.id ? { ...c, slides: updatedSlides } : c
    );
    saveCurrentCarouselsState(updatedCarousels);
    setActiveSlideIndex(index + 1);
  };

  const handleDeleteSlide = (index: number) => {
    if (!activeCarousel || activeCarousel.slides.length <= 1) return;
    const updatedSlides = activeCarousel.slides.filter((_, idx) => idx !== index);
    const updatedCarousels = carousels.map((c) =>
      c.id === activeCarousel.id ? { ...c, slides: updatedSlides } : c
    );
    saveCurrentCarouselsState(updatedCarousels);
    setActiveSlideIndex(Math.max(0, index - 1));
  };

  const handleMoveSlide = (fromIndex: number, toIndex: number) => {
    if (!activeCarousel || toIndex < 0 || toIndex >= activeCarousel.slides.length) return;
    const updatedSlides = [...activeCarousel.slides];
    const [moved] = updatedSlides.splice(fromIndex, 1);
    updatedSlides.splice(toIndex, 0, moved);

    const updatedCarousels = carousels.map((c) =>
      c.id === activeCarousel.id ? { ...c, slides: updatedSlides } : c
    );
    saveCurrentCarouselsState(updatedCarousels);
    setActiveSlideIndex(toIndex);
  };

  const handleSaveProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    saveUserProfile(newProfile);
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
                  onClick={handleCreateNewCarousel}
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
        {/* Left Side Panel: Editor Controls */}
        <aside className="w-[420px] bg-slate-900 border-r border-slate-800 flex flex-col overflow-y-auto p-5 gap-6 shrink-0 scrollbar-thin">
          <TemplateSelector
            currentContentType={activeSlide.contentType || 'text_1_image'}
            currentLayoutStyle={activeSlide.layoutStyle || 'twitter'}
            onSelectContentType={handleSelectContentType}
            onSelectLayoutStyle={handleSelectLayoutStyle}
          />

          <hr className="border-slate-800" />

          {/* Editor de Texto adaptativo */}
          {activeSlide.layoutStyle === 'immersive' ? (
            <div className="flex flex-col gap-3">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>Citação ou Texto Inspiracional</span>
              </label>
              <HighlightTextEditor
                value={
                  activeSlide.layers.text?.find((t) => t.role === 'quote' || t.role === 'body')?.content || ''
                }
                onChange={handleQuoteTextChange}
                rows={4}
                placeholder="Digite a citação inspiracional..."
              />

              <div className="flex flex-col gap-1.5 mt-1 pt-3 border-t border-slate-800/80">
                <label className="text-xs font-semibold text-slate-300">
                  Assinatura do Nome (Manuscrito)
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
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  <span>Edição de Texto do Slide</span>
                </label>

                {activeSlide.contentType === 'text_only' && (
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-400 mr-1">Inserir:</span>
                    {['Você:', 'Bliip:', 'Governo:'].map((prefix) => (
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
                placeholder="Digite o conteúdo do slide..."
              />
            </div>
          )}

          {/* Upload de Imagens */}
          {maxImagesAllowed > 0 && (
            <>
              <hr className="border-slate-800" />
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Imagens do Slide ({maxImagesAllowed} permitida{maxImagesAllowed > 1 ? 's' : ''})</span>
                  </label>
                </div>

                {maxImagesAllowed >= 2 && (
                  <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-400 font-medium">Orientação do Layout:</span>
                    <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg">
                      <button
                        type="button"
                        onClick={() => updateActiveSlide((prev) => ({ ...prev, imageLayout: 'vertical' }))}
                        className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition ${
                          activeSlide.imageLayout !== 'horizontal'
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Vertical (Empilhadas)
                      </button>
                      <button
                        type="button"
                        onClick={() => updateActiveSlide((prev) => ({ ...prev, imageLayout: 'horizontal' }))}
                        className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition ${
                          activeSlide.imageLayout === 'horizontal'
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Horizontal (Lado a Lado)
                      </button>
                    </div>
                  </div>
                )}

                {Array.from({ length: maxImagesAllowed }).map((_, imgIdx) => {
                  const currentImgUrl = activeSlide.layers.images?.[imgIdx]?.source.url;

                  return (
                    <div key={imgIdx} className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <div className="w-14 h-14 rounded-lg bg-slate-800 border border-slate-700 overflow-hidden shrink-0 flex items-center justify-center">
                        {currentImgUrl ? (
                          <img src={currentImgUrl} alt="Preview Upload" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-slate-600" />
                        )}
                      </div>

                      <div className="flex-1 flex flex-col justify-center">
                        <span className="text-xs font-medium text-slate-300">
                          Imagem #{imgIdx + 1}
                        </span>
                        <span className="text-[10px] text-slate-500">Upload manual de foto/print</span>
                      </div>

                      <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-2 rounded-lg border border-slate-700 flex items-center gap-1.5 transition shrink-0">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Trocar</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(imgIdx, file);
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          <hr className="border-slate-800" />

          {/* Customização de Fundo & Proporção */}
          <div className="flex flex-col gap-3">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-rose-400" />
              <span>Estilo de Fundo do Slide</span>
            </label>

            <div className="flex items-center gap-2">
              {[
                { label: 'Branco', color: '#ffffff' },
                { label: 'Creme', color: '#fdfbf7' },
                { label: 'Lavanda', color: '#f4f4fe' },
                { label: 'Dark', color: '#0f172a' },
              ].map((preset) => (
                <button
                  key={preset.color}
                  onClick={() => handleBackgroundChange(preset.color)}
                  className={`flex-1 py-2 px-1 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition ${
                    activeSlide.background === preset.color
                      ? 'border-indigo-500 bg-slate-800 text-white shadow-glow'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full border border-slate-600 shrink-0"
                    style={{ backgroundColor: preset.color }}
                  />
                  <span>{preset.label}</span>
                </button>
              ))}
            </div>

            <div className="mt-2 pt-3 border-t border-slate-800/60 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5 text-indigo-400" /> Proporção Instagram:
              </span>
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => handleToggleAspectRatio('4:5')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                    activeCarousel.aspectRatio !== '1:1'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  4:5 (1080×1350)
                </button>
                <button
                  onClick={() => handleToggleAspectRatio('1:1')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                    activeCarousel.aspectRatio === '1:1'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  1:1 (1080×1080)
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Center Canvas Preview Workspace */}
        <main className="flex-1 bg-slate-950 flex flex-col justify-between overflow-hidden relative">
          <div className="flex-1 flex items-center justify-center overflow-auto p-6">
            <SlideCanvas
              ref={activeSlideRef}
              slide={activeSlide}
              profile={profile}
              aspectRatio={activeCarousel.aspectRatio || '4:5'}
            />
          </div>

          <SlideReorderBar
            slides={activeCarousel.slides}
            activeIndex={activeSlideIndex}
            onSelectSlide={(idx) => setActiveSlideIndex(idx)}
            onAddSlide={handleAddSlide}
            onInsertSlideAt={handleInsertSlideAt}
            onDuplicateSlide={handleDuplicateSlide}
            onDeleteSlide={handleDeleteSlide}
            onMoveSlide={handleMoveSlide}
          />
        </main>
      </div>

      {/* Hidden Slide Elements para Captura */}
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
                onClick={handleCreateNewCarousel}
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
