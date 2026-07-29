import React, { useState } from 'react';
import { PRESET_MODELS, PresetModel } from '@/config/presetModels';
import {
  Compass,
  Wrench,
  Award,
  Crown,
  BookOpen,
  Quote,
  GitCommit,
  Layers,
  Sparkles,
  CheckCircle2,
  X
} from 'lucide-react';

interface NewCarouselModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateByQuantity: (slideCount: number) => void;
  onCreateByModel: (modelId: string) => void;
}

const ICON_MAP = {
  Compass,
  Wrench,
  Award,
  Crown,
  BookOpen,
  Quote,
  GitCommit,
};

export const NewCarouselModal: React.FC<NewCarouselModalProps> = ({
  isOpen,
  onClose,
  onCreateByQuantity,
  onCreateByModel,
}) => {
  const [activeTab, setActiveTab] = useState<'quantity' | 'preset'>('quantity');
  const [slideCount, setSlideCount] = useState<number>(3);
  const [selectedModelId, setSelectedModelId] = useState<string>('a_jornada');

  if (!isOpen) return null;

  const handleConfirmCreate = () => {
    if (activeTab === 'quantity') {
      onCreateByQuantity(slideCount);
    } else {
      onCreateByModel(selectedModelId);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl my-8 relative flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              Criar Novo Conteúdo
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Escolha entre definir a quantidade manual ou aplicar um modelo pronto.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher (Mututamente Exclusivos) */}
        <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 mb-5">
          <button
            onClick={() => setActiveTab('quantity')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'quantity'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <Layers className="w-4 h-4" />
            Por Quantidade
          </button>

          <button
            onClick={() => setActiveTab('preset')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'preset'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Modelos Prontos (7)
          </button>
        </div>

        {/* Tab Content 1: Por Quantidade */}
        {activeTab === 'quantity' && (
          <div className="space-y-6 py-2 px-1">
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-semibold text-slate-200">
                  Quantidade de Slides:
                </label>
                <span className="text-sm font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-md border border-indigo-500/20">
                  {slideCount} {slideCount === 1 ? 'slide' : 'slides'}
                </span>
              </div>

              <input
                type="range"
                min="1"
                max="10"
                value={slideCount}
                onChange={(e) => setSlideCount(Number(e.target.value))}
                className="w-full accent-indigo-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />

              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-2">
                <span>1 slide (Post Único)</span>
                <span>5 slides</span>
                <span>10 slides</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed bg-indigo-950/20 border border-indigo-900/30 rounded-xl p-3">
              💡 <strong>Como funciona:</strong> Ao criar por quantidade, sua ferramenta gerará um carrossel livre com a quantidade exata de slides selecionada no slider acima.
            </p>
          </div>
        )}

        {/* Tab Content 2: Por Modelos Prontos */}
        {activeTab === 'preset' && (
          <div className="flex-1 overflow-y-auto pr-1 space-y-3 max-h-[380px] custom-scrollbar">
            <p className="text-[11px] text-slate-400 mb-2">
              Selecione um dos modelos abaixo. <em>(O slider de quantidade será ignorado e a estrutura completa do modelo será criada)</em>:
            </p>

            <div className="grid grid-cols-1 gap-2.5">
              {PRESET_MODELS.map((model) => {
                const IconComponent = ICON_MAP[model.iconName] || Sparkles;
                const isSelected = selectedModelId === model.id;

                return (
                  <div
                    key={model.id}
                    onClick={() => setSelectedModelId(model.id)}
                    className={`group relative border rounded-xl p-3.5 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-indigo-950/40 border-indigo-500 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500'
                        : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 hover:bg-slate-950'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg border ${
                          isSelected 
                            ? 'bg-indigo-600 text-white border-indigo-500' 
                            : 'bg-slate-800 text-slate-300 border-slate-700 group-hover:text-white'
                        }`}>
                          <IconComponent className="w-4 h-4" />
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                              {model.name}
                            </h4>
                            <span className="text-[10px] font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                              {model.tagline}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-400 leading-snug">
                            {model.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span className="text-[10px] font-mono font-medium text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                          {model.slideCount} {model.slideCount === 1 ? 'slide' : 'slides'}
                        </span>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 mt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Cancelar
          </button>

          <button
            onClick={handleConfirmCreate}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {activeTab === 'quantity'
              ? `Criar ${slideCount} ${slideCount === 1 ? 'Slide' : 'Slides'}`
              : `Criar Modelo (${PRESET_MODELS.find(m => m.id === selectedModelId)?.slideCount || 0} Slides)`}
          </button>
        </div>

      </div>
    </div>
  );
};
