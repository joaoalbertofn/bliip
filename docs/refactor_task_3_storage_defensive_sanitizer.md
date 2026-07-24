# Especificação Técnica - Tarefa 3: Sanitização Defensiva da Camada de Persistência

> [!IMPORTANT]
> **Instruções para o Agente**: Esta tarefa visa tornar as funções em `src/lib/storage.ts` imunes a dados corrompidos ou com formato antigo salvos no `IndexedDB` ou `localStorage` do navegador do usuário.

---

## 1. Objetivo
Garantir que as funções `loadUserProfile()`, `loadCarousels()` e `loadIntegrations()` no arquivo [storage.ts](file:///Volumes/Midia/Antigravity%20Projeto/Bliip/src/lib/storage.ts) sempre retornem objetos válidos preenchidos com os valores padrão padrão (defaults) caso faltem propriedades obrigatórias nos dados recuperados do navegador.

---

## 2. Arquivos Envolvidos
- **[MODIFICAR]** `src/lib/storage.ts`

---

## 3. Passos de Implementação

### Passo 3.1: Criar Helper de Sanitização/Merge de Perfil em `storage.ts`
Garantir que qualquer perfil carregado mescle com `DEFAULT_USER_PROFILE`:

```typescript
function sanitizeUserProfile(data: any): UserProfile {
  if (!data || typeof data !== 'object') return DEFAULT_USER_PROFILE;
  return {
    name: typeof data.name === 'string' && data.name.trim() !== '' ? data.name : DEFAULT_USER_PROFILE.name,
    handle: typeof data.handle === 'string' ? data.handle : DEFAULT_USER_PROFILE.handle,
    avatarUrl: typeof data.avatarUrl === 'string' ? data.avatarUrl : DEFAULT_USER_PROFILE.avatarUrl,
  };
}
```

### Passo 3.2: Criar Sanitizador de Carrosséis e Slides em `storage.ts`
Garantir que cada `Carousel` e cada `Slide` dentro do array possuam arrays e objetos válidos (prevenindo erro `cannot read property of undefined` em componentes):

```typescript
function sanitizeCarousel(c: any): Carousel {
  return {
    id: c?.id || `carousel_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: c?.name || 'Carrossel Sem Nome',
    createdAt: c?.createdAt || new Date().toISOString(),
    updatedAt: c?.updatedAt || new Date().toISOString(),
    status: c?.status || 'draft',
    aspectRatio: c?.aspectRatio || '4:5',
    slides: Array.isArray(c?.slides) ? c.slides.map(sanitizeSlide) : [],
  };
}

function sanitizeSlide(s: any): Slide {
  return {
    id: s?.id || `slide_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    style: s?.style || 'twitter',
    layout: s?.layout || 'text_only',
    imageLayout: s?.imageLayout || 'horizontal',
    background: s?.background || '#ffffff',
    layers: {
      text: Array.isArray(s?.layers?.text) ? s.layers.text : [],
      images: Array.isArray(s?.layers?.images) ? s.layers.images : [],
    },
  };
}
```

### Passo 3.3: Atualizar as Funções de Carga em `storage.ts`
Utilizar os sanitizadores nas funções `loadUserProfile`, `loadCarousels` e `loadIntegrations`.

---

## 4. Plano de Verificação
1. Inserir manualmente uma string inválida ou objeto incompleto no `localStorage` sob a chave `bliip_user_profile` ou `bliip_carousels`.
2. Atualizar a aplicação e verificar que ela não trava, exibindo os dados corrigidos automaticamente.
3. Testar salvamento e recarregamento normal.
