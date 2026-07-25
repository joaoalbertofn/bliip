# Relatório de Diagnóstico & Plano de Refatoração Arquitetural (Bliip)

Este relatório apresenta o **diagnóstico minucioso das causas raízes** dos problemas de inconsistência visual (redimensionamento do canvas, variação do tamanho da pré-visualização ao mudar estilos ou fontes, e distorção no layout das imagens nos templates JSON) e o **plano de refatoração baseado em Design Patterns** para garantir consistência visual de 100%.

---

## 🔍 1. Diagnóstico das Causas Raízes

### Bug 1: Inconsistência na Dimensão do Canvas (Tamanho mudando ao trocar texto/fonte/estilo)
- **Causa Raiz A (`SlideCanvas.tsx`)**:
  - O container em `SlideCanvas.tsx` utiliza a classe Tailwind `aspect-[4/5]`. No CSS Flexbox, a propriedade `aspect-ratio` é uma sugestão de dimensão. Quando elementos filhos dentro do container não possuem limites rígidos (`min-h-0`, `flex-shrink`), elementos de texto longos ou com fonte maior **forçam o container pai a esticar verticalmente**, alterando a proporção real do slide no canvas.
- **Causa Raiz B (`DynamicSlideRenderer.tsx`)**:
  - No `DynamicSlideRenderer.tsx`, o bloco de texto (`body_text`) foi configurado como `className="shrink-0 w-full"`, enquanto o bloco de imagem (`single_image`) possui `className="flex-1 min-h-[220px]"`.
  - Quando o texto cresce ou a fonte aumenta, a soma da altura do texto + altura mínima da imagem (220px) excede a altura máxima do card de 575px. Isso faz o card esticar ou cortar silenciosamente o conteúdo inferior.

---

### Bug 2: Tamanho da Fonte do Usuário (`slide.fontSize`) sendo Ignorado no Renderizador JSON
- **Causa Raiz**:
  - Na migração para a arquitetura baseada em esquemas JSON (`DynamicSlideRenderer.tsx`), a propriedade `slide.fontSize` (ex: 16px, 20px, 24px, 30px, 38px) **foi substituída por classes utilitárias fixas** como `text-lg` (linha 71, 82) e `text-2xl` (linha 105).
  - Como consequência, alterar o seletor de tamanho de fonte na barra lateral não surtia efeito real no texto do `DynamicSlideRenderer.tsx`, ou causava quebras desalinhadas em modelos específicos.

---

### Bug 3: Inconsistência no Dimensionamento de Imagens entre os Templates
- **Causa Raiz**:
  - Cada template tratava a altura das imagens de forma ad-hoc:
    - *Imersivo*: Usava `h-[55%]` fixo na seção superior.
    - *Twitter (1 Imagem)*: Usava `flex-1 min-h-[220px]`.
    - *Notícias*: Colocava a imagem no topo sem trava de proporção flexível.
    - *Comparativo (2 Imagens)*: Usava `flex-1 h-full` sem `min-h-0` no container filho.
  - A ausência de um **Contrato Unificado de Proporção Flexível (`Flex-1 Min-H-0 Contract`)** fazia a imagem encolher ou esticar aleatoriamente dependendo da quantidade de texto no slide.

---

## 🏛️ 2. Solução Arquitetural baseada em Design Patterns

Para resolver esses problemas definitivamente sem soluções superficiais, aplicaremos **três padrões de projeto**:

```
+-----------------------------------------------------------------------+
|                         SlideCanvas.tsx                               |
|        (Pattern 1: Strict Box Aspect-Ratio Contract)                  |
|        Exato 460px x 575px (4:5) ou 460px x 460px (1:1)               |
+-----------------------------------------------------------------------+
                                  |
                                  v
+-----------------------------------------------------------------------+
|                    DynamicSlideRenderer.tsx                           |
|        (Pattern 3: Flex Layout Strategy - Layout Contract)            |
|                                                                       |
|   +---------------------------------------------------------------+   |
|   | Header / Title (shrink-0)                                     |   |
|   +---------------------------------------------------------------+   |
|   | Text Container (Pattern 2: Dynamic Font Strategy)             |   |
|   | Uses slide.fontSize (px) + Controlled Flex Shrink             |   |
|   +---------------------------------------------------------------+   |
|   | Image Container (flex-1 min-h-0 w-full overflow-hidden)       |   |
|   | Adapts smoothly without pushing or stretching canvas bounds   |   |
|   +---------------------------------------------------------------+   |
+-----------------------------------------------------------------------+
```

### Pattern 1: Strict Box Aspect-Ratio Contract (Contrato de Dimensão Rígida)
- Definir dimensões absolutas de container em `SlideCanvas.tsx`:
  - `4:5`: `w-[460px] h-[575px]` (`aspect-[4/5]`) com `overflow-hidden` e `flex flex-col`.
  - `1:1`: `w-[460px] h-[460px]` (`aspect-square`) com `overflow-hidden` e `flex flex-col`.
- O container interno do `DynamicSlideRenderer` sempre usará `w-full h-full min-h-0 flex flex-col overflow-hidden`, impedindo 100% qualquer alteração no tamanho do card.

### Pattern 2: Dynamic Font Size Strategy (Estratégia de Tipografia Dinâmica)
- Aplicar a propriedade `slide.fontSize` (padrão 20px) dinamicamente em todos os blocos de texto:
  - **Texto Principal**: `style={{ fontSize: '${slide.fontSize || 20}px', lineHeight: 1.4 }}`
  - **Título/Manchete**: Proporcional em 1.25x (`${Math.round((slide.fontSize || 20) * 1.25)}px`).
  - **Identificador de Fala (Diálogos)**: Proporcional em 0.9x (`${Math.round((slide.fontSize || 20) * 0.9)}px`).

### Pattern 3: Proportional Flex-1 Min-H-0 Image Contract (Contrato de Imagem Flexível)
- Garantir que todas as imagens (`single_image` e `dual_image`) usem a classe `flex-1 min-h-0 w-full h-full overflow-hidden`.
- O container de texto terá `shrink-0 max-h-[60%] overflow-hidden` quando acompanhado de imagem, garantindo que o texto nunca esmague a imagem nem force a quebra da estrutura visual.

---

## 📋 3. Arquivos Envolvidos na Alteração

1. **[SlideCanvas.tsx](file:///Volumes/Midia/Antigravity%20Projeto/Bliip/src/components/SlideCanvas.tsx)**: Fixação do contrato de dimensões rígidas para 4:5 e 1:1.
2. **[DynamicSlideRenderer.tsx](file:///Volumes/Midia/Antigravity%20Projeto/Bliip/src/components/DynamicSlideRenderer.tsx)**: Aplicação dinâmica de `slide.fontSize` e regras de flex layout `flex-1 min-h-0`.
3. **[InteractiveImageContainer.tsx](file:///Volumes/Midia/Antigravity%20Projeto/Bliip/src/components/InteractiveImageContainer.tsx)**: Garantia de preenchimento `h-full w-full object-cover` sem estourar margens.

---

## 🧪 4. Plano de Verificação

1. **Teste de Dimensão Estável do Canvas**:
   - Trocar entre os 4 Estilos (Twitter, Imersivo, Comparativo, Notícias).
   - Alternar entre 16px, 20px, 24px, 30px e 38px no seletor de fonte.
   - Verificar que a caixa do canvas permanece **100% idêntica e fixa em 460px x 575px** (ou 460px x 460px).
2. **Teste de Renderização de Imagens**:
   - Testar 1 foto e 2 fotos em layouts vertical e horizontal.
   - Confirmar que as fotos preenchem o espaço proporcional disponível perfeitamente.
3. **Compilação e Build**:
   - Rodar `npx tsc --noEmit` (0 erros).
   - Rodar `npm run build` (build bem-sucedido).
