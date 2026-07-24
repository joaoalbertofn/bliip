# Especificação Técnica - Tarefa 1: Extração do Custom Hook `useCarouselState`

> [!IMPORTANT]
> **Instruções para o Agente**: Esta tarefa consiste estritamente em uma refatoração de estado sem alteração na interface de usuário nem nos comportamentos existentes. Não modifique layouts visuais nem lógica de negócios.

---

## 1. Objetivo
Mover toda a lógica de gerenciamento de estado dos carrosséis, slides ativos, e manipulação de slides (adicionar, remover, atualizar texto, reordenar, trocar layout) de [page.tsx](file:///Volumes/Midia/Antigravity%20Projeto/Bliip/src/app/page.tsx) para um custom hook isolado `src/hooks/useCarouselState.ts`.

---

## 2. Arquivos Envolvidos
- **[NOVO]** `src/hooks/useCarouselState.ts`
- **[MODIFICAR]** `src/app/page.tsx`

---

## 3. Passos de Implementação

### Passo 3.1: Criar o Hook `useCarouselState.ts`
Criar o arquivo em `src/hooks/useCarouselState.ts` exportando uma função `useCarouselState`:

```typescript
import { useState, useEffect } from 'react';
import { Carousel, Slide, UserProfile } from '@/types/carousel';
import { loadCarousels, saveCarousels } from '@/lib/storage';
import { createSlide } from '@/lib/templates';

export function useCarouselState(profile: UserProfile) {
  const [carousels, setCarousels] = useState<Carousel[]>([]);
  const [activeCarouselId, setActiveCarouselId] = useState<string>('');
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);

  // 1. Carregar dados iniciais ou criar demonstração
  useEffect(() => {
    async function initData() {
      const savedCarousels = await loadCarousels();
      if (savedCarousels.length > 0) {
        setCarousels(savedCarousels);
        setActiveCarouselId(savedCarousels[0].id);
      } else {
        // Inicializar Carrossel Demo de 8 permutações (manter lógica atual do page.tsx)
      }
    }
    initData();
  }, [profile.name]);

  // 2. Carrossel Ativo e Slide Ativo derivados
  const activeCarousel = carousels.find(c => c.id === activeCarouselId) || carousels[0];
  const activeSlide = activeCarousel?.slides[activeSlideIndex] || activeCarousel?.slides[0];

  // 3. Handlers de mutação encapsulados
  const updateActiveSlide = (updater: (slide: Slide) => Slide) => { /* ... */ };
  const addSlide = (style?: any, layout?: any) => { /* ... */ };
  const removeSlide = (index: number) => { /* ... */ };
  const reorderSlides = (newSlides: Slide[]) => { /* ... */ };
  const createNewCarousel = (slideCount: number, name?: string) => { /* ... */ };
  const deleteCarousel = (id: string) => { /* ... */ };

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
    updateActiveSlide,
    addSlide,
    removeSlide,
    reorderSlides,
    createNewCarousel,
    deleteCarousel,
  };
}
```

### Passo 3.2: Refatorar `src/app/page.tsx`
Substituir as dezenas de `useState` e handlers manuais em `page.tsx` pela chamada do hook `useCarouselState(profile)`.
- Garantir que todas as props repassadas para `<SlideCanvas />`, `<Dashboard />`, `<SlideReorderBar />` continuem funcionando exatamente da mesma forma.

---

## 4. Plano de Verificação
1. Rodar o projeto com `npm run dev`.
2. Verificar se o carrossel demo de 8 slides é carregado normalmente na inicialização.
3. Testar a edição de texto, troca de layouts, adição e remoção de slides.
4. Garantir que as alterações persistem no IndexedDB/localStorage após recarregar a página.
