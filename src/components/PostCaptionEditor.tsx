import React from 'react';
import { SocialChannel } from '@/types/carousel';
import { Instagram, Linkedin, Facebook, Hash, Smile, Send, AlertCircle, Link as LinkIcon } from 'lucide-react';

interface PostCaptionEditorProps {
  caption: string;
  selectedChannels: SocialChannel[];
  connectedChannels?: SocialChannel[];
  isBufferConnected?: boolean;
  onCaptionChange: (caption: string) => void;
  onToggleChannel: (channel: SocialChannel) => void;
  onOpenIntegrations?: () => void;
}

export const PostCaptionEditor: React.FC<PostCaptionEditorProps> = ({
  caption,
  selectedChannels,
  connectedChannels = ['instagram', 'linkedin', 'facebook'],
  isBufferConnected = true,
  onCaptionChange,
  onToggleChannel,
  onOpenIntegrations,
}) => {
  const isInstagramConnected = isBufferConnected && connectedChannels.includes('instagram');
  const isLinkedinConnected = isBufferConnected && connectedChannels.includes('linkedin');
  const isFacebookConnected = isBufferConnected && connectedChannels.includes('facebook');

  const isInstagramSelected = selectedChannels.includes('instagram');
  const isLinkedinSelected = selectedChannels.includes('linkedin');
  const isFacebookSelected = selectedChannels.includes('facebook');

  const addHashtag = (tag: string) => {
    const space = caption && !caption.endsWith(' ') && !caption.endsWith('\n') ? ' ' : '';
    onCaptionChange(`${caption}${space}#${tag}`);
  };

  const addEmoji = (emoji: string) => {
    onCaptionChange(`${caption}${emoji}`);
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* SELEÇÃO MULTI-CANAL DE DESTINO COM CHECKBOXES */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Send className="w-3.5 h-3.5 text-indigo-400" />
            <span>Redes Sociais de Destino</span>
          </label>
          <span className="text-[10px] text-slate-400 font-mono">
            {isBufferConnected ? `${connectedChannels.length} conectada(s)` : 'Buffer desconectado'}
          </span>
        </div>

        {/* AVISO DISCRETO CASO O BUFFER NÃO ESTEJA CONECTADO */}
        {!isBufferConnected && (
          <div className="p-2.5 bg-indigo-950/40 border border-indigo-500/30 rounded-xl flex items-center justify-between text-xs text-indigo-300 gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-[11px] leading-tight">
                Conecte com uma ferramenta de postagem para exportar seus conteúdos.
              </span>
            </div>
            {onOpenIntegrations && (
              <button
                type="button"
                onClick={onOpenIntegrations}
                className="px-2.5 py-1 text-[10px] font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition shrink-0 flex items-center gap-1"
              >
                <LinkIcon className="w-3 h-3" />
                <span>Conectar</span>
              </button>
            )}
          </div>
        )}

        <div className="grid grid-cols-3 gap-2">
          {/* Checkbox Instagram */}
          <button
            type="button"
            disabled={!isInstagramConnected}
            onClick={() => isInstagramConnected && onToggleChannel('instagram')}
            title={isInstagramConnected ? 'Instagram conectado no Buffer' : 'Conecte o Instagram no Buffer para ativar'}
            className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition ${
              !isInstagramConnected
                ? 'border-slate-800/60 bg-slate-950/40 text-slate-600 cursor-not-allowed opacity-50'
                : isInstagramSelected
                ? 'border-pink-500/80 bg-pink-950/30 text-white ring-1 ring-pink-500/40 shadow-glow'
                : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <Instagram className={`w-4 h-4 ${isInstagramConnected ? (isInstagramSelected ? 'text-pink-400' : 'text-slate-400') : 'text-slate-600'}`} />
              <span className="text-xs font-bold">Instagram</span>
            </div>
            <input
              type="checkbox"
              checked={isInstagramSelected && isInstagramConnected}
              disabled={!isInstagramConnected}
              readOnly
              className="w-4 h-4 accent-pink-500 rounded cursor-pointer pointer-events-none"
            />
          </button>

          {/* Checkbox LinkedIn */}
          <button
            type="button"
            disabled={!isLinkedinConnected}
            onClick={() => isLinkedinConnected && onToggleChannel('linkedin')}
            title={isLinkedinConnected ? 'LinkedIn conectado no Buffer' : 'Conecte o LinkedIn no Buffer para ativar'}
            className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition ${
              !isLinkedinConnected
                ? 'border-slate-800/60 bg-slate-950/40 text-slate-600 cursor-not-allowed opacity-50'
                : isLinkedinSelected
                ? 'border-blue-500/80 bg-blue-950/30 text-white ring-1 ring-blue-500/40 shadow-glow'
                : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <Linkedin className={`w-4 h-4 ${isLinkedinConnected ? (isLinkedinSelected ? 'text-blue-400' : 'text-slate-400') : 'text-slate-600'}`} />
              <span className="text-xs font-bold">LinkedIn</span>
            </div>
            <input
              type="checkbox"
              checked={isLinkedinSelected && isLinkedinConnected}
              disabled={!isLinkedinConnected}
              readOnly
              className="w-4 h-4 accent-blue-500 rounded cursor-pointer pointer-events-none"
            />
          </button>

          {/* Checkbox Facebook */}
          <button
            type="button"
            disabled={!isFacebookConnected}
            onClick={() => isFacebookConnected && onToggleChannel('facebook')}
            title={isFacebookConnected ? 'Facebook conectado no Buffer' : 'Conecte o Facebook no Buffer para ativar'}
            className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition ${
              !isFacebookConnected
                ? 'border-slate-800/60 bg-slate-950/40 text-slate-600 cursor-not-allowed opacity-50'
                : isFacebookSelected
                ? 'border-indigo-500/80 bg-indigo-950/30 text-white ring-1 ring-indigo-500/40 shadow-glow'
                : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <Facebook className={`w-4 h-4 ${isFacebookConnected ? (isFacebookSelected ? 'text-indigo-400' : 'text-slate-400') : 'text-slate-600'}`} />
              <span className="text-xs font-bold">Facebook</span>
            </div>
            <input
              type="checkbox"
              checked={isFacebookSelected && isFacebookConnected}
              disabled={!isFacebookConnected}
              readOnly
              className="w-4 h-4 accent-indigo-500 rounded cursor-pointer pointer-events-none"
            />
          </button>
        </div>
      </div>

      {/* CAMPO DE EDIÇÃO DA LEGENDA GLOBAL DO POST */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
          <span>Legenda Global da Publicação</span>
          <span className="font-mono text-[11px] text-slate-400">
            {caption.length} caracteres
          </span>
        </div>

        <textarea
          value={caption}
          onChange={(e) => onCaptionChange(e.target.value)}
          placeholder="Escreva a legenda geral do post (usada no Instagram, LinkedIn, Facebook)... Ex: Você já se perguntou como o algoritmo decide o que vai mostrar? Arraste para o lado! #conteudo #estrategia"
          rows={5}
          className="w-full bg-slate-800/90 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed resize-y scrollbar-thin"
        />

        {/* ATALHOS RÁPIDOS DE EMOJIS E HASHTAGS */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
            <Smile className="w-3 h-3 text-amber-400" /> Emojis:
          </span>
          {['🔥', '💡', '📌', '🚀', '👇', '🎯', '✨'].map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => addEmoji(emoji)}
              className="px-1.5 py-0.5 text-xs bg-slate-800 hover:bg-slate-700 rounded border border-slate-700/60 transition"
            >
              {emoji}
            </button>
          ))}

          <div className="w-px h-3 bg-slate-700 my-auto mx-1" />

          <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
            <Hash className="w-3 h-3 text-indigo-400" /> Tags:
          </span>
          {['dica', 'conteudo', 'estrategia', 'marketing'].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => addHashtag(tag)}
              className="px-1.5 py-0.5 text-[10px] font-mono text-indigo-300 bg-indigo-950/60 hover:bg-indigo-900 border border-indigo-700/50 rounded transition"
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
