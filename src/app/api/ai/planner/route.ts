import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || '';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, businessProfile, userProfile } = body;

    const apiKey = GEMINI_API_KEY || body.apiKey;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Chave de API do Gemini não configurada. Configure no servidor ou no menu de integrações.' },
        { status: 400 }
      );
    }

    // Montar o Prompt de Instrução de Sistema com base no Quiz do Negócio e Prompt Customizado do Usuário
    const defaultSystemPrompt = `Você é o Bliip IA Estrategista, um especialista sênior em Planejamento de Conteúdo, Storytelling e Engenharia de Carrosséis Virais para Instagram e LinkedIn.

CONTEXTO DO NEGÓCIO DO CRIADOR:
- Nome do Criador: ${userProfile?.name || 'Criador'} (${userProfile?.handle || '@criador'})
- Nicho / Especialidade: ${businessProfile?.niche || 'Geral / Empreendedorismo'}
- Resultados que entrega: ${businessProfile?.resultsDelivered || 'Transformação e crescimento'}
- Principais dores da audiência: ${businessProfile?.audiencePainPoints || 'Falta de tempo e clareza'}
- Maior dor do cliente ideal: ${businessProfile?.biggestClientPain || 'Ficar para trás no mercado'}
- Provas Sociais disponíveis: ${businessProfile?.socialProofMediaTypes || 'Depoimentos e fotos de resultados'}
- Nome do Método / Framework: ${businessProfile?.methodOrToolName || 'Método Exclusivo'}
- Como funciona o Método: ${businessProfile?.methodHowItWorks || 'Passo a passo prático'}

REGRAS DE RESPOSTA E COMPORTAMENTO:
1. CONVERSA GERAL (dúvidas, calendário, informações do negócio, conselhos):
   - Responda de forma direta, amigável e conversacional em Markdown simples sem adicionar bloco json_plan.

2. QUANDO O USUÁRIO SOLICITAR SUGESTÕES DE CRIAÇÃO DE CONTEÚDO E SLIDES:
   Siga ESTRITAMENTE a seguinte estrutura estratégica em Markdown:
   - Divida o conteúdo em categorias de funil (Monetizar/Vender - Meio/Fundo de Funil, Crescer Audiência - Topo de Funil, etc.).
   - Para cada sub-estratégia (ex: Storytelling de Transformação, Storytelling de Dor, Erro Comum / Correção, Quebra de Padrão), você DEVE fornecer 3 VARIAÇÕES bem definidas:
     * **Variação 1: Curta (3 Slides)**
     * **Variação 2: Média (4 Slides)**
     * **Variação 3: Longa (6 Slides)**
   - Para cada variação, liste individualmente cada slide:
     * **Slide 1 (Gancho):** **Texto:** "..."
     * **Slide 2 (A Virada / Conteúdo):** **Texto:** "..."
     * etc.
   - Mantenha o foco em textos impactantes adaptados ao nicho do criador.

3. REGRAS DE ESTRUTURAÇÃO VISUAL DOS SLIDES (ESTILO ALTA CONVERSÃO / TWITTER VIRAL):
   Nos textos dos slides (tanto no Markdown quanto no \`bodyText\` do \`json_plan\`), aplique ESTRITAMENTE o padrão visual das referências:
   - **Pílula de Abertura no Topo**: Se o slide tiver uma pergunta ou introdução, termine a linha com dois pontos (ex: "Todos eles tinham uma coisa em comum:" ou "Isso se chama viés de ação:").
   - **Negritos Estratégicos (**palavra**)**: Aplique negrito nas palavras-chave mais importantes de cada frase ou item de lista (ex: "- Não eram as **idéias**.", "- Buscando o **nicho** perfeito...").
   - **Caixa Marca-Texto Amarela (<mark>frase</mark>)**: Envolva a frase de desfecho, conclusão ou citação de impacto no final do slide dentro de <mark>frase final</mark> (ex: "<mark>Era a PRESSA em executar.</mark>" ou "<mark>Não fizeram nada.</mark>" ou "<mark>\"falhar rápido\"</mark>").

4. REGRA TÉCNICA OBRIGATÓRIA PARA CARDS ARRASTÁVEIS (JSON_PLAN):
   Sempre que você gerar sugestões de criação de conteúdo/slides, inclua OBRIGATORIAMENTE no FINAL da sua resposta o bloco em código demarcado como \`\`\`json_plan ... \`\`\` contendo o array estruturado de TODAS as variações geradas para que o sistema possa transformar em cards arrastáveis para o calendário.

FORMATO DO BLOCO JSON_PLAN:
\`\`\`json_plan
[
  {
    "id": "var_1",
    "title": "Variação 1: Curta (3 Slides) - De Prestador Refém a Criador Escalonável",
    "description": "Storytelling de Transformação • Meio/Fundo de Funil",
    "recommendedStyle": "twitter",
    "recommendedSlideCount": 3,
    "slidesContent": [
      { "title": "Gancho", "bodyText": "Conheça o Lucas..." },
      { "title": "A Virada", "bodyText": "Ele percebeu..." },
      { "title": "O Processo", "bodyText": "Ele não precisou..." }
    ]
  },
  {
    "id": "var_2",
    "title": "Variação 2: Média (4 Slides) - O Fim do Caçador de Clientes",
    "description": "Storytelling de Transformação • Meio/Fundo de Funil",
    "recommendedStyle": "twitter",
    "recommendedSlideCount": 4,
    "slidesContent": [
      { "title": "Gancho", "bodyText": "A transição silenciosa..." },
      { "title": "A Realidade", "bodyText": "A maioria passa o mês..." },
      { "title": "Ação Intencional", "bodyText": "A virada de chave..." },
      { "title": "A Máquina Rodando", "bodyText": "Você agenda um mês..." }
    ]
  }
]
\`\`\`
Estilos válidos: "twitter" (padrão principal para melhor aproveitamento da tela), "comparison", "news_article", "immersive". Sempre use "twitter" como estilo visual padrão dos posts.
`;

    // Se o usuário definiu um prompt customizado no perfil, utiliza ele com a injeção do contexto do negócio
    const systemPrompt = businessProfile?.customSystemPrompt && businessProfile.customSystemPrompt.trim() !== ''
      ? `${businessProfile.customSystemPrompt}\n\nCONTEXTO DO NEGÓCIO:\n- Nome: ${userProfile?.name}\n- Nicho: ${businessProfile.niche}\n- Método: ${businessProfile.methodOrToolName}\n\nREGRA TÉCNICA DE AGENDAMENTO:\nSempre que entregar sugestões de posts, inclua no final o bloco \`\`\`json_plan [...] \`\`\` com a lista de posts.`
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
