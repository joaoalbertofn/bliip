# Diagnostic & Arquitetura do Bliip: Separação de Camadas (Clean Architecture)

Este documento analisa a estrutura arquitetural atual do **Bliip** e apresenta o modelo de **Separação de Responsabilidades (Layered / Clean Architecture)** que garante a desacoplagem total entre as **regras de negócio**, os **modelos de domínio** e a **interface gráfica (UI)**.

---

## 🏛️ 1. Como a Arquitetura do Bliip está Organizada Hoje

O Bliip já foi construído seguindo princípios modernos de desacoplamento, onde a interface gráfica (`page.tsx` e componentes) **não guarda a lógica do sistema**, agindo apenas como uma camada de visualização.

```
+--------------------------------------------------------------------------------------------------+
|                                    CAMADA 1: DOMÍNIO (DOMAIN)                                    |
|                       (100% Livre de React, UI ou bibliotecas externas)                          |
|                                                                                                  |
|  - Entidades e Contratos: Carousel, Slide, UserProfile, SocialChannel (src/types/carousel.ts)    |
|  - Esquemas de Templates: SlideTemplateSchema, BlockConfig (src/types/templateSchema.ts)        |
|  - Presets de Temas: SLIDE_THEMES, getSlideTheme (src/lib/themes.ts)                              |
+--------------------------------------------------------------------------------------------------+
                                                 |
                                                 v
+--------------------------------------------------------------------------------------------------+
|                              CAMADA 2: REGRAS DE NEGÓCIO & SERVIÇOS                              |
|                       (Funções Puras de Persistência, Fábricas e Exporte)                        |
|                                                                                                  |
|  - Fábrica de Slides & Templates: createSlide, LAYOUT_STYLES (src/lib/templates.ts)              |
|  - Engine de Registro de Schemas: getTemplateSchema (src/templates/schemas/templatesRegistry.ts)|
|  - Persistência e Sanitizador: loadCarousels, saveCarousels, sanitizeCarousel (src/lib/storage.ts)|
|  - Serviço de Exportação & Publicação: publishToBufferApi (src/lib/exporter.ts)                  |
+--------------------------------------------------------------------------------------------------+
                                                 |
                                                 v
+--------------------------------------------------------------------------------------------------+
|                             CAMADA 3: APLICAÇÃO (STATE & CONTROLLER)                             |
|                           (Hook Central de Gerenciamento de Estado)                              |
|                                                                                                  |
|  - Controller de Estado: useCarouselState (src/hooks/useCarouselState.ts)                        |
|    * Gerencia a lista de carrosséis e slide ativo                                               |
|    * Executa mutações de negócio (adicionar slide, alterar fonte, trocar layout, legendar)     |
|    * Garante a persistência automática transparente para a UI                                   |
+--------------------------------------------------------------------------------------------------+
                                                 |
                                                 v
+--------------------------------------------------------------------------------------------------+
|                            CAMADA 4: INTERFACE GRÁFICA / PRESENTATION                            |
|                       (Componentes Plugáveis - Totalmente Substituíveis)                         |
|                                                                                                  |
|  - Layout Shell & Orquestrador: BliipApp (src/app/page.tsx)                                      |
|  - Renderizador Orientado a Esquema: DynamicSlideRenderer.tsx & SlideCanvas.tsx                  |
|  - Componentes de Controle: MediaTray, TemplateSelector, PostCaptionEditor, HighlightTextEditor  |
|  - Mockups Realistas Plugáveis: InstagramMockupPreview, LinkedInMockupPreview, SocialPostPanel   |
+--------------------------------------------------------------------------------------------------+
```

---

## ✨ 2. Pontos Fortes da Arquitetura Atual

1. **Troca Fácil da Interface (UI)**:
   - Se amanhã quisermos mudar **100% da interface gráfica** (ex: criar uma versão mobile nativa, mudar para Tailwind v4, usar ShadcnUI ou redesenhar os painéis), **zero linhas de regras de negócio precisarão ser alteradas**.
   - Toda a inteligência de mutação de slides, controle de limite de imagens, sanitização de dados e histórico de persistência fica isolada dentro do custom hook `useCarouselState.ts` e dos serviços de `src/lib/`.

2. **Renderizador Orientado a Esquema (`DynamicSlideRenderer.tsx`)**:
   - A renderização dos slides não é codificada de forma rígida (*hardcoded*).
   - O componente lê um contrato de esquemas em JSON (`src/templates/schemas/`). Adicionar um novo modelo visual de slide requer apenas criar um novo arquivo `.json` sem alterar o código dos componentes React.

3. **Modelos de Domínio Puros (`src/types/`)**:
   - Os tipos de dados (`Carousel`, `Slide`, `SocialChannel`) são definições TypeScript puras, sem acoplamento com hooks do React ou lógica de renderização.

---

## 🎯 3. Recomendações para Potencializar o Desacoplamento Futuro

Para manter a arquitetura no mais alto nível de excelência à medida que o sistema cresce:

1. **Formalização do Padrão Publisher Adapter (`src/lib/publishers/`)**:
   - Isolar os conectores de redes sociais (Buffer, Metricool, APIs nativas) em uma pasta dedicada `src/lib/publishers/` implementando uma interface comum `PublishingAdapter`.

2. **Encapsulamento de Validações de Domínio (`src/domain/`)**:
   - Mover regras de negócio puras (ex: "um slide comparativo sempre exige 2 imagens", "uma legenda de Instagram suporta até 2200 caracteres") para um módulo de validação de domínio independente de componentes de interface.
