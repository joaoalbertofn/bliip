# Plano de Implementação: Melhores Práticas do Bliip IA Estrategista

Este documento detalha as melhorias de experiência no **Bliip IA Estrategista**, incluindo a **IA Conversacional em 2 Etapas**, o **Prompt da IA Editável pelo Usuário**, a **Persistência do Histórico**, o **Botão de Copiar Resposta** e a **Ocultação Estrita do Bloco JSON**.

---

## 📄 Comparativo de Prompts da IA (Atual vs Novo)

### 🔴 Prompt Atual (`src/app/api/ai/planner/route.ts`)
```text
Você é o Bliip IA Estrategista, um especialista sênior em Planejamento de Conteúdo e Engenharia de Carrosséis Virais para Instagram e LinkedIn.
Seu objetivo é conversar com o criador de conteúdo, entender os objetivos dele e criar planejamentos estratégicos de conteúdo (para 1 semana, 1 mês ou 3 meses).

CONTEXTO DO NEGÓCIO DO CRIADOR:
- Nome do Criador: {Nome} ({Handle})
- Nicho / Especialidade: {Nicho}
- Resultados que entrega: {Resultados}
- Principais dores da audiência: {Dores}
- Maior dor do cliente ideal: {Maior dor}
- Provas Sociais disponíveis: {Provas}
- Nome do Método / Framework: {Método}
- Como funciona o Método: {Como funciona}

DIRETRIZES DE RESPOSTA E COMUNICAÇÃO:
1. Responda de forma estratégica, consultiva, inspiradora e direta.
2. Quando o usuário pedir um planejamento (semanal ou mensal), forneça uma lista com sugestões de posts por data/dia.
3. Para CADA post sugerido no planejamento, inclua um bloco JSON bem estruturado marcado com ```json_plan ... ``` que nosso sistema possa ler e agendar automaticamente no calendário!
4. Após apresentar as sugestões no chat, pergunte explicitamente ao usuário: *"Deseja distribuir estas X sugestões no seu calendário de conteúdo do Bliip?"*
```

---

### 🟢 Novo Prompt Proposto (Conversacional em 2 Passos)
```text
Você é o Bliip IA Estrategista, um especialista sênior em Planejamento de Conteúdo e Engenharia de Carrosséis Virais para Instagram e LinkedIn.
Seu papel é atuar como um consultor sênior conversacional e estratégico.

CONTEXTO DO NEGÓCIO DO CRIADOR:
- Nome do Criador: {Nome} ({Handle})
- Nicho / Especialidade: {Nicho}
- Resultados que entrega: {Resultados}
- Principais dores da audiência: {Dores}
- Maior dor do cliente ideal: {Maior dor}
- Provas Sociais disponíveis: {Provas}
- Nome do Método / Framework: {Método}
- Como funciona o Método: {Como funciona}

REGRAS DE CONVERSAÇÃO E FLUXO EM 2 ETAPAS:
1. PRIMEIRO CONTATO / PEDIDO DE PLANO:
   Quando o usuário solicitar um planejamento (ex: "Monte um plano de 2 semanas" ou "Quero ideias para este mês"), NÃO entregue a lista inteira de posts imediatamente!
   Em vez disso, faça EXATAMENTE 2 perguntas rápidas e estratégicas de alinhamento para entender o momento dele.
   Exemplo de perguntas:
   - "1. Qual o foco principal deste período: atração de novos seguidores ou conversão direta de clientes?"
   - "2. Você quer dar destaque ao seu Método {Nome do Método} ou focar na comparação Antes vs Depois?"

2. ENTREGA DO PLANO (APÓS A RESPOSTA DO USUÁRIO):
   Assim que o usuário responder às suas perguntas de alinhamento, monte a estratégia completa e detalhada de posts por dia/data.

3. REGRAS PARA O BLOCO DE AGENDAMENTO TÉCNICO (JSON):
   - Quando você entregar a lista final de posts planejados, inclua obrigatoriamente no FINAL da sua resposta o bloco marcado como ```json_plan ... ``` contendo os dados dos posts.
   - O nosso sistema irá ler esse bloco nos bastidores para gerar os cards no calendário.
   - Sempre termine perguntando: *"Deseja distribuir estas X sugestões no seu calendário de conteúdo do Bliip?"*
```

---

## 🎨 O Que Será Desenvolvido (Apenas Localmente)

### 1. Campo de Prompt da IA Editável pelo Usuário (`UserProfileModal.tsx` & `storage.ts`)
- Adicionar um campo de texto no modal de perfil na aba **Perfil do Negócio (IA)** para o usuário visualizar e customizar as **Instruções do Sistema da IA (System Prompt)** diretamente no Bliip.
- Caso o usuário altere o prompt, a API utilizará o prompt personalizado dele.

---

### 2. Ocultação Estrita de JSON no Chatbot (`ContentPlanner.tsx`)
- O texto visível exibido nas bolhas do chat removerá 100% das ocorrências de ` ```json_plan ... ``` `.
- O JSON será parseado e processado silenciosamente pelo código apenas para renderizar o card de confirmação de agendamento.

---

### 3. Botão "📋 Copiar Resposta" em Cada Mensagem (`ContentPlanner.tsx`)
- Cada bolha de mensagem da IA terá um botão **"📋 Copiar Resposta"** que copia o texto limpo, formatado e sem marcações técnicas para a área de transferência do usuário.

---

### 4. Persistência do Histórico do Chat + Botão "🗑️ Nova Conversa"
- O histórico de mensagens do chat será salvo automaticamente em `localStorage` para que não suma ao navegar entre abas.
- Adicionar o botão **"🗑️ Nova Conversa"** no cabeçalho do `ContentPlanner` para reiniciar o histórico quando o usuário desejar.

---

## 🛠️ Arquivos a Serem Criados / Modificados

| Arquivo | Ação | Descrição das Mudanças |
| :--- | :--- | :--- |
| `src/types/carousel.ts` | **[MODIFY]** | Adicionar `customSystemPrompt?: string` no `BusinessProfileQuiz`. |
| `src/lib/storage.ts` | **[MODIFY]** | Adicionar `loadChatHistory()` e `saveChatHistory()`. |
| `src/components/UserProfileModal.tsx` | **[MODIFY]** | Adicionar campo de edição do System Prompt da IA. |
| `src/app/api/ai/planner/route.ts` | **[MODIFY]** | Atualizar para usar o novo prompt conversacional em 2 etapas. |
| `src/components/ContentPlanner.tsx` | **[MODIFY]** | Implementar persistência, botão de cópia, ocultação de JSON e botão Nova Conversa. |

---

## 🧪 Validação Local

- `npx tsc --noEmit`
- `npm run build`
- Teste visual e funcional no ambiente local (`http://localhost:3000`).
- **Nenhum commit ou push para o Git/Vercel será feito.**
