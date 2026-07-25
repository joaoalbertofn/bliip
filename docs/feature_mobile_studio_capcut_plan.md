# Plano de Implementação: Interface Mobile Dedicada (`MobileStudioView.tsx`)

> 📌 **Status**: **PENDENTE / TAREFA FUTURA DO PROJETO (BACKLOG)**  
> *(Este plano descreve a arquitetura para quando formos executar a versão mobile nativa)*

---

## 🎨 Visão Geral do Design da Interface Mobile (Opção 2)

![Interface Mobile Dedicada Bliip Studio estilo CapCut/Canva](/Users/joaoalbertofn/.gemini/antigravity/brain/701e5552-fcea-4cdd-983a-e3afda04047a/mobile_studio_capcut_1785013035563.jpg)

A **Opção 2** foi selecionada como a melhor solução para o celular. Ela oferece a experiência de um **aplicativo nativo estilo CapCut e Canva Mobile**, perfeitamente ergonômica para uso com uma única mão.

---

## 📐 Estrutura de Arquitetura dos Componentes

Grata à nossa **Clean Architecture**, 100% das regras de negócio (`useCarouselState.ts`, `@/domain`, `PublisherRegistry`) serão reutilizadas sem nenhuma alteração. O módulo mobile será composto por 3 novos componentes puramente visuais:

```
src/
└── components/
    └── mobile/                           <-- [PASTA FUTURA]
        ├── MobileStudioView.tsx          (Orquestrador da tela de celular)
        ├── MobileBottomBar.tsx           (Barra fixa de ferramentas no rodapé)
        └── MobileBottomSheet.tsx         (Gaveta deslizante para edição)
```

---

## 📋 Detalhamento dos Módulos

### 1. `MobileStudioView.tsx` (Orquestrador Mobile)
- **Painel Superior (65% da Tela)**: 
  - Exibe o `SlideCanvas` centralizado.
  - Detecta gestos de **Swipe (Deslizar para Esquerda/Direita)** para avançar/voltar slides.
  - Pontinhos de paginação do carrossel (`• • •`).
- **Detecção Automática**:
  - No `src/app/page.tsx`, usaremos a detecção de largura de tela (`< 768px`):
    ```tsx
    const isMobile = useMediaQuery('(max-width: 768px)');
    return isMobile ? <MobileStudioView ... /> : <DesktopStudioView ... />;
    ```

---

### 2. `MobileBottomBar.tsx` (Barra do Polegar)
- Barra fixa no rodapé da tela com os 5 botões de acesso rápido:
  1. `[ 📸 Mídias ]` ➔ Abre gaveta da bandeja de mídias do carrossel.
  2. `[ 🎨 Estilos ]` ➔ Abre gaveta de escolha de layout e temas de cores.
  3. `[ ✍️ Texto ]` ➔ Abre gaveta de edição de frase, citação e tamanho de fonte.
  4. `[ 📝 Legenda ]` ➔ Abre gaveta do editor de legenda global e checkboxes das redes.
  5. `[ 👁️ Previews ]` ➔ Abre gaveta com os mockups do Instagram, LinkedIn e YouTube.

---

### 3. `MobileBottomSheet.tsx` (Gaveta Deslizante)
- Componente de gaveta deslizante com animação suave de subida/descida.
- Ocupa os 45% inferiores da tela, permitindo que o usuário edite o texto ou escolha mídias **sem perder a visão do slide no topo da tela**.

---

## 🧪 Plano de Validação Futura
1. **Ergonomia em Telas Reais**: Testar em iOS (Safari Mobile) e Android (Chrome Mobile).
2. **Gestos Touch**: Validar fluidez do Swipe de troca de slide.
3. **Build & Compilação**:
   - `npx tsc --noEmit`
   - `npm run build`
