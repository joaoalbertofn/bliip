# Plano de Arquitetura: Organização da Sidebar em Acordeão & Controles Flutuantes de Imagem no Canvas

Este plano especifica a reorganização da interface do **Bliip**, trazendo **Grupos Sanfonados (Acordeão)** para a barra lateral, **Controles Flutuantes de Imagem sobre o Canvas** e **Interação Nativa em Slots Vazios**.

---

## 1. Componentes e Alterações na Arquitetura

### A. Componente Reutilizável de Grupo Sanfonado (`src/components/CollapsibleSection.tsx`)
- Novo componente de acordeão com:
  - Cabeçalho clicável com ícone, título e seta indicador (`ChevronDown` / `ChevronUp`).
  - Animação suave para expandir e recolher.
  - Todas as 4 seções abertas por padrão (`defaultOpen={true}`).

---

### B. Reorganização da Barra Lateral (`src/app/page.tsx`)
A barra lateral esquerda será limpa e estruturada nos seguintes grupos:
1. 📁 **Fotos da História** (`<MediaTray />` unificada).
2. 🎨 **Estilo Visual & Tipo de Conteúdo** (`<TemplateSelector />`).
3. ✍️ **Conteúdo do Slide** (Título, Texto Principal com destaques, Assinatura e Tamanho da Fonte).
4. 🌈 **Tema de Cores do Slide** (Os 5 Presets de Cores).

---

### C. Controles Flutuantes de Imagem no Canvas (`src/app/page.tsx`)
- **Remoção de Sliders Obsoletos**: Remover completamente da barra lateral os controles redundantes de Posição X/Y e os botões "Upload/Trocar".
- **Painel Flutuante sobre o Canvas**: Ao selecionar uma imagem no slide, exibir uma barra flutuante no topo da área do canvas com:
  - Slider de Zoom (`100%` a `300%`).
  - Botão `Resetar Zoom`.
  - Botão `Remover Imagem` do slide.

---

### D. Interatividade Completa nos Slots Vazios (`src/components/InteractiveImageContainer.tsx`)
Quando um slot de imagem do slide estiver vazio (`!url`):
- **Clique Direto**: Abre o seletor nativo de arquivos do computador.
- **Arraste do Computador**: Aceita o evento `onDrop` de arquivos locais da área de trabalho ou pastas.
- **Arraste da Bandeja**: Aceita o evento `onDrop` de fotos da Bandeja de Mídias.

---

## 2. Plano de Verificação

### Testes Manuais
1. **Acordeão da Sidebar**: Testar expandir e recolher cada uma das 4 seções na barra lateral.
2. **Controles Flutuantes**: Selecionar uma foto no canvas e verificar o surgimento do painel flutuante com Slider de Zoom e Reset.
3. **Mover com Mouse**: Confirmar que o movimento X/Y feito com o mouse direto na foto continua funcionando sem a necessidade dos sliders X/Y antigos.
4. **Slot Vazio**:
   - Clicar em um slot vazio e verificar a abertura do seletor de arquivos.
   - Soltar um arquivo do computador ou da bandeja e verificar a aplicação instantânea.

### Compilação e Build
- Executar `npx tsc --noEmit` (0 erros).
- Executar `npm run build` (build Next.js bem-sucedido).
