export interface DefaultSlideContent {
  id?: string;
  bodyText: string;
  quoteText?: string;
  signature?: string;
  imageUrl1?: string;
  imageUrl2?: string;
}

export const DEFAULT_STUDENT_FRAMEWORKS = {
  // 1. NOTÍCIA / GOOGLE STUDY (Texto + 1 Imagem de Relatório/Google)
  googleNewsStudy: {
    title: 'Notícia: Estudo do Google (7 Horas de Contato)',
    bodyText: `**MERCADO & ATENÇÃO**\n\n<mark class="bg-yellow-300 px-1 rounded">Estudo do Google revela:</mark> Um cliente precisa de pelo menos 7 horas de contato em 11 pontos de toque antes de tomar uma decisão de compra.\n\nSe você não produz conteúdo diário, como o seu potencial cliente vai passar 7 horas com a sua marca?`,
    // Foto de relatório / dashboard analítico / escritório tech
    imageUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1000&q=80',
  },

  // 2. TWITTER / POST DE REFLEXÃO (Texto + Imagem de Estúdio/Criador)
  twitterPerfectionism: {
    title: 'Post Twitter: Feito é Melhor que Perfeito',
    bodyText: `Você ainda acha que produzir conteúdo é opcional?\n\n<mark class="bg-yellow-300 px-1 rounded">O profissional que aparece com menos conhecimento vende 10x mais</mark> do que o especialista de 15 anos de mercado que não publica nada.\n\nVisibilidade vence o perfeccionismo toda vez.`,
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80',
  },

  // 3. COMPARATIVO (Texto + 2 Imagens Lado a Lado / Vertical)
  visibilityComparison: {
    title: 'Comparativo: Profissional Visível vs Invisível',
    bodyText: `**Profissional que Aparece:** Atrai clientes qualificados diariamente, cobra o valor justo e cria autoridade inquestionável.\n\n**Profissional Invisível:** Depende de indicações esporádicas, briga por preço no leilão e fica estagnado.`,
    // Imagem 1: Profissional ativo, sorrindo em reunião/apresentação de sucesso
    imageUrl1: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
    // Imagem 2: Profissional sozinho no escuro / mesa vazia com notebook sem clientes
    imageUrl2: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80',
  },

  // 4. IMERSIVO / CITAÇÃO (Texto de Impacto em Tela Cheia)
  immersiveQuotes: [
    {
      quote: 'A audiência não compra do melhor profissional do mercado. Ela compra do profissional que ela conhece, confia e lembra.',
      signature: 'Quem Não É Visto Não É Lembrado',
    },
    {
      quote: 'Conhecimento guardado na gaveta não gera autoridade nem faturamento. Coloque seu saber no mundo.',
      signature: 'Feito é Melhor que Perfeito',
    },
    {
      quote: 'Seu conteúdo é o seu vendedor mais dedicado: ele trabalha 24 horas por dia, 7 dias por semana, sem cobrar comissão.',
      signature: 'Efeito das 7 Horas (Google)',
    },
    {
      quote: 'A constância supera a genialidade. Fazer o básico bem feito todos os dias vale mais do que um post perfeito por mês.',
      signature: 'Código de Execução',
    },
  ],
};
