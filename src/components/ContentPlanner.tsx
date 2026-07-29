import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, PlannedContentIdea } from '@/types/carousel';
import { loadPlannedContentIdeas, savePlannedContentIdeas, loadChatHistory, saveChatHistory } from '@/lib/storage';
import { FormattedMarkdownMessage } from './FormattedMarkdownMessage';
import {
  Calendar as CalendarIcon,
  Send,
  Sparkles,
  Bot,
  User,
  Plus,
  Zap,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Layout,
  FileText,
  X,
  Trash2,
  Copy,
  Check
} from 'lucide-react';

interface ContentPlannerProps {
  profile: UserProfile;
  onCreateCarouselFromIdea: (idea: PlannedContentIdea) => void;
  apiKey?: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  extractedPlan?: PlannedContentIdea[];
  timestamp: string;
}

export const ContentPlanner: React.FC<ContentPlannerProps> = ({
  profile,
  onCreateCarouselFromIdea,
  apiKey,
}) => {
  // Estados de Planejamento e Mensagens
  const [ideas, setIdeas] = useState<PlannedContentIdea[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<PlannedContentIdea[] | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  // Estados de Navegação do Calendário
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedIdea, setSelectedIdea] = useState<PlannedContentIdea | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Carregar ideias e histórico de chat salvos no início
  useEffect(() => {
    async function loadData() {
      const savedIdeas = await loadPlannedContentIdeas();
      setIdeas(savedIdeas);

      const savedChat = await loadChatHistory();
      if (savedChat && savedChat.length > 0) {
        setMessages(savedChat);
      } else {
        // Mensagem Inicial de Boas-Vindas do Chatbot caso não haja histórico
        const welcomeMsg: ChatMessage = {
          id: 'welcome_msg',
          role: 'assistant',
          content: `Olá **${profile.name}**! Sou o seu **Bliip IA Estrategista** (Gemini 3.6). 🤖✨

${
  profile.businessProfile?.niche
    ? `Já carreguei as informações do seu negócio (*Nicho: ${profile.businessProfile.niche}*).`
    : 'Dica: preencha a aba **Perfil do Negócio** no seu perfil para eu personalizar 100% da estratégia!'
}

Como posso te ajudar hoje? Posso planejar seu conteúdo para 1 semana, 1 mês ou gerar ganchos virais para o seu método!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages([welcomeMsg]);
        saveChatHistory([welcomeMsg]);
      }
    }
    loadData();
  }, [profile]);

  // Salvar histórico sempre que atualizar mensagens
  useEffect(() => {
    if (messages.length > 0) {
      saveChatHistory(messages);
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Limpar Histórico / Nova Conversa
  const handleClearChat = async () => {
    const welcomeMsg: ChatMessage = {
      id: `welcome_${Date.now()}`,
      role: 'assistant',
      content: `Nova conversa iniciada! Sou o seu **Bliip IA Estrategista** (Gemini 3.6). 🤖✨\n\nComo posso te ajudar a planejar seu conteúdo hoje?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([welcomeMsg]);
    setPendingPlan(null);
    await saveChatHistory([welcomeMsg]);
  };

  // Função para sanitizar e remover 100% de blocos JSON do texto visível do chat
  const cleanDisplayContent = (text: string) => {
    if (!text) return '';
    // Corta tudo que começar a partir de ```json_plan ou ```json
    let clean = text.split(/```json_plan/i)[0];
    clean = clean.split(/```json/i)[0];
    return clean.trim();
  };

  // Função para enviar mensagem ao Gemini API
  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    if (!textToSend) setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
          businessProfile: profile.businessProfile,
          userProfile: profile,
          apiKey,
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const assistantMsg: ChatMessage = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: data.content,
        extractedPlan: data.extractedPlan,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);

      if (data.extractedPlan && Array.isArray(data.extractedPlan) && data.extractedPlan.length > 0) {
        setPendingPlan(data.extractedPlan);
      }
    } catch (err: any) {
      console.error('Erro no Chatbot Estrategista:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: 'assistant',
          content: `⚠️ Não consegui se conectar à IA (${err.message || 'Erro de conexão'}). Verifique sua chave de API ou tente novamente.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Aceitar e Distribuir Sugestões no Calendário
  const handleConfirmPlanToCalendar = async (planToConfirm?: PlannedContentIdea[]) => {
    const targetPlan = planToConfirm || pendingPlan;
    if (!targetPlan || targetPlan.length === 0) return;

    const formattedIdeas: PlannedContentIdea[] = targetPlan.map((p, idx) => ({
      ...p,
      id: `idea_${Date.now()}_${idx}`,
      status: 'planned',
    }));

    const updated = [...ideas, ...formattedIdeas];
    setIdeas(updated);
    await savePlannedContentIdeas(updated);

    setPendingPlan(null);

    // Mensagem de confirmação no chat
    const confirmMsg: ChatMessage = {
      id: `confirm_${Date.now()}`,
      role: 'assistant',
      content: `✅ Excelente! **${formattedIdeas.length} novos conteúdos** foram agendados com sucesso no seu Calendário Editorial do Bliip ao lado! 🗓️✨`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, confirmMsg]);
  };

  // Deletar Ideia do Calendário
  const handleDeleteIdea = async (ideaId: string) => {
    const updated = ideas.filter((i) => i.id !== ideaId);
    setIdeas(updated);
    await savePlannedContentIdeas(updated);
    setSelectedIdea(null);
  };

  // Navegação do Mês no Calendário
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Lógica do Calendário Grid
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  return (
    <div className="flex-1 h-full flex flex-col md:flex-row overflow-hidden bg-slate-950">
      {/* COLUNA ESQUERDA: CHATBOT ESTRATEGISTA IA (45%) */}
      <div className="w-full md:w-[45%] h-full border-r border-slate-800/80 flex flex-col bg-slate-900/60 backdrop-blur-md">
        {/* Header do Chat */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-violet-500 text-white flex items-center justify-center shadow-glow">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                <span>Bliip IA Estrategista</span>
                <span className="text-[9px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 py-0.5 rounded font-mono">
                  Gemini 3.6
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">Planejador editorial & ganchos virais</p>
            </div>
          </div>

          <button
            onClick={handleClearChat}
            className="p-2 bg-slate-800/80 hover:bg-red-950/60 text-slate-400 hover:text-red-300 rounded-xl border border-slate-700/80 transition flex items-center gap-1.5 text-xs font-semibold shadow-sm"
            title="Iniciar Nova Conversa (Limpar Histórico)"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
            <span className="hidden sm:inline">Nova Conversa</span>
          </button>
        </div>

        {/* Prompt Suggestions Rápidos */}
        <div className="px-3 py-2 bg-slate-950/60 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
          <button
            onClick={() => handleSendMessage('Monte um plano editorial estratégico para as próximas 2 semanas focado nas dores do meu público.')}
            className="px-2.5 py-1 bg-slate-800/80 hover:bg-purple-900/40 text-purple-200 border border-slate-700/80 rounded-lg text-[11px] font-semibold whitespace-nowrap transition flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span>🗓️ Plano 2 Semanas</span>
          </button>

          <button
            onClick={() => handleSendMessage(`Crie 3 ideias virais baseadas no meu método (${profile.businessProfile?.methodOrToolName || 'meu método'}).`)}
            className="px-2.5 py-1 bg-slate-800/80 hover:bg-amber-900/40 text-amber-200 border border-slate-700/80 rounded-lg text-[11px] font-semibold whitespace-nowrap transition flex items-center gap-1"
          >
            <Zap className="w-3 h-3 text-amber-400" />
            <span>🔥 Ideias do Meu Método</span>
          </button>

          <button
            onClick={() => handleSendMessage('Quais são as principais comparações "Antes vs Depois" que posso postar neste mês?')}
            className="px-2.5 py-1 bg-slate-800/80 hover:bg-indigo-900/40 text-indigo-200 border border-slate-700/80 rounded-lg text-[11px] font-semibold whitespace-nowrap transition flex items-center gap-1"
          >
            <Layout className="w-3 h-3 text-indigo-400" />
            <span>📊 Comparativos Virais</span>
          </button>
        </div>

        {/* Histórico de Mensagens */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 scrollbar-thin scrollbar-thumb-slate-800">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-[92%] ${
                msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white'
                }`}
              >
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                <div
                  className={`p-4 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white font-medium rounded-tr-none'
                      : 'bg-slate-800/95 text-slate-200 border border-slate-700/80 rounded-tl-none shadow-sm'
                  }`}
                >
                  <FormattedMarkdownMessage
                    content={msg.role === 'user' ? msg.content : cleanDisplayContent(msg.content)}
                  />
                </div>

                {/* Botão Copiar Resposta para Mensagens do Assistente */}
                {msg.role === 'assistant' && cleanDisplayContent(msg.content) && (
                  <button
                    onClick={() => {
                      const textToCopy = cleanDisplayContent(msg.content);
                      navigator.clipboard.writeText(textToCopy);
                      setCopiedMessageId(msg.id);
                      setTimeout(() => setCopiedMessageId(null), 2000);
                    }}
                    className="self-start text-[10px] font-semibold text-slate-400 hover:text-purple-300 flex items-center gap-1 bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700/50 px-2.5 py-1 rounded-lg transition"
                    title="Copiar texto da estratégia"
                  >
                    {copiedMessageId === msg.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-300">Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-purple-400" />
                        <span>📋 Copiar Resposta</span>
                      </>
                    )}
                  </button>
                )}

                {/* Card de Confirmação quando a IA gera um plano */}
                {msg.extractedPlan && Array.isArray(msg.extractedPlan) && (
                  <div className="bg-purple-950/60 border border-purple-500/40 rounded-xl p-3.5 flex flex-col gap-2 shadow-lg mt-1">
                    <div className="flex items-center gap-2 text-purple-200 text-xs font-bold">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      <span>{msg.extractedPlan.length} Sugestões Geradas Pela IA!</span>
                    </div>

                    <p className="text-[11px] text-slate-300">
                      Deseja distribuir estas {msg.extractedPlan.length} sugestões diretamente no seu Calendário Editorial do Bliip?
                    </p>

                    <button
                      onClick={() => handleConfirmPlanToCalendar(msg.extractedPlan)}
                      className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-lg transition shadow-glow flex items-center justify-center gap-1.5 mt-1"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Sim, Agendar no Calendário</span>
                    </button>
                  </div>
                )}

                <span className="text-[9px] text-slate-500 font-mono px-1">
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 mr-auto">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl rounded-tl-none p-3.5 text-xs text-slate-300 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce delay-100" />
                <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce delay-200" />
                <span className="text-slate-400 ml-1">Estrategista digitando...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Form de Envio */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 border-t border-slate-800 bg-slate-900 flex items-center gap-2 shrink-0"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Converse com seu Estrategista IA..."
            disabled={isLoading}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="w-10 h-10 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white flex items-center justify-center transition shadow-glow"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* COLUNA DIREITA: CALENDÁRIO EDITORIAL INTERATIVO (55%) */}
      <div className="w-full md:w-[55%] h-full flex flex-col bg-slate-950 p-4 md:p-6 overflow-y-auto scrollbar-thin">
        {/* Top Header do Calendário */}
        <div className="flex items-center justify-between mb-4 bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <span>{monthNames[month]} {year}</span>
              </h2>
              <p className="text-xs text-slate-400">
                {ideas.length} {ideas.length === 1 ? 'conteúdo planejado' : 'conteúdos planejados'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={prevMonth}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700/80 transition"
              title="Mês Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextMonth}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700/80 transition"
              title="Próximo Mês"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Grid de Dias da Semana (Dom a Sáb) */}
        <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold text-slate-400">
          <span>DOM</span>
          <span>SEG</span>
          <span>TER</span>
          <span>QUA</span>
          <span>QUI</span>
          <span>SEX</span>
          <span>SÁB</span>
        </div>

        {/* Grid do Mês */}
        <div className="grid grid-cols-7 gap-2 flex-1 auto-rows-fr min-h-[450px]">
          {/* Células vazias do início do mês */}
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty_${i}`} className="bg-slate-900/20 border border-slate-900/50 rounded-xl p-1 opacity-40 min-h-[90px]" />
          ))}

          {/* Dias do Mês */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const dayIdeas = ideas.filter((idea) => idea.date === formattedDate);
            const isToday =
              new Date().getDate() === dayNum &&
              new Date().getMonth() === month &&
              new Date().getFullYear() === year;

            return (
              <div
                key={`day_${dayNum}`}
                className={`bg-slate-900/90 border rounded-xl p-1.5 flex flex-col justify-between transition min-h-[95px] relative group overflow-hidden ${
                  isToday
                    ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-slate-850'
                    : 'border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`text-xs font-extrabold px-1.5 py-0.5 rounded-md ${
                      isToday ? 'bg-indigo-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    {dayNum}
                  </span>
                </div>

                {/* Lista de Ideias do Dia */}
                <div className="flex flex-col gap-1 my-1 overflow-y-auto max-h-[70px] scrollbar-none">
                  {dayIdeas.map((idea) => (
                    <button
                      key={idea.id}
                      onClick={() => setSelectedIdea(idea)}
                      className={`w-full p-1.5 rounded-lg text-left transition flex flex-col gap-0.5 border ${
                        idea.status === 'created'
                          ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                          : 'bg-purple-950/60 border-purple-500/40 text-purple-200 hover:bg-purple-900/80'
                      }`}
                    >
                      <span className="text-[10px] font-bold truncate leading-tight">
                        {idea.title}
                      </span>
                      <span className="text-[8px] opacity-80 flex items-center gap-1 font-mono">
                        <Zap className="w-2.5 h-2.5" />
                        <span>{idea.recommendedSlideCount || 4} slides</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL DE DETALHES DA IDEIA SELECIONADA DO CALENDÁRIO */}
      {selectedIdea && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative flex flex-col gap-4">
            <button
              onClick={() => setSelectedIdea(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-purple-400 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-800">
                  Data: {selectedIdea.date}
                </span>
                <h3 className="text-base font-extrabold text-white mt-1">{selectedIdea.title}</h3>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 flex flex-col gap-3">
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                {selectedIdea.description}
              </p>

              <div className="flex items-center gap-4 text-xs text-slate-400 border-t border-slate-800/80 pt-2 font-mono">
                <span className="flex items-center gap-1">
                  <Layout className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Estilo: {selectedIdea.recommendedStyle}</span>
                </span>

                <span className="flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                  <span>{selectedIdea.recommendedSlideCount} Slides Sugeridos</span>
                </span>
              </div>
            </div>

            {/* Roteiro dos Slides Sugeridos */}
            {selectedIdea.slidesContent && selectedIdea.slidesContent.length > 0 && (
              <div className="flex flex-col gap-2 max-h-[180px] overflow-y-auto scrollbar-thin p-1">
                <span className="text-xs font-bold text-slate-300">Estrutura de Conteúdo Sugerida:</span>
                {selectedIdea.slidesContent.map((s, idx) => (
                  <div key={idx} className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 text-xs">
                    <span className="font-bold text-indigo-400 block mb-0.5">Slide {idx + 1}: {s.title || ''}</span>
                    <p className="text-slate-300 italic">{s.bodyText}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Ações do Modal */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => handleDeleteIdea(selectedIdea.id)}
                className="p-2.5 text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-xl transition"
                title="Excluir Ideia do Calendário"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedIdea(null)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Fechar
                </button>

                <button
                  onClick={() => {
                    onCreateCarouselFromIdea(selectedIdea);
                    setSelectedIdea(null);
                  }}
                  className="px-5 py-2.5 text-xs font-bold bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl shadow-glow transition flex items-center gap-2 transform hover:scale-[1.02]"
                >
                  <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                  <span>⚡ Criar Conteúdo no Bliip Studio</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
