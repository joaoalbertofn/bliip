# Bliip ⚡ - Criador Inteligente de Carrosséis & Integração Buffer

> Aplicação web moderna e de alta performance para criação, edição visual e exportação automatizada de carrosséis e posts dinâmicos para redes sociais (Instagram, LinkedIn, Facebook), com publicação direta via **Buffer GraphQL API**.

---

## 🚀 Principais Funcionalidades

- 🎨 **Editor Visual Interativo**:
  - Criação e personalização dinâmica de slides com suporte a estilos como **Tweet / Bruno Perini** e **Design Imersivo**.
  - Controle de proporções de aspecto: **4:5 (1080x1350px)** e **1:1 (1080x1080px)**.
  - Suporte a múltiplos layouts de imagens (única, dupla, horizontal, vertical).

- 🔗 **Integração Nativa com Buffer (GraphQL API)**:
  - Publicação automatizada de **Carrosséis Nativos do Instagram** (enviando múltiplos slides como assets individuais).
  - Suporte a **Rascunhos (Drafts)**, **Agendamento** e **Envio Imediato**.
  - Auto-detecção de organizações e canais vinculados à conta do Buffer.

- 🖼️ **Exportação de Mídia de Alta Resolução**:
  - Renderização precisa de canvas via `html-to-image` em proporção retina (2x pixel ratio).
  - Download de slides individuais em PNG ou lote compactado em arquivo **ZIP**.
  - Conversão automatizada de Data URLs (Base64) em URLs públicas HTTPS para integração com APIs de redes sociais.

- 🌐 **Arquitetura Expansível de Formatos Sociais**:
  - Sistema extensível para novos formatos: *Instagram Carousel, Instagram Post, Instagram Story, Instagram Reels, LinkedIn Post, Facebook Post*.

---

## 🛠️ Tecnologias Utilizadas

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS & Lucide Icons
- **Integração de API**: Buffer GraphQL API (`https://api.buffer.com`)
- **Manipulação de Mídia**: `html-to-image`, `JSZip`
- **Execução & Dev Server**: Node.js & Next.js Dev Server

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

## ⚙️ Configuração da Integração com o Buffer

1. Acesse o seu painel do [Buffer](https://publish.buffer.com/).
2. Obtenha a sua **Chave de API do Buffer (Access Token)**.
3. No **Bliip**, clique no ícone de **Integrações** no menu superior.
4. Cole a sua **Chave de API** e o **ID do Canal (Channel ID)** do seu perfil (ex: Instagram ou LinkedIn).
5. Ao exportar seu conteúdo, escolha a opção **Publicar no Buffer (Carrossel (Instagram))**.

---

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── api/
│   │   └── buffer/route.ts      # Endpoint Serverless para integração GraphQL do Buffer
│   └── page.tsx                 # Dashboard & Editor Principal do Bliip
├── components/
│   ├── Dashboard.tsx            # Visão geral de carrosséis e estatísticas
│   ├── ExportModal.tsx          # Modal de exportação e disparo de publicação
│   ├── IntegrationsModal.tsx    # Modal de configuração de chaves de API e Canais
│   ├── Navbar.tsx               # Barra de navegação e controles globais
│   ├── SlideCanvas.tsx          # Componente de renderização do slide
│   └── templates/               # Estilos e templates gráficos (TwitterStyle, ImmersiveStyle)
├── lib/
│   ├── exporter.ts              # Utilitários de conversão em PNG e publicação
│   └── storage.ts               # Persistência de dados e perfil no LocalStorage
└── types/
    ├── carousel.ts              # Definições de tipos de dados do carrossel
    └── socialFormats.ts         # Catálogo de formatos e redes sociais
```

---

## 📝 Licença

Este projeto é de propriedade privada e desenvolvido para gestão eficiente de conteúdos sociais.
