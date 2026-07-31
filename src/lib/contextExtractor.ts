import { Carousel, UserProfile } from '@/types/carousel';

export interface UserContentContext {
  hasHistory: boolean;
  totalCarouselsAnalyzed: number;
  averageSlideCount: number;
  hookStyleSummary: string;
  mediaPatternSummary: string;
  markHighlightSummary: string;
  captionStyleSummary: string;
  representativeExamples: string;
  businessProfileSummary: string;
}

export function extractUserContentContext(
  carousels: Carousel[] = [],
  profile?: UserProfile
): UserContentContext {
  const quiz = profile?.businessProfile;

  // 1. Resumo do Perfil de Negócio (Dores e Desejos Profundos)
  const businessProfileSummary = [
    `Nicho / Especialidade: ${quiz?.niche || 'Estratégia & Criação de Conteúdo'}`,
    `Resultados Entregues: ${quiz?.resultsDelivered || 'Vendas e Autoridade no Instagram e YouTube'}`,
    `Dores da Audiência: ${
      quiz?.audiencePainPoints ||
      'Falta tempo para criar conteúdo pessoal, não sabe o que criar, gera posts genéricos, sem engajamento e que NÃO TRAZEM VENDAS.'
    }`,
    `Maior Desejo da Audiência: ${
      quiz?.biggestClientPain ||
      'Criar a MENOR QUANTIDADE DE CONTEÚDO POSSÍVEL no Instagram e/ou YouTube, de forma altamente estratégica que traga mais seguidores e, principalmente, VENDAS REAIS.'
    }`,
    `Método / Ferramenta: ${quiz?.methodOrToolName || 'Método Bliip de Criação Estratégica em Lote'}`,
  ].join('\n');

  // Se não houver histórico de carrosséis salvos
  if (!carousels || carousels.length === 0) {
    return {
      hasHistory: false,
      totalCarouselsAnalyzed: 0,
      averageSlideCount: 4,
      hookStyleSummary: 'Ganchos diretos com quebra de expectativa e prova/números reais no Slide 1.',
      mediaPatternSummary: 'Slide 1 (1 Foto), Slide 2 (Texto), Slide 3 (2 Fotos Comparativas ou Prints), Slide Final (CTA).',
      markHighlightSummary: 'Destaca de 1 a 2 palavras/frases-chave por slide usando a tag <mark>.',
      captionStyleSummary: 'Legenda em 3 blocos: Gancho forte -> Tópicos práticos -> CTA direta de vendas.',
      representativeExamples: 'Nenhum carrossel salvo anteriormente.',
      businessProfileSummary,
    };
  }

  // Filtrar carrosséis que possuem slides
  const validCarousels = carousels.filter((c) => c.slides && c.slides.length > 0);
  if (validCarousels.length === 0) {
    return {
      hasHistory: false,
      totalCarouselsAnalyzed: 0,
      averageSlideCount: 4,
      hookStyleSummary: 'Ganchos diretos com quebra de expectativa e prova/números reais no Slide 1.',
      mediaPatternSummary: 'Slide 1 (1 Foto), Slide 2 (Texto), Slide 3 (2 Fotos Comparativas ou Prints), Slide Final (CTA).',
      markHighlightSummary: 'Destaca de 1 a 2 palavras/frases-chave por slide usando a tag <mark>.',
      captionStyleSummary: 'Legenda em 3 blocos: Gancho forte -> Tópicos práticos -> CTA direta de vendas.',
      representativeExamples: 'Nenhum carrossel com slides encontrado.',
      businessProfileSummary,
    };
  }

  // 2. Análise da Quantidade Média de Slides
  const totalSlidesCount = validCarousels.reduce((acc, c) => acc + c.slides.length, 0);
  const averageSlideCount = Math.max(3, Math.round(totalSlidesCount / validCarousels.length));

  // 3. Análise dos Ganchos (Slide 1)
  const firstSlides = validCarousels.map((c) => c.slides[0]);
  const hookTitles = firstSlides
    .map((s) => s.title)
    .filter(Boolean)
    .slice(0, 5);
  const hookTexts = firstSlides
    .map((s) => s.layers.text?.[0]?.content?.replace(/<[^>]*>/g, ''))
    .filter(Boolean)
    .slice(0, 5);

  const hookStyleSummary = `
- Títulos comuns no Slide 1: ${hookTitles.length > 0 ? hookTitles.join(' | ') : 'Gancho, Capa, História'}
- Abertura de texto típica: ${hookTexts.length > 0 ? hookTexts.map(t => `"${t?.slice(0, 60)}..."`).join(' | ') : 'Ganchos diretos focados em quebra de expectativa, números e provas reais.'}
  `.trim();

  // 4. Análise de Padrão de Mídias (Fotos)
  let textOnlyCount = 0;
  let text1ImageCount = 0;
  let text2ImagesCount = 0;

  validCarousels.forEach((c) => {
    c.slides.forEach((s) => {
      if (s.contentType === 'text_only') textOnlyCount++;
      else if (s.contentType === 'text_1_image') text1ImageCount++;
      else if (s.contentType === 'text_2_images') text2ImagesCount++;
    });
  });

  const mediaPatternSummary = `
- Frequência de Tipos de Slide: Texto + 1 Foto (${text1ImageCount}), Texto + 2 Fotos (${text2ImagesCount}), Apenas Texto (${textOnlyCount}).
- Preferência de Imagens: O criador alterna entre fotos únicas de rosto/evento, prints de resultados e comparativos (Antes/Depois).
  `.trim();

  // 5. Análise de Marca-Texto (<mark>)
  let markCount = 0;
  validCarousels.forEach((c) => {
    c.slides.forEach((s) => {
      const content = s.layers.text?.[0]?.content || '';
      const matches = content.match(/<mark[^>]*>[\s\S]*?<\/mark>/gi);
      if (matches) markCount += matches.length;
    });
  });
  const avgMarksPerSlide = (markCount / Math.max(1, totalSlidesCount)).toFixed(1);

  const markHighlightSummary = `
- Média de tags <mark> por slide: ~${avgMarksPerSlide}. O criador utiliza o marca-texto amarelo estrategicamente para destacar números, gatilhos de autoridade e viradas de chave.
  `.trim();

  // 6. Análise das Legendas (Captions)
  const sampleCaptions = validCarousels
    .map((c) => c.caption)
    .filter(Boolean)
    .slice(0, 3);
  const captionStyleSummary = sampleCaptions.length > 0
    ? `Exemplos de legendas salvas pelo criador:\n${sampleCaptions.map((cap, i) => `--- LEGENDA #${i + 1} ---\n${cap?.slice(0, 200)}...`).join('\n')}`
    : 'Legendas objetivas em 3 blocos: Gancho direto -> Tópicos reflexivos -> Chamada para ação (CTA) para vendas.';

  // 7. Formatação dos 3 Exemplos Mais Recentes/Relevantes do Criador
  const representativeExamples = validCarousels
    .slice(0, 3)
    .map((carousel, cIdx) => {
      const slideDetails = carousel.slides.map((s, sIdx) => {
        const rawText = s.layers.text?.[0]?.content || '';
        const text = rawText
          .replace(/<mark[^>]*>/gi, '<mark>')
          .replace(/ style="[^"]*"/gi, '')
          .replace(/ class="[^"]*"/gi, '');
        const imgCount = s.layers.images?.length || 0;
        const imgLabels = s.imageLabels ? ` (Rótulos: ${s.imageLabels.join(' / ')})` : '';
        return `   - Slide #${sIdx + 1} [${s.title || 'Sem título'}] (Tipo: ${s.contentType}, Estilo: ${s.layoutStyle}${imgLabels}): "${text}"`;
      }).join('\n');

      return `EXEMPLO DE POST SALVO #${cIdx + 1}: "${carousel.name}"
Legenda Global: "${carousel.caption || 'Sem legenda'}"
Slides:
${slideDetails}`;
    })
    .join('\n\n');

  return {
    hasHistory: true,
    totalCarouselsAnalyzed: validCarousels.length,
    averageSlideCount,
    hookStyleSummary,
    mediaPatternSummary,
    markHighlightSummary,
    captionStyleSummary,
    representativeExamples,
    businessProfileSummary,
  };
}
