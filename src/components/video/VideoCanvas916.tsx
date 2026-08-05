import React, { useRef, useState, useEffect } from 'react';
import { Upload, Eye } from 'lucide-react';
import { VerticalVideoProject, TrackItem, BliipVideoTemplate, MultiBarPresetStyle } from '@/types/video';
import { DEFAULT_VIDEO_TEMPLATES } from '@/data/defaultVideoPresets';

interface VideoCanvas916Props {
  project: VerticalVideoProject;
  currentTime: number;
  isPlaying: boolean;
  selectedTrackItemId: string | null;
  onVideoUpload: (file: File) => void;
  onSelectTrackItem: (id: string | null) => void;
  onUpdateItemPosition: (id: string, x: number, y: number) => void;
  onUpdateItemWidth?: (id: string, width: number) => void;
  onUpdateItemText: (id: string, text: string) => void;
  onTimeUpdate: (time: number) => void;
  onAddTemplateFromDrop?: (template: BliipVideoTemplate) => void;
}

// RENDERIZADOR DE BARRAS INDIVIDUAIS POR LINHA & NEON BADGES (MULTI-BAR LINE HIGHLIGHTER ENGINE)
const MultiBarTextRenderer: React.FC<{
  item: TrackItem;
  isEditing: boolean;
  editingTextValue: string;
  onTextChange: (val: string) => void;
  onBlur: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}> = ({ item, isEditing, editingTextValue, onTextChange, onBlur, onKeyDown }) => {
  const text = isEditing ? editingTextValue : item.content.text || '';
  const preset: MultiBarPresetStyle = item.content.multiBarPreset || (item.content.presetStyle as MultiBarPresetStyle) || 'italo_black_white';
  const fontFamily = item.content.fontFamily || 'Impact, sans-serif';
  const tiltAngle = item.content.tiltAngle || 0;
  const bgOpacityVal = item.content.bgOpacity !== undefined ? item.content.bgOpacity / 100 : 0.95;

  if (isEditing) {
    return (
      <input
        type="text"
        autoFocus
        value={editingTextValue}
        onChange={(e) => onTextChange(e.target.value)}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        className="bg-slate-950/90 text-white px-3 py-1.5 rounded-xl border-2 border-purple-500 outline-none text-center w-full shadow-2xl font-bold"
      />
    );
  }

  // Se o texto não contiver \n, fazemos a divisão inteligente de palavras em 2 linhas se for longo
  let lines: string[] = [];
  if (text.includes('\n')) {
    lines = text.split('\n');
  } else {
    const words = text.split(' ');
    if (words.length > 3) {
      const mid = Math.ceil(words.length / 2);
      lines = [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
    } else {
      lines = [text];
    }
  }

  // Renderização Especial: Badges Neon (Estilo Sabrina Riguette "R$ 1 MM -> R$ 3.6 MM")
  if (preset === ('neon_badges' as any)) {
    return (
      <div
        style={{ transform: tiltAngle ? `rotate(${tiltAngle}deg)` : undefined, fontFamily: 'Montserrat, sans-serif' }}
        className="flex items-center gap-2 justify-center flex-wrap"
      >
        <span className="bg-red-600 text-white px-3 py-1 rounded-xl font-black text-sm shadow-[0_0_15px_rgba(239,68,68,0.7)] border border-red-400">
          {lines[0] || 'R$ 1 MM'}
        </span>
        <span className="text-white font-bold text-xs">➔</span>
        <span className="bg-emerald-500 text-white px-3 py-1 rounded-xl font-black text-sm shadow-[0_0_15px_rgba(34,197,94,0.7)] border border-emerald-300">
          {lines[1] || 'R$ 3.6 MM'}
        </span>
      </div>
    );
  }

  // Renderização Especial: Ali Abdaal Marca-Texto ("and how to fix it.")
  if (preset === ('ali_abdaal_highlight' as any)) {
    return (
      <div
        style={{ transform: tiltAngle ? `rotate(${tiltAngle}deg)` : undefined, fontFamily: 'Montserrat, sans-serif' }}
        className="text-center font-black text-lg text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)] leading-tight"
      >
        {lines.map((l, idx) => (
          <span key={idx} className="inline-block mx-1">
            {idx === lines.length - 1 ? (
              <span className="bg-amber-400 text-slate-950 px-2 py-0.5 rounded-md font-black shadow-md">
                {l}
              </span>
            ) : (
              <span>{l} </span>
            )}
          </span>
        ))}
      </div>
    );
  }

  // Cores das Barras Duplas (Linha 1 vs Linha 2)
  const getLineStyles = (index: number) => {
    const isEven = index % 2 === 0;

    switch (preset) {
      case 'caco_yellow_white':
        return isEven
          ? { bg: '#FACC15', color: '#0F172A' } // Linha 1: Amarelo Neon + Texto Preto
          : { bg: '#FFFFFF', color: '#0F172A' }; // Linha 2: Branco + Texto Preto

      case 'ladeira_red_white':
        return isEven
          ? { bg: '#EF4444', color: '#FFFFFF' } // Linha 1: Vermelho Alerta + Texto Branco
          : { bg: '#FFFFFF', color: '#0F172A' }; // Linha 2: Branco + Texto Preto

      case 'wagnner_blue_white':
        return isEven
          ? { bg: '#2563EB', color: '#FFFFFF' } // Linha 1: Azul Conversão + Texto Branco
          : { bg: '#FFFFFF', color: '#0F172A' }; // Linha 2: Branco + Texto Preto

      case 'sticker_outlined':
        return { bg: 'transparent', color: '#FFFFFF', stroke: '3px #000000' };

      case 'italo_black_white':
      default:
        return isEven
          ? { bg: `rgba(15, 23, 42, ${bgOpacityVal})`, color: '#FFFFFF' } // Linha 1: Preto Sólido + Texto Branco
          : { bg: `rgba(255, 255, 255, ${bgOpacityVal})`, color: '#0F172A' }; // Linha 2: Branco Puro + Texto Preto
    }
  };

  return (
    <div
      style={{
        transform: tiltAngle ? `rotate(${tiltAngle}deg)` : undefined,
        fontFamily,
      }}
      className="flex flex-col items-center gap-1.5 transition-transform"
    >
      {lines.map((line, idx) => {
        const lineStyle = getLineStyles(idx);
        return (
          <div
            key={idx}
            style={{
              backgroundColor: lineStyle.bg,
              color: lineStyle.color,
              WebkitTextStroke: lineStyle.stroke,
              borderRadius: '8px',
              padding: '6px 14px',
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.75)',
              border: lineStyle.bg !== 'transparent' ? '1px solid rgba(255, 255, 255, 0.25)' : undefined,
            }}
            className="inline-block uppercase tracking-wider font-black text-center shadow-xl leading-snug w-auto max-w-full"
          >
            {line}
          </div>
        );
      })}
    </div>
  );
};

export const VideoCanvas916: React.FC<VideoCanvas916Props> = ({
  project,
  currentTime,
  isPlaying,
  selectedTrackItemId,
  onVideoUpload,
  onSelectTrackItem,
  onUpdateItemPosition,
  onUpdateItemWidth,
  onUpdateItemText,
  onTimeUpdate,
  onAddTemplateFromDrop,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showSafeZones, setShowSafeZones] = useState<boolean>(true);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingTextValue, setEditingTextValue] = useState<string>('');

  // Mouse Dragging States (Mover posição)
  const [draggingItemId, setDraggingItemId] = useState<string | null>(null);
  const [resizingItemId, setResizingItemId] = useState<string | null>(null);
  const [resizeInitialWidth, setResizeInitialWidth] = useState<number>(240);
  const [resizeStartX, setResizeStartX] = useState<number>(0);

  const [showSnapGuideX, setShowSnapGuideX] = useState<boolean>(false);
  const [showSnapGuideY, setShowSnapGuideY] = useState<boolean>(false);

  // Sincroniza a reprodução do vídeo com currentTime e isPlaying
  useEffect(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (!videoRef.current) return;
    if (Math.abs(videoRef.current.currentTime - currentTime) > 0.3) {
      videoRef.current.currentTime = currentTime;
    }
  }, [currentTime]);

  const handleNativeTimeUpdate = () => {
    if (videoRef.current && isPlaying) {
      onTimeUpdate(videoRef.current.currentTime);
    }
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setShowSnapGuideX(false);
    setShowSnapGuideY(false);

    // 1. Checa se é um template JSON arrastado da sidebar
    const rawTemplateData = e.dataTransfer.getData('application/json');
    if (rawTemplateData && onAddTemplateFromDrop) {
      try {
        const template = JSON.parse(rawTemplateData);
        onAddTemplateFromDrop(template);
        return;
      } catch (err) {}
    }

    // 2. Checa se é um arquivo de vídeo do computador
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('video/')) {
        onVideoUpload(file);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onVideoUpload(e.target.files[0]);
    }
  };

  // MOUSE DRAGGING DOS ELEMENTOS NO CANVAS 9:16
  const handleItemMouseDown = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    onSelectTrackItem(itemId);
    setDraggingItemId(itemId);
  };

  // MANIPULAÇÃO DAS ALÇAS LATERAIS DE REDIMENSIONAMENTO
  const handleResizeHandleMouseDown = (e: React.MouseEvent, item: TrackItem) => {
    e.stopPropagation();
    setResizingItemId(item.id);
    setResizeStartX(e.clientX);
    setResizeInitialWidth(item.position.width || 240);
  };

  const handleMouseMoveContainer = (e: React.MouseEvent<HTMLDivElement>) => {
    if (resizingItemId && onUpdateItemWidth) {
      const deltaX = e.clientX - resizeStartX;
      const newWidth = Math.max(120, Math.min(320, resizeInitialWidth + deltaX * 1.5));
      onUpdateItemWidth(resizingItemId, Math.round(newWidth));
      return;
    }

    if (!draggingItemId || !canvasContainerRef.current) return;

    const rect = canvasContainerRef.current.getBoundingClientRect();
    let newXPercent = ((e.clientX - rect.left) / rect.width) * 100;
    let newYPercent = ((e.clientY - rect.top) / rect.height) * 100;

    // SNAPPING MAGNÉTICO AO CENTRO (Eixo X = 50%, Eixo Y = 50%)
    const SNAP_TOLERANCE = 3.5;

    if (Math.abs(newXPercent - 50) < SNAP_TOLERANCE) {
      newXPercent = 50;
      setShowSnapGuideX(true);
    } else {
      setShowSnapGuideX(false);
    }

    if (Math.abs(newYPercent - 50) < SNAP_TOLERANCE) {
      newYPercent = 50;
      setShowSnapGuideY(true);
    } else {
      setShowSnapGuideY(false);
    }

    newXPercent = Math.max(5, Math.min(95, newXPercent));
    newYPercent = Math.max(5, Math.min(95, newYPercent));

    onUpdateItemPosition(draggingItemId, Math.round(newXPercent), Math.round(newYPercent));
  };

  const handleMouseUpContainer = () => {
    setDraggingItemId(null);
    setResizingItemId(null);
    setShowSnapGuideX(false);
    setShowSnapGuideY(false);
  };

  // Filtra itens visíveis no tempo atual
  const visibleItems = project.activeTrackItems.filter(
    (item) => currentTime >= item.startTime && currentTime <= item.endTime
  );

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center relative select-none p-2"
      onMouseMove={handleMouseMoveContainer}
      onMouseUp={handleMouseUpContainer}
      onMouseLeave={handleMouseUpContainer}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="video/*"
        className="hidden"
      />

      {/* Controls Bar at Top of Canvas */}
      <div className="flex items-center gap-3 mb-2 z-10 bg-slate-900/80 backdrop-blur-md px-4 py-1 rounded-full border border-slate-800 text-xs text-slate-300 shadow-lg">
        <button
          onClick={() => setShowSafeZones(!showSafeZones)}
          className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full transition ${
            showSafeZones ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40' : 'hover:bg-slate-800'
          }`}
          title="Zonas Seguras para Reels/TikTok"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Safe Zones {showSafeZones ? 'ON' : 'OFF'}</span>
        </button>

        <span className="text-slate-600">|</span>

        <span className="font-mono text-[11px]">
          {project.videoUrl ? `${currentTime.toFixed(1)}s / ${project.duration.toFixed(1)}s` : '9:16 (1080x1920)'}
        </span>
      </div>

      {/* Main Clean 9:16 Canvas Container */}
      <div
        ref={canvasContainerRef}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleFileDrop}
        className="relative w-[320px] sm:w-[360px] aspect-[9/16] bg-slate-950 border-4 border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col items-center justify-center transition-all"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 35px rgba(168, 85, 247, 0.2)',
        }}
      >
        {/* GUIAS VISUAIS DE ALINHAMENTO COM ATRAÇÃO MAGNÉTICA (SNAPPING) */}
        {showSnapGuideX && (
          <div className="absolute inset-y-0 left-1/2 w-0.5 bg-pink-500 z-40 shadow-glow pointer-events-none" />
        )}
        {showSnapGuideY && (
          <div className="absolute inset-x-0 top-1/2 h-0.5 bg-pink-500 z-40 shadow-glow pointer-events-none" />
        )}

        {!project.videoUrl ? (
          /* Dropzone State when no video is loaded */
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-full flex flex-col items-center justify-center p-6 text-center cursor-pointer group hover:bg-purple-950/20 transition duration-300"
          >
            <div className="w-16 h-16 rounded-3xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:border-purple-500/50 transition">
              <Upload className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-sm font-bold text-slate-100 mb-1">
              Arraste seu vídeo aqui
            </h3>
            <p className="text-xs text-slate-400 max-w-[200px] mb-4">
              ou clique para escolher um arquivo do seu computador
            </p>
            <span className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-[11px] font-bold shadow-md">
              Selecionar Vídeo MP4 / MOV
            </span>
          </div>
        ) : (
          /* Video Player Active State (100% Full Canvas 9:16) */
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-black">
            <video
              ref={videoRef}
              src={project.videoUrl}
              onTimeUpdate={handleNativeTimeUpdate}
              muted={project.trimConfig.muted}
              playsInline
              className="w-full h-full object-cover"
            />

            {/* Overlays Layer */}
            <div
              className="absolute inset-0 z-20 pointer-events-auto"
              onClick={() => onSelectTrackItem(null)}
            >
              {visibleItems.map((item) => {
                const isSelected = selectedTrackItemId === item.id;

                return (
                  <div
                    key={item.id}
                    onMouseDown={(e) => handleItemMouseDown(e, item.id)}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectTrackItem(item.id);
                    }}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      if (item.content.text) {
                        setEditingItemId(item.id);
                        setEditingTextValue(item.content.text);
                      }
                    }}
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing transition-shadow ${
                      isSelected ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-slate-900 rounded-2xl p-1' : ''
                    }`}
                    style={{
                      left: `${item.position.x}%`,
                      top: `${item.position.y}%`,
                      width: item.position.width ? `${item.position.width}px` : 'auto',
                      maxWidth: '92%',
                      transform: `translate(-50%, -50%) scale(${item.position.scale || 1})`,
                    }}
                  >
                    {/* BOUNDING BOX HANDLES DE REDIMENSIONAMENTO NAS LATERAIS */}
                    {isSelected && (
                      <>
                        <div
                          onMouseDown={(e) => handleResizeHandleMouseDown(e, item)}
                          className="absolute -left-3 top-1/2 -translate-y-1/2 w-3.5 h-7 bg-purple-500 border border-white rounded-full cursor-ew-resize shadow-md hover:scale-125 transition z-30"
                          title="Arraste para alterar a largura e quebra de linha"
                        />
                        <div
                          onMouseDown={(e) => handleResizeHandleMouseDown(e, item)}
                          className="absolute -right-3 top-1/2 -translate-y-1/2 w-3.5 h-7 bg-purple-500 border border-white rounded-full cursor-ew-resize shadow-md hover:scale-125 transition z-30"
                          title="Arraste para alterar a largura e quebra de linha"
                        />
                      </>
                    )}

                    {/* Render Image Overlay */}
                    {item.trackType === 'image_overlay' && item.content.imageUrl && (
                      <img
                        src={item.content.imageUrl}
                        alt="Overlay"
                        className="max-w-[180px] max-h-[180px] object-contain rounded-lg drop-shadow-xl"
                      />
                    )}

                    {/* RENDERIZAÇÃO DAS BARRAS INDIVIDUAIS POR LINHA (MULTI-BAR LINE HIGHLIGHTER ENGINE) */}
                    {item.content.text && (
                      <MultiBarTextRenderer
                        item={item}
                        isEditing={editingItemId === item.id}
                        editingTextValue={editingTextValue}
                        onTextChange={setEditingTextValue}
                        onBlur={() => {
                          onUpdateItemText(item.id, editingTextValue);
                          setEditingItemId(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            onUpdateItemText(item.id, editingTextValue);
                            setEditingItemId(null);
                          }
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Safe Zones Overlay Mask (Instagram Reels / TikTok) */}
            {showSafeZones && (
              <div className="absolute inset-0 pointer-events-none z-15 flex flex-col justify-between p-3 border border-pink-500/20">
                <div className="absolute right-3 bottom-24 flex flex-col items-center gap-3 text-white/50 text-[10px]">
                  <div className="w-8 h-8 rounded-full bg-slate-800/40 border border-white/20 flex items-center justify-center">❤️</div>
                  <div className="w-8 h-8 rounded-full bg-slate-800/40 border border-white/20 flex items-center justify-center">💬</div>
                  <div className="w-8 h-8 rounded-full bg-slate-800/40 border border-white/20 flex items-center justify-center">✈️</div>
                </div>

                <div className="absolute bottom-4 left-3 right-14 text-white/50 text-[10px] space-y-1">
                  <div className="font-bold">@seu_perfil</div>
                  <div className="text-[9px] truncate">Áudio original - Bliip Creator</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
