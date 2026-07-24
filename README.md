# Bliip ⚡ - Criador Inteligente de Carrosséis & Posts Sociais

> Aplicação web moderna, de alta performance e visualmente impressionante para criação, edição e publicação automatizada de carrosséis e posts dinâmicos para redes sociais (Instagram, LinkedIn, Facebook, X/Twitter), com envio direto via **Buffer GraphQL API** e suporte a **Make.com Webhooks**.

---

## ⚡ Overview das Possibilidades com o Bliip

O **Bliip** foi projetado para transformar textos e ideias em peças visuais prontas para publicação com qualidade de designer profissional em poucos cliques. Com uma interface estilo dashboard + estúdio de criação em tela cheia, você tem controle total sobre o layout, tipografia, enquadramento de fotos e identidade de marca.

### Principais Destaques:
- 🎨 **Templates & Estilos de Design Flexíveis**: Alterne entre cartões sociais no estilo Twitter/X e layouts cheios de impacto visual (Estilo Imersivo).
- 🖼️ **Múltiplas Disposições de Imagem**: Suporte para 0, 1 ou 2 imagens por slide com orientações vertical (2 linhas) ou horizontal (2 colunas).
- 🖱️ **Enquadramento Interativo & Pan/Zoom (Mouse Drag)**: Controle fino de enquadramento com arrasto interativo pelo mouse (Pan X/Y) e ajuste contínuo de zoom (1.0x a 3.0x) direto no canvas.
- 🖍️ **Editor de Texto com Marca-Texto**: Destaque termos estratégicos com efeito de marca-texto amarelo (`<mark>`) ou negrito com apenas um clique.
- 🎨 **Gerenciador de Temas de Cores**: Presets de paletas cromáticas de alto contraste (Dark Slate, Light Clean, Midnight Purple, Emerald Dark, Solar Amber, etc.) definidos centralizadamente.
- 📐 **Proporções de Tela Flexíveis**: Alterne instantaneamente entre **4:5 (1080x1350px - Instagram Portrait)** e **1:1 (1080x1080px - Quadrado)**.
- 🔗 **Publicação Direta no Buffer (API GraphQL)**: Envio automático de carrosséis nativos ou posts únicos para o Instagram/LinkedIn sem necessidade de exportar manualmente.
- 🛡️ **Proxy Serverless Seguro**: Endpoint de integração com o Buffer protegido por cabeçalhos de segurança HTTP rígidos (*X-Content-Type-Options*, *X-Frame-Options*, *Referrer-Policy*, *Cache-Control*).
- 📦 **Exportação de Alta Resolução**: Renderização em qualidade Retina (2x) com download individual (PNG) ou pacote completo em arquivo **.ZIP**.
- 💾 **Persistência Defensiva**: Armazenamento com sanitização de dados e fallback transparente entre IndexedDB e `localStorage`.

---

## 🎨 Guia de Templates, Estilos & Formatos Visuais

### 1. Estilos Visuais de Layout (`LayoutStyle`)

O Bliip oferece dois estilos fundamentais de layout que definem a estética do seu slide:

| Estilo | Nome no Editor | Descrição & Aplicação Recomendada |
| :--- | :--- | :--- |
| 🐦 **Twitter** | *Twitter* | Fundo claro ou customizável com cabeçalho contendo avatar de perfil, nome, handle (`@usuario`) e selo verificado azul. Ideal para posts conceituais, autoridade, insights rápidos, tweets curados e diálogos formatados. |
| ✨ **Immersive** | *Immersive* | Visual de alto impacto com tipografia grande em destaque, aspas elegantes, badge de avatar circular no topo e espaço exclusivo para assinatura do autor. Ideal para citações inspiracionais, frases marcantes e encerramento de carrosséis (CTA). |
| ⚖️ **Comparativo** | *Comparativo* | Layout estruturado com rótulos de fotos e ordenação vertical/horizontal. Ideal para comparações (Antes/Depois ou opção A vs B). |
| 📰 **Notícia** | *Notícia* | Visual editorial estilo manchete de notícias de mercado com alta legibilidade e destaques em texto. |

---

### 2. Tipos de Conteúdo e Disposição de Fotos (`ContentType`)

Cada slide pode ser configurado individualmente com uma estrutura de mídia:

1. **Apenas Texto (`text_only`)**:
   - Foco 100% na mensagem textual, citações, diálogos ou listas.
2. **Texto + 1 Imagem (`text_1_image`)**:
   - Alinha o texto principal com uma imagem destacada centralizada.
3. **Texto + 2 Imagens (`text_2_images`)**:
   - Permite exibir até 2 imagens simultâneas com dois modos de arranjo:
     - **Vertical (2 Linhas)**: Imagens empilhadas (uma acima e outra abaixo do texto).
     - **Horizontal (2 Colunas)**: Imagens dispostas lado a lado.

---

### 3. Presets de Temas de Cores de Alto Contraste

Você pode alterar a paleta cromática do slide a qualquer momento clicando em um dos temas pré-definidos em `src/lib/themes.ts`:

- 🌑 **Dark Slate**: Fundo escuro elegante (`#0f172a`) com texto branco.
- ⚪ **Light Clean**: Fundo branco limpo (`#ffffff`) com texto escuro.
- 🟣 **Midnight Purple**: Fundo roxo profundo (`#1e1b4b`) com texto lilás suave.
- 🌲 **Emerald Dark**: Fundo verde esmeralda (`#064e3b`) com texto esverdeado claro.
- ☀️ **Solar Amber**: Fundo âmbar terroso (`#451a03`) com texto dourado.

---

### 4. Formatos de Redes Sociais Suportados

Na hora de exportar ou publicar via Buffer, você pode selecionar a finalidade da publicação no catálogo de formatos:

- 📸 **Carrossel (Instagram)** *(Recomendado)*: Envia múltiplos slides como um carrossel nativo de fotos do Instagram.
- 🖼️ **Post Único (Instagram)**: Publica uma imagem única no feed.
- 📱 **Story (Instagram)**: Envia o slide formatado para Instagram Story.
- 🎥 **Reels (Instagram)**: Publica a capa/imagem no formato Reels.
- 💼 **Post (LinkedIn)**: Publica no feed do perfil ou página do LinkedIn.
- 👥 **Post (Facebook)**: Envia a imagem para a página do Facebook.
- 🐦 **Post (X / Twitter)**: Publica no feed do X / Twitter.

---

## 📖 Passo a Passo: Criando um Post Único (1 Slide)

Se você precisa criar uma publicação rápida para o feed, story ou LinkedIn:

```
[Dashboard] ➔ [+ Novo Conteúdo] ➔ [1 Slide] ➔ [Editar Texto & Estilo] ➔ [Exportar/Buffer]
```

### Passo 1: Iniciar Novo Conteúdo
1. No Dashboard do Bliip, clique no botão **`+ Novo Conteúdo`** no canto superior direito.
2. Na janela que se abre, ajuste o slider para **`1 slide (Post Único)`** e clique em **`Criar Conteúdo`**.

### Passo 2: Definir o Estilo Visual & Tipo de Conteúdo
1. No painel esquerdo do editor:
   - Em **Estilo Visual do Slide**, escolha entre **Twitter (Perini)** ou **Imersivo (Sadhguru)**.
   - Em **Tipo de Conteúdo**, escolha **Apenas Texto** ou **Texto + 1 Imagem**.

### Passo 3: Escrever o Texto e Aplicar Efeitos
1. No campo **Texto Principal**, digite sua mensagem.
2. *Para criar um efeito de diálogo:* Digite no formato `Pessoa: Fala` (ex: `Você: Como criar posts rápidos?\n\nBliip: Use nossos templates!`).
3. *Para destacar palavras em amarelo:* Selecione o trecho do texto com o cursor e clique no botão **`Marca-Texto`** na mini-toolbar acima do campo de texto.

### Passo 4: Adicionar Imagem e Ajustar Enquadramento Interativo
1. Clique no botão **`Upload`** no painel de imagens e selecione um arquivo de imagem do seu computador.
2. Após o envio, utilize a ferramenta interativa de enquadramento:
   - **Arraste com o Mouse (Pan X/Y)**: Clique e arraste a imagem diretamente no container visual para posicioná-la perfeitamente.
   - **Nível de Zoom**: Utilize o slider (1.0x a 3.0x) para ampliar a imagem mantendo a qualidade.

### Passo 5: Personalizar Cor e Proporção
1. Em **Tema de Cores do Slide**, selecione a combinação que melhor combina com a sua marca.
2. Na barra flutuante do topo do canvas, escolha a proporção **4:5** ou **1:1**.

### Passo 6: Exportar ou Publicar
1. Clique no botão **`Exportar / Publicar`** no topo da tela.
2. Escolha o formato social desejado (ex: *Post Único (Instagram)* ou *Story (Instagram)*).
3. Clique em **`Publicar no Buffer`** para enviar direto para a sua fila do Buffer, ou clique em **`Baixar Apenas Slide Atual (PNG)`** para salvar no seu computador.

---

## 📖 Passo a Passo: Criando um Carrossel Completo (Múltiplos Slides)

Para criar um carrossel educativo, narrativa de história ou sequência de dicas:

```
[Dashboard] ➔ [+ Novo Conteúdo] ➔ [Definir N° de Slides] ➔ [Editar Slide a Slide] ➔ [Publicar Carrossel no Buffer / ZIP]
```

### Passo 1: Definir o Carrossel
1. No Dashboard, clique em **`+ Novo Conteúdo`**.
2. Arraste o slider para a quantidade de slides desejada (ex: **5 a 10 slides**).
3. Clique em **`Criar Conteúdo`**.

### Passo 2: Configurar o Perfil do Autor (Sua Marca)
1. Clique na sua foto/nome no topo para abrir o **Perfil do Usuário**.
2. Defina seu **Nome**, **Handle (@usuario)**, **Selo Verificado (Azul)** e o link do seu **Avatar**.
3. Estas informações serão replicadas harmoniosamente nos slides no estilo Twitter ou Imersivo.

### Passo 3: Construir a Sequência Slide a Slide
1. Utilize a **Barra de Reordenação de Slides** no rodapé para navegar entre os slides.
2. **Personalize cada slide de acordo com a narrativa:**
   - **Slide 1 (Capa / Gancho)**: Use *Estilo Twitter* com *Texto + 1 Imagem* marcante.
   - **Slides Intermediários (Conteúdo)**: Varie entre *Texto + 2 Imagens* (orientação Vertical ou Horizontal) e *Apenas Texto* com marca-texto amarelo nos pontos principais.
   - **Último Slide (Chamada para Ação / CTA)**: Alterne para o *Estilo Imersivo*, insira a frase de fechamento e preencha a *Assinatura / Autor*.

### Passo 4: Gerenciar e Reordenar os Slides
- **Adicionar Slide**: Clique em **`+ Adicionar Slide`** no rodapé ou no botão `+` entre os slides.
- **Duplicar Slide**: Clique no ícone de cópia no slide desejado para replicar seu layout.
- **Mover / Reordenar**: Utilize as setas `←` `→` na barra inferior para trocar a ordem dos slides.
- **Remover**: Clique no ícone da lixeira para apagar slides excedentes.

### Passo 5: Exportar ou Publicar no Buffer
1. Clique em **`Exportar / Publicar`**.
2. Verifique se o formato selecionado é **`Carrossel (Instagram)`**.
3. **Opção A - Publicar via Buffer GraphQL API:**
   - Clique em **`Publicar no Buffer (Carrossel (Instagram))`**.
   - O Bliip renderizará todos os slides, converterá as imagens em URLs seguras HTTPS e enviará a postagem inteira no formato carrossel nativo para o seu perfil no Buffer.
4. **Opção B - Baixar pacote comprimido:**
   - Clique em **`Baixar Todos os Slides (.ZIP)`** para salvar um arquivo `.zip` contendo todas as imagens PNG nomeadas e organizadas.

---

## ⚙️ Configuração da Integração com o Buffer e Webhooks

Para habilitar a publicação com um clique via API oficial do Buffer:

1. Acesse o seu painel do [Buffer](https://publish.buffer.com/).
2. Vá em **Settings > Personal Access Tokens** e gere a sua chave API.
3. No **Bliip**, clique no ícone de **Integrações (Webhook)** no topo da tela.
4. Cole a sua **Buffer API Key** e clique em **Testar Conexão**.
5. O Bliip detectará automaticamente os canais vinculados (ex: seu perfil do Instagram ou LinkedIn). Selecione o canal desejado.
6. *(Opcional)*: Se desejar integrar com cenários do **Make.com**, **N8N** ou **Zapier**, insira a URL do seu Webhook no campo correspondente.

---

## 🛠️ Tecnologias Utilizadas

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router & Serverless API Routes)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS & Lucide Icons
- **Integração de API**: Buffer GraphQL API (`https://api.buffer.com/graphql`) com Security Headers
- **Processamento de Imagens & Canvas**: `html-to-image`, `JSZip`
- **Gerenciamento de Estado**: Custom Hook (`useCarouselState`)
- **Armazenamento**: LocalStorage & IndexedDB com sanitização defensiva de dados (`storage.ts`)

---

## 📦 Como Executar o Projeto Localmente

### 1. Clonar o repositório
```bash
git clone https://github.com/joaoalbertofn/bliip.git
cd bliip
```

### 2. Instalar as dependências
```bash
npm install
```

### 3. Executar o servidor de desenvolvimento
```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

---

## 📁 Estrutura do Projeto

```
bliip/
├── docs/                        # Documentação técnica e planos de refatoração/funcionalidades
│   ├── feature_canvas_zoom_and_mouse_drag_plan.md
│   ├── feature_image_zoom_pan_plan.md
│   ├── feature_theme_and_twitter_centering_plan.md
│   ├── refactor_task_1_carousel_state_hook.md
│   ├── refactor_task_2_buffer_security_headers.md
│   └── refactor_task_3_storage_defensive_sanitizer.md
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── buffer/route.ts  # Proxy Serverless para GraphQL da API do Buffer com Security Headers
│   │   ├── globals.css          # Estilos globais e Tailwind CSS
│   │   ├── layout.tsx           # Layout raiz da aplicação
│   │   └── page.tsx             # Dashboard & Estúdio Principal
│   ├── components/
│   │   ├── Dashboard.tsx        # Visão geral de carrosséis, rascunhos e métricas
│   │   ├── ExportModal.tsx      # Modal de exportação PNG, ZIP e disparo Buffer
│   │   ├── HighlightTextEditor.tsx # Editor de texto com marca-texto amarelo (<mark>)
│   │   ├── IntegrationsModal.tsx # Gerenciador de API Keys e auto-detecção de canais Buffer
│   │   ├── InteractiveImageContainer.tsx # Componente de crop/pan interativo com mouse drag & zoom
│   │   ├── Navbar.tsx           # Barra superior com ações rápidas e navegação
│   │   ├── SlideCanvas.tsx      # Canvas visual responsivo com renderização de layouts
│   │   ├── SlideReorderBar.tsx  # Barra interativa de ordenação e adição de slides
│   │   ├── TemplateSelector.tsx # Seletor de estilos visuais e arranjo de fotos
│   │   ├── UserProfileModal.tsx # Modal de perfil da marca e autor
│   │   └── templates/           # Componentes de renderização visual
│   │       ├── ImmersiveStyleSlide.tsx
│   │       ├── TemplateA.tsx
│   │       ├── TemplateB.tsx
│   │       ├── TemplateC.tsx
│   │       ├── TemplateD.tsx
│   │       ├── TemplateHeader.tsx
│   │       └── TwitterStyleSlide.tsx
│   ├── hooks/
│   │   └── useCarouselState.ts  # Custom hook de gerenciamento de estado do carrossel
│   ├── lib/
│   │   ├── exporter.ts          # Conversão em canvas PNG Retina 2x, ZIP e Buffer GraphQL
│   │   ├── storage.ts           # Persistência de dados com sanitização defensiva e fallback
│   │   ├── templates.ts         # Definições de layouts e construtores de slides
│   │   └── themes.ts            # Presets de temas de cores de alto contraste
│   └── types/
│       ├── carousel.ts          # Definições dos tipos de dados do slide e carrossel
│       └── socialFormats.ts     # Catálogo de formatos de redes sociais
```

---

## 📝 Licença

Este projeto é de propriedade privada e desenvolvido para gestão e criação eficiente de conteúdos para redes sociais.
