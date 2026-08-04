import React, { useState, useRef, useEffect } from 'react';
import { ImageLayer } from '@/types/carousel';
import { Sparkles, UploadCloud, ZoomIn, ZoomOut, RotateCcw, FolderOpen, Trash2 } from 'lucide-react';

interface InteractiveImageContainerProps {
  imageLayer?: ImageLayer;
  imageIndex: number;
  onImageTransform?: (imageIndex: number, transform: { scale?: number; offsetX?: number; offsetY?: number }) => void;
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

  const url = imageLayer?.source?.url;
  const rawScale = imageLayer?.scale ?? 1;
  const scale = Math.max(1, rawScale);
  const offsetX = imageLayer?.offsetX ?? 0;
  const offsetY = imageLayer?.offsetY ?? 0;

  const isInteractive = !!url;

  // Fechar controles de zoom ao clicar fora da imagem
  useEffect(() => {
    if (!isSelected) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsSelected(false);
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

    if (!onImageTransform) return;
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startOffsetX: offsetX,
      startOffsetY: offsetY,
    };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStartRef.current || !containerRef.current || !onImageTransform) return;
    e.preventDefault();

    const rect = containerRef.current.getBoundingClientRect();
    const deltaX = ((e.clientX - dragStartRef.current.x) / rect.width) * 100;
    const deltaY = ((e.clientY - dragStartRef.current.y) / rect.height) * 100;

    const sensitivity = 0.8;
    const newOffsetX = Math.max(-50, Math.min(50, dragStartRef.current.startOffsetX - deltaX * sensitivity));
    const newOffsetY = Math.max(-50, Math.min(50, dragStartRef.current.startOffsetY - deltaY * sensitivity));

    onImageTransform(imageIndex, { offsetX: newOffsetX, offsetY: newOffsetY });
  };

  const handleMouseUpOrLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      dragStartRef.current = null;
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

    // 1. Arquivos arrastados direto do computador
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

    // 2. Mídia arrastada da Bandeja de Mídias
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

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      {/* TOOLBAR FLUTUANTE DE TROCA DE IMAGEM & ZOOM (Aparece ACIMA da imagem quando selecionada) */}
      {isInteractive && isSelected && !isDropTarget && (
        <div
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          className="absolute -top-12 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 bg-slate-900/95 border border-indigo-500/80 p-1.5 rounded-xl shadow-2xl backdrop-blur text-white animate-in fade-in zoom-in-95 duration-150 whitespace-nowrap shrink-0 select-none"
        >
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
            className="w-16 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 shrink-0"
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

          <span className="text-[10px] font-mono font-extrabold text-indigo-300 w-9 text-center shrink-0 inline-block">
            {Math.round(scale * 100)}%
          </span>

          <button
            type="button"
            onClick={handleResetTransform}
            disabled={scale === 1 && offsetX === 0 && offsetY === 0}
            className="p-1 rounded-lg bg-indigo-950 hover:bg-indigo-900 disabled:opacity-30 disabled:hover:bg-indigo-950 text-indigo-300 transition text-[9px] font-bold px-1.5 border border-indigo-700/80 active:scale-95 flex items-center gap-0.5 shrink-0"
            title="Resetar Zoom e Posição"
          >
            <RotateCcw className="w-2.5 h-2.5" />
            <span>Reset</span>
          </button>

          <div className="w-[1px] h-4 bg-slate-700/80 mx-0.5 shrink-0" />

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
        </div>
      )}

      {/* CONTÊINER DA IMAGEM COM OVERFLOW HIDDEN */}
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
        title={isInteractive ? `Imagem #${imageIndex + 1} - Clique para selecionar e ver controles de zoom` : 'Clique para selecionar do computador ou solte uma foto aqui'}
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

        {/* OVERLAY VISUAL DE DROP DESTACADO */}
        {isDropTarget && (
          <div className="absolute inset-0 bg-indigo-950/85 backdrop-blur-sm flex flex-col items-center justify-center text-white z-40 p-4 text-center animate-fadeIn">
            <Sparkles className="w-8 h-8 text-indigo-400 animate-pulse mb-2" />
            <span className="text-xs font-bold uppercase tracking-wider">Solte para aplicar à Foto #{imageIndex + 1}</span>
          </div>
        )}

        {/* Dica discreta ao passar o mouse */}
        {isInteractive && !isDragging && !isDropTarget && !isSelected && (
          <div className="absolute bottom-2 right-2 bg-slate-900/80 text-white text-[10px] px-2 py-0.5 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition shadow backdrop-blur">
            ✋ Clique para selecionar e ajustar Zoom
          </div>
        )}
      </div>
    </div>
  );
};
