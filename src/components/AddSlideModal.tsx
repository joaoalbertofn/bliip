import React, { useState } from 'react';
import { SavedSlideTemplate, UserProfile } from '@/types/carousel';
import { SlideCanvas } from './SlideCanvas';
import { X, Plus, Star, Trash2, Edit2, Check, Sparkles } from 'lucide-react';

interface AddSlideModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedTemplates: SavedSlideTemplate[];
  profile: UserProfile;
  onInsertStandardSlide: () => void;
  onInsertSlideFromTemplate: (template: SavedSlideTemplate) => void;
  onDeleteTemplate: (templateId: string) => void;
  onRenameTemplate: (templateId: string, newName: string) => void;
}

export const AddSlideModal: React.FC<AddSlideModalProps> = ({
  isOpen,
  onClose,
  savedTemplates,
  profile,
  onInsertStandardSlide,
  onInsertSlideFromTemplate,
  onDeleteTemplate,
  onRenameTemplate,
}) => {
  const [activeTab, setActiveTab] = useState<'standard' | 'library'>('standard');
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [editNameValue, setEditNameValue] = useState<string>('');

  if (!isOpen) return null;

  const handleStartRename = (template: SavedSlideTemplate) => {
    setEditingTemplateId(template.id);
    setEditNameValue(template.name);
  };

  const handleSaveRename = (templateId: string) => {
    if (editNameValue.trim()) {
      onRenameTemplate(templateId, editNameValue.trim());
    }
    setEditingTemplateId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto scrollbar-thin flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-extrabold text-white mb-1 flex items-center gap-2">
          <span>Adicionar Novo Slide</span>
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Escolha se deseja criar um slide padrão herdado do anterior ou escolher um dos seus modelos salvos.
        </p>

        {/* Seleção de Abas */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 mb-4">
          <button
            onClick={() => setActiveTab('standard')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
              activeTab === 'standard'
                ? 'bg-indigo-600 text-white shadow-glow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Slide Padrão (Herdado)</span>
          </button>

          <button
            onClick={() => setActiveTab('library')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
              activeTab === 'library'
                ? 'bg-amber-600 text-white shadow-glow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Star className="w-4 h-4 fill-amber-400/20" />
            <span>Meus Modelos Salvos ({savedTemplates.length})</span>
          </button>
        </div>

        {/* CONTEÚDO DA ABA 1: SLIDE PADRÃO */}
        {activeTab === 'standard' && (
          <div className="bg-slate-950/60 p-6 rounded-xl border border-slate-800 flex flex-col items-center justify-center text-center gap-4 py-8">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shadow-inner">
              <Sparkles className="w-7 h-7" />
            </div>

            <div>
              <h4 className="text-sm font-bold text-white mb-1">Criar Slide no Padrão do Atual</h4>
              <p className="text-xs text-slate-400 max-w-sm">
                Cria o próximo slide mantendo o mesmo estilo visual, fotos imersivas, tema e tamanho de fonte que você acabou de usar.
              </p>
            </div>

            <button
              onClick={() => {
                onInsertStandardSlide();
                onClose();
              }}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl shadow-glow font-bold text-xs flex items-center gap-2 transition transform hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>Inserir Slide Padrão</span>
            </button>
          </div>
        )}

        {/* CONTEÚDO DA ABA 2: BIBLIOTECA DE MODELOS SALVOS */}
        {activeTab === 'library' && (
          <div className="flex flex-col gap-4">
            {savedTemplates.length === 0 ? (
              <div className="bg-slate-950/60 p-8 rounded-xl border border-slate-800 text-center flex flex-col items-center gap-2">
                <Star className="w-8 h-8 text-slate-600 mb-1" />
                <span className="text-xs font-bold text-slate-300">Nenhum modelo salvo ainda.</span>
                <p className="text-[11px] text-slate-500 max-w-xs">
                  Para salvar um modelo, clique nos 3 pontinhos (<strong>...</strong>) em qualquer slide na barra inferior e escolha "Salvar como Modelo".
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto p-1 scrollbar-thin">
                {savedTemplates.map((template) => {
                  const isEditing = editingTemplateId === template.id;

                  return (
                    <div
                      key={template.id}
                      className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col hover:border-slate-700 transition shadow-card group"
                    >
                      {/* Live Canvas Preview */}
                      <div className="w-full aspect-[4/3] bg-slate-900 relative overflow-hidden flex items-center justify-center p-2">
                        <div className="w-full max-w-[200px] pointer-events-none scale-65 origin-center">
                          <SlideCanvas slide={template.slide} profile={profile} aspectRatio="4:5" />
                        </div>
                      </div>

                      {/* Header do Card com Nome e Ações */}
                      <div className="p-3 bg-slate-900 border-t border-slate-800/80 flex flex-col gap-2">
                        <div className="flex items-center justify-between gap-2">
                          {isEditing ? (
                            <div className="flex items-center gap-1 w-full">
                              <input
                                type="text"
                                value={editNameValue}
                                onChange={(e) => setEditNameValue(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white font-medium focus:outline-none"
                              />
                              <button
                                onClick={() => handleSaveRename(template.id)}
                                className="p-1 text-emerald-400 hover:text-emerald-300"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between w-full">
                              <span className="text-xs font-bold text-white truncate" title={template.name}>
                                {template.name}
                              </span>

                              <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                                <button
                                  onClick={() => handleStartRename(template)}
                                  className="p-1 text-slate-400 hover:text-white"
                                  title="Renomear Modelo"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => onDeleteTemplate(template.id)}
                                  className="p-1 text-red-400 hover:text-red-300"
                                  title="Excluir Modelo da Biblioteca"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => {
                            onInsertSlideFromTemplate(template);
                            onClose();
                          }}
                          className="w-full py-2 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 font-bold text-xs rounded-lg transition border border-amber-500/40 flex items-center justify-center gap-1.5"
                        >
                          <Star className="w-3.5 h-3.5" />
                          <span>Inserir Este Modelo</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
