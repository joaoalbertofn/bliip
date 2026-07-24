# Plano de Arquitetura: Motor de Templates Dinâmicos Baseado em Schemas JSON

Este plano especifica a reformulação arquitetural do **Bliip**, substituindo componentes React engessados por um **Motor de Templates Dinâmicos Guiado por Schemas JSON (Schema-Driven Template Engine)**.

Com esta nova arquitetura, adicionar qualquer novo modelo de slide no futuro (ex: *Comparativo Antes/Depois*, *Artigo de Notícia*, *Citação Estilo Sadhguru*) exigirá **apenas criar os arquivos de configuração JSON**, sem necessidade de alterar o código-fonte da aplicação.

---

## 1. Nova Arquitetura de Schemas JSON

### A. Tipagem do Schema (`src/types/templateSchema.ts`)
Definição da especificação de alto nível, porém com controle granular de blocos e estilo:

```typescript
export type BlockType =
  | 'profile_header'
  | 'title_text'
  | 'body_text'
  | 'quote_text'
  | 'signature_text'
  | 'single_image'
  | 'dual_image'
  | 'badge_icon'
  | 'watermark';

export interface BlockConfig {
  type: BlockType;
  align?: 'left' | 'center' | 'right';
  styleProps?: {
    fontSize?: string;
    fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
    margin?: string;
    padding?: string;
    customCssClass?: string;
  };
  // Rótulos padrão para duas imagens (ex: ["Primeiro a comida", "Depois a sobremesa"])
  imageCaptions?: [string, string];
}

export interface SlideTemplateSchema {
  id: string; // Ex: 'twitter_text_only', 'immersive_text_1_image'
  styleGroup: string; // Ex: 'twitter', 'immersive', 'news_article', 'comparison'
  contentType: 'text_only' | 'text_1_image' | 'text_2_images';
  name: string;
  container: {
    layout: 'flex_col' | 'centered_card' | 'split_top_bottom';
    padding?: string;
    justifyContent?: 'start' | 'center' | 'between';
    alignItems?: 'start' | 'center' | 'end';
    gap?: string;
  };
  blocks: BlockConfig[];
}
```

---

### B. Registro de Arquivos JSON (`src/templates/schemas/`)

Organização em pastas para cada estilo visual:

```text
src/templates/schemas/
├── twitter/
│   ├── text_only.json
│   ├── text_1_image.json
│   └── text_2_images.json
├── immersive/
│   ├── text_only.json
│   ├── text_1_image.json
│   └── text_2_images.json
├── comparison/
│   └── text_2_images.json       # Estilo Antes/Depois ou Comida/Sobremesa
├── news_article/
│   └── text_only.json           # Estilo Artigo de Notícias
└── templatesRegistry.ts         # Carregador e compilador fortemente tipado
```

#### Exemplo de JSON de Template (`comparison/text_2_images.json`):
```json
{
  "id": "comparison_text_2_images",
  "styleGroup": "comparison",
  "contentType": "text_2_images",
  "name": "Comparativo Antes/Depois",
  "container": {
    "layout": "flex_col",
    "padding": "p-6",
    "justifyContent": "between",
    "gap": "gap-3"
  },
  "blocks": [
    { "type": "profile_header" },
    { "type": "dual_image", "imageCaptions": ["Primeiro a comida", "Depois a sobremesa"] },
    { "type": "watermark" }
  ]
}
```

---

### C. Motor de Renderização Dinâmico (`src/components/DynamicSlideRenderer.tsx`)
Substitui os arquivos legados de template por um único renderizador universal que:
1. Busca a especificação JSON correspondente ao `(slide.layoutStyle, slide.contentType)`.
2. Constrói o container Flexbox dinamicamente.
3. Renderiza cada bloco na ordem configurada (Perfil, Título, Corpo com marcações `<mark>`, Imagem com Zoom/Pan, Rótulos, Assinatura e Marca d'água).
4. Aplica as cores do tema selecionado (`light`, `dark`, `navy`, `sepia`, `emerald`).

---

### D. Atualização da Interface e Sidebar (`src/types/carousel.ts` & `src/app/page.tsx`)
- Adicionar suporte ao campo opcional `title` na interface `Slide` e `TextLayer`.
- Atualizar a barra lateral para permitir preencher o Título Principal quando o template exigir.

---

## 2. Plano de Verificação

### Testes Manuais de Interface
1. **Unificação dos Modelos Atuais**:
   - Testar os modelos *Twitter* e *Imersivo* carregados a partir dos schemas JSON.
   - Confirmar que a troca de cores, edição de texto e imagens com Zoom & Pan funcionam exatamente como antes.
2. **Teste do Novo Modelo de Comparação (Antes / Depois)**:
   - Selecionar o novo estilo comparativo com 2 imagens.
   - Verificar os rótulos dinâmicos configurados no JSON em cima de cada foto.
3. **Validação do Build**:
   - Rodar `npx tsc --noEmit` e `npm run build` para confirmar 0 erros.
