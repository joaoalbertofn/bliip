# Plano de Implementação: Zoom & Pan Não-Destrutivo em Imagens

Este plano especifica a adição do recurso de **Zoom & Pan Não-Destrutivo**, permitindo ampliar (100% a 300%) e repensar o enquadramento de qualquer imagem enviada para o slide (como prints de dashboards de faturamento) sem perder o arquivo original e salvando o ajuste no estado do carrossel.

---

## 1. Alterações Propostas

### A. Estrutura de Dados (`src/types/carousel.ts`)
Adicionar propriedades de escala e deslocamento à interface `ImageLayer`:

```typescript
export type ImageLayer = {
  id: string;
  source: ImageSource;
  position?: "top" | "bottom" | "center" | "background";
  scale?: number;     // Fator de zoom: 1.0 (100%) a 3.0 (300%). Padrão: 1.0
  offsetX?: number;   // Deslocamento X em porcentagem (-50% a 50%). Padrão: 0
  offsetY?: number;   // Deslocamento Y em porcentagem (-50% a 50%). Padrão: 0
};
```

---

### B. Sanitização no Storage (`src/lib/storage.ts`)
Garantir que a função `sanitizeSlide` valide os valores de `scale`, `offsetX` e `offsetY` para evitar `NaN` ou valores inválidos ao carregar carrosséis antigos.

---

### C. Hook de Estado (`src/hooks/useCarouselState.ts`)
Adicionar a função `handleImageTransform`:

```typescript
const handleImageTransform = (
  imageIndex: number,
  transform: { scale?: number; offsetX?: number; offsetY?: number }
) => {
  updateActiveSlide((prev) => {
    const images = [...(prev.layers.images || [])];
    if (!images[imageIndex]) return prev;
    
    images[imageIndex] = {
      ...images[imageIndex],
      scale: transform.scale !== undefined ? transform.scale : (images[imageIndex].scale ?? 1),
      offsetX: transform.offsetX !== undefined ? transform.offsetX : (images[imageIndex].offsetX ?? 0),
      offsetY: transform.offsetY !== undefined ? transform.offsetY : (images[imageIndex].offsetY ?? 0),
    };

    return {
      ...prev,
      layers: { ...prev.layers, images },
    };
  });
};
```

---

### D. Renderização dos Templates (`TwitterStyleSlide.tsx` & `ImmersiveStyleSlide.tsx`)
- Aplicar o estilo CSS no container da imagem:
  `style={{ transform: scale(${scale}) translate(${offsetX}%, ${offsetY}%), transformOrigin: 'center center' }}`
- Manter a imagem dentro de um container com `overflow-hidden` para funcionar como uma janela de máscara limpa.
- Adicionar suporte a interação de arrastar (drag) com o mouse direto sobre a imagem no canvas preview para ajustar `offsetX` e `offsetY` em tempo real.

---

### E. Painel de Controle de Enquadramento na Barra Lateral (`src/app/page.tsx`)
Na seletor de imagens do painel esquerdo, quando houver uma imagem carregada:
1. **Slider de Zoom**: Controle de `1.0x` (100%) a `3.0x` (300%).
2. **Controles de Posição**: Sliders para ajuste fino de Pan Vertical/Horizontal.
3. **Botão Resetar**: Reverte instantaneamente para o estado original (`scale = 1.0`, `offsetX = 0`, `offsetY = 0`).

---

## 2. Plano de Verificação

### Testes Manuais de Uso
1. **Upload de Print Grande (Dashboard)**:
   - Fazer upload do print da Hotmart.
   - Deslizar o Zoom para 2.0x (200%).
   - Arrastar a imagem para centralizar no valor do faturamento ("R$ 914.028,46").
2. **Navegação entre Slides e Recarregamento**:
   - Alternar para o Slide #2 e voltar para o Slide #1 para garantir que o enquadramento permanece intacto.
   - Dar F5 na página e verificar a persistência no IndexedDB.
3. **Reset de Enquadramento**:
   - Clicar no botão "Resetar Enquadramento" e confirmar que a imagem volta à proporção inteira original.
