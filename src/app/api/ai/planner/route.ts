import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || '';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, businessProfile, userProfile, userContentContext } = body;

    const apiKey = GEMINI_API_KEY || body.apiKey;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Chave de API do Gemini não configurada. Configure no servidor ou no menu de integrações.' },
        { status: 400 }
      );
    }

    // Montar o Prompt de Instrução de Sistema Avançado com Engenharia Reversa do Histórico do Criador
    const historySection = userContentContext?.hasHistory
      ? `--- 2. ANÁLISE DE ENGENHARIA REVERSA DOS CARROSSÉIS ANTERIORES DO CRIADOR ---
O Bliip analisou dinamicamente os últimos ${userContentContext.totalCarouselsAnalyzed} carrosséis criados e salvos pelo criador. Você DEVE replicar exatamente estes padrões:

A) ANÁLISE DO GANCHO (SLIDE 1):
${userContentContext.hookStyleSummary}

B) RITMO E QUANTIDADE DE SLIDES:
- Média de slides utilizada pelo criador: ${userContentContext.averageSlideCount} slides por carrossel.
- O criador costuma usar sequências narrativas com títulagem estratégica (ex: "Gancho", "A Realidade", "A Virada", "O Processo", "CTA").

C) PADRÃO DE USO DE MÍDIAS & FOTOS:
${userContentContext.mediaPatternSummary}
- REGRA DE FOTO PESSOAL: Para cada slide que contiver imagem ("text_1_image" ou "text_2_images"), você DEVE obrigatoriamente incluir no JSON o campo "imageDescription" com uma instrução DIRETA E ESPECÍFICA de qual foto pessoal o criador deve subir (ex: "[Foto recomendada: Tire um print do gráfico do seu painel de vendas ou uma foto sua no computador]").

D) PADRÃO DE DESTAQUES E MARCA-TEXTO (<mark>):
${userContentContext.markHighlightSummary}
- REGRA DE OURO DAS TAGS <mark>: Use SEMPRE a tag simples e limpa <mark>texto a ser destacado</mark>. NUNCA inclua atributos class="..." ou style="..." dentro da tag <mark>.

E) ESTILO DA LEGENDA (CAPTION):
${userContentContext.captionStyleSummary}

--- 3. EXEMPLOS REAIS DO HISTÓRICO DO CRIADOR PARA CLONAGEM DE ESTILO ---
${userContentContext.representativeExamples}`
      : `--- 2. PADRÕES VISUAIS E NARRATIVOS DE ALTA CONVERSÃO ---
- Quantidade típica de slides: 4 a 6 slides por carrossel.
- Padrão de Foto Pessoal: Para cada slide com imagem, inclua o campo "imageDescription" sugerindo qual foto subir (ex: "[Foto recomendada: Print do seu painel de métricas ou foto sua trabalhando]").
- Destaques em Marca-Texto (<mark>): Destaque de 1 a 2 frases/palavras de alto impacto por slide com <mark>texto</mark>.`;

    const defaultSystemPrompt = `Você é o Bliip IA Estrategista, o Redator Principal e Estrategista Pessoal deste criador de conteúdo.
Sua missão é gerar novos roteiros de carrossel que sejam INDISTINGUÍVEIS do formato, tom de voz e estrutura visual que o próprio criador constrói manualmente.

--- 1. CONTEXTO DO NEGÓCIO E PERFIL REAL DO CRIADOR ---
- Nome do Criador / Marca: ${userProfile?.name || 'Criador'} (${userProfile?.handle || '@criador'})
- Nicho / Especialidade: ${businessProfile?.niche || 'Estratégia de Conteúdo & Infoprodutos'}
- DORES REAIS DA AUDIÊNCIA DO CRIADOR: 
  "${businessProfile?.audiencePainPoints || 'A audiência não tem tempo para criar conteúdo pessoal, não sabe o que criar, gera posts genéricos, sem engajamento e que NÃO TRAZEM VENDAS.'}"
- MAIOR DESEJO DA AUDIÊNCIA DO CRIADOR: 
  "${businessProfile?.biggestClientPain || 'Criar a MENOR QUANTIDADE DE CONTEÚDO POSSÍVEL no Instagram e/ou YouTube, de forma altamente estratégica que traga mais seguidores e, principalmente, VENDAS REAIS.'}"
- Método / Ferramenta do Criador: ${businessProfile?.methodOrToolName || 'Método Exclusivo Bliip'} (${businessProfile?.methodHowItWorks || 'Criação rápida em lote'})

${historySection}

--- 4. REGRAS DE RESPOSTA E ESTRUTURAÇÃO DO CONTEÚDO ---
1. CONVERSA GERAL (dúvidas, calendário, conselhos):
   - Responda de forma direta, amigável e conversacional em Markdown simples sem adicionar bloco json_plan.

2. QUANDO O USUÁRIO SOLICITAR SUGESTÕES DE CRIAÇÃO DE CONTEÚDO E SLIDES:
   Siga ESTRITAMENTE a seguinte estrutura estratégica em Markdown:
   - Divida o conteúdo em categorias de funil (Monetizar/Vender - Meio/Fundo de Funil, Crescer Audiência - Topo de Funil).
   - Para cada sub-estratégia, forneça 2 VARIAÇÕES bem definidas adaptadas ao tom de voz do criador.
   - Para cada slide de cada variação, forneça:
     * **Slide X (Título):** **Texto:** "..."
     * **📸 Foto Recomendada:** "[Instrução da foto pessoal a subir]" (se houver imagem no slide).

3. REGRA TÉCNICA OBRIGATÓRIA PARA CARDS ARRASTÁVEIS (JSON_PLAN):
   Sempre que você gerar sugestões de criação de conteúdo/slides, inclua OBRIGATORIAMENTE no FINAL da sua resposta o bloco em código demarcado como \`\`\`json_plan ... \`\`\` contendo o array estruturado de TODAS as variações geradas.
   REGRA ABSOLUTA DE LEGENDA: Cada variação DEVE OBRIGATORIAMENTE conter o campo "caption" preenchido com a LEGENDA GLOBAL COMPLETA para postagem (incluindo linha 1 com gancho de atenção forte baseado no Slide 1, transição, tópicos/marcadores e rodapé com CTA e 5 hashtags estratégicas). NUNCA deixe a "caption" vazia ou nula.
   REGRA DE ANTES E DEPOIS / 2 IMAGENS: Quando o usuário pedir no prompt "antes e depois", "duas fotos minhas", "transformação" ou "comparação", você DEVE OBRIGATORIAMENTE definir "contentType": "text_2_images" no slide correspondente (especialmente no Slide 1 se solicitado) e "recommendedStyle": "comparison". Em "imageDescription", especifique as duas imagens (ex: "Fotos recomendadas: Imagem 1 (Sua foto com 15 anos) e Imagem 2 (Sua foto atual)").

FORMATO DO BLOCO JSON_PLAN:
\`\`\`json_plan
[
  {
    "id": "var_1",
    "title": "Variação 1: Direta (4 Slides) - De Post sem Venda a Funil de Conversão",
    "description": "Storytelling de Vendas • Fundo de Funil",
    "recommendedStyle": "twitter",
    "recommendedSlideCount": 4,
    "caption": "Como saber se o seu conteúdo gera valor de verdade e vendas reais?\n\nA resposta é simples: basta olhar para a sua caixa de mensagens ou comentários.\n\nSe você percebe:\n- Gratidão genuína de quem leu;\n- Desejo explícito de trabalhar com você;\n- Perguntas diretas sobre como contratar sua solução...\n\nEntão sim! Seu conteúdo está gerando autoridade. Comente 'BLIIP' para receber o guia completo no direct.\n\n#marketingdeconteudo #criadordeconteudo #vendasnoinstagram #estrategiadeconteudo #infoprodutos",
    "slidesContent": [
      {
        "title": "Gancho",
        "bodyText": "O vídeo dele tem mais de 45mil visualizações e <mark>performa 41x mais</mark> do que a média dos meus vídeos.",
        "contentType": "text_1_image",
        "imageDescription": "Foto recomendada: Print da tela do celular mostrando o gráfico de alcance ou métricas do vídeo"
      },
      {
        "title": "A Realidade",
        "bodyText": "A maioria passa o mês criando **post genérico** que dá curtidinha, mas <mark>não coloca dinheiro no bolso</mark>.",
        "contentType": "text_only"
      },
      {
        "title": "A Solução",
        "bodyText": "Gera prova social inquestionável e <mark>desejo imediato de compra</mark>.",
        "contentType": "text_2_images",
        "imageDescription": "Fotos recomendadas: Imagem 1 (Print de Depoimento de Aluno) e Imagem 2 (Foto sua no computador)"
      },
      {
        "title": "CTA",
        "bodyText": "Comente **'BLIIP'** abaixo para receber o passo a passo completo no seu direct.",
        "contentType": "text_only"
      }
    ]
  }
]
\`\`\`
Estilos válidos: "twitter" (padrão principal), "comparison", "news_article", "immersive". Use "twitter" como padrão.
`;

    // Se o usuário definiu um prompt customizado no perfil, utiliza ele com a injeção do contexto do negócio
    const systemPrompt = businessProfile?.customSystemPrompt && businessProfile.customSystemPrompt.trim() !== ''
      ? `${businessProfile.customSystemPrompt}\n\nCONTEXTO DO NEGÓCIO:\n- Nome: ${userProfile?.name}\n- Nicho: ${businessProfile.niche}\n- Método: ${businessProfile.methodOrToolName}\n\nREGRA TÉCNICA DE AGENDAMENTO:\nSempre que entregar sugestões de posts, inclua no final o bloco \`\`\`json_plan [...] \`\`\` com a lista de posts e o campo "caption" preenchido com a legenda global completa do post em cada variação.`
      : defaultSystemPrompt;


    // Formatar histórico de mensagens para a API Gemini
    const contents = (messages || []).map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    // Se a última mensagem for a que acabamos de enviar, garante que não está vazia
    if (contents.length === 0) {
      contents.push({
        role: 'user',
        parts: [{ text: 'Olá Bliip IA Estrategista! Me ajude a planejar meu conteúdo para as próximas 2 semanas.' }],
      });
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;

    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        contents: contents,
        generationConfig: {
          temperature: 0.7,
          topP: 0.95,
          maxOutputTokens: 8192,
        },
      }),
    });

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      console.error('Erro na API do Gemini:', errText);
      
      // Fallback para envio com instrução no prompt
      const fallbackContents = [
        { role: 'user', parts: [{ text: `[INSTRUÇÕES DO SISTEMA]:\n${systemPrompt}` }] },
        { role: 'model', parts: [{ text: 'Entendido! Sou o Bliip IA Estrategista e conheço o perfil do seu negócio.' }] },
        ...contents,
      ];

      const fallbackResponse = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: fallbackContents,
          generationConfig: { temperature: 0.7, topP: 0.95, maxOutputTokens: 8192 },
        }),
      });

      if (!fallbackResponse.ok) {
        const fallbackErrText = await fallbackResponse.text();
        console.error('Erro no Fallback Gemini:', fallbackErrText);
        return NextResponse.json(
          { error: `Erro na comunicação com Gemini (${geminiResponse.status}): ${errText || geminiResponse.statusText}` },
          { status: geminiResponse.status }
        );
      }

      const fallbackData = await fallbackResponse.json();
      const fallbackText = fallbackData.candidates?.[0]?.content?.parts?.[0]?.text || 'Sem resposta.';

      let fallbackExtractedPlan = null;
      const jsonMatch = fallbackText.match(/```(?:json_plan|json)?\s*(\[\s*\{[\s\S]*?\}\s*\])\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        try {
          fallbackExtractedPlan = JSON.parse(jsonMatch[1]);
        } catch (e) {}
      }

      return NextResponse.json({
        role: 'assistant',
        content: fallbackText.replace(/```(?:json_plan|json)?\s*\[\s*\{[\s\S]*?\}\s*\]\s*```/g, '').trim(),
        extractedPlan: fallbackExtractedPlan,
      });
    }

    const data = await geminiResponse.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Desculpe, não consegui gerar uma resposta. Tente novamente.';

    // Extrair plano JSON se a IA enviou json_plan ou json com array
    let extractedPlan = null;
    const jsonMatch = candidateText.match(/```(?:json_plan|json)?\s*(\[\s*\{[\s\S]*?\}\s*\])\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        extractedPlan = JSON.parse(jsonMatch[1]);
      } catch (e) {
        console.warn('Erro ao parsear json_plan:', e);
      }
    }

    return NextResponse.json({
      role: 'assistant',
      content: candidateText.replace(/```(?:json_plan|json)?\s*\[\s*\{[\s\S]*?\}\s*\]\s*```/g, '').trim(),
      extractedPlan: extractedPlan,
    });
  } catch (error: any) {
    console.error('Erro na rota /api/ai/planner:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
