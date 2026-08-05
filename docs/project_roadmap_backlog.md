# Roadmap & Lista de Tarefas do Bliip

Este documento registra o status das funcionalidades desenvolvidas e o backlog planejado para o futuro do **Bliip Studio**.

---

## ✅ Funcionalidades Concluídas

### 1. 📱 Estúdio de Criação de Vídeos Verticais 9:16 (Reels / TikTok / Shorts)
- **Status**: **CONCLUÍDO**
- **Componentes**: `VerticalVideoCreatorView`, `VideoCanvas916`, `VideoTimelineTrimmer`, `VideoSidebarControls`, `VideoTextFormatToolbar`, `VideoSocialPostPreviewPanel`.
- **Descrição**:
  - Interface dedicada no formato 9:16 para edição visual de vídeos curtos.
  - Timeline interativa para trim de mídias, corte de tempo, ajuste do Hook inicial (3s) e tempo de fala.
  - Formatação avançada de textos com marca-texto, alinhamento e estilos nativos.
  - Previews em tempo real simulando Instagram Reels, TikTok e YouTube Shorts.

### 2. 🤖 Gerador de Legendas Estratégicas por IA (Gemini 3.6 API)
- **Status**: **CONCLUÍDO**
- **Componentes**: `/api/ai/caption`, `src/lib/captionAI.ts`, `PostCaptionEditor`.
- **Descrição**:
  - Geração de legendas completas orientadas a engajamento diretamente no editor de post.
  - Seleção de tom de voz (Persuasivo, Educacional, Viral, Vendedor, Minimalista).
  - Inclusão automática de ganchos de atração, chamadas para ação (CTAs) e grupo de hashtags otimizadas.

### 3. 🖼️ Interatividade & Enquadramento Avançado de Mídia (`InteractiveImageContainer`)
- **Status**: **CONCLUÍDO**
- **Componentes**: `InteractiveImageContainer.tsx`, `SlideCanvas.tsx`.
- **Descrição**:
  - Zoom fluido (100% a 300%) e Pan (deslocamento X/Y por drag/mouse/touch) com reposicionamento preciso.
  - Barra de ações flutuantes no topo da imagem para troca de foto, reset de enquadramento e remoção.
  - Otimização do arrasto e soltura (Drag & Drop) nativo para mídias da bandeja e do sistema.

### 4. 📂 Gerenciamento Unificado de Projetos no Dashboard
- **Status**: **CONCLUÍDO**
- **Componentes**: `Dashboard.tsx`, `src/lib/storage.ts`, `useCarouselState.ts`, `useVerticalVideoState.ts`.
- **Descrição**:
  - Suporte completo a múltiplos tipos de projeto (Carrosséis Visuais vs Vídeos Verticais).
  - Filtragem por abas e busca reativa no Dashboard.
  - Persistência local no IndexedDB com autosave contínuo, duplicação e exportação/importação de backups em JSON.

### 5. 👤 Atualização Reativa da Foto de Perfil no Dashboard
- **Status**: **CONCLUÍDO** (Commit `edc3607`)
- **Descrição**: Priorização da imagem de perfil de conta do usuário sobre fallback genérico.

---

## 📌 Tarefas Pendentes (Backlog de Funcionalidades Futuras)

### 1. 📱 Interface Mobile Dedicada (`MobileStudioView.tsx`)
- **Status**: **PENDENTE (Aguardando Execução Futura)**
- **Plano de Referência**: [docs/feature_mobile_studio_capcut_plan.md](file:///Volumes/Midia/Antigravity%20Projeto/Bliip/docs/feature_mobile_studio_capcut_plan.md)
- **Descrição**: 
  - Desenvolver a interface nativa para smartphones baseada no estilo **CapCut/Canva Mobile**.
  - Implementar navegação por gestos de deslize (*Swipe*) para os slides.
  - Criar barra inferior ergonômica para o polegar e gavetas deslizantes (*Bottom Sheets*) para edição de texto, mídias, temas e pré-visualizações.

---

### 2. 🎬 Suporte a Vídeo nos Slots dos Slides de Carrossel (`MediaLayer` & Video Trimmer)
- **Status**: **PENDENTE (Prioridade Baixa - Arquitetado)**
- **Plano de Referência**: [docs/feature_video_support_plan.md](file:///Volumes/Midia/Antigravity%20Projeto/Bliip/docs/feature_video_support_plan.md)
- **Descrição**:
  - Permitir que os campos dos slides de carrossel (Twitter, Comparison, Immersive) aceitem também arquivos de vídeo (MP4/WebM).
  - Implementar drag & drop, zoom (scale) e pan (offset X/Y) para vídeos em slides estáticos.
  - Gravação de slides em MP4 via MediaRecorder/WebCodecs e upload via Cloudflare R2.
