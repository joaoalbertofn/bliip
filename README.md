# Bliip — Criador de Carrosséis e Posts para Instagram & Redes Sociais

O **Bliip** é uma plataforma SaaS moderna para criação rápida de posts e carrosséis visuais para redes sociais (Instagram, LinkedIn, YouTube, TikTok) inspirada nos estilos visuais de Bruno Perini e Sadhguru.

---

## 📐 Arquitetura da Interface do Editor (3 Colunas)

```text
┌───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                      NAVBAR                                                           │
├───────────────────────────────┬────────────────────────────────────────────────────────┬──────────────────────────────┤
│ ⬅️ Slide Design (Esquerda)    │ 🎯 Content Workspace (Centro)                          │ ➡️ Social Post Preview (Direita)│
│ [Recolhível]                  │                                                        │ [Recolhível]                 │
│                               │ 🖼️ Canvas do Slide Selecionado                         │ 🌐 Checkboxes de Redes       │
│ • Bandeja de Mídias (Fotos)   │ 📝 Editor de Legenda Global (Lado a lado do Canvas)    │   (Instagram, LinkedIn, etc) │
│ • Estilo Visual & Tipo        │ 🎞️ Barra Inferior de Reordenação de Slides             │                              │
│ • Texto do Slide              │                                                        │ 📱 Lista de Previews         │
│ • Temas de Cores              │                                                        │   Empilhados em Scroll       │
└───────────────────────────────┴────────────────────────────────────────────────────────┴──────────────────────────────┘
```

### 🏷️ Nomenclatura Oficial dos Painéis:

1. ⬅️ **Slide Design** *(Painel Esquerdo — Recolhível)*: Configuração de estilo, mídias e temas do slide ativo.
2. 🎯 **Content Workspace** *(Painel Central)*: Canvas do slide ativo + Editor de Legenda Global lado a lado + Barra de Slides.
3. ➡️ **Social Post Preview** *(Painel Direito — Recolhível)*: Checkboxes de redes ativas + Lista empilhada de mockups interativos das redes selecionadas.

---

## 🛠️ Tecnologias Utilizadas
- **Next.js 14 (App Router)**
- **React 18 & TypeScript**
- **Tailwind CSS & Lucide Icons**
- **Auth.js v5 (NextAuth.js)** — Autenticação com conta Google
- **Buffer API (GraphQL & REST v1)** — Agendamento e publicação direta
