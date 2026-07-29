import React, { useState } from 'react';
import { Slide } from '@/types/carousel';
import { CONTENT_TYPES, LAYOUT_STYLES } from '@/lib/templates';
import { Plus, Copy, Trash2, ArrowLeft, ArrowRight, GripVertical, AlertTriangle, Sparkles, MoreVertical, Star } from 'lucide-react';

interface SlideReorderBarProps {
  slides: Slide[];
  activeIndex: number;
  onSelectSlide: (index: number) => void;
  onAddSlide: () => void;
  onInsertSlideAt: (index: number) => void;
  onDuplicateSlide: (index: number) => void;
  onDeleteSlide: (index: number) => void;
  onMoveSlide: (fromIndex: number, toIndex: number) => void;
  onOpenSaveTemplateModal?: (slide: Slide) => void;
  onAssignMedia?: (slideId: string, imageIndex: number, url: string) => void;
  onCreateSlideFromMedia?: (url: string) => void;
}

export const SlideReorderBar: React.FC<SlideReorderBarProps> = ({
  slides,
  activeIndex,
  onSelectSlide,
  onAddSlide,
  onInsertSlideAt,
  onDuplicateSlide,
  onDeleteSlide,
  onMoveSlide,
  onOpenSaveTemplateModal,
  onAssignMedia,
  onCreateSlideFromMedia,
}) => {
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [confirmDeleteIdx, setConfirmDeleteIdx] = useState<number | null>(null);
  const [dropHoverAdd, setDropHoverAdd] = useState(false);
  const [dropHoverSlideId, setDropHoverSlideId] = useState<string | null>(null);
  const [activeMenuSlideId, setActiveMenuSlideId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIdx(index);
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleSlideDrop = (e: React.DragEvent, targetIndex: number, slideId: string) => {
    e.preventDefault();
    setDropHoverSlideId(null);

    const droppedMediaUrl = e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text/plain');

    // Se foi uma imagem arrastada da Bandeja de Mídias
    if (droppedMediaUrl && (droppedMediaUrl.startsWith('data:image') || droppedMediaUrl.startsWith('http'))) {
      onAssignMedia?.(slideId, 0, droppedMediaUrl);
      return;
    }

    // Se foi reordenação de slides
    if (draggedIdx !== null && draggedIdx !== targetIndex) {
      onMoveSlide(draggedIdx, targetIndex);
    }
    setDraggedIdx(null);
  };

  const handleAddSlideDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDropHoverAdd(false);
    const droppedMediaUrl = e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text/plain');
    if (droppedMediaUrl && (droppedMediaUrl.startsWith('data:image') || droppedMediaUrl.startsWith('http'))) {
      onCreateSlideFromMedia?.(droppedMediaUrl);
    } else {
      onAddSlide();
    }
  };

  const handleConfirmDelete = () => {
    if (confirmDeleteIdx !== null) {
      onDeleteSlide(confirmDeleteIdx);
      setConfirmDeleteIdx(null);
    }
  };

  return (
    <div className="w-full bg-slate-900 border-t border-slate-800 px-4 py-1.5 flex flex-col gap-1.5 relative shrink-0">
      {/* Controles de Cabeçalho (Status e Reordenação) */}
      <div className="flex items-center justify-between px-1 text-xs font-semibold text-slate-400">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-300">SLIDES DO CARROSSEL ({slides.length})</span>
          <span className="text-[10px] font-normal text-slate-500 hidden sm:inline">
            • Arraste ou use + para inserir ou solte fotos
          </span>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-0.5 rounded-lg border border-slate-800">
          <span className="text-[11px] text-slate-300 font-bold mr-1">
            Slide #{activeIndex + 1} selecionado
          </span>

          <button
            onClick={() => onMoveSlide(activeIndex, activeIndex - 1)}
            disabled={activeIndex === 0}
            className="p-1 px-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 transition text-slate-200 flex items-center gap-1 text-[10px]"
            title="Mover slide para esquerda"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Mover Esq.</span>
          </button>

          <button
            onClick={() => onMoveSlide(activeIndex, activeIndex + 1)}
            disabled={activeIndex === slides.length - 1}
            className="p-1 px-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 transition text-slate-200 flex items-center gap-1 text-[10px]"
            title="Mover slide para direita"
          >
            <span>Mover Dir.</span>
            <ArrowRight className="w-3 h-3" />
          </button>

          <span className="w-px h-3.5 bg-slate-800 mx-0.5" />

          <button
            onClick={() => onDuplicateSlide(activeIndex)}
            className="p-1 px-1.5 rounded bg-slate-800 hover:bg-slate-700 transition text-slate-200 flex items-center gap-1 text-[10px] font-medium"
            title="Duplicar slide selecionado"
          >
            <Copy className="w-3 h-3 text-indigo-400" />
            <span>Duplicar</span>
          </button>
        </div>
      </div>

      {/* Trilha de Miniaturas com Botões de Inserção entre Slides */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 scrollbar-thin scrollbar-thumb-slate-700">
        {slides.map((slide, idx) => {
          const isActive = idx === activeIndex;
          const contentTypeObj = CONTENT_TYPES[slide.contentType || 'text_1_image'];
          const layoutStyleObj = LAYOUT_STYLES[slide.layoutStyle || 'twitter'];
          const templateName = contentTypeObj ? `${contentTypeObj.name.split(' ')[0]} ${layoutStyleObj?.id === 'immersive' ? '(Imersivo)' : ''}` : 'Slide';
          const textPreview = slide.layers.text?.[0]?.content?.replace(/<[^>]*>?/gm, '').slice(0, 32);
          const isDropHover = dropHoverSlideId === slide.id;

          return (
            <React.Fragment key={slide.id || idx}>
              {/* Botão de Inserção ANTES do slide i (se i > 0) */}
              {idx > 0 && (
                <div className="flex items-center shrink-0 -mx-1 z-10">
                  <button
                    onClick={() => onInsertSlideAt(idx)}
                    className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-indigo-600 hover:border-indigo-500 transition flex items-center justify-center shadow-md group"
                    title={`Inserir novo slide aqui (Posição #${idx + 1})`}
                  >
                    <Plus className="w-3 h-3 group-hover:scale-110 transition-transform" />
                  </button>
                </div>
              )}

              {/* Card do Slide */}
              <div
                draggable
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={(e) => {
                  handleDragOver(e);
                  setDropHoverSlideId(slide.id);
                }}
                onDragLeave={() => setDropHoverSlideId(null)}
                onDrop={(e) => handleSlideDrop(e, idx, slide.id)}
                onClick={() => onSelectSlide(idx)}
                className={`flex-shrink-0 w-28 h-28 rounded-xl border-2 transition-all p-2 flex flex-col justify-between text-left relative group cursor-pointer select-none ${
                  isDropHover
                    ? 'border-indigo-400 bg-indigo-950/80 scale-105 shadow-glow ring-2 ring-indigo-400'
                    : isActive
                    ? 'border-indigo-500 bg-slate-800/90 shadow-glow ring-2 ring-indigo-500/30'
                    : 'border-slate-800 bg-slate-900/80 hover:border-slate-700 hover:bg-slate-850'
                } ${draggedIdx === idx ? 'opacity-40 scale-95 border-dashed border-indigo-400' : ''}`}
              >
                {/* Menu de 3 Pontinhos no canto superior direito */}
                <div className="absolute top-1.5 right-1.5 z-20">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuSlideId(activeMenuSlideId === slide.id ? null : slide.id);
                    }}
                    className="p-1 rounded-md bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white transition border border-slate-700/80 shadow"
                    title="Opções do Slide"
                  >
                    <MoreVertical className="w-3 h-3" />
                  </button>

                  {/* Popover do Menu de 3 Pontinhos */}
                  {activeMenuSlideId === slide.id && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-0 top-6 w-36 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1 z-30 flex flex-col gap-0.5 animate-in fade-in zoom-in-95 duration-100"
                    >
                      <button
                        onClick={() => {
                          onDuplicateSlide(idx);
                          setActiveMenuSlideId(null);
                        }}
                        className="w-full px-2.5 py-1.5 text-[11px] font-semibold text-slate-200 hover:bg-slate-800 rounded-lg flex items-center gap-2 transition text-left"
                      >
                        <Copy className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Duplicar</span>
                      </button>

                      <button
                        onClick={() => {
                          onOpenSaveTemplateModal?.(slide);
                          setActiveMenuSlideId(null);
                        }}
                        className="w-full px-2.5 py-1.5 text-[11px] font-semibold text-slate-200 hover:bg-slate-800 rounded-lg flex items-center gap-2 transition text-left"
                      >
                        <Star className="w-3.5 h-3.5 text-amber-400" />
                        <span>Salvar Modelo</span>
                      </button>

                      {slides.length > 1 && (
                        <button
                          onClick={() => {
                            setConfirmDeleteIdx(idx);
                            setActiveMenuSlideId(null);
                          }}
                          className="w-full px-2.5 py-1.5 text-[11px] font-semibold text-red-400 hover:bg-red-950/60 rounded-lg flex items-center gap-2 transition text-left"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Excluir</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Header do Card com Número e Drag Handle */}
                <div className="flex items-center justify-between w-full pr-5">
                  <span
                    className={`text-[9px] font-bold px-1 py-0.5 rounded flex items-center gap-0.5 ${
                      isActive ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <GripVertical className="w-2 h-2 opacity-60 group-hover:opacity-100" />
                    #{idx + 1}
                  </span>

                  <span className="text-[9px] text-slate-400 font-medium truncate max-w-[40px]">
                    {templateName.split(' ')[0]}
                  </span>
                </div>

                {/* Snippet do Texto */}
                <div className="my-auto text-[9px] text-slate-300 font-medium line-clamp-2 leading-tight overflow-hidden opacity-90">
                  {textPreview || <span className="italic text-slate-500">Sem texto</span>}
                </div>

                {/* Rodapé do Card */}
                <div className="flex items-center justify-between text-[8px] text-slate-400 font-mono pt-0.5 border-t border-slate-800/60">
                  <span>{slide.layers.images?.length ? `📷 ${slide.layers.images.length}` : '📝 Texto'}</span>
                </div>
              </div>
            </React.Fragment>
          );
        })}

        {/* Botão Inserir ANTES do último botão se houver slides */}
        {slides.length > 0 && (
          <div className="flex items-center shrink-0 -mx-1 z-10">
            <button
              onClick={() => onInsertSlideAt(slides.length)}
              className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-indigo-600 hover:border-indigo-500 transition flex items-center justify-center shadow-md group"
              title="Inserir novo slide no final"
            >
              <Plus className="w-3 h-3 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        )}

        {/* Botão Adicionar Novo Slide no Final (Aceita Drop de Imagem) */}
        <button
          onClick={onAddSlide}
          onDragOver={(e) => {
            e.preventDefault();
            setDropHoverAdd(true);
          }}
          onDragLeave={() => setDropHoverAdd(false)}
          onDrop={handleAddSlideDrop}
          className={`flex-shrink-0 w-28 h-28 rounded-xl border-2 border-dashed transition flex flex-col items-center justify-center gap-1.5 ${
            dropHoverAdd
              ? 'border-indigo-400 bg-indigo-950/80 text-white scale-105 shadow-glow ring-2 ring-indigo-400'
              : 'border-slate-700 bg-slate-850/40 hover:bg-slate-800 hover:border-indigo-500/50 text-slate-400 hover:text-indigo-400'
          }`}
          title="Solte uma foto aqui para criar um novo slide automaticamente!"
        >
          <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
            {dropHoverAdd ? <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" /> : <Plus className="w-4 h-4 text-indigo-400" />}
          </div>
          <span className="text-[11px] font-semibold">{dropHoverAdd ? 'Criar com Foto' : 'Novo Slide'}</span>
        </button>
      </div>

      {/* Modal de Confirmação de Exclusão de Slide */}
      {confirmDeleteIdx !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-red-950/80 border border-red-800 text-red-400 flex items-center justify-center mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-white mb-1">
              Excluir Slide #{confirmDeleteIdx + 1}?
            </h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Tem certeza que deseja apagar o <strong>Slide #{confirmDeleteIdx + 1}</strong>? Esta ação removerá o slide do carrossel.
            </p>

            <div className="flex items-center justify-center gap-3 w-full">
              <button
                onClick={() => setConfirmDeleteIdx(null)}
                className="flex-1 py-2.5 px-4 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 px-4 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-xl shadow-lg transition flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Sim, Excluir</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
