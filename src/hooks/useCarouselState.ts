import { useState, useEffect } from 'react';
import { Carousel, Slide, UserProfile, ImageSource, ContentType, LayoutStyle } from '@/types/carousel';
import { loadCarousels, saveCarousels } from '@/lib/storage';
import { createSlide } from '@/lib/templates';
import { SlideTheme, SLIDE_THEMES } from '@/lib/themes';

export function useCarouselState(profile: UserProfile) {
  const [carousels, setCarousels] = useState<Carousel[]>([]);
  const [activeCarouselId, setActiveCarouselId] = useState<string>('');
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);

  // 1. Carregar dados iniciais ou criar carrossel de demonstração (8 permutações)
  useEffect(() => {
    async function initData() {
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
    const updated = carousels.map((c) => (c.id === activeCarousel.id ? { ...c, aspectRatio } : c));
    saveCurrentCarouselsState(updated);
  };

  const handleCreateNewCarousel = (newCarouselSlideCount: number = 4) => {
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
    updateActiveSlide((prev) => ({ ...prev, fontSize }));
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
  };
}
