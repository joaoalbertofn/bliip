# Roteiro de Tarefas: Autenticação Google & Hospedagem Vercel

> **Objetivo**: Permitir login via conta Google (NextAuth.js JWT) para uso da equipe e convidados em ambiente de testes na Vercel, mantendo armazenamento local inicial no IndexedDB e preparando base limpa para futuro domínio próprio e Supabase.

---

## 📌 Lista de Tarefas (Para Amanhã)

### 1. Configuração do NextAuth.js (Auth.js v5)
- [ ] Instalar o pacote `next-auth@beta` no projeto.
- [ ] Criar o arquivo de configuração de autenticação `src/auth.ts` com o provedor do Google e estratégia de sessão JWT.
- [ ] Criar a rota Handler da API do NextAuth em `src/app/api/auth/[...nextauth]/route.ts`.

### 2. Interface de Autenticação & Proteção de Rotas
- [ ] Criar a tela/modal de Login simples com botão "Entrar com Google".
- [ ] Adicionar o `SessionProvider` no layout raiz (`src/app/layout.tsx`).
- [ ] Proteger o Dashboard principal para exigir autenticação com conta Google antes do acesso.

### 3. Sincronização de Perfil com Estado do Bliip
- [ ] Conectar os dados da sessão (`user.name`, `user.email`, `user.image`) com a sanitização e salvamento em `src/lib/storage.ts`.
- [ ] Atualizar o avatar e nome do usuário nos slides estilo Twitter/Imersivo com a foto e nome oficiais da conta Google.

### 4. Instruções de Deploy & Variáveis de Ambiente (Vercel)
- [ ] Configurar Projeto & Tela de Consentimento no **Google Cloud Console** (Client ID + Client Secret).
- [ ] Definir URLs autorizadas:
  - Origem JS: `http://localhost:3000` e `https://seu-app.vercel.app`
  - Callbacks: `http://localhost:3000/api/auth/callback/google` e `https://seu-app.vercel.app/api/auth/callback/google`
- [ ] Adicionar variáveis no painel da Vercel:
  - `AUTH_SECRET`
  - `AUTH_GOOGLE_ID`
  - `AUTH_GOOGLE_SECRET`
  - `NEXTAUTH_URL`

---

## 🚀 Próximas Etapas Futuras (Fase 2)
- [ ] Conectar domínio próprio na Vercel (`Settings -> Domains`).
- [ ] Adicionar suporte a banco de dados na nuvem via Supabase para sincronização de carrosséis entre múltiplos dispositivos.
