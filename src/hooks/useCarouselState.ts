import { useState, useEffect } from 'react';
import { Carousel, Slide, UserProfile, ImageSource, ContentType, LayoutStyle, SocialChannel } from '@/types/carousel';
import { loadCarousels, saveCarousels, loadUserPreferences, saveUserPreferences, DEFAULT_USER_PREFERENCES } from '@/lib/storage';
import { createSlide } from '@/lib/templates';
import { DEFAULT_STUDENT_FRAMEWORKS } from '@/config/defaultContent';
import { SlideTheme, SLIDE_THEMES } from '@/lib/themes';
import { validateFontSize, canDeleteSlide, canAddSlide } from '@/domain';

export function useCarouselState(profile: UserProfile) {
  const [carousels, setCarousels] = useState<Carousel[]>([]);
  const [activeCarouselId, setActiveCarouselId] = useState<string>('');
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);

  // 1. Carregar dados iniciais ou criar carrossel de demonstração (Frameworks de Conteúdo para Alunos)
  useEffect(() => {
    async function initData() {
      const savedCarousels = await loadCarousels();
      if (savedCarousels.length > 0) {
        setCarousels(savedCarousels);
        setActiveCarouselId(savedCarousels[0].id);
      } else {
        // Criar Carrossel Inicial Didático com Suíte Completa de Formatos (8 Slides)
        const s1 = createSlide('text_1_image', 'news_article');
        const s2 = createSlide('text_2_images', 'comparison');
        const s3 = createSlide('text_only', 'immersive');
        const s4 = createSlide('text_1_image', 'twitter');

        const s5 = createSlide('text_only', 'immersive');
        s5.layers.text = [
          { id: 't5_q', role: 'quote', content: DEFAULT_STUDENT_FRAMEWORKS.immersiveQuotes[0].quote },
          { id: 't5_s', role: 'signature', content: DEFAULT_STUDENT_FRAMEWORKS.immersiveQuotes[0].signature || profile.name }
        ];

        const s6 = createSlide('text_only', 'immersive');
        s6.background = '#0f172a';
        s6.layers.text = [
          { id: 't6_q', role: 'quote', content: DEFAULT_STUDENT_FRAMEWORKS.immersiveQuotes[1].quote },
          { id: 't6_s', role: 'signature', content: DEFAULT_STUDENT_FRAMEWORKS.immersiveQuotes[1].signature || profile.name }
        ];

        const s7 = createSlide('text_only', 'immersive');
        s7.layers.text = [
          { id: 't7_q', role: 'quote', content: DEFAULT_STUDENT_FRAMEWORKS.immersiveQuotes[2].quote },
          { id: 't7_s', role: 'signature', content: DEFAULT_STUDENT_FRAMEWORKS.immersiveQuotes[2].signature || profile.name }
        ];

        const s8 = createSlide('text_only', 'immersive');
        s8.layers.text = [
          { id: 't8_q', role: 'quote', content: DEFAULT_STUDENT_FRAMEWORKS.immersiveQuotes[3].quote },
          { id: 't8_s', role: 'signature', content: DEFAULT_STUDENT_FRAMEWORKS.immersiveQuotes[3].signature || profile.name }
        ];

        const demoCarousel: Carousel = {
          id: `carousel_${Date.now()}`,
          name: 'Frameworks de Autoridade e Vendas (Exemplo para Alunos)',
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

  // 2. Carrossel Ativo e Slide Ativo derivados
  const activeCarousel = carousels.find((c) => c.id === activeCarouselId) || carousels[0];
  const activeSlide = activeCarousel?.slides[activeSlideIndex] || activeCarousel?.slides[0];

  // Helper para salvar estado no IndexedDB/localStorage
  const saveCurrentCarouselsState = async (updatedCarousels: Carousel[]) => {
    setCarousels(updatedCarousels);
    setIsSaving(true);
    await saveCarousels(updatedCarousels);
    setTimeout(() => setIsSaving(false), 500);
  };

  // Mutadores de Carrossel
  const handleUpdateCarouselName = (name: string) => {
    if (!activeCarousel) return;
    const updated = carousels.map((c) => (c.id === activeCarousel.id ? { ...c, name, updatedAt: new Date().toISOString() } : c));
    saveCurrentCarouselsState(updated);
  };

  const handleToggleAspectRatio = (aspectRatio: '4:5' | '1:1') => {
    if (!activeCarousel) return;
    saveUserPreferences({ aspectRatio });
    const updated = carousels.map((c) => (c.id === activeCarousel.id ? { ...c, aspectRatio } : c));
    saveCurrentCarouselsState(updated);
  };

  const handleCreateNewCarousel = async (newCarouselSlideCount: number = 3) => {
    const prefs = await loadUserPreferences();
    const newSlides: Slide[] = [];

    // Sequência didática de formatos para o aluno aprender os diferentes estilos
    const slidePresets: Array<{ contentType: ContentType; layoutStyle: LayoutStyle }> = [
      { contentType: 'text_1_image', layoutStyle: 'news_article' }, // Slide 1: Notícia / Estudo do Google
      { contentType: 'text_2_images', layoutStyle: 'comparison' },   // Slide 2: Comparativo Visível vs Invisível
      { contentType: 'text_only', layoutStyle: 'immersive' },         // Slide 3: Frase Imersiva / Citação
      { contentType: 'text_1_image', layoutStyle: 'twitter' },         // Slide 4+: Twitter Post de Reflexão
    ];

    for (let i = 0; i < newCarouselSlideCount; i++) {
      const preset = slidePresets[i] || slidePresets[3];
      const slide = createSlide(preset.contentType, preset.layoutStyle);
      if (prefs.theme) {
        slide.theme = prefs.theme;
      }
      newSlides.push(slide);
    }

    const newCarousel: Carousel = {
      id: `carousel_${Date.now()}`,
      name: `Carrossel #${carousels.length + 1}`,
      slides: newSlides,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'draft',
      aspectRatio: prefs.aspectRatio || '4:5',
      selectedChannels: prefs.selectedChannels || ['instagram', 'linkedin'],
    };

    const updated = [newCarousel, ...carousels];
    saveCurrentCarouselsState(updated);
    setActiveCarouselId(newCarousel.id);
    setActiveSlideIndex(0);
    return newCarousel;
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

  // Mutadores de Slide
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
    saveUserPreferences({ contentType });
    updateActiveSlide((prev) => {
      const maxImages = contentType === 'text_2_images' ? 2 : contentType === 'text_1_image' ? 1 : 0;
      const images = [...(prev.layers.images || [])];
      while (images.length < maxImages) {
        images.push({
          id: `img_${Date.now()}_${images.length}`,
          position: 'center',
          source: { type: 'upload', url: '' },
          scale: 1,
          offsetX: 0,
          offsetY: 0,
        });
      }
      return { ...prev, contentType, layers: { ...prev.layers, images } };
    });
  };

  const handleSelectLayoutStyle = (layoutStyle: LayoutStyle) => {
    saveUserPreferences({ layoutStyle });
    updateActiveSlide((prev) => {
      const isComparison = layoutStyle === 'comparison';
      return {
        ...prev,
        layoutStyle,
        contentType: isComparison ? 'text_2_images' : prev.contentType,
      };
    });
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
          while (images.length <= imageIndex) {
            images.push({
              id: `img_${Date.now()}_${images.length}`,
              position: 'center',
              source: { type: 'upload', url: '' },
              scale: 1,
              offsetX: 0,
              offsetY: 0,
            });
          }
          images[imageIndex] = {
            ...images[imageIndex],
            source: newSource,
            scale: images[imageIndex]?.scale ?? 1,
            offsetX: images[imageIndex]?.offsetX ?? 0,
            offsetY: images[imageIndex]?.offsetY ?? 0,
          };
          return { ...prev, layers: { ...prev.layers, images } };
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleThemeChange = (themeId: SlideTheme) => {
    const themeConfig = SLIDE_THEMES[themeId];
    saveUserPreferences({ theme: themeId });
    updateActiveSlide((prev) => ({
      ...prev,
      theme: themeId,
      background: themeConfig.bg,
    }));
  };

  const handleImageTransform = (
    imageIndex: number,
    transform: { scale?: number; offsetX?: number; offsetY?: number }
  ) => {
    updateActiveSlide((prev) => {
      const images = [...(prev.layers.images || [])];
      while (images.length <= imageIndex) {
        images.push({
          id: `img_${Date.now()}_${images.length}`,
          position: 'center',
          source: { type: 'upload', url: '' },
          scale: 1,
          offsetX: 0,
          offsetY: 0,
        });
      }

      const currentImg = images[imageIndex];
      images[imageIndex] = {
        ...currentImg,
        scale: transform.scale !== undefined ? transform.scale : (currentImg.scale ?? 1),
        offsetX: transform.offsetX !== undefined ? transform.offsetX : (currentImg.offsetX ?? 0),
        offsetY: transform.offsetY !== undefined ? transform.offsetY : (currentImg.offsetY ?? 0),
      };

      return {
        ...prev,
        layers: { ...prev.layers, images },
      };
    });
  };

  const handleBackgroundChange = (bg: string) => {
    updateActiveSlide((prev) => ({ ...prev, background: bg }));
  };

  const handleFontSizeChange = (fontSize: number) => {
    const validSize = validateFontSize(fontSize);
    updateActiveSlide((prev) => ({ ...prev, fontSize: validSize }));
  };

  const handleAddSlide = () => {
    if (!activeCarousel || !canAddSlide(activeCarousel.slides.length)) return;
    const refSlide = activeSlide || activeCarousel.slides[activeCarousel.slides.length - 1];
    const targetContentType = refSlide?.contentType || 'text_1_image';
    const targetLayoutStyle = refSlide?.layoutStyle || 'twitter';

    const newSlide = createSlide(targetContentType, targetLayoutStyle, refSlide);
    const updatedSlides = [...activeCarousel.slides, newSlide];
    const updatedCarousels = carousels.map((c) =>
      c.id === activeCarousel.id ? { ...c, slides: updatedSlides } : c
    );
    saveCurrentCarouselsState(updatedCarousels);
    setActiveSlideIndex(updatedSlides.length - 1);
  };

  const handleInsertSlideAt = (insertIndex: number) => {
    if (!activeCarousel || !canAddSlide(activeCarousel.slides.length)) return;
    const previousSlide = insertIndex > 0 ? activeCarousel.slides[insertIndex - 1] : activeCarousel.slides[0];
    const refSlide = previousSlide || activeSlide;
    const targetContentType = refSlide?.contentType || 'text_1_image';
    const targetLayoutStyle = refSlide?.layoutStyle || 'twitter';

    const newSlide = createSlide(targetContentType, targetLayoutStyle, refSlide);
    const updatedSlides = [...activeCarousel.slides];
    updatedSlides.splice(insertIndex, 0, newSlide);

    const updatedCarousels = carousels.map((c) =>
      c.id === activeCarousel.id ? { ...c, slides: updatedSlides } : c
    );
    saveCurrentCarouselsState(updatedCarousels);
    setActiveSlideIndex(insertIndex);
  };

  const handleDuplicateSlide = (index: number) => {
    if (!activeCarousel || !canAddSlide(activeCarousel.slides.length)) return;
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
    if (!activeCarousel || !canDeleteSlide(activeCarousel.slides.length)) return;
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

  const handleUploadMediaToTray = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    const readPromises = fileArray.map(
      (file) =>
        new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        })
    );

    Promise.all(readPromises).then((urls) => {
      const currentMedia = activeCarousel.mediaLibrary || [];
      const updatedMedia = [...currentMedia, ...urls];

      const updatedCarousels = carousels.map((c) =>
        c.id === activeCarousel.id ? { ...c, mediaLibrary: updatedMedia } : c
      );
      saveCurrentCarouselsState(updatedCarousels);
    });
  };

  const handleRemoveMediaFromTray = (indexToRemove: number) => {
    const currentMedia = activeCarousel.mediaLibrary || [];
    const updatedMedia = currentMedia.filter((_, idx) => idx !== indexToRemove);

    const updatedCarousels = carousels.map((c) =>
      c.id === activeCarousel.id ? { ...c, mediaLibrary: updatedMedia } : c
    );
    saveCurrentCarouselsState(updatedCarousels);
  };

  const handleAssignMediaToSlide = (slideId: string, imageIndex: number, url: string) => {
    const updatedSlides = activeCarousel.slides.map((s) => {
      if (s.id !== slideId) return s;
      const images = [...(s.layers.images || [])];
      images[imageIndex] = {
        id: `img_${Date.now()}_${imageIndex}`,
        position: imageIndex === 0 ? 'top' : 'bottom',
        source: { type: 'upload', url },
        scale: 1,
        offsetX: 0,
        offsetY: 0,
      };

      // Se o slide estiver em modo 'text_only', muda automaticamente para 'text_1_image'
      const contentType = s.contentType === 'text_only' ? 'text_1_image' : s.contentType;

      return {
        ...s,
        contentType,
        layers: { ...s.layers, images },
      };
    });

    const updatedCarousels = carousels.map((c) =>
      c.id === activeCarousel.id ? { ...c, slides: updatedSlides } : c
    );
    saveCurrentCarouselsState(updatedCarousels);
  };

  const handleCreateSlideFromMedia = (url: string) => {
    const currentSlide = activeSlide;
    const contentType = currentSlide.contentType === 'text_only' ? 'text_1_image' : currentSlide.contentType;
    const newSlide: Slide = {
      id: `slide_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      contentType,
      layoutStyle: currentSlide.layoutStyle,
      imageLayout: currentSlide.imageLayout,
      theme: currentSlide.theme,
      background: currentSlide.background,
      layers: {
        text: [
          {
            id: `text_1`,
            role: 'body',
            content: 'Escreva a explicação do seu novo slide aqui...',
          },
        ],
        images: [
          {
            id: `img_1`,
            position: 'center',
            source: { type: 'upload', url },
            scale: 1,
            offsetX: 0,
            offsetY: 0,
          },
        ],
      },
    };

    const updatedSlides = [...activeCarousel.slides, newSlide];
    const updatedCarousels = carousels.map((c) =>
      c.id === activeCarousel.id ? { ...c, slides: updatedSlides } : c
    );
    saveCurrentCarouselsState(updatedCarousels);
    setActiveSlideIndex(updatedSlides.length - 1);
  };

  const handleCaptionChange = (caption: string) => {
    if (!activeCarousel) return;
    const updatedCarousels = carousels.map((c) =>
      c.id === activeCarousel.id ? { ...c, caption } : c
    );
    saveCurrentCarouselsState(updatedCarousels);
  };

  const handleToggleChannel = (channel: SocialChannel) => {
    if (!activeCarousel) return;
    const currentChannels = activeCarousel.selectedChannels || ['instagram', 'linkedin'];
    const exists = currentChannels.includes(channel);
    let newChannels: SocialChannel[];
    if (exists) {
      if (currentChannels.length <= 1) return; // Mantém ao menos 1 canal ativo
      newChannels = currentChannels.filter((ch) => ch !== channel);
    } else {
      newChannels = [...currentChannels, channel];
    }

    saveUserPreferences({ selectedChannels: newChannels });
    const updatedCarousels = carousels.map((c) =>
      c.id === activeCarousel.id ? { ...c, selectedChannels: newChannels } : c
    );
    saveCurrentCarouselsState(updatedCarousels);
  };

  return {
    carousels,
    setCarousels,
    activeCarouselId,
    setActiveCarouselId,
    activeSlideIndex,
    setActiveSlideIndex,
    activeCarousel,
    activeSlide,
    isSaving,
    saveCurrentCarouselsState,
    handleUpdateCarouselName,
    handleToggleAspectRatio,
    handleCreateNewCarousel,
    handleDuplicateCarousel,
    handleDeleteCarousel,
    handleMarkAsSent,
    updateActiveSlide,
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
  };
}
