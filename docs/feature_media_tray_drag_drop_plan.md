# Plano de Arquitetura: Bandeja de Mídias (Uploads Estilo Canva) e Arraste Direto para o Canvas & Novos Slides

Este plano especifica a implementação do novo fluxo de trabalho de **Bandeja de Mídias (Asset Staging Tray)** e **Drag-and-Drop Direto**.

Essa funcionalidade permitirá carregar múltiplas fotos de uma só vez na barra lateral e simplesmente **arrastá-las direto para qualquer imagem do slide no canvas** ou para o botão de **+ Novo Slide**.

---

## 1. Componentes e Alterações na Arquitetura

### A. Extensão do Estado do Carrossel (`src/types/carousel.ts` & `src/hooks/useCarouselState.ts`)
- Adicionar `mediaLibrary?: string[]` ao tipo `Carousel`.
- Criar os manipuladores de estado:
  - `uploadMediaToTray(files)`: Adiciona múltiplas fotos à bandeja do carrossel ativo.
  - `removeMediaFromTray(index)`: Remove uma foto da bandeja.
  - `assignMediaToSlide(slideId, imageIndex, url)`: Define a imagem de um slot do slide ativo.
  - `createSlideFromMedia(url)`: Cria um novo slide copiando o estilo visual do slide anterior e atribuindo a foto arrastada.

---

### B. Novo Componente: Bandeja de Mídias Estilo Canva (`src/components/MediaTray.tsx`)
- Adicionar na barra lateral esquerda um painel retrátil de uploads com:
  - **Área de Drag & Drop de Múltiplos Arquivos** (*"📥 Solte aqui suas fotos da história"*).
  - **Grade de Miniaturas**: Exibição visual das fotos carregadas no projeto.
  - **Arraste Habilitado (`draggable={true}`)**: Cada miniatura dispara o evento `onDragStart` transferindo a URL da imagem.

---

### C. Alvos de Arraste (Drag Targets)

#### 1. Canvas do Slide (`src/components/InteractiveImageContainer.tsx`)
- Ao arrastar uma foto por cima de uma imagem no canvas (Slot #1 ou Slot #2), o contêiner exibe um destaque visual animado (*"✨ Solte para aplicar a esta imagem"*).
- Ao soltar (`onDrop`), a foto é aplicada instantaneamente ao slot sem precisar ir para o painel de configurações.

#### 2. Botão de + Novo Slide (`src/app/page.tsx` & `src/components/SlideReorderBar.tsx`)
- O botão `+ Novo Slide` aceita o evento de soltar (`onDrop`).
- Ao soltar uma foto sobre ele, um **novo slide é criado automaticamente** herdando o estilo visual e o modelo do slide atual com a nova foto aplicada.

---

## 2. Plano de Verificação

### Testes Manuais de Usabilidade
1. **Upload em Massa**: Selecionar 4 fotos de uma vez e verificar a exibição imediata na Bandeja de Mídias da barra lateral.
2. **Arraste Direto para o Canvas**: Arrastar uma miniatura da bandeja e soltar sobre o canvas do slide ativo. Confirmar a atualização da foto.
3. **Arraste em Slide de 2 Imagens**: Arrastar para a Foto 1 (esquerda/topo) e Foto 2 (direita/baixo) e verificar o destaque do slot correto.
4. **Criação de Novo Slide via Arraste**: Arrastar uma foto para o botão `+ Novo Slide` e verificar a criação automática do novo slide com a foto.
5. **Persistência**: Recarregar a página e confirmar que as fotos salvas na bandeja do carrossel permanecem salvas.

### Compilação e Build
- Executar `npx tsc --noEmit` (0 erros).
- Executar `npm run build` (build Next.js bem-sucedido).
