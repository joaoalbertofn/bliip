# Plano de Arquitetura & Implementação: Publicação Multi-Canal & Pré-visualização Realista

Este plano estabelece a nova arquitetura do **Bliip** para transformar a ferramenta em uma plataforma **Multi-Canal & Multi-Plataforma** com pré-visualização realista em tempo real (Instagram, LinkedIn e YouTube Comunidade), edição de **Legenda Global do Post** e envio direcionado via **Buffer Adapter**.

---

## 🏛️ 1. Visão Geral da Arquitetura

```
+--------------------------------------------------------------------------------------------------+
|                                    TELA DE CRIAÇÃO DO BLIIP                                      |
|                                                                                                  |
|  [ Barra Lateral ]                 [ Área Central de Pré-Visualização ]                           |
|  - Bandeja de Mídias               - Seletor de Rede Ativa ( Tabs: Canvas | Instagram | LinkedIn )|
|  - Seleção de Estilos              - [ Canvas de Edição do Slide ]  ou                           |
|  - Conteúdo do Slide               - [ Mockup Realista do Instagram com Legenda e Slide ]  ou    |
|  - Legenda Global do Post          - [ Mockup Realista do LinkedIn com Galeria/Slide e Legenda ]   |
|  - Seleção Multi-Canal [x] [x]     ------------------------------------------------------------  |
|                                    - Slider de Posição / Reordenação de Slides                   |
+--------------------------------------------------------------------------------------------------+
                                                     |
                                                     v
+--------------------------------------------------------------------------------------------------+
|                               PUBLISHING ADAPTER ARCHITECTURE                                    |
|                                                                                                  |
|                         +----------------------------------------+                               |
|                         |    StandardizedPostPayload (Contrato)  |                               |
|                         |  - slidesImages[] (JPG/PNG DataURLs)   |                               |
|                         |  - captionText (com Hashtags/Emojis)   |                               |
|                         |  - targetChannels: ['instagram', ...]  |                               |
|                         +----------------------------------------+                               |
|                                              |                                                   |
|                +-----------------------------+-----------------------------+                     |
|                |                                                           |                     |
|                v                                                           v                     |
|    +------------------------+                                 +------------------------+         |
|    |     BufferAdapter      |                                 |    FutureAdapters      |         |
|    |  (Instagram, LinkedIn, |                                 | (Metricool, Webhooks,  |         |
|    |   YouTube Community)   |                                 |  Direct OAuth APIs)    |         |
|    +------------------------+                                 +------------------------+         |
+--------------------------------------------------------------------------------------------------+
```

---

## 📋 2. Módulos & Componentes a Serem Construídos

### A. Modelo de Dados Atualizado (`src/types/carousel.ts`)
- Adicionar no modelo do `Carousel`:
  - `caption?: string`: Legenda global da publicação (suporta hashtags, emojis e parágrafos).
  - `selectedChannels?: SocialChannel[]`: Canais ativos para este post (ex: `['instagram', 'linkedin', 'youtube']`).

---

### B. Seletor de Canais & Editor de Legenda Global (`src/components/PostCaptionEditor.tsx`)
- Novo painel retrátil (Acordeão) na barra lateral esquerda:
  - **Checkboxes de Canais**:
    - `[x] Instagram`
    - `[x] LinkedIn`
    - `[ ] YouTube (Comunidade)`
    - `[ ] TikTok (Vídeo MP4)`
  - **Caixa de Texto da Legenda (Caption Editor)**:
    - Campo de texto dedicado com contador de caracteres (ex: 0/2200 para Instagram, 0/3000 para LinkedIn).
    - Inserção rápida de hashtags `#` populares e emojis.

---

### C. Sistema de Pré-Visualização Realista das Redes (`SocialPreviewContainer.tsx`)
Na área central de pré-visualização (ao lado da barra de zoom/fit), o criador poderá alternar as abas de pré-visualização:
1. **🎨 Canvas Bliip** (Edição e visualização do slide atual).
2. **📸 Instagram Preview** (Fiel ao mock do Instagram):
   - Cabeçalho com foto de perfil e username (`@joaoalbertofn`).
   - Carrossel com navegação lateral e pontinhos (`• • •`).
   - Barra de interações (`❤️ 💬 🔄 ✈️ 🔖`).
   - Legenda do post formatada abaixo com hashtags em destaque.
3. **💼 LinkedIn Preview** (Fiel ao mock do LinkedIn):
   - Cabeçalho do perfil professional com nome, cargo e tempo (`1h · 🌐`).
   - Legenda do post no topo.
   - Galeria/Slide de imagens no centro.
   - Barra inferior do LinkedIn (`👍 Like  💬 Comment  🔄 Repost  ✈️ Send`).
4. **🔴 YouTube Comunidade Preview**:
   - Layout da aba Comunidade do YouTube com avatar, nome do canal, postagem de texto e grade de imagens anexadas.

---

### D. Arquitetura de Publicação Multi-Canal via Buffer (`src/lib/publishers/`)
- **Adaptador Unificado de Envio (`BufferMultiChannelPublisher.ts`)**:
  - Quando o usuário clica em **Exportar / Agendar via Buffer**:
    1. O Bliip renderiza todas as telas em imagem de alta resolução (JPG/PNG).
    2. Identifica os perfis/canais do Buffer associados às redes selecionadas (Instagram, LinkedIn, etc.).
    3. Envia o payload adaptado para cada canal via API do Buffer (`createPost` GraphQL com fallback REST v1):
       - Para **Instagram**: Envia `text: caption` + `assets: slidesImages[]`.
       - Para **LinkedIn**: Envia `text: caption` + `assets: slidesImages[]` (Galeria de imagens).
       - Para **YouTube Comunidade**: Envia `text: caption` + `assets: slidesImages[]`.

---

### E. Estrutura Preparada para Integrações Futuras (Metricool, Webhooks & APIs Diretas)
- Criação da interface padrão `PublishingAdapter`:
  ```typescript
  export interface PublishingAdapter {
    id: string; // 'buffer' | 'metricool' | 'make' | 'direct_oauth'
    name: string;
    publish(payload: StandardizedPostPayload): Promise<PublishResult>;
  }
  ```

---

## 📋 3. Roteiro Sequencial de Execução (Fases)

### Fase 1: Modelo de Dados & Editor de Legenda Global
1. Atualizar os tipos em `src/types/carousel.ts` e sanitizador em `src/lib/storage.ts` com `caption` e `selectedChannels`.
2. Adicionar o manipulador `handleCaptionChange` e `handleChannelToggle` no hook `useCarouselState.ts`.
3. Adicionar o grupo acordeão **"Legenda Global & Canais de Destino"** na barra lateral.

### Fase 2: Componentes de Pré-Visualização Realistas (Instagram & LinkedIn)
1. Criar `src/components/previews/InstagramMockupPreview.tsx`.
2. Criar `src/components/previews/LinkedInMockupPreview.tsx`.
3. Criar `src/components/previews/YouTubeCommunityPreview.tsx`.
4. Integrar o seletor de abas de pré-visualização no topo do Canvas Principal.

### Fase 3: Roteamento de Envio Multi-Canal no Buffer
1. Atualizar a rota API `/api/buffer` para aceitar envio em lote para múltiplos `profileIds` ou canais de destino.
2. Atualizar a modal de exportação `ExportModal.tsx` para exibir o progresso de envio canal por canal (`[✓] Instagram` `[✓] LinkedIn`).

---

## 🧪 4. Plano de Verificação

1. **Edição de Legenda**: Digitar a legenda na barra lateral e verificar a atualização instantânea nas pré-visualizações realistas do Instagram e LinkedIn.
2. **Seleção de Canais**: Marcar LinkedIn e Instagram e confirmar que as abas de pré-visualização realista ficam acessíveis no topo do canvas.
3. **Envio via Buffer**: Disparar o envio e verificar nos logs/painel do Buffer o recebimento dos posts com galeria no Instagram e LinkedIn.
4. **Build & Typos**: Executar `npx tsc --noEmit` (0 erros) e `npm run build`.
