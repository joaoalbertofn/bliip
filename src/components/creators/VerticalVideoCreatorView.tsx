import React from 'react';
import { Film, Sparkles, CheckCircle2 } from 'lucide-react';

interface VerticalVideoCreatorViewProps {
  onBackToDashboard: () => void;
}

export const VerticalVideoCreatorView: React.FC<VerticalVideoCreatorViewProps> = ({ onBackToDashboard }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-slate-950 text-slate-100 overflow-y-auto">
      <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
        {/* Decorative ambient background glow */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-pink-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-600 via-purple-600 to-indigo-600 flex items-center justify-center shadow-glow mb-5">
          <Film className="w-8 h-8 text-white" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-950/60 border border-pink-500/40 text-pink-300 text-xs font-bold font-mono mb-3">
          <Sparkles className="w-3.5 h-3.5 text-pink-400" />
          <span>EM BREVE • FORMATO 9:16</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
          Criador de Vídeos Verticais
        </h1>
        <p className="text-sm text-slate-400 max-w-lg mb-8 leading-relaxed">
          Crie e otimize conteúdos em vídeo de alta retenção para **Instagram Reels**, **TikTok**, **YouTube Shorts** e **LinkedIn Video (9:16)**.
        </p>

        {/* Feature roadmap preview grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left mb-8">
          <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-pink-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-slate-200">Editor de Ganchos (Hook 3s)</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Otimize os primeiros 3 segundos para capturar a atenção do feed.</p>
            </div>
          </div>

          <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-pink-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-slate-200">Legendas Dinâmicas (IA)</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Closed captions sincronizadas automaticamente por áudio.</p>
            </div>
          </div>

          <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-pink-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-slate-200">Timeline de Mídias</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Cortes rápidos, inserção de áudio e overlays gráficos.</p>
            </div>
          </div>

          <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-pink-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-slate-200">Preview 9:16 Realista</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Visualize exatamente como vai aparecer no smartphone.</p>
            </div>
          </div>
        </div>

        <button
          onClick={onBackToDashboard}
          className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 text-xs font-bold transition"
        >
          Voltar para o Dashboard
        </button>
      </div>
    </div>
  );
};
