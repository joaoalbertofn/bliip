# Bliip — Criador de Carrosséis, Vídeos e Posts para Instagram & Redes Sociais

O **Bliip** é uma plataforma SaaS moderna para criação rápida, edição visual, geração de vídeos e agendamento de posts e carrosséis visuais para redes sociais (Instagram, LinkedIn, Facebook, YouTube Community, TikTok), inspirada nos estilos visuais de Bruno Perini e Sadhguru, com inteligência artificial integrada.

---

## 🚀 Funcionalidades Principais

### 🤖 Bliip IA Estrategista & Content Planner
- **Geração Inteligente de Conteúdo**: Criação automática de roteiros de carrossel por IA (Google Gemini API).
- **Engenharia Reversa Narrativa & Visual em Tempo Real**:
  - Leitura dinâmica dos carrosséis salvos pelo próprio criador no estúdio para aprender e clonar o seu tom de voz, estrutura de ganchos, ritmo de slides e frequência de marca-texto (`<mark>`).
  - Geração de orientações práticas e diretas de **fotos pessoais recomendadas** (`imageDescription`) em cada slot de imagem (ex: *"[Foto recomendada: Print da tela do seu painel de vendas ou foto no computador]"*).
- **Personalização de Perfil de Negócio Profundo**: Alinhamento com as dores da audiência (*falta de tempo, posts genéricos sem engajamento e sem vendas*) e desejo principal (*criar o mínimo de conteúdo possível no Instagram/YouTube trazendo mais seguidores e vendas*).
- **Comando de Voz por Microfone (Speech-to-Text Bilíngue)**: Suporte a ditado por voz no chat com alternância rápida entre Português (`pt-BR`) e Inglês (`en-US`), com transcrição contínua acumulativa.
- **Padronização Visual Otimizada**: Posts e variações recomendadas no estilo visual **Twitter/X** por padrão para melhor aproveitamento do espaço em tela.
- **Vínculo Dinâmico Chat ↔ Estúdio**: Preservação das edições feitas no estúdio quando o conteúdo é acessado pelo chat do planejador ou calendário.

### 🎨 Editor Visual de Carrosséis & Estilos
- **Editor WYSIWYG de Canvas (`InlineCanvasEditor`)**: Edição direta de texto no próprio slide com suporte a realce em marca-texto (`<mark>`), negrito e tratamento de quebra de linhas inteligente.
- **Formatos e Layouts Especiais**: Suporte a layouts Twitter/X Style, Immersive, Comparison e News Article.
- **Temas Visuais & Paletas**: Temas predefinidos (Bruno Perini, Dark Minimal, High Contrast, Gradient, Vibrant Light, etc.).
- **Marca-Texto Fluido, Purificado & Inteligente**: Formatação de destaques (`<mark>`) semânticos em linha sem blocos quadrados, sanitização defensiva contra vazamento de atributos Tailwind e remoção automática de tags vazias.
- **Controles de Imagem, Zoom & Ações Flutuantes**:
  - Menu flutuante posicionado no topo externo da foto ao selecioná-la.
  - Zoom preciso (100% a 300%) com trava mínima em 1.0x para evitar bordas vazias.
  - Botões de **Reset de Enquadramento**, **📁 Trocar Imagem** e **🗑️ Remover Imagem**.
  - Ocultamento automático da barra de zoom ao clicar fora da imagem.
- **Editor de Legenda Global**: Legenda unificada para o post com atalhos para emojis, hashtags e CTAs.

### 🎬 Criadores de Conteúdo Multi-Formato
- **📱 Criador de Vídeos Verticais (Reels / TikTok / Shorts)**: Suporte ao formato 9:16 com preview de timeline, editor de ganchos (Hook 3s) e closed captions dinâmicos.
- **🎥 Criador de Vídeos Longos (YouTube / LinkedIn / Facebook Watch)**: Formato 16:9 widescreen com gerador de thumbnails e marcadores de tempo (timestamps/capítulos) para SEO.
- **⚡ Criador de Stories**: Suporte a narrativas efêmeras de 24h com múltiplos cards em sequência e elementos de engajamento.

### 🛡️ Validação & Renderização Avançada de Mídia
- **`VideoRenderEngine`**: Extração instantânea de frames de vídeo (poster image / thumbnail) a partir de arquivos MP4/MOV para uso como capa estática.
- **`ImageRenderEngine`**: Captura de slides em PNG Ultra HD (3x pixel ratio) e compressão otimizada em lote via ZIP.
- **`SocialMediaValidator` & Modal de Compatibilidade**: Diagnóstico dinâmico de compatibilidade de mídias por canal social. Avisa e oferece opções ao usuário caso mídias em vídeo sejam usadas em canais incompatíveis com carrosséis de vídeo (como LinkedIn).

### 🎞️ Barra de Reordenação e Edição Rápida de Slides
- **Exclusão de 1 Clique**: Ícone de lixeira (🗑️) direto no topo do card de cada slide para remoção rápida sem precisar abrir menus suspensos.
- **Menu de Opções do Slide**: Duplicação em 1 clique e salvamento do slide como Modelo Customizado.
- **Inserção e Reordenação Drag & Drop**: Arrasto fluido para reordenar slides ou inserir novas mídias.

### 📱 Previews Multi-plataforma em Tempo Real
- Mockups interativos e fiéis ao visual final em 4 redes sociais:
  - 📸 **Instagram** (Feed e Carrossel)
  - 💼 **LinkedIn** (Documento/Carrossel e Post)
  - 👥 **Facebook** (Postagem e Galeria)
  - ▶️ **YouTube Community** (Post da Comunidade)

### 🗓️ Agendamento e Publicação Multi-canal (Buffer API)
- **Integração com Buffer**: Conexão com contas sociais diretamente pela plataforma.
- **Agendamento em Massa**: Definição de data, horário e canais de publicação.
- **Arquitetura Adaptável**: Sistema de publicação extensível via padrão Adapter (`PublishingAdapter`).

### 📦 Exportação de Alta Qualidade
- **Exportação em Lote (ZIP)**: Download de todos os slides do carrossel em imagens PNG/JPG organizadas em um arquivo `.zip`.
- **Exportação Individual**: Download direto de slides específicos.

### 📂 Dashboard & Gerenciamento de Projetos
- **Persistência Local Defensiva**: Armazenamento no navegador via IndexedDB (`idb-keyval`), garantindo autosave contínuo sem perda de rascunhos.
- **Gerenciador de Projetos**: Criação, busca, filtragem por nicho, duplicação e exclusão.
- **Backup & Restore (JSON)**: Importação e exportação do estado completo de projetos para backup ou transferência.
- **Biblioteca de Templates**: Possibilidade de salvar e reusar schemas de slides personalizados.

---

## 📐 Arquitetura da Interface do Editor (3 Colunas)

```text
┌───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                      NAVBAR                                                           │
├───────────────────────────────┬────────────────────────────────────────────────────────┬──────────────────────────────┤
│ ⬅️ Slide Design (Esquerda)    │ 🎯 Content Workspace (Centro)                          │ ➡️ Social Post Preview (Direita)│
│ [Recolhível]                  │                                                        │ [Recolhível]                 │
│                               │ 🖼️ Canvas do Slide Selecionado (Inline Canvas Editor)   │ 🌐 Checkboxes de Redes       │
│ • Estilo Visual & Tipo        │ 📝 Editor de Legenda Global (Lado a lado do Canvas)    │   (Instagram, LinkedIn, etc) │
│ • Texto & Marca-Texto         │ 🎞️ Barra Inferior (Reordenação & Lixeira 1-Clique)     │                              │
│ • Temas de Cores              │                                                        │ 📱 Lista de Previews         │
│                               │                                                        │   Empilhados em Scroll       │
└───────────────────────────────┴────────────────────────────────────────────────────────┴──────────────────────────────┘
```

---

## 🛠️ Tecnologias Utilizadas

- **Next.js 14 (App Router)** — Framework React fullstack
- **React 18 & TypeScript** — Interface dinâmica com tipagem estática
- **Tailwind CSS & Lucide Icons** — Estilização moderna e conjunto de ícones
- **Web Speech API** — Reconhecimento nativo de voz em Português e Inglês
- **Auth.js v5 (NextAuth.js)** — Autenticação de usuários com conta Google
- **Buffer API (GraphQL & REST)** — Agendamento e publicação direta nas redes
- **Google Gemini API** — Inteligência artificial para geração estratégica de conteúdo
- **IndexedDB (`idb-keyval`)** — Armazenamento e persistência offline de projetos
- **`html-to-image` & `jszip`** — Renderização de slides e exportação de imagens em lote

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
- Node.js 18.x ou superior
- Gerenciador de pacotes `npm` ou `yarn`

### Passos para Instalação

1. **Clonar o repositório**:
   ```bash
   git clone <URL_DO_REPOSITORIO>
   cd Bliip
   ```

2. **Instalar as dependências**:
   ```bash
   npm install
   ```

3. **Configurar as Variáveis de Ambiente**:
   Crie um arquivo `.env.local` na raiz do projeto e configure as chaves necessárias:
   ```env
   # Autenticação (NextAuth)
   AUTH_SECRET=sua_chave_secreta_aqui
   AUTH_GOOGLE_ID=seu_google_client_id
   AUTH_GOOGLE_SECRET=seu_google_client_secret

   # Inteligência Artificial (Gemini)
   GEMINI_API_KEY=sua_chave_api_gemini

   # Buffer API (Opcional para agendamento)
   BUFFER_CLIENT_ID=seu_buffer_client_id
   BUFFER_CLIENT_SECRET=seu_buffer_client_secret
   ```

4. **Executar o servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```

   Acesse no navegador: `http://localhost:3000` (ou `http://localhost:3001` caso a porta 3000 esteja em uso).

---

## 📁 Estrutura de Pastas Principais

```text
src/
├── app/                  # Rotas do Next.js App Router & Server Actions / APIs (/api/ai, /api/buffer, /api/lead-sync)
├── components/           # Componentes React (Editor, Dashboard, Canvas, InlineCanvasEditor, Speech Input)
│   ├── creators/         # Criadores de conteúdo multi-formato (Vídeos Verticais, Vídeos Longos, Stories)
│   ├── modals/           # Modais de interface (Exportação, Compatibilidade de Mídia, etc)
│   ├── previews/         # Mockups de pré-visualização (Instagram, LinkedIn, Facebook, YouTube)
│   └── templates/        # Renderizadores visuais dos modelos de slides
├── domain/               # Regras de negócio puras (validações de legenda, slide e carrossel)
├── hooks/                # Custom React Hooks (useCarouselState, useSpeechRecognition)
├── lib/                  # Utilitários, storage (IndexedDB), contextExtractor, exportadores e adaptadores de publicação
│   ├── renderers/        # Motores de renderização de imagem (ImageRenderEngine) e vídeo (VideoRenderEngine)
│   └── validators/       # Validadores de compatibilidade de mídias sociais (SocialMediaValidator)
├── templates/            # Schemas e registros de modelos de slide
└── types/                # Definições de tipos TypeScript do domínio
```
