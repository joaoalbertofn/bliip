# Especificação Técnica - Tarefa 2: Migração de Segurança da API do Buffer

> [!IMPORTANT]
> **Instruções para o Agente**: Esta tarefa foca na segurança do transporte do *Personal Access Token* do Buffer entre o cliente web e o proxy da API em Next.js. Não altere a lógica de parsing da resposta do Buffer (REST v1 e GraphQL v2).

---

## 1. Objetivo
Remover a passagem de token via Query String (`?token=...`) na rota do proxy do Buffer [route.ts](file:///Volumes/Midia/Antigravity%20Projeto/Bliip/src/app/api/buffer/route.ts) e nos componentes cliente. Passar a utilizar o cabeçalho padronizado `Authorization: Bearer <token>`.

---

## 2. Arquivos Envolvidos
- **[MODIFICAR]** `src/app/api/buffer/route.ts`
- **[MODIFICAR]** `src/components/IntegrationsModal.tsx`
- **[MODIFICAR]** `src/components/ExportModal.tsx` (se realizar chamadas diretas para `/api/buffer`)

---

## 3. Passos de Implementação

### Passo 3.1: Atualizar `src/app/api/buffer/route.ts`
Substituir a extração do token da URL por extração do cabeçalho `Authorization`:

```typescript
// ANTES:
// const { searchParams } = new URL(req.url);
// const token = searchParams.get('token');

// DEPOIS:
const authHeader = req.headers.get('authorization');
const token = authHeader?.startsWith('Bearer ') 
  ? authHeader.substring(7).trim() 
  : null;

if (!token) {
  return NextResponse.json(
    { error: 'Por favor, insira o seu Personal Access Token do Buffer no cabeçalho Authorization.' },
    { status: 400 }
  );
}
```

### Passo 3.2: Atualizar `src/components/IntegrationsModal.tsx`
Atualizar as requisições `fetch('/api/buffer')` no frontend para incluir os headers:

```typescript
// ANTES:
// const res = await fetch(`/api/buffer?token=${encodeURIComponent(token)}`);

// DEPOIS:
const res = await fetch('/api/buffer', {
  headers: {
    'Authorization': `Bearer ${token.trim()}`,
  },
});
```

---

## 4. Plano de Verificação
1. Testar o modal de integrações inserindo uma chave/token de teste.
2. Abrir o DevTools (Network tab) no navegador e confirmar que a requisição `/api/buffer` não contém `?token=` na URL.
3. Confirmar que o cabeçalho `Authorization: Bearer <token>` está presente nos Request Headers.
4. Testar respostas de sucesso (200) e erro de autenticação (401).
