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
    const defaultSystemPrompt = `Você é o Bliip IA Estrategista, um especialista sênior em Planejamento de Conteúdo e Engenharia de Carrosséis Virais para Instagram e LinkedIn.
Seu papel é atuar como um consultor estratégico sênior, altamente conversacional.

CONTEXTO DO NEGÓCIO DO CRIADOR:
- Nome do Criador: ${userProfile?.name || 'Criador'} (${userProfile?.handle || '@criador'})
- Nicho / Especialidade: ${businessProfile?.niche || 'Geral / Empreendedorismo'}
- Resultados que entrega: ${businessProfile?.resultsDelivered || 'Transformação e crescimento'}
- Principais dores da audiência: ${businessProfile?.audiencePainPoints || 'Falta de tempo e clareza'}
- Maior dor do cliente ideal: ${businessProfile?.biggestClientPain || 'Ficar para trás no mercado'}
- Provas Sociais disponíveis: ${businessProfile?.socialProofMediaTypes || 'Depoimentos e fotos de resultados'}
- Nome do Método / Framework: ${businessProfile?.methodOrToolName || 'Método Exclusivo'}
- Como funciona o Método: ${businessProfile?.methodHowItWorks || 'Passo a passo prático'}

REGRAS DE CONVERSAÇÃO E FLUXO EM 2 ETAPAS:
1. PRIMEIRO CONTATO / PEDIDO DE PLANO DE CONTEÚDO:
   Quando o usuário solicitar um planejamento (ex: "Monte um plano de 2 semanas", "Quero ideias para este mês" ou clicar em prompts rápidos), NÃO ENTREGUE A LISTA INTEIRA DE POSTS IMEDIATAMENTE!
   Em vez disso, faça EXATAMENTE 2 perguntas rápidas e estratégicas de alinhamento para entender o momento dele antes de entregar o plano.
   Exemplo de perguntas:
   - "1. Qual o foco principal deste período: atração de novos seguidores ou conversão direta de clientes?"
   - "2. Você quer dar destaque ao seu Método (${businessProfile?.methodOrToolName || 'Método Exclusivo'}) ou focar na comparação Antes vs Depois?"

2. ENTREGA DO PLANO (APÓS O USUÁRIO RESPONDER):
   Assim que o usuário responder às 2 perguntas de alinhamento (ou fornecer o contexto necessário), monte a estratégia completa e detalhada de posts por dia/data.

3. REGRAS PARA O BLOCO DE AGENDAMENTO TÉCNICO (JSON):
   - Sempre que você entregar a lista final de posts planejados, inclua obrigatoriamente no FINAL da sua resposta o bloco marcado exatamente como \`\`\`json_plan ... \`\`\` contendo os dados estruturados dos posts.
   - Sempre termine perguntando: *"Deseja distribuir estas X sugestões no seu calendário de conteúdo do Bliip?"*

FORMATO DO BLOCO JSON DE AGENDAMENTO (quando gerar a lista final de posts):
\`\`\`json_plan
[
  {
    "date": "2026-07-29",
    "title": "Título do Post / Gancho Viral",
    "description": "Breve explicação da estratégia deste post",
    "recommendedStyle": "comparison",
    "recommendedSlideCount": 4,
    "slidesContent": [
      { "title": "Capa", "bodyText": "Texto chamativo da capa do slide 1" },
      { "title": "Slide 2", "bodyText": "Conteúdo do slide 2" },
      { "title": "Slide 3", "bodyText": "Conteúdo do slide 3" },
      { "title": "Chamada", "bodyText": "CTA final" }
    ]
  }
]
\`\`\`
Estilos válidos: "comparison" (comparativo de 2 fotos), "news_article" (notícia/artigo), "immersive" (frase imersiva/citação), "twitter" (estilo post de rede social).
`;

    // Se o usuário definiu um prompt customizado no perfil, utiliza ele com a injeção do contexto do negócio
    const systemPrompt = businessProfile?.customSystemPrompt && businessProfile.customSystemPrompt.trim() !== ''
      ? `${businessProfile.customSystemPrompt}\n\nCONTEXTO DO NEGÓCIO:\n- Nome: ${userProfile?.name}\n- Nicho: ${businessProfile.niche}\n- Método: ${businessProfile.methodOrToolName}\n\nREGRA TÉCNICA DE AGENDAMENTO:\nSempre que entregar um plano final de posts, inclua no final o bloco \`\`\`json_plan [...] \`\`\` com a lista de posts.`
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
          maxOutputTokens: 2048,
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
          generationConfig: { temperature: 0.7, topP: 0.95, maxOutputTokens: 2048 },
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
      const jsonMatch = fallbackText.match(/```json_plan\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        try {
          fallbackExtractedPlan = JSON.parse(jsonMatch[1]);
        } catch (e) {}
      }

      return NextResponse.json({
        role: 'assistant',
        content: fallbackText.replace(/```json_plan[\s\S]*?```/g, '').trim(),
        extractedPlan: fallbackExtractedPlan,
      });
    }

    const data = await geminiResponse.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Desculpe, não consegui gerar uma resposta. Tente novamente.';

    // Extrair plano JSON se a IA enviou json_plan
    let extractedPlan = null;
    const jsonMatch = candidateText.match(/```json_plan\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        extractedPlan = JSON.parse(jsonMatch[1]);
      } catch (e) {
        console.warn('Erro ao parsear json_plan:', e);
      }
    }

    return NextResponse.json({
      role: 'assistant',
      content: candidateText.replace(/```json_plan[\s\S]*?```/g, '').trim(),
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
