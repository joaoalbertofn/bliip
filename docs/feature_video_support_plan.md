# Especificação Técnica & Plano de Backlog: Suporte a Vídeos nos Slides (Prioridade Baixa)

Este documento registra o planejamento arquitetural e a especificação técnica para a futura funcionalidade de **Suporte a Vídeos em Slots de Imagem no Bliip**.

---

## 🎯 Objetivo da Funcionalidade
Permitir que o usuário insira arquivos de vídeo (MP4, WebM, MOV) nos mesmos campos dos slides que hoje aceitam imagens estáticas (incluindo layouts com 1 ou 2 mídias, como o estilo *Comparison*), oferecendo:
- Drag & Drop de vídeos do computador e da Bandeja de Mídias.
- Zoom (Scale) e Pan (Offset X/Y) sobre o vídeo dentro da moldura.
- Timeline de corte de vídeo (Start Time / End Time) limitada a até 60 segundos por slide.
- Opção para ativar ou remover o áudio do vídeo (Mute Toggle).
- Exportação em formato de vídeo `.mp4` mantendo a moldura visual do Bliip (Twitter, Immersive, Comparison, News).

---

## 📐 Especificação Arquitetural e Mudanças no Código

### 1. Modelo de Dados (`src/types/carousel.ts`)
Evolução do tipo `ImageLayer` para `MediaLayer`:
```typescript
export type MediaSource = 
  | { type: "upload"; url: string; mediaType: "image" | "video" }
  | { type: "ai_generated"; provider: string; prompt: string; url: string }
  | { type: "meme"; templateId: string; url: string };

export type MediaLayer = {
  id: string;
  source: MediaSource;
  position: "top" | "bottom" | "center" | "background";
  scale?: number;     // Zoom: 1.0 a 3.0
  offsetX?: number;   // Deslocamento X em %
  offsetY?: number;   // Deslocamento Y em %
  videoConfig?: {
    duration: number;   // Duração total do vídeo original (segundos)
    startTime: number;  // Tempo de início do corte (segundos)
    endTime: number;    // Tempo de fim do corte (segundos, máx. 60s)
    muted: boolean;     // Se o som original será removido na exportação
    loop?: boolean;
  };
};
```

---

### 2. Componentes de UI e Canvas (`src/components/InteractiveImageContainer.tsx`)
- Renderização condicional de elementos `<video>` quando `source.mediaType === 'video'`.
- Atributos no editor: `autoPlay`, `loop`, `muted`, `playsInline` para pré-visualização contínua e fluida durante a edição.
- Suporte a Drag & Drop atualizado (`accept="image/*,video/*"`).
- Aplicação de `objectPosition` e `transform: scale()` no elemento `<video>` exatamente como nas imagens.

---

### 3. Componente de Timeline e Corte (`src/components/VideoTrimmer.tsx`)
- Componente deslizante com cursores duplos de início e fim.
- Atualização em tempo real do `currentTime` do vídeo no Canvas ao mover os manipuladores.
- Validação automática para impedir seleção de trechos superiores a 60s.
- Toggle switch para "Remover Som" (Mute).

---

### 4. Estratégia de Armazenamento (Híbrida: IndexedDB + Cloudflare R2)
Para evitar limitações de payload de 4.5MB da Vercel e custos de tráfego:
1. **Fase de Edição (Local)**: Arquivos de vídeo e Blob URLs salvos no IndexedDB (`idb-keyval`) no navegador do usuário (R$ 0,00 de infraestrutura).
2. **Fase de Exportação/Buffer (Nuvem)**: Upload direto via Presigned URL do navegador para o **Cloudflare R2** (zero taxa de transferência/egress).
3. A API do Buffer recebe o link do R2 para publicação no Instagram/LinkedIn.

---

### 5. Renderização & Exportação de Mídia (`src/lib/exporter.ts`)
- **Downscaling & Re-encoding**: O Canvas captura o layout completo em 1080x1350px (4:5).
- **Gravação**: Utilização de `MediaRecorder` / `WebCodecs` no cliente.
- **Tamanho Esperado do Arquivo Final**:
  - Independentemente de o vídeo original ser 480p ou 4K, o re-encoding do slide completo (60s @ 1080x1350, 4Mbps Bitrate) gera um arquivo final leve de **~25 MB a 35 MB**.

---

## 📌 Checklist de Tarefas Futuras (Quando Ativado)
- [ ] Criar migração de schema em `carousel.ts` para suporte a `MediaLayer`.
- [ ] Atualizar `InteractiveImageContainer` para aceitar e renderizar `<video>`.
- [ ] Implementar o componente `VideoTrimmer` com manipuladores de timeline.
- [ ] Atualizar o `MediaTray.tsx` para aceitar vídeos e gerar thumbnails.
- [ ] Implementar a gravação de Canvas via `MediaRecorder` em `exporter.ts`.
- [ ] Configurar bucket e Presigned URLs no Cloudflare R2.
