# Plano de Implementação: Rótulos Comparativos, Orientação de Imagens e Alinhamentos Independentes

Este documento detalha o plano para implementar o controle de rótulos do estilo comparativo, alternância de orientação (Horizontal/Vertical), bloqueios de domínio por estilo e alinhamentos independentes (Notícia e Texto Principal).

---

## 🎨 O Que Será Desenvolvido (Apenas Localmente)

### 1. Atualização do Modelo de Dados (`src/types/carousel.ts`)
- Adicionar ao `Slide`:
  - `textAlignment?: 'left' | 'center' | 'right'` (Alinhamento do texto principal).
  - `titleAlignment?: 'left' | 'center' | 'right'` (Alinhamento do título da notícia).
- Adicionar ao `ImageLayer`:
  - `title?: string` (Rótulo individual da imagem, ex: `"Antes"`, `"Depois"`).

---

### 2. Regras Estritas de Domínio (`src/domain/rules/slideRules.ts`)
- **Bloqueio no Estilo Comparativo**:
  - Quando `layoutStyle === 'comparison'`, a única opção válida é `contentType = 'text_2_images'`. As opções *"Apenas Texto"* e *"Texto + 1 Imagem"* ficam desabilitadas.
- **Bloqueio nos Demais Estilos** (`twitter`, `immersive`, `news_article`):
  - A opção `text_2_images` fica desabilitada.
- **Controle de Orientação**:
  - Habilitado apenas quando o estilo for `comparison` / `text_2_images`.

---

### 3. Controles no Inspetor de Design (`src/components/TemplateSelector.tsx` & `HighlightTextEditor.tsx`)
- **Na seção "ESTILO VISUAL & LAYOUT"**:
  - Botões de conteúdo com estado desabilitado conforme as regras do domínio.
  - Seletor de **Orientação das Imagens** (`📱 Vertical` | `🖥️ Horizontal`) posicionado logo abaixo da opção *"Texto + 2 Imagens"*.
- **Na seção "TEXTO DO SLIDE"**:
  - **Se Comparativo**: Exibe dois campos de texto **"Rótulo da Imagem 1"** (padrão `"Antes"`) e **"Rótulo da Imagem 2"** (padrão `"Depois"`). Se limpos, o rótulo é removido da imagem.
  - **Se Notícia**: Exibe o campo **"Título da Notícia"** + Seletor de Alinhamento do Título (`Esquerda`, `Centro`, `Direita`).
  - **Para Todos os Estilos**: Seletor de Alinhamento do **Texto Principal** (`Esquerda`, `Centro`, `Direita`).

---

### 4. Renderização no Canvas (`src/components/DynamicSlideRenderer.tsx`)
- Exibir os rótulos customizados das imagens no comparativo apenas se o texto não estiver vazio.
- Renderizar as duas imagens lado a lado (`flex-row`) quando a orientação for `horizontal`, e empilhadas (`flex-col`) quando `vertical`.
- Aplicar os alinhamentos `textAlignment` e `titleAlignment` (`text-left`, `text-center`, `text-right`).

---

### 5. Sanitização & Templates (`src/lib/templates.ts` & `src/lib/storage.ts`)
- Preencher `"Antes"` e `"Depois"` como padrão ao criar um slide comparativo.
- Preservar alinhamentos e rótulos no sanitizador de storage.

---

## 🛠️ Arquivos a Serem Modificados

| Arquivo | Descrição das Mudanças |
| :--- | :--- |
| `src/types/carousel.ts` | Adicionar `textAlignment`, `titleAlignment` e `ImageLayer.title`. |
| `src/domain/rules/slideRules.ts` | Adicionar regras de validação de `contentType` e orientação. |
| `src/lib/templates.ts` | Inicializar slide comparativo com rótulos `"Antes"` / `"Depois"`. |
| `src/lib/storage.ts` | Preservar novas propriedades na sanitização. |
| `src/components/TemplateSelector.tsx` | Adicionar seletor de orientação e aplicar bloqueios visuais. |
| `src/components/HighlightTextEditor.tsx` | Adicionar campos de rótulos 1/2, título da notícia e seletor de alinhamentos. |
| `src/components/DynamicSlideRenderer.tsx` | Renderizar rótulos, orientação e alinhamentos no Canvas. |

---

## 🧪 Validação Local

- `npx tsc --noEmit`
- `npm run build`
- Teste visual no servidor de desenvolvimento local (`http://localhost:3000`).
- **Nenhum commit ou push para a Vercel será feito.**
