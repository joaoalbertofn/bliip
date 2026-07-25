# Plano de Refatoração Arquitetural: Regras de Domínio & Padrão Publisher Adapter

Este plano especifica a formalização da **Clean Architecture** no **Bliip**, criando a camada explícita de **Regras de Domínio (`src/domain/`)** e a camada de **Adaptadores de Publicação (`src/lib/publishers/`)**.

---

## 🏛️ 1. Estrutura dos Novos Módulos

```
src/
├── domain/                         <-- [NOVO] Camada de Domínio Puro
│   ├── rules/
│   │   ├── slideRules.ts           (Regras de validação de slides, imagens e fontes)
│   │   ├── captionRules.ts         (Regras de limites de legenda e hashtags por rede social)
│   │   └── carouselRules.ts        (Regras de contagem de slides e limites do carrossel)
│   └── index.ts                    (Ponto único de exportação do Domínio)
│
└── lib/
    └── publishers/                 <-- [NOVO] Padrão Publisher Adapter
        ├── PublishingAdapter.ts    (Contrato/Interface abstrata de publicação)
        ├── BufferPublisher.ts      (Implementação concreta do Buffer)
        ├── PublisherRegistry.ts    (Registro e fábrica de publishers)
        └── index.ts
```

---

## 📋 2. Detalhamento Técnico das Implementações

### A. Módulo de Domínio (`src/domain/`)

1. **`slideRules.ts`**:
   - `canChangeContentType(layoutStyle, targetContentType)`: Valida se o tipo de conteúdo é compatível (ex: o estilo *Comparativo* exige estritamente `text_2_images`).
   - `getMaxImagesForContentType(contentType)`: Retorna o limite de fotos (0, 1 ou 2).
   - `validateFontSize(fontSize)`: Garante limites seguros (14px a 48px, padrão 20px).

2. **`captionRules.ts`**:
   - `SOCIAL_CAPTION_LIMITS`: Tabela com limites de cada rede (Instagram: 2200, LinkedIn: 3000, YouTube: 5000, TikTok: 2200).
   - `validateCaptionForChannel(caption, channel)`: Retorna status, contagem de caracteres e aviso se exceder o limite da rede.
   - `extractHashtags(caption)`: Utilitário de domínio para isolar e formatar hashtags.

3. **`carouselRules.ts`**:
   - `canDeleteSlide(currentSlideCount)`: Impede a exclusão se o carrossel tiver apenas 1 slide.
   - `CAROUSEL_LIMITS`: Máximo de 15 slides por carrossel.

---

### B. Padrão Publisher Adapter (`src/lib/publishers/`)

1. **`PublishingAdapter.ts`**:
   - Interface padronizada:
     ```typescript
     export interface StandardizedPostPayload {
       carouselId: string;
       carouselName: string;
       caption: string;
       mediaUrls: string[];
       targetChannels: SocialChannel[];
     }

     export interface PublishingAdapter {
       id: string; // 'buffer' | 'metricool' | 'make' | 'direct_oauth'
       name: string;
       publish(payload: StandardizedPostPayload, config: IntegrationConfig): Promise<PublishResult>;
     }
     ```

2. **`BufferPublisher.ts`**:
   - Encapsula 100% da integração com o Buffer consumindo a API `/api/buffer`.

3. **`PublisherRegistry.ts`**:
   - Permite registrar e instanciar novos publicadores (ex: `getPublisher('buffer')`) de forma transparente.

---

## 🧪 3. Plano de Verificação

1. **Refatoração sem regressão**:
   - Atualizar `TemplateSelector.tsx`, `useCarouselState.ts` e `ExportModal.tsx` para consumirem os novos módulos de `src/domain/` e `src/lib/publishers/`.
2. **Testes de Compilação & Build**:
   - `npx tsc --noEmit` (0 erros).
   - `npm run build` (build Next.js bem-sucedido).
