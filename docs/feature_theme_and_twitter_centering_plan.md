# Plano de Implementação: Centralização de Layout & Sistema de 5 Temas de Cores

Este plano detalha as alterações para centralizar o cabeçalho + texto no estilo Twitter (modelo Bruno Perini / Pedro Moreira) e implementar 5 Temas de Cores Integrados (*Presets*), garantindo alto contraste e legibilidade impecável ao trocar cores de fundo.

---

## 1. Mudanças Propostas

### A. Dicionário de Temas de Cores (`src/lib/themes.ts`)
Criar uma estrutura centralizada que define o visual completo de cada um dos 5 temas:

```typescript
export type SlideTheme = 'light' | 'dark' | 'navy' | 'sepia' | 'emerald';

export interface ThemeConfig {
  id: SlideTheme;
  name: string;
  bg: string;             // Cor de fundo do slide
  text: string;           // Cor do texto principal (parágrafo/corpo)
  textSecondary: string;  // Cor do handle (@perfil) e marca d'água
  speakerBg: string;      // Fundo do nome do locutor em diálogos
  speakerText: string;    // Cor do texto do locutor
  markBg: string;         // Cor do fundo do marcador <mark>
  markText: string;       // Cor do texto dentro do marcador <mark>
  borderColor: string;    // Cor de bordas sutis (se houver)
}

export const SLIDE_THEMES: Record<SlideTheme, ThemeConfig> = {
  light: {
    id: 'light',
    name: 'Claro Clássico',
    bg: '#ffffff',
    text: '#0f172a',
    textSecondary: '#64748b',
    speakerBg: '#e0e7ff',
    speakerText: '#3730a3',
    markBg: '#fef08a',
    markText: '#0f172a',
    borderColor: '#e2e8f0',
  },
  dark: {
    id: 'dark',
    name: 'Escuro Profundo',
    bg: '#0f172a',
    text: '#f8fafc',
    textSecondary: '#94a3b8',
    speakerBg: '#1e293b',
    speakerText: '#818cf8',
    markBg: '#fef08a',
    markText: '#0f172a',
    borderColor: '#334155',
  },
  navy: {
    id: 'navy',
    name: 'Azul Noturno',
    bg: '#1e293b',
    text: '#f1f5f9',
    textSecondary: '#94a3b8',
    speakerBg: '#0f172a',
    speakerText: '#93c5fd',
    markBg: '#38bdf8',
    markText: '#0f172a',
    borderColor: '#334155',
  },
  sepia: {
    id: 'sepia',
    name: 'Sépia Editorial',
    bg: '#fef3c7',
    text: '#78350f',
    textSecondary: '#b45309',
    speakerBg: '#fde68a',
    speakerText: '#92400e',
    markBg: '#fde047',
    markText: '#78350f',
    borderColor: '#fcd34d',
  },
  emerald: {
    id: 'emerald',
    name: 'Verde Minimalista',
    bg: '#022c22',
    text: '#ecfdf5',
    textSecondary: '#6ee7b7',
    speakerBg: '#064e3b',
    speakerText: '#a7f3d0',
    markBg: '#34d399',
    markText: '#022c22',
    borderColor: '#065f46',
  },
};
```

---

### B. Ajustes nos Componentes

#### [NEW] [themes.ts](file:///Volumes/Midia/Antigravity%20Projeto/Bliip/src/lib/themes.ts)
- Definir os 5 temas de cores e funções utilitárias `getTheme(themeId)`.

#### [MODIFY] [carousel.ts](file:///Volumes/Midia/Antigravity%20Projeto/Bliip/src/types/carousel.ts)
- Adicionar a propriedade opcional `theme?: SlideTheme` à interface `Slide`.

#### [MODIFY] [TwitterStyleSlide.tsx](file:///Volumes/Midia/Antigravity%20Projeto/Bliip/src/components/templates/TwitterStyleSlide.tsx)
1. **Centralização Vertical (Modo "Apenas Texto")**:
   - Quando `contentType === 'text_only'`, encapsular o **Perfil (Foto + Nome + Handle)** e o **Texto do Slide** em um único container centralizado verticalmente (`flex flex-col justify-center flex-1 my-auto`).
   - Isso alinha o design exatamente como nas referências fornecidas (Bruno Perini e Pedro Moreira).
2. **Aplicação Dinâmica de Cores**:
   - Aplicar as cores do tema selecionado (`bg`, `text`, `textSecondary`, `markBg`, `speakerBg`, etc.) para que todos os textos, tags, links e marcas texto fiquem 100% legíveis em qualquer fundo.

#### [MODIFY] [TemplateHeader.tsx](file:///Volumes/Midia/Antigravity%20Projeto/Bliip/src/components/templates/TemplateHeader.tsx)
- Aceitar propriedade de cor de texto para adaptar o Nome e o Handle (`@usuario`) dinamicamente de acordo com o tema.

#### [MODIFY] [page.tsx](file:///Volumes/Midia/Antigravity%20Projeto/Bliip/src/app/page.tsx)
- Substituir a seção "Personalização de Cor de Fundo" da barra lateral pelo novo seletor de **5 Presets de Temas de Cores**.
- Ao clicar em uma cor, atualizar o atributo `theme` do slide ativo para um dos 5 valores (`light`, `dark`, `navy`, `sepia`, `emerald`).

---

## 2. Plano de Verificação

### Testes Manuais de Interface
1. **Verificação de Centralização**:
   - Selecionar o estilo *Twitter* e o formato *Apenas Texto*.
   - Confirmar que o bloco contendo a foto de perfil, nome, handle e o texto está perfeitamente centralizado no meio do slide canvas.
2. **Verificação de Legibilidade e Contraste**:
   - Alternar o slide ativo entre os 5 temas (*Claro*, *Escuro*, *Azul Noturno*, *Sépia*, *Verde Minimalista*).
   - Verificar se em todos os 5 temas o texto principal, os destaques (`<mark>`), nomes e cabecalho permanecem perfeitamente visíveis e elegantes.
3. **Verificação nos Modos de Imagem**:
   - Alternar para *Texto + 1 Imagem* e *Texto + 2 Imagens* para garantir que o layout com imagem continue funcionando perfeitamente e respeitando os temas de cores.
