# Plano de Implementação: Biblioteca de Slides Salvos & Menu de Ações nas Miniaturas

Este documento detalha o plano para implementar o recurso de **Salvar Slides como Modelos**, o **Menu de 3 Pontinhos** nas miniaturas inferiores e o **Modal de Inserção de Novo Slide** com biblioteca e pré-visualização.

---

## 🎨 O Que Será Desenvolvido (Apenas Localmente)

### 1. Modelo de Dados & Armazenamento (`src/types/carousel.ts` & `src/lib/storage.ts`)
- Criar o tipo `SavedSlideTemplate`:
  ```typescript
  export type SavedSlideTemplate = {
    id: string;
    name: string;
    createdAt: string;
    slide: Slide; // Guarda o JSON completo (texto, marca-texto, negrito, imagens, tema, layout, etc)
  };
  ```
- Funções em `src/lib/storage.ts`:
  - `loadSavedSlideTemplates()`: Carrega a lista de modelos do usuário.
  - `saveSlideAsTemplate(name, slide)`: Salva um novo modelo.
  - `deleteSavedSlideTemplate(templateId)`: Remove um modelo da biblioteca.
  - `renameSavedSlideTemplate(templateId, newName)`: Renomeia um modelo existente.

---

### 2. Menu de 3 Pontinhos nas Miniaturas (`src/components/SlideReorderBar.tsx`)
- Substituir os botões individuais de cada miniatura na barra inferior por um botão limpo de **`...` (3 Pontinhos)**.
- Ao clicar nos 3 pontinhos de qualquer slide, abre um menu flutuante com:
  - 📋 **Duplicar Slide** (renomeado de "Copiar").
  - ⭐ **Salvar como Modelo...** (Abre o modal para nomear o modelo).
  - 🗑️ **Excluir Slide** (se houver mais de 1 slide).

---

### 3. Modal de Inserção de Novo Slide (`src/components/AddSlideModal.tsx` [NOVO])
- Disparado ao clicar no botão **`+ Novo Slide`** na barra inferior.
- Exibe duas seções/abas:
  1. **➕ Novo Slide Padrão**: Cria um slide herdando as propriedades do slide anterior (comportamento atual em 1 clique).
  2. **⭐ Meus Modelos Salvos**:
     - Grid com todos os seus modelos salvos na biblioteca.
     - **Pré-visualização (Preview)** em tempo real de cada modelo usando o `<SlideCanvas />`.
     - Botão **Inserir Slide**.
     - Ações de gerenciamento: ✏️ **Renomear** e 🗑️ **Excluir Modelo**.

---

### 4. Modal para Salvar e Nomear Modelo (`src/components/SaveTemplateModal.tsx` [NOVO])
- Modal simples disparado ao clicar em *"Salvar como Modelo"*:
  - Campo de texto: *"Nome do Modelo"* (ex: `CTA Instagram Final`).
  - Botão: *"Salvar Modelo"*.

---

### 5. Atualização do Hook de Estado (`src/hooks/useCarouselState.ts`)
- Adicionar `handleInsertSlideFromTemplate(template: SavedSlideTemplate)`.
- Gerenciar o estado reativo da biblioteca de modelos.

---

## 🛠️ Arquivos a Serem Criados / Modificados

| Arquivo | Ação | Descrição das Mudanças |
| :--- | :--- | :--- |
| `src/types/carousel.ts` | **[MODIFY]** | Adicionar tipo `SavedSlideTemplate`. |
| `src/lib/storage.ts` | **[MODIFY]** | Adicionar persistência para `loadSavedSlideTemplates`, `saveSlideAsTemplate`, etc. |
| `src/components/SlideReorderBar.tsx` | **[MODIFY]** | Adicionar menu de 3 pontinhos em cada miniatura. |
| `src/components/SaveTemplateModal.tsx` | **[NEW]** | Componente modal para nomear o modelo ao salvar. |
| `src/components/AddSlideModal.tsx` | **[NEW]** | Componente modal para escolher/visualizar slides salvos ou criar em branco. |
| `src/hooks/useCarouselState.ts` | **[MODIFY]** | Integrar criação de slides a partir dos modelos salvos. |
| `src/app/page.tsx` | **[MODIFY]** | Renderizar os novos modais e conectar as ações do usuário. |

---

## 🧪 Validação Local

- `npx tsc --noEmit`
- `npm run build`
- Teste visual completo no ambiente local (`http://localhost:3000`).
- **Nenhum commit ou push para o Git/Vercel será feito.**
