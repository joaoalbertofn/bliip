# Plano de Implementação: Arraste Direto da Foto (Mouse Drag) & Zoom da Pré-Visualização do Canvas

Este plano especifica a implementação de duas melhorias de usabilidade (UX):
1. **Arraste Direto na Foto pelo Mouse (Mouse Drag & Pan)**: Permitir arrastar e reenquadrar a imagem diretamente no slide preview usando o ponteiro do mouse (`cursor: grab/grabbing`) sempre que a foto estiver com zoom > 100%.
2. **Zoom de Tela da Pré-Visualização (Canvas Screen Zoom)**: Adicionar controles de visualização (`80%`, `100%`, `120%`, `150%`) no topo do canvas para ampliar a área de edição sem afetar a exportação final.

---

## 1. Alterações Propostas

### A. Interação de Arraste do Mouse (Mouse Drag & Pan)
#### Componentes: [TwitterStyleSlide.tsx](file:///Volumes/Midia/Antigravity%20Projeto/Bliip/src/components/templates/TwitterStyleSlide.tsx) & [ImmersiveStyleSlide.tsx](file:///Volumes/Midia/Antigravity%20Projeto/Bliip/src/components/templates/ImmersiveStyleSlide.tsx)
- Adicionar evento de captura de mouse (`onMouseDown`, `onMouseMove`, `onMouseUp`, `onMouseLeave`) no container da imagem.
- Quando `scale > 1`:
  - O cursor muda para `cursor-grab` (mão aberta) e `cursor-grabbing` (mão fechada ao arrastar).
  - O movimento do mouse atualiza `offsetX` e `offsetY` em tempo real através do callback `onImageTransform`.

---

### B. Zoom de Tela do Canvas de Pré-Visualização
#### Componente: [page.tsx](file:///Volumes/Midia/Antigravity%20Projeto/Bliip/src/app/page.tsx)
- **Estado**: Adicionar estado `canvasZoom` (padrão: `100%`, com opções `80%`, `100%`, `120%`, `150%`).
- **Barra Superior Flutuante**: No topo da área central de preview (ao lado do seletor `4:5` / `1:1`), adicionar botões compactos de Zoom de Tela.
- **Container do Canvas**: Aplicar `transform: scale(canvasZoom / 100)` na área de preview com `transform-origin: top center` e rolagem suave se o zoom ultrapassar a tela.
- **Exportação Garantida**: O processo de captura de imagem (`html-to-image`) em [exporter.ts](file:///Volumes/Midia/Antigravity%20Projeto/Bliip/src/lib/exporter.ts) continua capturando o slide em sua resolução nativa desvinculada do zoom da tela.

---

## 2. Plano de Verificação

### Testes Manuais de Uso
1. **Teste de Arraste Direto do Mouse**:
   - Carregar uma imagem e definir o zoom em 150%.
   - Clicar na imagem no preview e arrastar para os lados/cima/baixo.
   - Confirmar que a imagem se desloca suavemente sob o ponteiro e que o cursor indica o estado de agarrar (`grabbing`).
2. **Teste do Zoom de Tela**:
   - Alternar os botões de Zoom do Canvas (`80%`, `100%`, `120%`, `150%`).
   - Confirmar que o slide cresce na tela facilitando a leitura de textos e detalhes do print.
3. **Teste de Exportação**:
   - Definir o Zoom de Tela em `150%` e exportar o slide em PNG.
   - Confirmar que o arquivo gerado possui dimensões e qualidade de imagem impecáveis (sem qualquer distorção).
