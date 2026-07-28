import React, { useState, useEffect } from 'react';
import { Carousel, UserProfile } from '@/types/carousel';
import { AVAILABLE_SOCIAL_FORMATS } from '@/types/socialFormats';
import { exportElementToPng, downloadDataUrl, exportCarouselToZip, triggerWebhookIntegration, publishToBufferApi } from '@/lib/exporter';
import { loadIntegrations } from '@/lib/storage';
import { ChannelPublishResult } from '@/lib/publishers/PublishingAdapter';
import { X, Download, Archive, Send, Loader2, CheckCircle2, Share2, Layers, Calendar, Clock, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  carousel: Carousel;
  carousels?: Carousel[];
  profile: UserProfile;
  activeSlideElement: HTMLElement | null;
  allSlideElements: HTMLElement[];
  onMarkAsSent?: () => void;
  onScheduleCarousel?: (carouselId: string, scheduledAt: string) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  carousel,
  carousels = [],
  profile,
  activeSlideElement,
  allSlideElements,
  onMarkAsSent,
  onScheduleCarousel,
}) => {
  const [selectedFormatId, setSelectedFormatId] = useState<string>(() => 
    carousel?.slides?.length <= 1 ? 'instagram_post' : 'instagram_carousel'
  );
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [isExportingSingle, setIsExportingSingle] = useState(false);
  const [isSendingWebhook, setIsSendingWebhook] = useState(false);
  const [isPublishingBuffer, setIsPublishingBuffer] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [channelResults, setChannelResults] = useState<ChannelPublishResult[]>([]);

  // Estados do Agendamento e Calendário Editorial
  const [activeTab, setActiveTab] = useState<'schedule' | 'now' | 'download'>('schedule');
  
  // Data inicial do calendário (se já estiver agendado, usa a data do agendamento)
  const initialDate = carousel?.scheduledAt ? new Date(carousel.scheduledAt) : new Date();
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(initialDate);
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
  
  // Hora do agendamento (ex: "10:00")
  const initialTime = carousel?.scheduledAt 
    ? `${String(new Date(carousel.scheduledAt).getHours()).padStart(2, '0')}:${String(new Date(carousel.scheduledAt).getMinutes()).padStart(2, '0')}`
    : '10:00';
  const [selectedTime, setSelectedTime] = useState<string>(initialTime);

  useEffect(() => {
    if (isOpen) {
      if (carousel?.slides?.length <= 1) {
        setSelectedFormatId('instagram_post');
      } else {
        setSelectedFormatId('instagram_carousel');
      }
      setStatusMessage(null);
      setChannelResults([]);
      
      if (carousel?.scheduledAt) {
        const d = new Date(carousel.scheduledAt);
        setSelectedDate(d);
        setCurrentMonthDate(d);
        setSelectedTime(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`);
      }
    }
  }, [isOpen, carousel]);

  if (!isOpen) return null;

  const currentFormat = AVAILABLE_SOCIAL_FORMATS.find((f) => f.id === selectedFormatId) || AVAILABLE_SOCIAL_FORMATS[0];
  const activeChannels = carousel.selectedChannels || ['instagram', 'linkedin'];

  // --- LÓGICA DO CALENDÁRIO MENSAL ---
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth(); // 0 - 11

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 (Dom) a 6 (Sáb)
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  // Mapeamento dos posts agendados do projeto por dia do mês atual
  const scheduledPostsByDay: Record<number, Carousel[]> = {};
  carousels.forEach((c) => {
    if (c.scheduledAt && c.status === 'scheduled') {
      const d = new Date(c.scheduledAt);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const dayNum = d.getDate();
        if (!scheduledPostsByDay[dayNum]) scheduledPostsByDay[dayNum] = [];
        scheduledPostsByDay[dayNum].push(c);
      }
    }
  });

  // Monta a data final ISO com a hora selecionada
  const getScheduledIsoString = (): string => {
    const [hours, minutes] = selectedTime.split(':').map(Number);
    const targetDate = new Date(selectedDate);
    targetDate.setHours(hours || 10, minutes || 0, 0, 0);
    return targetDate.toISOString();
  };

  // Baixar Slide Atual
  const handleExportSingle = async () => {
    if (!activeSlideElement) {
      alert('Slide não encontrado para exportação.');
      return;
    }
    try {
      setIsExportingSingle(true);
      setStatusMessage('Renderizando PNG de alta qualidade...');
      const dataUrl = await exportElementToPng(activeSlideElement, 'slide.png');
      downloadDataUrl(dataUrl, `${carousel.name.toLowerCase().replace(/\s+/g, '_')}_slide.png`);
      setStatusMessage('Slide exportado com sucesso!');
      onMarkAsSent?.();
    } catch (err) {
      console.error(err);
      setStatusMessage('Erro ao renderizar slide.');
    } finally {
      setIsExportingSingle(false);
    }
  };

  // Baixar Todos em ZIP
  const handleExportZip = async () => {
    if (!allSlideElements.length) return;
    try {
      setIsExportingZip(true);
      setStatusMessage('Gerando PNGs de todos os slides e criando pacote ZIP...');
      const zipBlob = await exportCarouselToZip(carousel, allSlideElements);
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(zipBlob);
      link.download = `${carousel.name.toLowerCase().replace(/\s+/g, '_')}_carrossel.zip`;
      link.click();
      setStatusMessage('Carrossel completo (.ZIP) exportado!');
      onMarkAsSent?.();
    } catch (err) {
      console.error(err);
      setStatusMessage('Erro ao exportar carrossel em ZIP.');
    } finally {
      setIsExportingZip(false);
    }
  };

  // Publicar / Agendar via API Oficial do Buffer
  const handlePublishBuffer = async (isScheduled: boolean = false) => {
    if (!activeSlideElement) return;
    setChannelResults([]);
    try {
      setIsPublishingBuffer(true);
      const scheduledIso = isScheduled ? getScheduledIsoString() : undefined;

      if (isScheduled) {
        const formattedDateStr = selectedDate.toLocaleDateString('pt-BR');
        setStatusMessage(`Agendando rascunho no Buffer para ${formattedDateStr} às ${selectedTime}...`);
      } else {
        setStatusMessage(`Renderizando ${allSlideElements.length || 1} slide(s)...`);
      }

      const config = await loadIntegrations();

      if (!config.bufferApiKey) {
        setStatusMessage('Por favor, insira a chave da API do Buffer no modal de integrações.');
        setIsPublishingBuffer(false);
        return;
      }

      const mediaUrls: string[] = [];
      const slidesToProcess = allSlideElements.length > 0 ? allSlideElements : (activeSlideElement ? [activeSlideElement] : []);

      for (let i = 0; i < slidesToProcess.length; i++) {
        const el = slidesToProcess[i];
        if (el) {
          const url = await exportElementToPng(el, `slide_${i + 1}.png`);
          if (url && url.length > 100) {
            mediaUrls.push(url);
          }
        }
      }

      setStatusMessage(`Enviando para o Buffer (${activeChannels.map(c => c.toUpperCase()).join(', ')})...`);
      
      const res = await publishToBufferApi(
        { ...carousel, scheduledAt: scheduledIso },
        profile,
        config,
        mediaUrls,
        {
          postType: currentFormat.postType,
          network: currentFormat.network,
        }
      );

      setStatusMessage(res.message);
      if (res.channelResults) {
        setChannelResults(res.channelResults);
      }

      if (res.success) {
        if (isScheduled && scheduledIso) {
          onScheduleCarousel?.(carousel.id, scheduledIso);
          setStatusMessage(`✅ Conteúdo agendado com sucesso para ${selectedDate.toLocaleDateString('pt-BR')} às ${selectedTime}!`);
        } else {
          onMarkAsSent?.();
        }
      }
    } catch (err) {
      console.error(err);
      setStatusMessage('Erro ao comunicar com o Buffer.');
    } finally {
      setIsPublishingBuffer(false);
    }
  };

  // Enviar para Webhook
  const handleSendWebhook = async () => {
    try {
      setIsSendingWebhook(true);
      setStatusMessage('Renderizando slides e enviando webhook para Buffer / Make.com...');
      const config = await loadIntegrations();
      
      if (!config.bufferWebhookUrl && !config.makeWebhookUrl) {
        setStatusMessage('Por favor, configure a URL de Webhook primeiro.');
        setIsSendingWebhook(false);
        return;
      }

      const pngDataUrls: string[] = [];
      for (const el of allSlideElements) {
        if (el) {
          const url = await exportElementToPng(el, 'slide.png');
          pngDataUrls.push(url);
        }
      }

      const res = await triggerWebhookIntegration(carousel, profile, config, pngDataUrls);
      setStatusMessage(res.message);
      if (res.success) {
        onMarkAsSent?.();
      }
    } catch (err) {
      console.error(err);
      setStatusMessage('Erro ao disparar integração via webhook.');
    } finally {
      setIsSendingWebhook(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto scrollbar-thin flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-extrabold text-white mb-1 flex items-center gap-2">
          <span>Exportar / Publicar Conteúdo</span>
        </h2>
        <p className="text-xs text-slate-400 mb-4">
          Agende a publicação com calendário editorial ou exporte em alta resolução.
        </p>

        {/* Abas de Modo: 🗓️ Agendar no Calendário | 🚀 Publicar Agora | 💾 Baixar Arquivos */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 mb-4">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
              activeTab === 'schedule'
                ? 'bg-purple-600 text-white shadow-glow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Calendário & Agendar</span>
          </button>
          <button
            onClick={() => setActiveTab('now')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
              activeTab === 'now'
                ? 'bg-indigo-600 text-white shadow-glow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Publicar Agora</span>
          </button>
          <button
            onClick={() => setActiveTab('download')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
              activeTab === 'download'
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Baixar Arquivos</span>
          </button>
        </div>

        {/* Seletor Dinâmico de Formatos Redes Sociais */}
        <div className="mb-4 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Formato do Conteúdo</span>
          </label>

          <select
            value={selectedFormatId}
            onChange={(e) => setSelectedFormatId(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {AVAILABLE_SOCIAL_FORMATS.map((fmt) => (
              <option key={fmt.id} value={fmt.id}>
                {fmt.name} {fmt.badge ? `(${fmt.badge})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* MENSAGEM DE STATUS DA PUBLICAÇÃO */}
        {statusMessage && (
          <div className="mb-4 p-3 bg-indigo-950/80 border border-indigo-500/40 rounded-xl text-indigo-200 text-xs font-medium flex flex-col gap-2 shadow-inner">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>{statusMessage}</span>
            </div>

            {/* RELATÓRIO INDIVIDUAL POR REDE SOCIAL */}
            {channelResults.length > 0 && (
              <div className="flex flex-col gap-1.5 pt-2 border-t border-indigo-500/20">
                {channelResults.map((r, idx) => (
                  <div
                    key={idx}
                    className={`p-2 rounded-lg text-xs font-semibold flex items-center justify-between ${
                      r.success
                        ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
                        : 'bg-red-950/60 border border-red-500/40 text-red-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{r.success ? '✅' : '⚠️'}</span>
                      <span className="uppercase tracking-wider text-[11px] font-bold">{r.channel}</span>
                      {r.channelName && <span className="text-[10px] text-slate-400">({r.channelName})</span>}
                    </div>
                    <span className="text-[10px] truncate max-w-[200px]">{r.message}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ABA 1: CALENDÁRIO EDITORIAL & AGENDAMENTO */}
        {activeTab === 'schedule' && (
          <div className="flex flex-col gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold text-slate-200">Agenda Editorial de Publicações</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevMonth}
                  className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  title="Mês Anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <span className="text-xs font-extrabold text-white font-mono min-w-[100px] text-center">
                  {monthNames[month]} {year}
                </span>

                <button
                  onClick={handleNextMonth}
                  className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  title="Próximo Mês"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Grid do Calendário Mensal */}
            <div className="grid grid-cols-7 gap-1 text-center border-t border-slate-800/80 pt-2">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((dayName) => (
                <div key={dayName} className="text-[10px] font-extrabold text-slate-400 uppercase py-1">
                  {dayName}
                </div>
              ))}

              {/* Espaços em branco antes do 1º dia do mês */}
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`empty_${i}`} className="h-10 rounded-lg bg-slate-950/30" />
              ))}

              {/* Dias do mês */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const isSelected =
                  selectedDate.getDate() === dayNum &&
                  selectedDate.getMonth() === month &&
                  selectedDate.getFullYear() === year;

                const scheduledItems = scheduledPostsByDay[dayNum] || [];
                const isToday =
                  new Date().getDate() === dayNum &&
                  new Date().getMonth() === month &&
                  new Date().getFullYear() === year;

                return (
                  <button
                    key={dayNum}
                    onClick={() => {
                      const d = new Date(year, month, dayNum);
                      setSelectedDate(d);
                    }}
                    className={`h-11 rounded-xl border p-1 flex flex-col items-center justify-between transition relative overflow-hidden ${
                      isSelected
                        ? 'bg-purple-600/30 border-purple-500 text-white font-bold ring-2 ring-purple-400'
                        : isToday
                        ? 'bg-indigo-950/40 border-indigo-500/50 text-indigo-200'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <span className="text-[11px] leading-none font-semibold">{dayNum}</span>

                    {/* Indicadores de Posts Agendados no Dia */}
                    {scheduledItems.length > 0 ? (
                      <div
                        className="w-full bg-purple-500/30 border border-purple-400/50 text-purple-200 text-[8px] font-bold rounded px-0.5 truncate flex items-center justify-center gap-0.5"
                        title={scheduledItems.map(c => `${c.name} (${new Date(c.scheduledAt!).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })})`).join(', ')}
                      >
                        <span>🗓️</span>
                        <span>{scheduledItems.length} post(s)</span>
                      </div>
                    ) : (
                      <span className="text-[8px] text-slate-600 font-mono">Livre</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Seletor de Hora */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-semibold text-slate-300">Horário da Publicação:</span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {['09:00', '12:00', '15:00', '18:00', '21:00'].map((timePreset) => (
                  <button
                    key={timePreset}
                    onClick={() => setSelectedTime(timePreset)}
                    className={`px-2 py-1 text-[10px] font-bold rounded-lg transition ${
                      selectedTime === timePreset
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {timePreset}
                  </button>
                ))}

                <input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Resumo da Seleção & Botão de Agendamento no Buffer */}
            <div className="p-3 bg-purple-950/40 border border-purple-500/30 rounded-xl flex flex-col gap-2">
              <div className="text-xs text-purple-200 font-medium flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>
                  Post agendado para{' '}
                  <strong className="font-extrabold text-white underline decoration-purple-400">
                    {selectedDate.toLocaleDateString('pt-BR')} às {selectedTime}
                  </strong>
                </span>
              </div>

              <button
                onClick={() => handlePublishBuffer(true)}
                disabled={isExportingZip || isExportingSingle || isSendingWebhook || isPublishingBuffer}
                className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-600 hover:from-purple-500 hover:to-indigo-500 text-white p-3.5 rounded-xl shadow-glow font-bold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {isPublishingBuffer ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Calendar className="w-4 h-4 text-purple-200" />
                )}
                <span>Agendar Rascunho no Buffer para {selectedDate.toLocaleDateString('pt-BR')}</span>
              </button>
            </div>
          </div>
        )}

        {/* ABA 2: PUBLICAR AGORA NO BUFFER */}
        {activeTab === 'now' && (
          <div className="flex flex-col gap-3">
            <button
              onClick={() => handlePublishBuffer(false)}
              disabled={isExportingZip || isExportingSingle || isSendingWebhook || isPublishingBuffer}
              className="w-full bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white p-4 rounded-xl shadow-glow font-semibold text-sm flex items-center justify-between transition disabled:opacity-50"
            >
              <div className="flex items-center gap-3 text-left">
                <Share2 className="w-6 h-6 shrink-0 text-white" />
                <div>
                  <div className="font-bold flex items-center gap-1.5">
                    🚀 Publicar Agora no Buffer
                  </div>
                  <div className="text-xs text-indigo-100 font-normal">
                    Envia simultaneamente para: <strong className="font-bold text-white uppercase">{activeChannels.join(', ')}</strong>
                  </div>
                </div>
              </div>
              {isPublishingBuffer ? <Loader2 className="w-5 h-5 animate-spin" /> : <Share2 className="w-5 h-5" />}
            </button>

            <button
              onClick={handleSendWebhook}
              disabled={isExportingZip || isExportingSingle || isSendingWebhook || isPublishingBuffer}
              className="w-full bg-slate-800/60 hover:bg-slate-700 text-slate-300 p-3.5 rounded-xl border border-slate-700/60 font-semibold text-xs flex items-center justify-between transition disabled:opacity-50"
            >
              <div className="flex items-center gap-3 text-left">
                <Send className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-semibold text-slate-200">Disparar via Webhook (Make.com)</div>
                </div>
              </div>
              {isSendingWebhook && <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />}
            </button>
          </div>
        )}

        {/* ABA 3: BAIXAR ARQUIVOS */}
        {activeTab === 'download' && (
          <div className="flex flex-col gap-3">
            <button
              onClick={handleExportZip}
              disabled={isExportingZip || isExportingSingle || isSendingWebhook || isPublishingBuffer}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 p-3.5 rounded-xl border border-slate-700 font-semibold text-xs flex items-center justify-between transition disabled:opacity-50"
            >
              <div className="flex items-center gap-3 text-left">
                <Archive className="w-5 h-5 text-indigo-400 shrink-0" />
                <div>
                  <div className="font-semibold text-white">Baixar Todos os Slides (.ZIP)</div>
                  <div className="text-[11px] text-slate-400 font-normal">
                    Gera todas as {carousel.slides.length} imagens PNG em alta resolução.
                  </div>
                </div>
              </div>
              {isExportingZip ? <Loader2 className="w-4 h-4 animate-spin text-slate-300" /> : <Download className="w-4 h-4 text-slate-400" />}
            </button>

            <button
              onClick={handleExportSingle}
              disabled={isExportingZip || isExportingSingle || isSendingWebhook || isPublishingBuffer}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 p-3 rounded-xl border border-slate-700/80 font-semibold text-xs flex items-center justify-between transition disabled:opacity-50"
            >
              <div className="flex items-center gap-3 text-left">
                <Download className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <div className="font-semibold text-slate-200">Baixar Apenas Slide Atual (PNG)</div>
                </div>
              </div>
              {isExportingSingle && <Loader2 className="w-4 h-4 animate-spin text-slate-300" />}
            </button>
          </div>
        )}

        <div className="mt-5 pt-4 border-t border-slate-800 text-center">
          <button
            onClick={onClose}
            className="text-xs font-semibold text-slate-400 hover:text-white"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
