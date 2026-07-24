import React, { useState, useEffect } from 'react';
import { Carousel, UserProfile } from '@/types/carousel';
import { AVAILABLE_SOCIAL_FORMATS, SocialFormatOption } from '@/types/socialFormats';
import { exportElementToPng, downloadDataUrl, exportCarouselToZip, triggerWebhookIntegration, publishToBufferApi } from '@/lib/exporter';
import { loadIntegrations } from '@/lib/storage';
import { X, Download, Archive, Send, Loader2, CheckCircle2, Share2, Layers } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  carousel: Carousel;
  profile: UserProfile;
  activeSlideElement: HTMLElement | null;
  allSlideElements: HTMLElement[];
  onMarkAsSent?: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  carousel,
  profile,
  activeSlideElement,
  allSlideElements,
  onMarkAsSent,
}) => {
  const [selectedFormatId, setSelectedFormatId] = useState<string>(() => 
    carousel?.slides?.length <= 1 ? 'instagram_post' : 'instagram_carousel'
  );
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [isExportingSingle, setIsExportingSingle] = useState(false);
  const [isSendingWebhook, setIsSendingWebhook] = useState(false);
  const [isPublishingBuffer, setIsPublishingBuffer] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (carousel?.slides?.length <= 1) {
        setSelectedFormatId('instagram_post');
      } else {
        setSelectedFormatId('instagram_carousel');
      }
    }
  }, [isOpen, carousel?.slides?.length]);

  if (!isOpen) return null;

  const currentFormat = AVAILABLE_SOCIAL_FORMATS.find((f) => f.id === selectedFormatId) || AVAILABLE_SOCIAL_FORMATS[0];

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

  // Publicar via API Oficial do Buffer com o formato selecionado
  const handlePublishBuffer = async () => {
    if (!activeSlideElement) return;
    try {
      setIsPublishingBuffer(true);
      setStatusMessage(`Renderizando slides para formato ${currentFormat.name}...`);
      const config = await loadIntegrations();

      if (!config.bufferApiKey) {
        setStatusMessage('Por favor, insira a chave da API do Buffer no modal de integrações.');
        setIsPublishingBuffer(false);
        return;
      }

      if (!config.bufferProfileId) {
        setStatusMessage('Por favor, insira ou selecione o ID do perfil/canal no modal de integrações do Buffer.');
        setIsPublishingBuffer(false);
        return;
      }

      const mediaUrls: string[] = [];

      // Se for formato Carrossel (instagram_carousel ou postType carousel), renderiza TODOS os slides
      if (currentFormat.id === 'instagram_carousel' || currentFormat.postType === 'carousel') {
        const slidesToProcess = allSlideElements.length > 0 ? allSlideElements : (activeSlideElement ? [activeSlideElement] : []);
        setStatusMessage(`Renderizando ${slidesToProcess.length} slides do carrossel...`);

        for (let i = 0; i < slidesToProcess.length; i++) {
          const el = slidesToProcess[i];
          if (el) {
            const url = await exportElementToPng(el, `slide_${i + 1}.png`);
            if (url && url.length > 100) {
              mediaUrls.push(url);
            }
          }
        }
      } else {
        // Post único, Story ou Reels: renderiza o slide ativo ou primeiro slide disponível
        const targetEl = activeSlideElement || allSlideElements[0];
        if (targetEl) {
          const url = await exportElementToPng(targetEl, 'slide.png');
          if (url && url.length > 100) {
            mediaUrls.push(url);
          }
        }
      }

      setStatusMessage(`Publicando via API do Buffer (${currentFormat.name})...`);
      const res = await publishToBufferApi(carousel, profile, config, mediaUrls, {
        postType: currentFormat.postType,
        network: currentFormat.network,
      });

      setStatusMessage(res.message);
      if (res.success) {
        onMarkAsSent?.();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-white mb-1">Exportar / Publicar Conteúdo</h2>
        <p className="text-xs text-slate-400 mb-4">
          Escolha o formato da publicação social e exporte ou publique no Buffer.
        </p>

        {/* Seletor Dinâmico de Formatos Redes Sociais / Instagram */}
        <div className="mb-5 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-2">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Formato do Conteúdo (Publicação)</span>
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
          <p className="text-[11px] text-slate-400 mt-1.5">
            {currentFormat.description}
          </p>
        </div>

        {statusMessage && (
          <div className="mb-5 p-3 bg-indigo-950/70 border border-indigo-500/30 rounded-xl text-indigo-200 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {/* Opção 1: Publicar Direto no Buffer (API Oficial) */}
          <button
            onClick={handlePublishBuffer}
            disabled={isExportingZip || isExportingSingle || isSendingWebhook || isPublishingBuffer}
            className="w-full bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white p-4 rounded-xl shadow-glow font-semibold text-sm flex items-center justify-between transition disabled:opacity-50"
          >
            <div className="flex items-center gap-3 text-left">
              <Share2 className="w-6 h-6 shrink-0 text-white" />
              <div>
                <div className="font-bold flex items-center gap-1.5">
                  Publicar no Buffer ({currentFormat.name})
                </div>
                <div className="text-xs text-indigo-100 font-normal">
                  Publica no Buffer informando o tipo <strong className="font-semibold text-white">{currentFormat.postType}</strong>.
                </div>
              </div>
            </div>
            {isPublishingBuffer ? <Loader2 className="w-5 h-5 animate-spin" /> : <Share2 className="w-5 h-5" />}
          </button>

          {/* Opção 2: Baixar Todos em ZIP */}
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

          {/* Opção 3: Baixar Apenas Slide Atual */}
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

          {/* Opção 4: Webhook Make.com / Buffer Webhook */}
          <button
            onClick={handleSendWebhook}
            disabled={isExportingZip || isExportingSingle || isSendingWebhook || isPublishingBuffer}
            className="w-full bg-slate-800/60 hover:bg-slate-700 text-slate-300 p-3 rounded-xl border border-slate-700/60 font-semibold text-xs flex items-center justify-between transition disabled:opacity-50"
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

        <div className="mt-6 pt-4 border-t border-slate-800 text-center">
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

