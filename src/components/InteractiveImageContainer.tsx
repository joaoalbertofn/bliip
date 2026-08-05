import React, { useState, useRef, useEffect } from 'react';
import { ImageLayer, ImageMask } from '@/types/carousel';
import { Sparkles, UploadCloud, ZoomIn, ZoomOut, RotateCcw, FolderOpen, Trash2, Square, Pipette, Plus, Copy } from 'lucide-react';

interface InteractiveImageContainerProps {
  imageLayer?: ImageLayer;
  imageIndex: number;
  onImageTransform?: (imageIndex: number, transform: { scale?: number; offsetX?: number; offsetY?: number }) => void;
  onUpdateMasks?: (imageIndex: number, masks: ImageMask[]) => void;
  onAssignMedia?: (imageIndex: number, url: string) => void;
  onSelect?: (imageIndex: number) => void;
  className?: string;
  fallbackText?: string;
  cardBg?: string;
  borderColor?: string;
  textSecondary?: string;
}

export const InteractiveImageContainer: React.FC<InteractiveImageContainerProps> = ({
  imageLayer,
  imageIndex,
  onImageTransform,
  onUpdateMasks,
  onAssignMedia,
  onSelect,
  className = '',
  fallbackText = 'Solte uma mídia aqui ou clique para selecionar',
  cardBg = '#f8fafc',
  borderColor = '#e2e8f0',
  textSecondary = '#64748b',
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSelected, setIsSelected] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isDropTarget, setIsDropTarget] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; startOffsetX: number; startOffsetY: number } | null>(null);

  // Estados de Tarjas (Image Masks)
  const [selectedMaskId, setSelectedMaskId] = useState<string | null>(null);
  const [activeDragMaskId, setActiveDragMaskId] = useState<string | null>(null);
  const [activeResizeMaskId, setActiveResizeMaskId] = useState<string | null>(null);
  const maskDragStartRef = useRef<{ mouseX: number; mouseY: number; startX: number; startY: number; startW: number; startH: number } | null>(null);

  const url = imageLayer?.source?.url;
  const rawScale = imageLayer?.scale ?? 1;
  const scale = Math.max(1, rawScale);
  const offsetX = imageLayer?.offsetX ?? 0;
  const offsetY = imageLayer?.offsetY ?? 0;
  const masks = imageLayer?.masks || [];

  const isInteractive = !!url;

  // Fechar seleções ao clicar fora da imagem
  useEffect(() => {
    if (!isSelected) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsSelected(false);
        setSelectedMaskId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSelected]);

  // Converter offsetX e offsetY (-50 a +50) para porcentagem de object-position (0% a 100%)
  const posX = Math.max(0, Math.min(100, 50 + offsetX));
  const posY = Math.max(0, Math.min(100, 50 + offsetY));

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsSelected(true);
    onSelect?.(imageIndex);

    // Se o slot estiver vazio, abre o seletor nativo de arquivos do computador
    if (!url) {
      fileInputRef.current?.click();
      return;
    }

    // Se clicou direto no container (e não em uma tarja ou handle), inicia pan da imagem
    if (!activeDragMaskId && !activeResizeMaskId) {
      setSelectedMaskId(null);
      if (onImageTransform) {
        e.preventDefault();
        setIsDragging(true);
        dragStartRef.current = {
          x: e.clientX,
          y: e.clientY,
          startOffsetX: offsetX,
          startOffsetY: offsetY,
        };
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    // 1. Mover Tarja (Drag Mask)
    if (activeDragMaskId && maskDragStartRef.current && onUpdateMasks) {
      e.preventDefault();
      const deltaX = ((e.clientX - maskDragStartRef.current.mouseX) / rect.width) * 100;
      const deltaY = ((e.clientY - maskDragStartRef.current.mouseY) / rect.height) * 100;

      const updatedMasks = masks.map((m) => {
        if (m.id !== activeDragMaskId) return m;
        const newX = Math.max(0, Math.min(100 - m.width, maskDragStartRef.current!.startX + deltaX));
        const newY = Math.max(0, Math.min(100 - m.height, maskDragStartRef.current!.startY + deltaY));
        return { ...m, x: Math.round(newX * 10) / 10, y: Math.round(newY * 10) / 10 };
      });

      onUpdateMasks(imageIndex, updatedMasks);
      return;
    }

    // 2. Redimensionar Tarja (Resize Mask)
    if (activeResizeMaskId && maskDragStartRef.current && onUpdateMasks) {
      e.preventDefault();
      const deltaX = ((e.clientX - maskDragStartRef.current.mouseX) / rect.width) * 100;
      const deltaY = ((e.clientY - maskDragStartRef.current.mouseY) / rect.height) * 100;

      const updatedMasks = masks.map((m) => {
        if (m.id !== activeResizeMaskId) return m;
        const newW = Math.max(5, Math.min(100 - m.x, maskDragStartRef.current!.startW + deltaX));
        const newH = Math.max(3, Math.min(100 - m.y, maskDragStartRef.current!.startH + deltaY));
        return { ...m, width: Math.round(newW * 10) / 10, height: Math.round(newH * 10) / 10 };
      });

      onUpdateMasks(imageIndex, updatedMasks);
      return;
    }

    // 3. Pan da Imagem
    if (isDragging && dragStartRef.current && onImageTransform) {
      e.preventDefault();
      const deltaX = ((e.clientX - dragStartRef.current.x) / rect.width) * 100;
      const deltaY = ((e.clientY - dragStartRef.current.y) / rect.height) * 100;

      const sensitivity = 0.8;
      const newOffsetX = Math.max(-50, Math.min(50, dragStartRef.current.startOffsetX - deltaX * sensitivity));
      const newOffsetY = Math.max(-50, Math.min(50, dragStartRef.current.startOffsetY - deltaY * sensitivity));

      onImageTransform(imageIndex, { offsetX: newOffsetX, offsetY: newOffsetY });
    }
  };

  const handleMouseUpOrLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      dragStartRef.current = null;
    }
    if (activeDragMaskId) {
      setActiveDragMaskId(null);
      maskDragStartRef.current = null;
    }
    if (activeResizeMaskId) {
      setActiveResizeMaskId(null);
      maskDragStartRef.current = null;
    }
  };

  const handleZoomChange = (newScale: number) => {
    if (!onImageTransform) return;
    const clampedScale = Math.max(1, Math.min(3, newScale));
    onImageTransform(imageIndex, { scale: clampedScale });
  };

  const handleResetTransform = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onImageTransform) return;
    onImageTransform(imageIndex, { scale: 1, offsetX: 0, offsetY: 0 });
  };

  // HANDLERS DE GERENCIAMENTO DE TARJAS
  const handleAddMask = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!onUpdateMasks) return;
    const newMask: ImageMask = {
      id: `mask_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      x: 30,
      y: 35,
      width: 40,
      height: 10,
      color: '#0f0f0f',
      borderRadius: 4,
    };
    onUpdateMasks(imageIndex, [...masks, newMask]);
    setSelectedMaskId(newMask.id);
  };

  const handleRemoveMask = (maskId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!onUpdateMasks) return;
    const updated = masks.filter((m) => m.id !== maskId);
    onUpdateMasks(imageIndex, updated);
    if (selectedMaskId === maskId) {
      setSelectedMaskId(null);
    }
  };

  const handleDuplicateMask = (maskId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!onUpdateMasks) return;
    const target = masks.find((m) => m.id === maskId);
    if (!target) return;
    const duplicated: ImageMask = {
      ...target,
      id: `mask_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      x: Math.min(90, target.x + 4),
      y: Math.min(90, target.y + 4),
    };
    onUpdateMasks(imageIndex, [...masks, duplicated]);
    setSelectedMaskId(duplicated.id);
  };

  const handleMaskColorChange = (maskId: string, color: string) => {
    if (!onUpdateMasks) return;
    const updated = masks.map((m) => (m.id === maskId ? { ...m, color } : m));
    onUpdateMasks(imageIndex, updated);
  };

  const handlePickEyeDropper = async (maskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if ('EyeDropper' in window) {
      try {
        const eyeDropper = new (window as any).EyeDropper();
        const result = await eyeDropper.open();
        if (result?.sRGBHex) {
          handleMaskColorChange(maskId, result.sRGBHex);
        }
      } catch (err) {
        console.warn('EyeDropper cancelado ou não suportado:', err);
      }
    } else {
      alert('Seu navegador não suporta a ferramenta de Conta-gotas automática. Use o seletor de cores nativo.');
    }
  };

  const handleMaskMouseDown = (e: React.MouseEvent, mask: ImageMask) => {
    e.stopPropagation();
    setIsSelected(true);
    setSelectedMaskId(mask.id);
    setActiveDragMaskId(mask.id);
    maskDragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: mask.x,
      startY: mask.y,
      startW: mask.width,
      startH: mask.height,
    };
  };

  const handleResizeHandleMouseDown = (e: React.MouseEvent, mask: ImageMask) => {
    e.stopPropagation();
    setIsSelected(true);
    setSelectedMaskId(mask.id);
    setActiveResizeMaskId(mask.id);
    maskDragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: mask.x,
      startY: mask.y,
      startW: mask.width,
      startH: mask.height,
    };
  };

  // HANDLERS PARA DRAG & DROP DA BANDEJA DE MÍDIAS E DO COMPUTADOR
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDropTarget(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDropTarget(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDropTarget(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const isVideoFile = file.type.startsWith('video/') || !!file.name.match(/\.(mp4|mov|webm)(\?.*)?$/i);

      if (isVideoFile && onAssignMedia) {
        const objectUrl = URL.createObjectURL(file);
        onAssignMedia(imageIndex, objectUrl);
        return;
      }

      const reader = new FileReader();
      reader.onload = (evt) => {
        const fileUrl = evt.target?.result as string;
        if (fileUrl && onAssignMedia) {
          onAssignMedia(imageIndex, fileUrl);
        }
      };
      reader.readAsDataURL(file);
      return;
    }

    const droppedUrl = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('text/uri-list');
    if (droppedUrl && onAssignMedia) {
      onAssignMedia(imageIndex, droppedUrl);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && onAssignMedia) {
      const file = e.target.files[0];
      const isVideoFile = file.type.startsWith('video/') || !!file.name.match(/\.(mp4|mov|webm)(\?.*)?$/i);

      if (isVideoFile) {
        const objectUrl = URL.createObjectURL(file);
        onAssignMedia(imageIndex, objectUrl);
        e.target.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = (evt) => {
        const fileUrl = evt.target?.result as string;
        if (fileUrl) {
          onAssignMedia(imageIndex, fileUrl);
        }
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    }
  };

  const activeMask = masks.find((m) => m.id === selectedMaskId);

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      {/* TOOLBAR FLUTUANTE ÚNICA E UNIFICADA (POSICIONADA FORA, ACIMA DA IMAGEM) */}
      {isInteractive && isSelected && !isDropTarget && (
        <div
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          className="absolute -top-12 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 bg-slate-900/95 border border-indigo-500/80 p-1.5 rounded-xl shadow-2xl backdrop-blur text-white animate-in fade-in zoom-in-95 duration-150 whitespace-nowrap shrink-0 select-none"
        >
          {activeMask ? (
            /* MODO 1: CONTROLES DA TARJA SELECIONADA (Foco total na edição da tarja ativa) */
            <>
              <span className="text-[10px] font-bold text-emerald-400 px-1 flex items-center gap-1 border-r border-slate-700/80 pr-2 shrink-0">
                <Square className="w-3 h-3 text-emerald-400 fill-emerald-400/20" />
                <span>Tarja</span>
              </span>

              {/* BOTÃO CONTA-GOTAS NATIVO (EyeDropper) */}
              {'EyeDropper' in window && (
                <button
                  type="button"
                  onClick={(e) => handlePickEyeDropper(activeMask.id, e)}
                  className="p-1 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/80 active:scale-95 flex items-center gap-1 text-[9px] font-bold transition shrink-0"
                  title="Conta-gotas: Clique para capturar a cor exata de fundo da foto"
                >
                  <Pipette className="w-3 h-3 text-emerald-400" />
                  <span>Conta-gotas</span>
                </button>
              )}

              {/* PALETA DE CORES RÁPIDAS */}
              <div className="flex items-center gap-1 px-1 border-l border-r border-slate-700/80 shrink-0">
                {[
                  { color: '#0f0f0f', title: 'Escuro (YouTube/Twitter)' },
                  { color: '#ffffff', title: 'Branco' },
                  { color: '#000000', title: 'Preto' },
                  { color: '#18181b', title: 'Cinza' },
                  { color: '#f8fafc', title: 'Off-White' },
                ].map((swatch) => (
                  <button
                    key={swatch.color}
                    type="button"
                    onClick={() => handleMaskColorChange(activeMask.id, swatch.color)}
                    className={`w-3.5 h-3.5 rounded-full border transition active:scale-90 ${
                      activeMask.color.toLowerCase() === swatch.color.toLowerCase()
                        ? 'ring-2 ring-emerald-400 scale-110 border-white'
                        : 'border-slate-600 hover:scale-105'
                    }`}
                    style={{ backgroundColor: swatch.color }}
                    title={swatch.title}
                  />
                ))}

                <input
                  type="color"
                  value={activeMask.color || '#0f0f0f'}
                  onChange={(e) => handleMaskColorChange(activeMask.id, e.target.value)}
                  className="w-4 h-4 rounded cursor-pointer border-0 p-0 bg-transparent shrink-0 ml-0.5"
                  title="Escolher cor personalizada"
                />
              </div>

              {/* DUPLICAR TARJA */}
              <button
                type="button"
                onClick={(e) => handleDuplicateMask(activeMask.id, e)}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-[9px] font-bold px-1.5 border border-slate-700 active:scale-95 flex items-center gap-1 shrink-0"
                title="Duplicar esta tarja"
              >
                <Copy className="w-3 h-3 text-slate-300" />
                <span>Duplicar</span>
              </button>

              {/* EXCLUIR TARJA */}
              <button
                type="button"
                onClick={(e) => handleRemoveMask(activeMask.id, e)}
                className="p-1 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 hover:text-rose-100 transition text-[9px] font-bold px-1.5 border border-rose-800/80 active:scale-95 flex items-center gap-1 shrink-0"
                title="Excluir esta tarja"
              >
                <Trash2 className="w-3 h-3 text-rose-400" />
                <span>Excluir</span>
              </button>

              <div className="w-[1px] h-4 bg-slate-700/80 mx-0.5 shrink-0" />

              {/* CONCLUIR / VOLTAR AO MODO IMAGEM */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedMaskId(null);
                }}
                className="p-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition text-[9px] font-bold px-2 active:scale-95 shrink-0"
                title="Concluir edição da tarja"
              >
                ✓ Concluir
              </button>
            </>
          ) : (
            /* MODO 2: CONTROLES DA IMAGEM (Zoom, Nova Tarja, Trocar, Remover) */
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleZoomChange(scale - 0.1);
                }}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition active:scale-95 shrink-0"
                title="Diminuir Zoom"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>

              <input
                type="range"
                min={1}
                max={3}
                step={0.05}
                value={scale}
                onChange={(e) => {
                  e.stopPropagation();
                  handleZoomChange(parseFloat(e.target.value));
                }}
                className="w-12 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 shrink-0"
                title={`Zoom da Imagem #${imageIndex + 1}: ${Math.round(scale * 100)}%`}
              />

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleZoomChange(scale + 0.1);
                }}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition active:scale-95 shrink-0"
                title="Aumentar Zoom"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={handleResetTransform}
                disabled={scale === 1 && offsetX === 0 && offsetY === 0}
                className="p-1 rounded-lg bg-indigo-950 hover:bg-indigo-900 disabled:opacity-30 text-indigo-300 transition text-[9px] font-bold px-1.5 border border-indigo-700/80 active:scale-95 flex items-center gap-0.5 shrink-0"
                title="Resetar Zoom e Posição"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                <span>Reset</span>
              </button>

              <div className="w-[1px] h-4 bg-slate-700/80 mx-0.5 shrink-0" />

              {/* BOTÃO + TARJA */}
              <button
                type="button"
                onClick={handleAddMask}
                className="p-1 rounded-lg bg-emerald-950/90 hover:bg-emerald-900 text-emerald-300 hover:text-emerald-100 transition text-[9px] font-bold px-2 border border-emerald-700/80 active:scale-95 flex items-center gap-1 shrink-0 shadow-sm"
                title="Adicionar retângulo de cobertura para apagar datas, avatares ou textos indesejados"
              >
                <Square className="w-3 h-3 text-emerald-400" />
                <span>+ Tarja</span>
              </button>

              <div className="w-[1px] h-4 bg-slate-700/80 mx-0.5 shrink-0" />

              {/* TROCAR & REMOÇÃO DE IMAGEM */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white transition text-[9px] font-bold px-1.5 border border-slate-700 active:scale-95 flex items-center gap-1 shrink-0"
                title="Trocar por outra imagem do computador"
              >
                <FolderOpen className="w-2.5 h-2.5" />
                <span>Trocar</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onAssignMedia) {
                    onAssignMedia(imageIndex, '');
                  }
                }}
                className="p-1 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 hover:text-rose-100 transition text-[9px] font-bold px-1.5 border border-rose-800/80 active:scale-95 flex items-center gap-1 shrink-0"
                title="Remover foto deste slot"
              >
                <Trash2 className="w-2.5 h-2.5" />
                <span>Remover</span>
              </button>
            </>
          )}
        </div>
      )}

      {/* CONTÊINER DA IMAGEM E DAS TARJAS */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`w-full h-full flex items-center justify-center overflow-hidden rounded-xl relative border select-none transition-all ${
          isDropTarget
            ? 'ring-4 ring-indigo-500 border-indigo-500 scale-[1.02] z-30 shadow-2xl'
            : isInteractive
            ? isSelected
              ? 'ring-2 ring-indigo-500 border-indigo-500 cursor-grab shadow-lg'
              : isDragging
              ? 'cursor-grabbing'
              : 'cursor-grab'
            : 'cursor-pointer hover:border-indigo-400/80 hover:bg-slate-800/40'
        }`}
        style={{ backgroundColor: cardBg, borderColor: isDropTarget ? '#6366f1' : isSelected ? '#6366f1' : borderColor }}
        title={isInteractive ? `Imagem #${imageIndex + 1} - Clique para selecionar e ver controles de zoom/tarjas` : 'Clique para selecionar do computador ou solte uma foto aqui'}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {url ? (
          imageLayer?.source?.mediaType === 'video' || url.startsWith('blob:') || url.startsWith('data:video/') || url.match(/\.(mp4|mov|webm)(\?.*)?$/i) ? (
            <video
              src={url}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover rounded-xl transition-all duration-75 pointer-events-none"
              style={{
                objectPosition: `${posX}% ${posY}%`,
                transform: `scale(${scale})`,
                transformOrigin: `${posX}% ${posY}%`,
              }}
            />
          ) : (
            <img
              src={url}
              alt={`Foto #${imageIndex + 1}`}
              draggable={false}
              className="w-full h-full object-cover rounded-xl transition-all duration-75 pointer-events-none"
              style={{
                objectPosition: `${posX}% ${posY}%`,
                transform: `scale(${scale})`,
                transformOrigin: `${posX}% ${posY}%`,
              }}
            />
          )
        ) : (
          <div className="flex flex-col items-center justify-center p-4 text-center gap-1.5" style={{ color: textSecondary }}>
            <UploadCloud className="w-6 h-6 text-indigo-400 opacity-80 mb-0.5" />
            <span className="text-xs font-semibold leading-tight">{fallbackText}</span>
          </div>
        )}

        {/* CAMADA DE TARJAS DE COBERTURA (IMAGE MASKS) */}
        {masks.map((mask) => {
          const isMaskSelected = selectedMaskId === mask.id && isSelected;
          return (
            <div
              key={mask.id}
              onMouseDown={(e) => handleMaskMouseDown(e, mask)}
              className={`absolute transition-shadow select-none z-20 cursor-move ${
                isMaskSelected ? 'ring-2 ring-emerald-400 shadow-xl' : 'hover:ring-1 hover:ring-indigo-300/80'
              }`}
              style={{
                left: `${mask.x}%`,
                top: `${mask.y}%`,
                width: `${mask.width}%`,
                height: `${mask.height}%`,
                backgroundColor: mask.color || '#0f0f0f',
                borderRadius: `${mask.borderRadius ?? 4}px`,
              }}
              title="Tarja de Cobertura - Arraste para mover"
            >
              {/* HANDLE DE REDIMENSIONAMENTO NO CANTO INFERIOR DIREITO */}
              {isMaskSelected && (
                <div
                  onMouseDown={(e) => handleResizeHandleMouseDown(e, mask)}
                  className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-slate-900 rounded-full cursor-nwse-resize shadow-lg hover:scale-125 transition-transform z-30"
                  title="Arraste para redimensionar a tarja"
                />
              )}
            </div>
          );
        })}

        {/* OVERLAY VISUAL DE DROP DESTACADO */}
        {isDropTarget && (
          <div className="absolute inset-0 bg-indigo-950/85 backdrop-blur-sm flex flex-col items-center justify-center text-white z-40 p-4 text-center animate-fadeIn">
            <Sparkles className="w-8 h-8 text-indigo-400 animate-pulse mb-2" />
            <span className="text-xs font-bold uppercase tracking-wider">Solte para aplicar à Foto #{imageIndex + 1}</span>
          </div>
        )}

        {/* Dica discreta ao passar o mouse */}
        {isInteractive && !isDragging && !isDropTarget && !isSelected && (
          <div className="absolute bottom-2 right-2 bg-slate-900/80 text-white text-[10px] px-2 py-0.5 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition shadow backdrop-blur flex items-center gap-1">
            <span>✋ Clique para ajustar Zoom ou Tarjas</span>
            {masks.length > 0 && <span className="bg-emerald-500/40 text-emerald-300 px-1 rounded font-bold">{masks.length} tarja(s)</span>}
          </div>
        )}
      </div>
    </div>
  );
};
