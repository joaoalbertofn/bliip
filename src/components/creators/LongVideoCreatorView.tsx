import React from 'react';
import { MonitorPlay, Sparkles, CheckCircle2 } from 'lucide-react';

interface LongVideoCreatorViewProps {
  onBackToDashboard: () => void;
}

export const LongVideoCreatorView: React.FC<LongVideoCreatorViewProps> = ({ onBackToDashboard }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-slate-950 text-slate-100 overflow-y-auto">
      <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
        {/* Decorative ambient background glow */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-600 to-indigo-600 flex items-center justify-center shadow-glow mb-5">
          <MonitorPlay className="w-8 h-8 text-white" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/60 border border-red-500/40 text-red-300 text-xs font-bold font-mono mb-3">
          <Sparkles className="w-3.5 h-3.5 text-red-400" />
          <span>EM BREVE • FORMATO 16:9 WIDESCREEN</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
          Criador de Vídeos Longos
        </h1>
        <p className="text-sm text-slate-400 max-w-lg mb-8 leading-relaxed">
          Publique vídeos horizontais de alta qualidade com capas (Thumbnails) profissionais para **YouTube**, **LinkedIn Video**, **Facebook Watch** e **TikTok Long-Form**.
        </p>

        {/* Feature roadmap preview grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left mb-8">
          <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-slate-200">Editor de Thumbnails 16:9</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Crie capas chamativas com os mesmos estilos visuais do Bliip.</p>
            </div>
          </div>

          <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-slate-200">Gerador de Capítulos (SEO)</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Marcadores de tempo (timestamps) gerados por IA para o YouTube.</p>
            </div>
          </div>

          <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-slate-200">Uploader MP4/MOV HD</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Gerenciamento eficiente de arquivos de até 15 min ou ilimitados.</p>
            </div>
          </div>

          <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-slate-200">Validador de Limites de Tempo</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Avisos automáticos sobre durações máximas por rede social.</p>
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
