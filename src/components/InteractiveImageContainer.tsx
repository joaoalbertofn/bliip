import React, { useState, useRef } from 'react';
import { ImageLayer } from '@/types/carousel';
import { Sparkles } from 'lucide-react';

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
  fallbackText = 'Faça upload de uma imagem ou arraste da galeria',
  cardBg = '#f8fafc',
  borderColor = '#e2e8f0',
  textSecondary = '#64748b',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isDropTarget, setIsDropTarget] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; startOffsetX: number; startOffsetY: number } | null>(null);

  const url = imageLayer?.source?.url;
  const scale = imageLayer?.scale ?? 1;
  const offsetX = imageLayer?.offsetX ?? 0;
  const offsetY = imageLayer?.offsetY ?? 0;

  const isInteractive = !!url;

  // Converter offsetX e offsetY (-50 a +50) para porcentagem de object-position (0% a 100%)
  const posX = Math.max(0, Math.min(100, 50 + offsetX));
  const posY = Math.max(0, Math.min(100, 50 + offsetY));

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    onSelect?.(imageIndex);
    if (!url || !onImageTransform) return;
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

  // HANDLERS PARA DRAG & DROP DA BANDEJA DE MÍDIAS
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

    const droppedUrl = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('text/uri-list');
    if (droppedUrl && onAssignMedia) {
      onAssignMedia(imageIndex, droppedUrl);
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUpOrLeave}
      onMouseLeave={handleMouseUpOrLeave}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex items-center justify-center overflow-hidden rounded-xl relative border select-none transition-all ${
        isDropTarget
          ? 'ring-4 ring-indigo-500 border-indigo-500 scale-[1.02] z-30 shadow-2xl'
          : isInteractive
          ? isDragging
            ? 'cursor-grabbing'
            : 'cursor-grab'
          : 'cursor-default'
      } ${className}`}
      style={{ backgroundColor: cardBg, borderColor: isDropTarget ? '#6366f1' : borderColor }}
      title={isInteractive ? `Imagem #${imageIndex + 1} - Clique para mover ou solte outra foto aqui` : undefined}
    >
      {url ? (
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
      ) : (
        <div className="flex flex-col items-center justify-center p-6 text-center" style={{ color: textSecondary }}>
          <span className="text-sm font-medium">{fallbackText}</span>
        </div>
      )}

      {/* OVERLAY VISUAL DE DROP DESTACADO */}
      {isDropTarget && (
        <div className="absolute inset-0 bg-indigo-950/80 backdrop-blur-sm flex flex-col items-center justify-center text-white z-40 p-4 text-center animate-fadeIn">
          <Sparkles className="w-8 h-8 text-indigo-400 animate-pulse mb-2" />
          <span className="text-xs font-bold uppercase tracking-wider">Solte para aplicar à Foto #{imageIndex + 1}</span>
        </div>
      )}

      {/* Dica discreta ao passar o mouse */}
      {isInteractive && !isDragging && !isDropTarget && (
        <div className="absolute bottom-2 right-2 bg-slate-900/80 text-white text-[10px] px-2 py-0.5 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition shadow backdrop-blur">
          ✋ Clique & Arraste Imagem #{imageIndex + 1}
        </div>
      )}
    </div>
  );
};
