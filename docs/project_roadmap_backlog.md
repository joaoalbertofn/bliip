# Roadmap & Lista de Tarefas Pendentes do Bliip

Este documento registra as funcionalidades aprovadas e planejadas para o futuro do **Bliip Studio**.

---

## 📌 Tarefas Pendentes (Backlog de Funcionalidades)

### 1. 📱 Interface Mobile Dedicada (`MobileStudioView.tsx`)
- **Status**: **PENDENTE (Aguardando Execução Futura)**
- **Plano de Referência**: [docs/feature_mobile_studio_capcut_plan.md](file:///Volumes/Midia/Antigravity%20Projeto/Bliip/docs/feature_mobile_studio_capcut_plan.md)
- **Descrição**: 
  - Desenvolver a interface nativa para smartphones baseada na **Opção 2 (Estilo CapCut/Canva Mobile)**.
  - Implementar navegação por gestos de deslize (*Swipe*) para os slides.
  - Criar a barra inferior ergonômica para o polegar e gavetas deslizantes (*Bottom Sheets*) para edição de texto, mídias, temas e pré-visualizações.

---

### 2. 👤 Atualização Reativa da Foto de Perfil no Dashboard
- **Status**: **CONCLUÍDO** (Correção já enviada no commit `edc3607`).

---

---

### 4. 🎬 Suporte a Vídeo nos Slots dos Slides (`MediaLayer` & Video Trimmer)
- **Status**: **PENDENTE (Prioridade Baixa - Arquitetado)**
- **Plano de Referência**: [docs/feature_video_support_plan.md](file:///Volumes/Midia/Antigravity%20Projeto/Bliip/docs/feature_video_support_plan.md)
- **Descrição**:
  - Permitir que os campos que hoje suportam fotos aceitem também vídeos (MP4/WebM), inclusive em layouts com 2 mídias (*Comparison*).
  - Implementar drag & drop, zoom (scale) e pan (offset X/Y) para vídeos.
  - Timeline interativa de corte para ajustar trechos de até 60 segundos com opção para ligar/desligar áudio.
  - Gravação do slide completo em MP4 (1080x1350 @ 4Mbps, ~30MB para 60s).
  - Armazenamento local no IndexedDB e upload direto para Cloudflare R2 via Presigned URLs (evitando limites da Vercel).

