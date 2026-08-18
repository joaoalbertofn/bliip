import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, PlannedContentIdea, Slide, LayoutStyle, ContentType, Carousel } from '@/types/carousel';
import { loadPlannedContentIdeas, savePlannedContentIdeas, loadChatHistory, saveChatHistory } from '@/lib/storage';
import { createSlide, formatSmartSlideText, detectComparisonLabels } from '@/lib/templates';
import { SlideCanvas } from './SlideCanvas';
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
  Check,
  GripVertical,
  Move,
  AlertCircle,
  Mic,
  MicOff,
  Camera,
  Heart,
  MessageCircle,
  Bookmark,
  MoreHorizontal,
} from 'lucide-react';
import { extractUserContentContext } from '@/lib/contextExtractor';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';


interface ContentPlannerProps {
  profile: UserProfile;
  carousels?: Carousel[];
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

// Parser inteligente de fallback para converter Markdown de Post/Variação em PlannedContentIdea[]
const parseMarkdownToIdeas = (content: string): PlannedContentIdea[] => {
  if (!content) return [];

  const rawJsonMatch = content.match(/```(?:json_plan|json)?\s*(\[\s*\{[\s\S]*?\}\s*\])\s*```/);
  if (rawJsonMatch && rawJsonMatch[1]) {
    try {
      const parsed = JSON.parse(rawJsonMatch[1]);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (e) {}
  }

  const ideas: PlannedContentIdea[] = [];
  const blockRegex = /(?:\*\*\s*)?(Variação\s*\d+[^\n]*|Post\s*\d+[^\n]*|Opção\s*\d+[^\n]*)/gi;
  const matches = [...content.matchAll(blockRegex)];

  if (matches.length > 0) {
    matches.forEach((match, idx) => {
      const startIdx = match.index || 0;
      const nextMatch = matches[idx + 1];
      const endIdx = nextMatch ? (nextMatch.index || content.length) : content.length;
      const blockText = content.substring(startIdx, endIdx);

      let titleLine = match[0].replace(/[\*#]/g, '').trim();

      const slidesContent: { title: string; bodyText: string }[] = [];
      const lines = blockText.split('\n');

      lines.forEach((line) => {
        if (
          line.includes('Slide') ||
          line.includes('Gancho') ||
          line.includes('Capa') ||
          line.includes('A Virada') ||
          line.includes('O Processo') ||
          line.includes('CTA')
        ) {
          const slideNameMatch = line.match(/(Slide\s*\d+(?:\s*\([^)]+\))?|Gancho|Capa|A Virada|O Processo|CTA|A Realidade|A Ação|A Máquina)/i);
          const textMatch = line.match(/(?:Texto:|Gancho:)\s*["']?([^"\n]+)["']?/i) || line.match(/:\s*["']?([^"\n]+)["']?/i);

          if (textMatch && textMatch[1] && textMatch[1].trim().length > 2) {
            const slideTitle = slideNameMatch ? slideNameMatch[0].replace(/[\*#]/g, '').trim() : `Slide ${slidesContent.length + 1}`;
            slidesContent.push({
              title: slideTitle,
              bodyText: textMatch[1].replace(/[\*"]/g, '').trim(),
            });
          }
        }
      });

      const countMatch = blockText.match(/(\d+)\s*Slides/i);
      const slideCount = countMatch ? parseInt(countMatch[1], 10) : (slidesContent.length || 4);
      const styleMatch = blockText.match(/(?:Estilo|Format):\s*["']?(\w+)["']?/i);
      const style = styleMatch ? styleMatch[1].toLowerCase() : (blockText.toLowerCase().includes('comparison') ? 'comparison' : 'twitter');

      ideas.push({
        id: `parsed_idea_${Date.now()}_${idx}`,
        title: titleLine,
        description: blockText.substring(0, 120).replace(/[\*#]/g, '').trim(),
        recommendedStyle: (['twitter', 'news_article', 'comparison', 'immersive'].includes(style) ? style : 'twitter') as any,
        recommendedSlideCount: slideCount,
        slidesContent: slidesContent.length > 0 ? slidesContent : [
          { title: 'Slide 1 (Gancho)', bodyText: titleLine }
        ],
        date: '',
        status: 'planned'
      });
    });
  }

  if (ideas.length === 0 && content.length > 30) {
    const listLines = content.split('\n').filter(l => l.trim().startsWith('*') || l.trim().startsWith('-'));
    if (listLines.length > 0) {
      const slidesContent = listLines.slice(0, 8).map((l, i) => {
        const textOnly = l.replace(/^[\*\-\d\.\s]+/, '').replace(/[\*"]/g, '').trim();
        return {
          title: `Slide ${i + 1}`,
          bodyText: textOnly,
        };
      });

      ideas.push({
        id: `gen_idea_${Date.now()}`,
        title: content.split('\n')[0].replace(/[\*#]/g, '').trim() || 'Sugestão de Conteúdo',
        description: 'Conteúdo planejado em slides',
        recommendedStyle: 'twitter',
        recommendedSlideCount: slidesContent.length,
        slidesContent: slidesContent,
        date: '',
        status: 'planned'
      });
    }
  }

  return ideas;
};

// Extrai somente a introdução da resposta quando os cards interativos estão presentes (sem duplicar roteiros em texto)
const getIntroTextOnly = (content: string) => {
  if (!content) return '';
  let text = content.split(/```json_plan/i)[0].split(/```json/i)[0].trim();
  const parts = text.split(/(?:---|###\s*🎯|####\s*📌|Variação\s*1|\#\s*🚀\s*TEMA)/i);
  const intro = parts[0] ? parts[0].trim() : '';
  if (intro.length > 5) {
    return intro;
  }
  return 'Aqui estão as sugestões de conteúdo e os roteiros dos slides divididos em variações para o seu negócio:';
};

// Gerador de Slides para a pré-visualização em alta fidelidade no Modal (Prioriza slides já editados no Studio se existirem)
const getSlidesForIdea = (idea: PlannedContentIdea, profile: UserProfile, carousels: Carousel[] = []): Slide[] => {
  if (idea.carouselId) {
    const existing = carousels.find((c) => c.id === idea.carouselId);
    if (existing && existing.slides && existing.slides.length > 0) {
      return existing.slides;
    }
  }

  // Padronizar estilo visual 'twitter' por padrão
  const style = idea.recommendedStyle === 'comparison' ? 'comparison' : 'twitter';
  const slides: Slide[] = [];

  const isComparisonTopic =
    style === 'comparison' ||
    idea.title.toLowerCase().includes('vs') ||
    idea.title.toLowerCase().includes('antes') ||
    idea.title.toLowerCase().includes('invisível');

  const comparisonLabels = detectComparisonLabels(idea.description || '', idea.title);

  if (idea.slidesContent && idea.slidesContent.length > 0) {
    idea.slidesContent.forEach((sc, idx) => {
      const isExplicitComparison =
        sc.contentType === 'text_2_images' ||
        (sc.imageDescription && (
          sc.imageDescription.toLowerCase().includes('antes') ||
          sc.imageDescription.toLowerCase().includes('duas fotos') ||
          sc.imageDescription.toLowerCase().includes('2 fotos') ||
          sc.imageDescription.toLowerCase().includes('imagem 1')
        ));

      const isComparisonSlide = isExplicitComparison || (isComparisonTopic && (idx === 1 || style === 'comparison'));
      const contentType: ContentType = isComparisonSlide ? 'text_2_images' : (sc.contentType || 'text_1_image');
      const slideStyle: LayoutStyle = isComparisonSlide ? 'comparison' : 'twitter';

      const s = createSlide(contentType, slideStyle);

      if (sc.title) {
        s.title = sc.title;
      }

      if ((slideStyle as string) === 'news_article') {
        s.newsTitle = sc.title || idea.title || 'ALERTA DE POSICIONAMENTO';
      }

      if (isComparisonSlide) {
        s.imageLabels = [comparisonLabels[0], comparisonLabels[1]];
      }

      const formattedBody = formatSmartSlideText(sc.bodyText, sc.title);
      s.layers.text = [
        {
          id: `text_planned_${idx}`,
          role: 'body',
          content: formattedBody,
        },
      ];

      if (s.layers.images && s.layers.images.length > 0) {
        s.layers.images = s.layers.images.map((img) => ({
          ...img,
          source: { type: 'upload', url: '' },
        }));
      }

      slides.push(s);
    });
  } else {
    const count = idea.recommendedSlideCount || 4;
    for (let i = 0; i < count; i++) {
      const isComparisonSlide = isComparisonTopic && i === 1;
      const contentType = isComparisonSlide ? 'text_2_images' : 'text_1_image';
      const slideStyle = isComparisonSlide ? 'comparison' : style;

      const s = createSlide(contentType, slideStyle);

      if (isComparisonSlide) {
        s.imageLabels = [comparisonLabels[0], comparisonLabels[1]];
      }

      if (s.layers.images && s.layers.images.length > 0) {
        s.layers.images = s.layers.images.map((img) => ({
          ...img,
          source: { type: 'upload', url: '' },
        }));
      }
      slides.push(s);
    }
  }

  return slides;
};

export const ContentPlanner: React.FC<ContentPlannerProps> = ({
  profile,
  carousels = [],
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

  // Estados para Drag & Drop e Notificações
  const [draggedIdea, setDraggedIdea] = useState<PlannedContentIdea | null>(null);
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Estados para Modal de Pré-Visualização (Ao Clicar no Card)
  const [previewIdea, setPreviewIdea] = useState<{ idea: PlannedContentIdea; slides: Slide[] } | null>(null);
  const [previewSlideIdx, setPreviewSlideIdx] = useState<number>(0);

  // Estados para navegação de slide e colapso de legenda individual em cada card do chat
  const [cardSlideIndexMap, setCardSlideIndexMap] = useState<Record<string, number>>({});
  const [expandedCaptionMap, setExpandedCaptionMap] = useState<Record<string, boolean>>({});
  const [copiedCaptionCardId, setCopiedCaptionCardId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const baseInputRef = useRef('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Suporte a Comando de Voz (Web Speech API - PT / EN)
  const {
    isListening,
    isSupported,
    selectedLang,
    stopListening,
    toggleListening,
    changeLanguage,
  } = useSpeechRecognition({
    onResult: (text) => {
      const prefix = baseInputRef.current ? baseInputRef.current + ' ' : '';
      setInputMessage(prefix + text);
    },
    onError: (err) => {
      showToast(`[Voz] ${err}`);
    },
  });

  const handleToggleMic = () => {
    if (!isListening) {
      baseInputRef.current = inputMessage;
    }
    toggleListening();
  };


  // Suporte a teclas de seta (← e →) no Modal de Pré-visualização e tecla ESC para fechar
  useEffect(() => {
    if (!previewIdea) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setPreviewSlideIdx((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setPreviewSlideIdx((prev) => Math.min(previewIdea.slides.length - 1, prev + 1));
      } else if (e.key === 'Escape') {
        setPreviewIdea(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewIdea]);

  const handleOpenPreview = (idea: PlannedContentIdea) => {
    const slides = getSlidesForIdea(idea, profile, carousels);
    setPreviewIdea({ idea, slides });
    setPreviewSlideIdx(0);
  };

  // Carregar ideias e histórico de chat salvos no início
  useEffect(() => {
    async function loadData() {
      const savedIdeas = await loadPlannedContentIdeas();
      setIdeas(savedIdeas);

      const savedChat = await loadChatHistory();
      if (savedChat && savedChat.length > 0) {
        setMessages(savedChat);
      } else {
        const welcomeMsg: ChatMessage = {
          id: 'welcome_msg',
          role: 'assistant',
          content: `Olá **${profile.name}**! Sou o seu **Bliip IA Estrategista** (Gemini 3.6). 🤖✨

${
  profile.businessProfile?.niche
    ? `Já carreguei as informações do seu negócio (*Nicho: ${profile.businessProfile.niche}*).`
    : 'Dica: preencha a aba **Perfil do Negócio** no seu perfil para eu personalizar 100% da estratégia!'
}

Como posso te ajudar hoje? Solicite sugestões de conteúdo e você poderá **arrastar os carrosséis gerados diretamente para o Calendário** ao lado!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages([welcomeMsg]);
        saveChatHistory([welcomeMsg]);
      }
    }
    loadData();
  }, [profile]);

  useEffect(() => {
    if (messages.length > 0) {
      saveChatHistory(messages);
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

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

  const cleanDisplayContent = (text: string) => {
    if (!text) return '';
    let clean = text.split(/```json_plan/i)[0];
    clean = clean.split(/```json/i)[0];
    return clean.trim();
  };

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
      const userContentContext = extractUserContentContext(carousels, profile);

      const response = await fetch('/api/ai/planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
          businessProfile: profile.businessProfile,
          userProfile: profile,
          userContentContext,
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
          content: `⚠️ Não consegui me conectar à IA (${err.message || 'Erro de conexão'}). Verifique sua chave de API ou tente novamente.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteIdea = async (ideaId: string) => {
    const updated = ideas.filter((i) => i.id !== ideaId);
    setIdeas(updated);
    await savePlannedContentIdeas(updated);
    setPreviewIdea(null);
  };

  // Handlers de Drag & Drop
  const handleDragStart = (varItem: PlannedContentIdea, e: React.DragEvent) => {
    setDraggedIdea(varItem);
    (window as any).__bliipDraggedIdea = varItem;

    try {
      const serialized = JSON.stringify(varItem);
      e.dataTransfer.setData('text/plain', serialized);
      e.dataTransfer.setData('application/json', serialized);
      e.dataTransfer.effectAllowed = 'copyMove';
    } catch (err) {
      console.warn('Erro ao definir dataTransfer:', err);
    }
  };

  const handleDragOverDate = (dateStr: string, e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      e.dataTransfer.dropEffect = 'copy';
    } catch (err) {}
    if (dragOverDate !== dateStr) {
      setDragOverDate(dateStr);
    }
  };

  const handleDragEnterDate = (dateStr: string, e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragOverDate !== dateStr) {
      setDragOverDate(dateStr);
    }
  };

  const handleDragLeaveDate = (dateStr: string, e: React.DragEvent) => {
    e.preventDefault();
    if (dragOverDate === dateStr) {
      setDragOverDate(null);
    }
  };

  const handleDropOnDate = async (dateStr: string, e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverDate(null);

    const existingForDate = ideas.find((i) => i.date === dateStr);
    if (existingForDate) {
      showToast('⚠️ Este dia já possui um conteúdo agendado! (Permitido apenas 1 por dia)');
      return;
    }

    let ideaToSchedule = draggedIdea || (window as any).__bliipDraggedIdea;
    if (!ideaToSchedule) {
      try {
        const textData = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('application/json');
        if (textData) ideaToSchedule = JSON.parse(textData);
      } catch (err) {}
    }

    if (!ideaToSchedule) {
      showToast('⚠️ Não foi possível identificar o carrossel. Tente o botão [Agendar em 1º vago].');
      return;
    }

    const newIdea: PlannedContentIdea = {
      ...ideaToSchedule,
      id: `idea_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      date: dateStr,
      status: 'planned',
    };

    const updated = [...ideas, newIdea];
    setIdeas(updated);
    await savePlannedContentIdeas(updated);
    setDraggedIdea(null);
    (window as any).__bliipDraggedIdea = null;
    showToast(`✅ Carrossel agendado para ${dateStr} com sucesso!`);
  };

  const handleQuickScheduleFirstEmptyDay = async (varItem: PlannedContentIdea) => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const currentDay = today.getDate();

    let targetYear = year;
    let targetMonth = month;
    let startDay = 1;

    if (targetYear === currentYear && targetMonth === currentMonth) {
      startDay = currentDay;
    } else if (targetYear < currentYear || (targetYear === currentYear && targetMonth < currentMonth)) {
      targetYear = currentYear;
      targetMonth = currentMonth;
      startDay = currentDay;
    }

    const daysInTargetMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
    let emptyDateStr: string | null = null;

    for (let d = startDay; d <= daysInTargetMonth; d++) {
      const dStr = `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      if (!ideas.some((i) => i.date === dStr)) {
        emptyDateStr = dStr;
        break;
      }
    }

    if (!emptyDateStr) {
      const nextM = (targetMonth + 1) % 12;
      const nextY = targetMonth === 11 ? targetYear + 1 : targetYear;
      const daysInNextMonth = new Date(nextY, nextM + 1, 0).getDate();
      for (let d = 1; d <= daysInNextMonth; d++) {
        const dStr = `${nextY}-${String(nextM + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        if (!ideas.some((i) => i.date === dStr)) {
          emptyDateStr = dStr;
          break;
        }
      }
    }

    if (!emptyDateStr) {
      showToast('⚠️ Não há dias vagos disponíveis!');
      return;
    }

    const newIdea: PlannedContentIdea = {
      ...varItem,
      id: `idea_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      date: emptyDateStr,
      status: 'planned',
    };

    const updated = [...ideas, newIdea];
    setIdeas(updated);
    await savePlannedContentIdeas(updated);
    showToast(`✅ Carrossel agendado para ${emptyDateStr}!`);
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  return (
    <div className="flex-1 h-full flex flex-col md:flex-row overflow-hidden bg-slate-950 relative">
      {/* Toast Notification Floating */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-purple-500/60 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl animate-in slide-in-from-bottom duration-200 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>{toastMessage}</span>
        </div>
      )}

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
            onClick={() => handleSendMessage('Quero sugestões de criação de conteúdo e slides para o meu público com variações curta, média e longa.')}
            className="px-2.5 py-1 bg-slate-800/80 hover:bg-purple-900/40 text-purple-200 border border-slate-700/80 rounded-lg text-[11px] font-semibold whitespace-nowrap transition flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span>✨ Gerar Variações Estratégicas</span>
          </button>

          <button
            onClick={() => handleSendMessage(`Crie 3 ideias virais baseadas no meu método (${profile.businessProfile?.methodOrToolName || 'meu método'}).`)}
            className="px-2.5 py-1 bg-slate-800/80 hover:bg-amber-900/40 text-amber-200 border border-slate-700/80 rounded-lg text-[11px] font-semibold whitespace-nowrap transition flex items-center gap-1"
          >
            <Zap className="w-3 h-3 text-amber-400" />
            <span>🔥 Ideias do Meu Método</span>
          </button>

          <button
            onClick={() => handleSendMessage('Quais dias deste mês estão sem conteúdo agendado no calendário?')}
            className="px-2.5 py-1 bg-slate-800/80 hover:bg-indigo-900/40 text-indigo-200 border border-slate-700/80 rounded-lg text-[11px] font-semibold whitespace-nowrap transition flex items-center gap-1"
          >
            <CalendarIcon className="w-3 h-3 text-indigo-400" />
            <span>🗓️ Consultar Dias Vagos</span>
          </button>
        </div>

        {/* Histórico de Mensagens */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 scrollbar-thin scrollbar-thumb-slate-800">
          {messages.map((msg) => {
            const planToDisplay = (msg.extractedPlan && Array.isArray(msg.extractedPlan) && msg.extractedPlan.length > 0)
              ? msg.extractedPlan
              : (msg.role === 'assistant' ? parseMarkdownToIdeas(msg.content) : []);

            const hasCards = msg.role === 'assistant' && planToDisplay.length > 0;
            const messageText = msg.role === 'user'
              ? msg.content
              : (hasCards ? getIntroTextOnly(msg.content) : cleanDisplayContent(msg.content));

            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[95%] ${
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
                  {messageText && (
                    <div
                      className={`p-4 rounded-2xl ${
                        msg.role === 'user'
                          ? 'bg-indigo-600 text-white font-medium rounded-tr-none'
                          : 'bg-slate-800/95 text-slate-200 border border-slate-700/80 rounded-tl-none shadow-sm'
                      }`}
                    >
                      <FormattedMarkdownMessage content={messageText} />
                    </div>
                  )}

                  {msg.role === 'assistant' && !hasCards && cleanDisplayContent(msg.content) && (
                    <button
                      onClick={() => {
                        const textToCopy = cleanDisplayContent(msg.content);
                        navigator.clipboard.writeText(textToCopy);
                        setCopiedMessageId(msg.id);
                        setTimeout(() => setCopiedMessageId(null), 2000);
                      }}
                      className="self-start text-[10px] font-semibold text-slate-400 hover:text-purple-300 flex items-center gap-1 bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700/50 px-2.5 py-1 rounded-lg transition"
                      title="Copiar texto da resposta"
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

                  {/* Bloco de Cards Arrastáveis EXPANDIDO (Tamanho Duplo) */}
                  {hasCards && (
                    <div className="bg-slate-950/95 border border-purple-500/50 rounded-2xl p-4 flex flex-col gap-3.5 shadow-2xl mt-1">
                      <div className="flex items-center justify-between border-b border-purple-900/50 pb-2.5">
                        <div className="flex items-center gap-2 text-purple-200 text-xs font-bold">
                          <Sparkles className="w-4 h-4 text-purple-400" />
                          <span>Cards de Conteúdo Interativos ({planToDisplay.length})</span>
                        </div>
                        <span className="text-[10px] text-purple-300 bg-purple-950 px-2.5 py-1 rounded-lg border border-purple-800 flex items-center gap-1 font-mono shadow-sm">
                          <GripVertical className="w-3.5 h-3.5 text-purple-400" />
                          <span>Arraste para o Calendário</span>
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 font-medium">
                        Arraste qualquer um dos cards de conteúdo abaixo e solte diretamente no dia desejado do seu calendário ao lado:
                      </p>

                      {/* Container dos Cards com DOBRO da altura para fácil navegação */}
                      <div className="flex flex-col gap-4 max-h-[720px] overflow-y-auto scrollbar-thin pr-1">
                        {planToDisplay.map((varItem, idx) => {
                          const cardId = varItem.id || `var_${idx}`;
                          const slides = getSlidesForIdea(varItem, profile, carousels);
                          const currentSlideIdx = cardSlideIndexMap[cardId] || 0;
                          const isCaptionExpanded = expandedCaptionMap[cardId] ?? true;

                          return (
                            <div
                              key={cardId}
                              draggable={true}
                              onDragStart={(e) => handleDragStart(varItem, e)}
                              className="bg-slate-900 border border-slate-700/90 hover:border-purple-500 rounded-2xl p-4 flex flex-col gap-3.5 transition cursor-grab active:cursor-grabbing group shadow-md hover:shadow-glow relative select-none"
                            >
                              {/* Header do Card com Titulo e Contagem de Slides */}
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="p-2 bg-purple-500/20 rounded-xl text-purple-300 group-hover:bg-purple-600 group-hover:text-white transition shrink-0">
                                    <GripVertical className="w-4.5 h-4.5" />
                                  </div>
                                  <h4 className="text-sm font-black text-white leading-tight truncate">
                                    {varItem.title}
                                  </h4>
                                </div>
                                <span className="text-xs bg-slate-800 text-indigo-300 font-mono px-2.5 py-1 rounded-lg shrink-0 border border-slate-700 font-bold">
                                  {slides.length} slides
                                </span>
                              </div>

                              {varItem.description && (
                                <p className="text-xs text-slate-300 italic font-medium leading-relaxed bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                                  {varItem.description}
                                </p>
                              )}

                              {/* MOCKUP DO INSTAGRAM FEED PREVIEW (MOCKUP REALISTA DO INSTAGRAM FEED SEM ESPAÇO MORTO) */}
                              <div className="w-full bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden flex flex-col shadow-2xl transition-all">
                                {/* Cabeçalho do Perfil do Instagram */}
                                <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-800/80 bg-slate-900/90">
                                  <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full p-[1.5px] bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600">
                                      <img
                                        src={profile?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
                                        alt={profile?.name || 'Perfil'}
                                        className="w-full h-full rounded-full object-cover border border-slate-900"
                                      />
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-[11px] font-bold text-slate-100 leading-tight">
                                        {profile?.handle || profile?.name?.toLowerCase().replace(/\s+/g, '') || '@criador'}
                                      </span>
                                      <span className="text-[9px] text-slate-400">Instagram Feed Preview</span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-mono text-purple-300 bg-purple-950/80 px-2 py-0.5 rounded-md border border-purple-800 font-bold">
                                      Slide {currentSlideIdx + 1}/{slides.length}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenPreview(varItem)}
                                      className="text-slate-400 hover:text-white text-[10px] font-semibold px-2 py-0.5 bg-slate-800/80 hover:bg-slate-700 rounded-lg border border-slate-700 transition"
                                      title="Ampliar em tela cheia"
                                    >
                                      Ampliar 🔍
                                    </button>
                                  </div>
                                </div>

                                {/* SLIDE VISUAL COMPACTO SEM ESPAÇO MORTO / ZERO LETTERBOXING */}
                                <div className="relative w-full h-[340px] bg-slate-950 flex items-center justify-center overflow-hidden border-b border-slate-800/80">
                                  {slides[currentSlideIdx] && (
                                    <div className="transform scale-[0.57] sm:scale-[0.59] transition-all origin-center">
                                      <SlideCanvas
                                        slide={slides[currentSlideIdx]}
                                        profile={profile}
                                        aspectRatio="4:5"
                                      />
                                    </div>
                                  )}

                                  {/* Setas de Navegação de Slides */}
                                  {slides.length > 1 && (
                                    <>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setCardSlideIndexMap((prev) => ({
                                            ...prev,
                                            [cardId]: Math.max(0, currentSlideIdx - 1),
                                          }));
                                        }}
                                        disabled={currentSlideIdx === 0}
                                        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-900/90 hover:bg-purple-600 disabled:opacity-20 text-white flex items-center justify-center shadow-xl border border-slate-700/80 z-20 transition"
                                      >
                                        <ChevronLeft className="w-5 h-5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setCardSlideIndexMap((prev) => ({
                                            ...prev,
                                            [cardId]: Math.min(slides.length - 1, currentSlideIdx + 1),
                                          }));
                                        }}
                                        disabled={currentSlideIdx === slides.length - 1}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-900/90 hover:bg-purple-600 disabled:opacity-20 text-white flex items-center justify-center shadow-xl border border-slate-700/80 z-20 transition"
                                      >
                                        <ChevronRight className="w-5 h-5" />
                                      </button>
                                    </>
                                  )}
                                </div>

                                {/* RECOMENDAÇÃO DE FOTO DO SLIDE ATUAL (SE HOUVER) */}
                                {varItem.slidesContent?.[currentSlideIdx]?.imageDescription && (
                                  <div className="px-3 py-1.5 bg-indigo-950/60 border-t border-b border-indigo-900/40 text-[10px] text-indigo-200 flex items-center gap-1.5">
                                    <Camera className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                                    <span className="font-semibold leading-tight">
                                      {varItem.slidesContent[currentSlideIdx].imageDescription}
                                    </span>
                                  </div>
                                )}

                                {/* BARRA DE AÇÕES DO INSTAGRAM (LIKES, PONTINHOS DO CARROSSEL) */}
                                <div className="flex items-center justify-between px-3.5 py-2 bg-slate-900 border-t border-slate-800/60">
                                  <div className="flex items-center gap-3 text-slate-300">
                                    <Heart className="w-4 h-4 hover:text-red-500 cursor-pointer transition" />
                                    <MessageCircle className="w-4 h-4 hover:text-indigo-400 cursor-pointer transition" />
                                    <Send className="w-4 h-4 hover:text-purple-400 cursor-pointer transition" />
                                  </div>

                                  {/* Pontinhos Indicadores do Carrossel */}
                                  {slides.length > 1 && (
                                    <div className="flex items-center gap-1">
                                      {slides.map((_, sIdx) => (
                                        <span
                                          key={sIdx}
                                          className={`w-1.5 h-1.5 rounded-full transition-all ${
                                            sIdx === currentSlideIdx ? 'bg-purple-400 scale-125' : 'bg-slate-700'
                                          }`}
                                        />
                                      ))}
                                    </div>
                                  )}

                                  <Bookmark className="w-4 h-4 text-slate-400 hover:text-white cursor-pointer transition" />
                                </div>

                                {/* NATIVE INSTAGRAM CAPTION SECTION (LEGENDA GLOBAL COM HASHTAGS DIRETO ABAIXO DO POST) */}
                                <div className="px-3.5 pb-3.5 pt-1.5 flex flex-col gap-2 bg-slate-900 border-t border-slate-800/40">
                                  <div className="flex items-center justify-between">
                                    <button
                                      type="button"
                                      onClick={() => setExpandedCaptionMap((prev) => ({ ...prev, [cardId]: !isCaptionExpanded }))}
                                      className="flex items-center gap-1.5 text-purple-300 hover:text-purple-200 text-[11px] font-bold"
                                    >
                                      <FileText className="w-3.5 h-3.5 text-purple-400" />
                                      <span>Legenda Global da Publicação</span>
                                      <span className="text-[10px] text-purple-400/80 font-mono">
                                        ({isCaptionExpanded ? '🔼 Ocultar' : '🔽 Exibir'})
                                      </span>
                                    </button>

                                    {varItem.caption && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          navigator.clipboard.writeText(varItem.caption || '');
                                          setCopiedCaptionCardId(cardId);
                                          setTimeout(() => setCopiedCaptionCardId(null), 2000);
                                        }}
                                        className="text-[10px] font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 px-2 py-0.5 rounded-lg transition flex items-center gap-1 shrink-0"
                                        title="Copiar legenda completa"
                                      >
                                        {copiedCaptionCardId === cardId ? (
                                          <>
                                            <Check className="w-3 h-3 text-emerald-400" />
                                            <span className="text-emerald-300">Copiado!</span>
                                          </>
                                        ) : (
                                          <>
                                            <Copy className="w-3 h-3 text-purple-400" />
                                            <span>Copiar Legenda</span>
                                          </>
                                        )}
                                      </button>
                                    )}
                                  </div>

                                {isCaptionExpanded && (
                                  <div className="bg-slate-950/80 border border-slate-800/90 p-3 rounded-xl text-xs text-slate-200 font-sans leading-relaxed max-h-[160px] overflow-y-auto scrollbar-thin select-text whitespace-pre-wrap">
                                    <strong className="text-white font-bold mr-1.5">
                                      {profile?.handle || profile?.name?.toLowerCase().replace(/\s+/g, '') || '@criador'}
                                    </strong>
                                    {varItem.caption ? (
                                      varItem.caption.split(/(\s+)/).map((part, pIdx) => (
                                        part.startsWith('#') ? (
                                          <span key={pIdx} className="text-sky-400 font-medium hover:underline cursor-pointer">
                                            {part}
                                          </span>
                                        ) : part
                                      ))
                                    ) : (
                                      <span className="text-slate-500 italic">Legenda global sendo gerada pela IA...</span>
                                    )}
                                  </div>
                                )}
                                </div>
                              </div>

                              {/* RODAPÉ DO CARD: DRAG & AGENDAR EM 1º VAGO */}
                              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                                <span className="text-slate-400 font-mono flex items-center gap-1.5 text-[11px]">
                                  <Move className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                                  <span>Arraste para o dia livre</span>
                                </span>

                                <button
                                  type="button"
                                  onClick={() => handleQuickScheduleFirstEmptyDay(varItem)}
                                  className="px-3 py-1.5 bg-purple-900/70 hover:bg-purple-600 text-purple-100 hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-purple-700/60 shadow-sm"
                                  title="Agendar no primeiro dia livre do calendário"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Agendar em 1º vago</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <span className="text-[9px] text-slate-500 font-mono px-1">
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

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

        {/* Form de Envio com Comando de Voz (PT/EN) e Textarea Multilinha */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (isListening) stopListening();
            handleSendMessage();
          }}
          className="p-3 border-t border-slate-800 bg-slate-900 flex items-end gap-2 shrink-0"
        >
          {/* Seletor Rápido de Idioma da Voz (PT / EN) */}
          <button
            type="button"
            onClick={() => changeLanguage(selectedLang === 'pt-BR' ? 'en-US' : 'pt-BR')}
            title={`Idioma atual da voz: ${selectedLang === 'pt-BR' ? 'Português (pt-BR)' : 'Inglês (en-US)'}. Clique para alterar.`}
            className="h-10 px-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-[11px] font-mono font-bold flex items-center gap-1 shrink-0 transition"
          >
            <span>{selectedLang === 'pt-BR' ? '🇧🇷 PT' : '🇺🇸 EN'}</span>
          </button>

          <textarea
            rows={1}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (isListening) stopListening();
                handleSendMessage();
              }
            }}
            placeholder={
              isListening
                ? `🎙️ Ouvindo em ${selectedLang === 'pt-BR' ? 'Português' : 'Inglês'}... Fale agora.`
                : "Converse com seu Estrategista IA... (Shift + Enter para quebrar linha)"
            }
            disabled={isLoading}
            className={`flex-1 bg-slate-950 border rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium resize-none max-h-32 min-h-[42px] scrollbar-thin transition-all ${
              isListening
                ? 'border-red-500/80 ring-2 ring-red-500/30 bg-red-950/10'
                : 'border-slate-800'
            }`}
          />

          {/* Botão de Microfone (Digitação por Voz) */}
          <button
            type="button"
            onClick={handleToggleMic}
            disabled={isLoading || !isSupported}
            title={
              !isSupported
                ? 'Reconhecimento de voz não é suportado neste navegador (use Chrome/Edge/Safari)'
                : isListening
                ? 'Clique para parar a gravação de voz'
                : `Digitar por voz em ${selectedLang === 'pt-BR' ? 'Português (pt-BR)' : 'Inglês (en-US)'}`
            }
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition shrink-0 ${
              isListening
                ? 'bg-red-600 hover:bg-red-500 text-white animate-pulse shadow-glow border border-red-400'
                : 'bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 border border-slate-700'
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-purple-400" />}
          </button>

          {/* Botão de Enviar */}
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="w-10 h-10 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white flex items-center justify-center transition shadow-glow shrink-0"
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
                {ideas.length} {ideas.length === 1 ? 'conteúdo planejado' : 'conteúdos planejados'} (máx. 1 por dia)
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

        {/* Grid do Mês (Zonas de Soltura para Drag & Drop) */}
        <div className="grid grid-cols-7 gap-2 flex-1 auto-rows-fr min-h-[450px]">
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty_${i}`} className="bg-slate-900/20 border border-slate-900/50 rounded-xl p-1 opacity-40 min-h-[95px]" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const dayIdeas = ideas.filter((idea) => idea.date === formattedDate);
            const hasIdea = dayIdeas.length > 0;
            const isToday =
              new Date().getDate() === dayNum &&
              new Date().getMonth() === month &&
              new Date().getFullYear() === year;

            const isDraggingOver = dragOverDate === formattedDate;

            return (
              <div
                key={`day_${dayNum}`}
                onDragOver={(e) => handleDragOverDate(formattedDate, e)}
                onDragEnter={(e) => handleDragEnterDate(formattedDate, e)}
                onDragLeave={(e) => handleDragLeaveDate(formattedDate, e)}
                onDrop={(e) => handleDropOnDate(formattedDate, e)}
                className={`rounded-xl p-1 flex flex-col justify-between transition min-h-[120px] relative group overflow-hidden border ${
                  isDraggingOver
                    ? hasIdea
                      ? 'border-red-500 bg-red-950/40 ring-2 ring-red-500/50'
                      : 'border-purple-500 bg-purple-950/40 ring-2 ring-purple-500/60 scale-[1.02]'
                    : isToday
                    ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-slate-900'
                    : 'bg-slate-900/90 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* Cabeçalho do Dia (Número do Dia) */}
                <div className="flex items-center justify-between w-full px-1 pt-0.5 pb-1 shrink-0">
                  <span
                    className={`text-xs font-extrabold px-1.5 py-0.5 rounded-md ${
                      isToday ? 'bg-indigo-600 text-white shadow-glow' : 'text-slate-400'
                    }`}
                  >
                    {dayNum}
                  </span>
                </div>

                {/* Conteúdo Agendado (Card Branco Estilo Slide Real do Studio - Abertura de Modal em Clique) */}
                {hasIdea ? (
                  (() => {
                    const idea = dayIdeas[0];
                    const existingCarousel = idea.carouselId ? carousels.find((c) => c.id === idea.carouselId) : null;
                    const totalSlides = existingCarousel ? existingCarousel.slides.length : (idea.recommendedSlideCount || idea.slidesContent?.length || 4);
                    const coverText = existingCarousel?.slides?.[0]?.layers?.text?.[0]?.content?.replace(/<[^>]*>/g, '') || idea.slidesContent?.[0]?.bodyText || idea.description;

                    return (
                      <div
                        onClick={() => handleOpenPreview(idea)}
                        className="w-full flex-1 bg-white hover:bg-slate-50 text-slate-900 border border-slate-200/90 rounded-xl p-2.5 flex flex-col justify-between transition-all cursor-pointer group shadow-md hover:shadow-xl hover:scale-[1.01] relative overflow-hidden"
                        title="Clique para abrir a pré-visualização completa em modal"
                      >
                        {/* Topo do Mini-Slide: Avatar & Nome do Usuário */}
                        <div className="flex items-center justify-between border-b border-slate-100 pb-1 mb-1">
                          <div className="flex items-center gap-1.5">
                            <img
                              src={profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                              alt={profile.name}
                              className="w-4 h-4 rounded-full object-cover border border-indigo-500"
                            />
                            <span className="text-[9px] font-bold text-slate-800 max-w-[70px] truncate">
                              {profile.name || 'Bliip'}
                            </span>
                          </div>
                        </div>

                        {/* Título / Assunto em Destaque no Meio */}
                        <div className="flex-1 flex flex-col justify-center">
                          <h4 className="text-[10px] font-black text-slate-900 leading-tight line-clamp-2 mb-1">
                            {idea.title}
                          </h4>

                          {/* Resumo do Gancho */}
                          {coverText && (
                            <p className="text-[9px] text-slate-600 italic line-clamp-2 bg-slate-50 p-1.5 rounded-lg border border-slate-100 font-medium leading-tight">
                              "{coverText}"
                            </p>
                          )}
                        </div>

                        {/* Rodapé do Card: Badge de Slides na Parte de Baixo sem Colisão com Lixeira */}
                        <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between mt-1">
                          <span className="text-[8.5px] font-mono font-bold bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded-md border border-indigo-200/80">
                            📄 {totalSlides} slides
                          </span>

                          <span className="text-[8px] font-semibold text-slate-400 group-hover:text-purple-600 transition flex items-center gap-0.5">
                            🔍 Abrir
                          </span>
                        </div>

                        {/* Botão de Excluir Fixo no Topo Direito */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteIdea(idea.id);
                          }}
                          className="absolute top-1.5 right-1.5 p-1 bg-white/90 text-slate-400 hover:text-red-600 rounded-md opacity-0 group-hover:opacity-100 transition shadow-sm border border-slate-200"
                          title="Excluir do Calendário"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })()
                ) : (
                  <div className="w-full flex-1 flex flex-col items-center justify-center border border-dashed border-slate-800/60 rounded-xl opacity-40 group-hover:opacity-80 transition text-[9px] text-slate-500 font-mono min-h-[60px]">
                    <span>+ Solte aqui</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL DE PRÉ-VISUALIZAÇÃO EM ALTA FIDELIDADE (ABRE AO CLICAR E FECHA AO CLICAR FORA) */}
      {previewIdea && (
        <div
          onClick={() => setPreviewIdea(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-150 select-none cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl relative flex flex-col items-center gap-4 max-w-xl w-full cursor-default"
          >
            {/* Botão X de Fechamento */}
            <button
              onClick={() => setPreviewIdea(null)}
              className="absolute top-4 right-4 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition border border-slate-700"
              title="Fechar (ou clique fora)"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header do Modal */}
            <div className="w-full flex items-center justify-between border-b border-slate-800 pb-3 pr-10">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-extrabold text-white leading-tight">
                  {previewIdea.idea.title}
                </h3>
              </div>

              <button
                onClick={() => {
                  onCreateCarouselFromIdea(previewIdea.idea);
                  setPreviewIdea(null);
                }}
                className="px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold transition shadow-glow flex items-center gap-1.5 transform hover:scale-[1.02]"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                <span>⚡ Editar no Bliip Studio</span>
              </button>
            </div>

            {/* Área Central de Visualização Fiel do Slide + Setas Laterais */}
            <div className="relative w-full flex items-center justify-center py-2 min-h-[380px]">
              {/* Seta Esquerda (‹) */}
              <button
                onClick={() => setPreviewSlideIdx((prev) => Math.max(0, prev - 1))}
                disabled={previewSlideIdx === 0}
                className="absolute left-2 z-20 p-2.5 bg-slate-800/90 hover:bg-purple-600 disabled:opacity-30 text-white rounded-full transition border border-slate-700 shadow-xl"
                title="Slide Anterior (ou Seta Esquerda ← do teclado)"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Render do Slide Fiel ao Studio em Escala */}
              <div className="transform scale-[0.65] md:scale-75 transition-all origin-center">
                {previewIdea.slides[previewSlideIdx] && (
                  <SlideCanvas
                    slide={previewIdea.slides[previewSlideIdx]}
                    profile={profile}
                    aspectRatio="4:5"
                  />
                )}
              </div>

              {/* Seta Direita (›) */}
              <button
                onClick={() => setPreviewSlideIdx((prev) => Math.min(previewIdea.slides.length - 1, prev + 1))}
                disabled={previewSlideIdx === previewIdea.slides.length - 1}
                className="absolute right-2 z-20 p-2.5 bg-slate-800/90 hover:bg-purple-600 disabled:opacity-30 text-white rounded-full transition border border-slate-700 shadow-xl"
                title="Próximo Slide (ou Seta Direita → do teclado)"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Rodapé: Paginação e Dica */}
            <div className="w-full flex flex-col gap-2 border-t border-slate-800 pt-3 text-xs text-slate-400">
              {previewIdea.idea.slidesContent?.[previewSlideIdx]?.imageDescription && (
                <div className="w-full bg-slate-900/90 border border-indigo-500/60 p-2.5 rounded-xl text-xs text-indigo-200 flex items-center gap-2 shadow-lg animate-in fade-in duration-200">
                  <Camera className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span className="font-semibold leading-tight">
                    {previewIdea.idea.slidesContent[previewSlideIdx].imageDescription}
                  </span>
                </div>
              )}

              <div className="w-full flex items-center justify-between">
                <span className="font-mono text-purple-300 bg-purple-950/80 px-2.5 py-1 rounded-lg border border-purple-800 font-bold">
                  Slide {previewSlideIdx + 1} de {previewIdea.slides.length}
                </span>

                <span className="text-[11px] text-slate-400 font-mono">
                  Navegue com ← e → • Clique fora ou ESC para fechar
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
