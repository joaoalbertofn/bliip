import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || '';

async function fetchImageAsInlineData(url: string): Promise<{ mimeType: string; data: string } | null> {
  try {
    if (!url || typeof url !== 'string' || url.startsWith('blob:')) return null;

    // Se já for data-url base64
    if (url.startsWith('data:')) {
      const matches = url.match(/^data:([^;]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        return { mimeType: matches[1], data: matches[2] };
      }
    }

    // Se for URL HTTP/HTTPS remota com timeout estrito de 1.5s
    if (url.startsWith('http://') || url.startsWith('https://')) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);

      const res = await fetch(url, {
        signal: controller.signal,
        headers: { 'User-Agent': 'Bliip-AI-Caption-Fetcher/1.0' },
      }).finally(() => clearTimeout(timeoutId));

      if (res.ok) {
        const contentType = res.headers.get('content-type') || 'image/jpeg';
        if (contentType.startsWith('image/')) {
          const arrayBuffer = await res.arrayBuffer();
          const base64 = Buffer.from(arrayBuffer).toString('base64');
          return { mimeType: contentType.split(';')[0], data: base64 };
        }
      }
    }
  } catch (err) {
    // Ignora requisições canceladas ou inválidas para não atrasar a geração
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { contentType, contextText, mediaUrls, businessProfile, userProfile, apiKey: clientApiKey } = body;

    const apiKey = GEMINI_API_KEY || clientApiKey;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Chave de API do Gemini não configurada. Configure no servidor ou no menu de integrações.' },
        { status: 400 }
      );
    }

    // Montar instrução do sistema para legenda otimizada de alta conversão
    const systemInstruction = `Você é o Copywriter de Elite e Estrategista Pessoal do Bliip Studio.
Sua única missão é escrever a LEGENDA COMPLETA (INÍCIO, MEIO E FIM) para a publicação do criador.

--- 1. CONTEXTO DO NEGÓCIO E PERFIL DO CRIADOR ---
- Nome do Criador / Marca: ${userProfile?.name || 'João Alberto'} (${userProfile?.handle || '@joaoalbertofn'})
- Nicho de Atuação: ${businessProfile?.niche || 'Estratégia de Conteúdo & Infoprodutos'}
- Método do Criador: ${businessProfile?.methodOrToolName || 'Método MCN / Bliip'}
- Dores da Audiência: "${businessProfile?.audiencePainPoints || 'Audiência insegura se o conteúdo gera valor ou atrai clientes.'}"
- Resultado Desejado: "${businessProfile?.resultsDelivered || businessProfile?.biggestClientPain || 'Gerar autoridade real, criar conteúdo sem estresse e fechar vendas.'}"

--- 2. EXEMPLO DE ESTRUTURA E TOM DE VOZ ESPERADO ---
Você DEVE SEMPRE GERAR O TEXTO COMPLETO DA PRIMEIRA À ÚLTIMA LINHA conforme o modelo abaixo:

[EXEMPLO DE LEGENDA COMPLETA]
Como saber se o seu conteúdo gera valor de verdade?

Mas a resposta para saber se seu conteúdo realmente funciona é simples: basta olhar para a sua caixa de comentários.

Se você percebe:
- Gratidão genuína;
- Desejo explícito da pessoa em trabalhar com você;
- Perguntas diretas sobre como a sua solução resolve a dor dela...

Então sim! Seu conteúdo está gerando valor real, ajudando DE VERDADE e construindo a sua autoridade no mercado. Quando você aplica o MCN, o conteúdo deixa de ser uma "dor de cabeça" e se torna um mapa fácil de seguir e gerador de vendas.

#inboundmarketing #marketingdeconteudo #vendasnoinstagram #criadordeconteudo #pequenasempresas
[FIM DO EXEMPLO]

--- 3. REGRAS OBRIGATÓRIAS DE CONSTRUÇÃO ---
1. **LINHA 1 (GANCHO DE ATENÇÃO OBRIGATÓRIO)**: Comece OBRIGATORIAMENTE na PRIMEIRA LINHA com uma pergunta ou afirmação forte baseada no Slide 1 (ex: "Como saber se...?", "Você já se perguntou...?"). NUNCA omita esta primeira linha.
2. **LINHA 2 E 3 (TRANSIÇÃO)**: "Mas a resposta para [tema do post] é simples: basta [ensinar o conceito principal do Slide 2 e 3]".
3. **BLOCO DE MARCADORES/SINAIS**: Se houver itens ou sinais no post, inclua os marcadores simples com hífen:
   - Tópico 1;
   - Tópico 2;
   - Tópico 3...
4. **CONCLUSÃO E REFORÇO**: "Então sim! [Conclusão de impacto]. Quando você aplica o ${businessProfile?.methodOrToolName || 'Método MCN'}, [resultado positivo]."
5. **HASHTAGS DE NICHO NO RODAPÉ**: Termine na última linha com 5 hashtags em minúsculo.

--- 4. REGRAS RÍGIDAS DE SAÍDA ---
- Comece GERANDO DIRETO a PRIMEIRA LINHA DO GANCHO.
- NUNCA comece no meio da frase.
- NUNCA use blocos de código ou aspas triplas na resposta.`;

    // Processar imagens multimodais em paralelo com timeout acelerado
    const imageParts: Array<{ inlineData: { mimeType: string; data: string } }> = [];
    if (Array.isArray(mediaUrls) && mediaUrls.length > 0) {
      const validUrls = mediaUrls.filter((u) => typeof u === 'string' && u.trim() !== '' && !u.startsWith('blob:')).slice(0, 3);
      const results = await Promise.all(validUrls.map((url) => fetchImageAsInlineData(url)));
      results.forEach((res) => {
        if (res) imageParts.push({ inlineData: res });
      });
    }

    const userPromptText = `--- CONTEÚDO COMPLETO DOS SLIDES DO CARROSSEL ---
Tipo de Mídia: ${contentType || 'Carrossel'}
Conteúdo Extraído dos Slides:
${contextText || 'Sem texto nos slides (baseie-se no perfil do negócio).'}`;

    // Montar payload do Gemini (Multimodal com systemInstruction no topo)
    const contentsPayload = {
      systemInstruction: {
        parts: [{ text: systemInstruction }],
      },
      contents: [
        {
          role: 'user',
          parts: [
            { text: userPromptText },
            ...imageParts,
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    };

    const candidateModels = [
      'gemini-3.6-flash',
      'gemini-2.0-flash',
      'gemini-1.5-flash',
      'gemini-1.5-pro',
    ];

    let generatedCaption = '';
    let lastErrorText = '';

    for (const modelName of candidateModels) {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
      try {
        const geminiResponse = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(contentsPayload),
        });

        if (geminiResponse.ok) {
          const data = await geminiResponse.json();
          generatedCaption = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
          if (generatedCaption) break;
        } else {
          lastErrorText = await geminiResponse.text();
          console.warn(`[Caption API] Modelo ${modelName} retornou erro ${geminiResponse.status}:`, lastErrorText);
        }
      } catch (err: any) {
        lastErrorText = err?.message || 'Erro de conexão';
      }
    }

    if (!generatedCaption) {
      return NextResponse.json(
        { error: `Erro na comunicação com a IA do Gemini: ${lastErrorText || 'Não foi possível gerar a legenda.'}` },
        { status: 500 }
      );
    }

    // Garantia absoluta de no mínimo 4 a 8 hashtags estratégicas relevantes no final
    const hashtagMatches = generatedCaption.match(/#[\w\u00C0-\u00FF]+/g) || [];
    if (hashtagMatches.length < 4) {
      const nicheTag = (businessProfile?.niche || 'estrategia')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '');

      const fallbackTags = [
        `#${nicheTag || 'estrategia'}`,
        '#conteudoestrategico',
        '#marketingdeconteudo',
        '#vendasnoinstagram',
        '#criadordeconteudo',
        '#produtividade',
      ];

      const missingTags = fallbackTags.filter((tag) => !generatedCaption.toLowerCase().includes(tag.toLowerCase()));
      const tagsToAdd = missingTags.slice(0, Math.max(4, 6 - hashtagMatches.length));

      if (tagsToAdd.length > 0) {
        generatedCaption = `${generatedCaption.trim()}\n\n${tagsToAdd.join(' ')}`;
      }
    }

    return NextResponse.json({
      success: true,
      caption: generatedCaption,
    });
  } catch (error: any) {
    console.error('[Caption API] Erro fatal na rota /api/ai/caption:', error);
    return NextResponse.json(
      { error: error?.message || 'Erro interno do servidor ao gerar legenda com IA.' },
      { status: 500 }
    );
  }
}

