import React from 'react';
import { Smartphone, Sparkles, CheckCircle2 } from 'lucide-react';

interface StoriesCreatorViewProps {
  onBackToDashboard: () => void;
}

export const StoriesCreatorView: React.FC<StoriesCreatorViewProps> = ({ onBackToDashboard }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-slate-950 text-slate-100 overflow-y-auto">
      <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
        {/* Decorative ambient background glow */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-pink-600 flex items-center justify-center shadow-glow mb-5">
          <Smartphone className="w-8 h-8 text-white" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs font-bold font-mono mb-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>EM BREVE • CONTEÚDO EFÊMERO (24H)</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
          Criador de Stories
        </h1>
        <p className="text-sm text-slate-400 max-w-lg mb-8 leading-relaxed">
          Crie sequências dinâmicas de Stories visuais e interativos para **Instagram Stories**, **Facebook Stories** e **TikTok Stories**.
        </p>

        {/* Feature roadmap preview grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left mb-8">
          <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-slate-200">Sequência de Stories (1, 2, 3)</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Monte narrativas em múltiplos cards ordenados com transições.</p>
            </div>
          </div>

          <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-slate-200">Simulador de Enquetes & Caixas</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Adicione elementos visuais interativos que aumentam a resposta do público.</p>
            </div>
          </div>

          <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-slate-200">Templates de Chamada para Ação</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">CTAs para cliques de link, direct/DM e vendas rápidas.</p>
            </div>
          </div>

          <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-slate-200">Exportação Direta em Alta Definição</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">PNG 1080x1920 sem perda de qualidade visual.</p>
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
