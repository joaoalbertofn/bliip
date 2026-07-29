export interface PresetSlideDefinition {
  title?: string;
  bodyText: string;
  hasHighlight?: boolean;
  isCta?: boolean;
  imagePlaceholder?: boolean;
}

export interface PresetModel {
  id: string;
  name: string;
  tagline: string;
  description: string;
  slideCount: number;
  iconName: 'Compass' | 'Wrench' | 'Award' | 'Crown' | 'BookOpen' | 'Quote' | 'GitCommit';
  slides: PresetSlideDefinition[];
}

export const PRESET_MODELS: PresetModel[] = [
  {
    id: 'a_jornada',
    name: '1. A Jornada',
    tagline: 'Gerar Identificação',
    description: 'Ideal para quebrar crenças do seu público e gerar forte identificação pessoal.',
    slideCount: 6,
    iconName: 'Compass',
    slides: [
      {
        title: 'Slide 1 (Gancho)',
        bodyText: '[Gancho - Promessa / Quebra de Padrão]\n\nComo saí do zero e conquistei minha autoridade produzindo conteúdo diário.',
      },
      {
        title: 'Slide 2 (A Dor / O Mito)',
        bodyText: 'O mito de que você precisa de mais uma pós-graduação ou curso técnico para finalmente conseguir clientes.',
      },
      {
        title: 'Slide 3 (A História)',
        bodyText: '[A História - Relato Real]\n\nPor anos eu acreditei que precisava do plano e certificado perfeitos antes de dar o primeiro passo.',
      },
      {
        title: 'Slide 4 (A Solução)',
        bodyText: '[A Solução - Virada de Chave]\n\nA virada de chave foi entender que quem não é visto, não é lembrado. O mercado busca quem resolve problemas hoje.',
      },
      {
        title: 'Slide 5 (A Lição de Ouro)',
        bodyText: 'Visibilidade constante vence o perfeccionismo toda vez.',
      },
      {
        title: 'Slide 6 (CTA)',
        bodyText: '[CTA - Chamada para Ação]\n\nMe siga para parar de ser um segredo bem guardado.',
        isCta: true,
      },
    ],
  },
  {
    id: 'a_ferramenta',
    name: '2. A Ferramenta',
    tagline: 'Entregar Valor Rápido',
    description: 'Ideal para entregar valor rápido e mostrar domínio técnico.',
    slideCount: 6,
    iconName: 'Wrench',
    slides: [
      {
        title: 'Slide 1 (Gancho)',
        bodyText: 'Como criar uma biblioteca de conteúdo em 5 minutos.',
      },
      {
        title: 'Slide 2 (O Problema)',
        bodyText: '[O Problema]\n\nA frustração de travar na frente da tela em branco todos os dias sem saber o que postar.',
      },
      {
        title: 'Slide 3 (A Revelação)',
        bodyText: '[A Revelação]\n\nConheça o Bliip: a ferramenta que transforma suas ideias em carrosséis profissionais em segundos.',
      },
      {
        title: 'Slide 4 (O Diferencial)',
        bodyText: '[O Diferencial]\n\n• Foca no que o seu cliente busca (e não no que seus colegas procuram).\n• Layouts de alta conversão.\n• Sem complicação técnica.',
      },
      {
        title: 'Slide 5 (O Exemplo Prático)',
        bodyText: '[Passo a Passo Prático]\n\n1. Acesse o Bliip\n2. Digite sua ideia ou escolha um modelo\n3. Exporte seu carrossel pronto',
      },
      {
        title: 'Slide 6 (CTA)',
        bodyText: '[CTA - Chamada para Ação]\n\nComente "FERRAMENTA" e te mando o link no direct.',
        isCta: true,
      },
    ],
  },
  {
    id: 'estudo_de_caso',
    name: '3. O Estudo de Caso',
    tagline: 'Prova Social',
    description: 'Ideal para gerar prova social inquestionável.',
    slideCount: 6,
    iconName: 'Award',
    slides: [
      {
        title: 'Slide 1 (Gancho)',
        bodyText: 'Como esse advogado conseguiu 10.000 seguidores e lotou a agenda em 90 dias.',
      },
      {
        title: 'Slide 2 (O Ponto de Partida)',
        bodyText: '[O Ponto de Partida]\n\nEle passou anos sem conseguir clientes pela internet, dependendo apenas de indicações esporádicas.',
      },
      {
        title: 'Slide 3 (O Erro Crítico)',
        bodyText: '[O Erro Crítico]\n\nEle criava conteúdo técnico e jurídico para outros advogados, em vez de focar nas dúvidas reais do seu cliente final.',
      },
      {
        title: 'Slide 4 (A Aplicação do Método)',
        bodyText: '[A Aplicação do Método]\n\nAjustamos a comunicação para responder as dúvidas mais frequentes de quem precisa contratar seus serviços.',
      },
      {
        title: 'Slide 5 (O Efeito Bola de Neve)',
        bodyText: '[O Efeito Bola de Neve]\n\nEm menos de 3 meses, o perfil se tornou uma máquina diária de atração de clientes qualificados.',
      },
      {
        title: 'Slide 6 (CTA)',
        bodyText: '[CTA - Chamada para Ação]\n\nQuer que eu desenhe a mesma estratégia para você? Link na bio.',
        isCta: true,
      },
    ],
  },
  {
    id: 'tita_do_mercado',
    name: '4. O Titã do Mercado',
    tagline: 'Efeito Halo / Validação',
    description: 'Ideal para validar sua tese usando o "efeito halo" de pessoas famosas.',
    slideCount: 6,
    iconName: 'Crown',
    slides: [
      {
        title: 'Slide 1 (Gancho)',
        bodyText: 'O que Érico Rocha, Alex Hormozi e GaryVee têm em comum?',
      },
      {
        title: 'Slide 2 (O Mito do Sucesso)',
        bodyText: 'Não, não é dinheiro, sorte ou câmera de cinema.',
      },
      {
        title: 'Slide 3 (O Padrão Oculto)',
        bodyText: 'Todos eles passaram pelo menos 90 dias publicando o Mínimo de Conteúdo Necessário sem falhar.',
      },
      {
        title: 'Slide 4 (A Transformação)',
        bodyText: '[A Transformação]\n\nEles não esperaram o cenário perfeito. Eles aplicaram o viés de ação antes mesmo de terem grandes estruturas.',
      },
      {
        title: 'Slide 5 (O Seu Mapa)',
        bodyText: '[O Seu Mapa]\n\n1 Tema + 1 Dor Principal do Cliente + 1 Post Diário.',
      },
      {
        title: 'Slide 6 (CTA)',
        bodyText: '[CTA - Chamada para Ação]\n\nTopa o desafio de ser consistente? Salve este post para os dias em que pensar em desistir.',
        isCta: true,
      },
    ],
  },
  {
    id: 'tutorial_definitivo',
    name: '5. O Tutorial Definitivo',
    tagline: 'Salva-Guarda / Retenção',
    description: 'Ideal para crescimento de base e salvamentos.',
    slideCount: 6,
    iconName: 'BookOpen',
    slides: [
      {
        title: 'Slide 1 (Gancho)',
        bodyText: 'O script definitivo para reter a atenção nos primeiros 3 segundos.',
      },
      {
        title: 'Slide 2 (O Fundamento)',
        bodyText: '[O Fundamento]\n\nA atenção é o ativo mais valioso da internet. Se você não prende o leitor em 3 segundos, ele rola a tela.',
      },
      {
        title: 'Slide 3 (O Esqueleto)',
        bodyText: '[O Esqueleto]\n\nFórmula de Ouro: [Gancho Impactante] + [Conflito/Dor] + [Resolução Prática]',
      },
      {
        title: 'Slide 4 (Exemplo Ruim x Exemplo Bom)',
        bodyText: '[Antes x Depois]\n\n❌ Ruim: "Hoje vou falar sobre como ter disciplina."\n\n✅ Bom: "Como ter disciplina quando você não tem nenhuma vontade de trabalhar."',
      },
      {
        title: 'Slide 5 (O Resumo Rápido)',
        bodyText: '[O Resumo Rápido]\n\n1. Comece provocando curiosidade\n2. Prometa uma solução clara\n3. Entregue sem enrolação',
      },
      {
        title: 'Slide 6 (CTA)',
        bodyText: '[CTA - Chamada para Ação]\n\nMande para o seu parceiro de negócios que precisa ver isso.',
        isCta: true,
      },
    ],
  },
  {
    id: 'frase_de_impacto',
    name: '6. A Frase de Impacto',
    tagline: 'Viral / Compartilhamento',
    description: 'Ideal para compartilhamento rápido nos stories e identificação imediata (1 Slide).',
    slideCount: 1,
    iconName: 'Quote',
    slides: [
      {
        title: 'Slide 1 (A Frase)',
        bodyText: 'Existe uma chance real de você conseguir o que quer se você se mover. Mas existe <mark class="bg-yellow-300 px-1 rounded">ZERO</mark> chances se ficar parado.',
        hasHighlight: true,
      },
    ],
  },
  {
    id: 'fio_condutor',
    name: '7. O Fio Condutor',
    tagline: 'Leitura Sequencial',
    description: 'Ideal para prender a atenção do início ao fim através de uma linha de raciocínio (4 Slides).',
    slideCount: 4,
    iconName: 'GitCommit',
    slides: [
      {
        title: 'Slide 1 (A Premissa)',
        bodyText: 'Existem três tipos de pessoas.',
      },
      {
        title: 'Slide 2 (O Ponto 1)',
        bodyText: 'Uma delas aprende, vendo o erro dos outros.',
      },
      {
        title: 'Slide 3 (O Ponto 2)',
        bodyText: 'Outra só aprende com os próprios erros.',
      },
      {
        title: 'Slide 4 (A Conclusão + CTA)',
        bodyText: 'A última, nunca aprende.\n\n[Chamada Sutil] Me siga para mais reflexões diárias sobre execução.',
        isCta: true,
      },
    ],
  },
];
