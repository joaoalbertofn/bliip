import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Type,
  Image as ImageIcon,
  MessageSquareText,
  Upload,
  FileCode,
  Share2,
  Check,
  Zap,
  Plus,
} from 'lucide-react';
import { BliipVideoTemplate, VerticalVideoProject } from '@/types/video';
import { SocialChannel } from '@/types/carousel';

interface VideoSidebarControlsProps {
  project: VerticalVideoProject;
  availableTemplates: BliipVideoTemplate[];
  onAddTemplate: (template: BliipVideoTemplate) => void;
  onAddImage: (url: string) => void;
  onGenerateSubtitles: () => void;
  onUpdatePostCaption: (caption: string) => void;
  onToggleChannel: (channel: SocialChannel) => void;
  onImportJSONPackage: (jsonString: string) => boolean;
}

export const VideoSidebarControls: React.FC<VideoSidebarControlsProps> = ({
  project,
  availableTemplates,
  onAddTemplate,
  onAddImage,
  onGenerateSubtitles,
  onUpdatePostCaption,
  onToggleChannel,
  onImportJSONPackage,
}) => {
  const [activeTab, setActiveTab] = useState<'titles' | 'subtitles' | 'caption' | 'channels'>('titles');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);

  const titleTemplates = availableTemplates.filter(
    (t) => t.category !== 'subtitle_style' && t.category !== 'hook_3s'
  );
  const hookTemplates = availableTemplates.filter((t) => t.category === 'hook_3s');

  const handleImageFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      onAddImage(url);
    }
  };

  const handleJSONFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          const success = onImportJSONPackage(content);
          if (success) {
            setImportStatus('Pacote JSON importado com sucesso!');
            setTimeout(() => setImportStatus(null), 3000);
          } else {
            setImportStatus('Erro ao ler arquivo JSON.');
            setTimeout(() => setImportStatus(null), 3000);
          }
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="w-full h-full bg-slate-900 border-r border-slate-800 flex flex-col overflow-y-auto text-slate-100 p-4 scrollbar-thin">
      {/* HEADER DA SIDEBAR */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-400">
          <Zap className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-xs font-bold text-white uppercase tracking-wider">PRESETS DE VÍDEO & DESIGN</h2>
          <p className="text-[11px] text-slate-400">Arraste ou clique para adicionar ao canvas 9:16</p>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-slate-950 rounded-2xl border border-slate-800 mb-4 text-[11px] font-bold">
        <button
          onClick={() => setActiveTab('titles')}
          className={`py-2 rounded-xl transition ${
            activeTab === 'titles' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Títulos
        </button>
        <button
          onClick={() => setActiveTab('subtitles')}
          className={`py-2 rounded-xl transition ${
            activeTab === 'subtitles' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Legendas
        </button>
        <button
          onClick={() => setActiveTab('caption')}
          className={`py-2 rounded-xl transition ${
            activeTab === 'caption' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Descrição
        </button>
        <button
          onClick={() => setActiveTab('channels')}
          className={`py-2 rounded-xl transition ${
            activeTab === 'channels' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Canais
        </button>
      </div>

      {/* TAB 1: TÍTULOS & OVERLAYS COM MINI-PRÉ-VISUALIZAÇÕES GRÁFICAS REALISTAS */}
      {activeTab === 'titles' && (
        <div className="space-y-5">
          {/* Section: Ganchos 3s Virais */}
          <div>
            <h3 className="text-xs font-bold text-slate-300 mb-2.5 flex items-center gap-1.5 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              <span>🔴 Ganchos de Retenção (Hook 3s)</span>
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {hookTemplates.map((t) => (
                <div
                  key={t.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('application/json', JSON.stringify(t));
                  }}
                  onClick={() => onAddTemplate(t)}
                  className="p-3 bg-slate-950/90 hover:bg-slate-950 border border-slate-800 hover:border-purple-500/60 rounded-2xl cursor-grab active:cursor-grabbing transition duration-200 group relative overflow-hidden shadow-lg flex flex-col items-center justify-center min-h-[85px]"
                >
                  <div className="w-full flex flex-col items-center gap-1 font-black text-center">
                    {t.id === 'italo_black_white' ? (
                      <>
                        <div className="bg-slate-950 text-white px-3 py-1 rounded-md uppercase text-xs w-full shadow border border-slate-800">
                          COMO CRIAR VÍDEOS
                        </div>
                        <div className="bg-white text-slate-950 px-3 py-1 rounded-md uppercase text-xs w-full shadow">
                          QUE VENDEM TODOS OS DIAS
                        </div>
                      </>
                    ) : t.id === 'caco_yellow_white' ? (
                      <>
                        <div className="bg-amber-400 text-slate-950 px-3 py-1 rounded-md uppercase text-xs w-full shadow">
                          PRODUÇÃO
                        </div>
                        <div className="bg-white text-slate-950 px-3 py-1 rounded-md uppercase text-xs w-full shadow">
                          DE CONTEÚDO
                        </div>
                      </>
                    ) : t.id === 'ladeira_red_white' ? (
                      <>
                        <div className="bg-red-600 text-white px-3 py-1 rounded-md uppercase text-xs w-full shadow">
                          VOCÊ NÃO PRECISA
                        </div>
                        <div className="bg-white text-slate-950 px-3 py-1 rounded-md uppercase text-xs w-full shadow">
                          DE SEGUIDORES
                        </div>
                      </>
                    ) : t.id === 'neon_badges' ? (
                      <div className="flex items-center gap-1.5 justify-center py-1">
                        <span className="bg-red-600 text-white px-2 py-0.5 rounded-lg text-xs shadow-[0_0_10px_rgba(239,68,68,0.6)]">
                          R$ 1 MM
                        </span>
                        <span className="text-white text-xs">➔</span>
                        <span className="bg-emerald-500 text-white px-2 py-0.5 rounded-lg text-xs shadow-[0_0_10px_rgba(34,197,94,0.6)]">
                          R$ 3.6 MM
                        </span>
                      </div>
                    ) : (
                      <div className="py-1 uppercase text-sm text-white font-bold">{t.name}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Presets Visuais de Títulos */}
          <div>
            <h3 className="text-xs font-bold text-slate-300 mb-2.5 flex items-center gap-1.5 uppercase tracking-wider">
              <Type className="w-3.5 h-3.5 text-indigo-400" />
              <span>⚡ Presets Visuais de Títulos</span>
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {titleTemplates.map((t) => (
                <div
                  key={t.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('application/json', JSON.stringify(t));
                  }}
                  onClick={() => onAddTemplate(t)}
                  className="p-3 bg-slate-950/90 hover:bg-slate-950 border border-slate-800 hover:border-purple-500/60 rounded-2xl cursor-grab active:cursor-grabbing transition duration-200 group relative overflow-hidden shadow-lg flex flex-col items-center justify-center min-h-[75px]"
                >
                  <div className="w-full flex flex-col items-center gap-1 font-black text-center">
                    {t.id === 'ali_abdaal_highlight' ? (
                      <div className="text-xs text-white font-bold">
                        and how to <span className="bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded font-black">fix it.</span>
                      </div>
                    ) : t.id === 'wagnner_blue_white' ? (
                      <>
                        <div className="bg-blue-600 text-white px-3 py-1 rounded-md uppercase text-xs w-full shadow">
                          DESIGN DE CONVERSÃO
                        </div>
                        <div className="bg-white text-slate-950 px-3 py-1 rounded-md uppercase text-xs w-full shadow">
                          DE 1,4% PARA 8%
                        </div>
                      </>
                    ) : t.id === 'sticker_outlined' ? (
                      <div className="text-amber-400 text-base font-black tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                        delisted.
                      </div>
                    ) : (
                      <div className="py-1 text-slate-200 font-bold text-xs">{t.name}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LEGENDAS DINÂMICAS IA */}
      {activeTab === 'subtitles' && (
        <div className="space-y-4">
          <div className="p-4 bg-gradient-to-br from-purple-950/50 to-indigo-950/50 border border-purple-500/30 rounded-2xl text-center space-y-3">
            <Sparkles className="w-8 h-8 text-amber-400 mx-auto" />
            <h3 className="text-xs font-bold text-white">Transcrição Automática por IA</h3>
            <p className="text-[11px] text-slate-300">
              Gere legendas dinâmicas com destaque palavra por palavra estilo Alex Hormozi.
            </p>
            <button
              onClick={onGenerateSubtitles}
              className="w-full py-2 bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-slate-950 font-black rounded-xl text-xs shadow-lg transition"
            >
              ⚡ Gerar Legendas com IA
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: LEGENDA GLOBAL DA PUBLICAÇÃO */}
      {activeTab === 'caption' && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <MessageSquareText className="w-3.5 h-3.5 text-purple-400" />
            <span>Texto / Legenda Global da Postagem</span>
          </h3>
          <textarea
            value={project.postCaption}
            onChange={(e) => onUpdatePostCaption(e.target.value)}
            placeholder="Escreva a legenda geral da postagem usada nas redes..."
            className="w-full h-40 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none focus:border-purple-500 transition resize-none"
          />
        </div>
      )}

      {/* TAB 4: SELEÇÃO DE CANAIS */}
      {activeTab === 'channels' && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-300">Redes Sociais de Destino</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'instagram', label: 'Instagram Reels' },
              { id: 'tiktok', label: 'TikTok' },
              { id: 'youtube', label: 'YouTube Shorts' },
              { id: 'linkedin', label: 'LinkedIn Video' },
            ].map((ch) => {
              const isSelected = project.selectedChannels.includes(ch.id as SocialChannel);
              return (
                <button
                  key={ch.id}
                  onClick={() => onToggleChannel(ch.id as SocialChannel)}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-purple-600/30 border-purple-500 text-purple-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>{ch.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-purple-400" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
