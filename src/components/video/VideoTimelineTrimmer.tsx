import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Trash2,
  Sparkles,
  Type,
  Image as ImageIcon,
  Music,
  Video,
} from 'lucide-react';
import { VerticalVideoProject, TrackItem } from '@/types/video';

interface VideoTimelineTrimmerProps {
  project: VerticalVideoProject;
  currentTime: number;
  isPlaying: boolean;
  selectedTrackItemId: string | null;
  onTimeUpdate: (time: number) => void;
  onTogglePlay: () => void;
  onToggleMute: () => void;
  onSelectTrackItem: (id: string | null) => void;
  onRemoveTrackItem: (id: string) => void;
  onUpdateTrackItemTiming: (id: string, startTime: number, endTime: number) => void;
}

export const VideoTimelineTrimmer: React.FC<VideoTimelineTrimmerProps> = ({
  project,
  currentTime,
  isPlaying,
  selectedTrackItemId,
  onTimeUpdate,
  onTogglePlay,
  onToggleMute,
  onSelectTrackItem,
  onRemoveTrackItem,
  onUpdateTrackItemTiming,
}) => {
  const duration = project.duration || 30;
  const timelineRulerRef = useRef<HTMLDivElement>(null);

  // REFS MUTÁVEIS PARA ALTA PERFORMANCE (Evita re-render / event tearing no arraste da agulha)
  const isScrubbingRef = useRef<boolean>(false);
  const durationRef = useRef<number>(duration);
  durationRef.current = duration;

  const onTimeUpdateRef = useRef(onTimeUpdate);
  onTimeUpdateRef.current = onTimeUpdate;

  const onUpdateTrackItemTimingRef = useRef(onUpdateTrackItemTiming);
  onUpdateTrackItemTimingRef.current = onUpdateTrackItemTiming;

  // Estados de Trimming e Dragging de Blocos
  const [trimmingItemId, setTrimmingItemId] = useState<string | null>(null);
  const [trimHandleType, setTrimHandleType] = useState<'start' | 'end' | null>(null);
  const [draggingBlockId, setDraggingBlockId] = useState<string | null>(null);

  const trimmingItemIdRef = useRef(trimmingItemId);
  trimmingItemIdRef.current = trimmingItemId;

  const trimHandleTypeRef = useRef(trimHandleType);
  trimHandleTypeRef.current = trimHandleType;

  const draggingBlockIdRef = useRef(draggingBlockId);
  draggingBlockIdRef.current = draggingBlockId;

  const dragClickTimeOffsetRef = useRef<number>(0);
  const dragBlockDurationRef = useRef<number>(5);
  const activeTrackItemsRef = useRef(project.activeTrackItems);
  activeTrackItemsRef.current = project.activeTrackItems;

  const rafIdRef = useRef<number | null>(null);

  // CÁLCULO INSTANTÂNEO DE TEMPO 1:1 A PARTIR DA POSIÇÃO X DO CURSOR
  const getTimeFromClientX = useCallback((clientX: number) => {
    if (!timelineRulerRef.current) return 0;
    const rect = timelineRulerRef.current.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, relativeX / rect.width));
    return ratio * durationRef.current;
  }, []);

  // 1. DISPARO DO SCRUBBING DA AGULHA TEMPORAL
  const handleStartScrubbing = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isScrubbingRef.current = true;
    const newTime = getTimeFromClientX(e.clientX);
    onTimeUpdateRef.current(newTime);
  };

  // 2. INÍCIO DO ARRASTE DO BLOCO INTEIRO PELO CENTRO
  const handleBlockCenterMouseDown = (e: React.MouseEvent, item: TrackItem) => {
    e.stopPropagation();
    e.preventDefault();
    onSelectTrackItem(item.id);

    const clickTime = getTimeFromClientX(e.clientX);
    dragClickTimeOffsetRef.current = clickTime - item.startTime;
    dragBlockDurationRef.current = item.endTime - item.startTime;
    setDraggingBlockId(item.id);
  };

  // 3. INÍCIO DO ARRASTE DAS ALÇAS DE INÍCIO/FIM DO BLOCO
  const handleBlockTrimMouseDown = (e: React.MouseEvent, item: TrackItem, handle: 'start' | 'end') => {
    e.stopPropagation();
    e.preventDefault();
    onSelectTrackItem(item.id);
    setTrimmingItemId(item.id);
    setTrimHandleType(handle);
  };

  // OUVINTE GLOBAL PERMANENTE COM REQUEST ANIMATION FRAME PARA 60FPS INSTANTÂNEO
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isScrubbingRef.current && !draggingBlockIdRef.current && !trimmingItemIdRef.current) return;

      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }

      rafIdRef.current = requestAnimationFrame(() => {
        const mouseTime = getTimeFromClientX(e.clientX);

        // A. Scrubbing em Tempo Real da Agulha Temporal
        if (isScrubbingRef.current) {
          onTimeUpdateRef.current(mouseTime);
          return;
        }

        // B. Arraste do Bloco Inteiro pelo Centro
        if (draggingBlockIdRef.current) {
          const blockDur = dragBlockDurationRef.current;
          let newStart = mouseTime - dragClickTimeOffsetRef.current;
          newStart = Math.max(0, Math.min(durationRef.current - blockDur, newStart));
          const newEnd = newStart + blockDur;
          onUpdateTrackItemTimingRef.current(
            draggingBlockIdRef.current,
            Math.round(newStart * 10) / 10,
            Math.round(newEnd * 10) / 10
          );
          return;
        }

        // C. Trimming das Extremidades (start/end)
        if (trimmingItemIdRef.current && trimHandleTypeRef.current) {
          const targetItem = activeTrackItemsRef.current.find((i) => i.id === trimmingItemIdRef.current);
          if (!targetItem) return;

          if (trimHandleTypeRef.current === 'start') {
            const validStart = Math.max(0, Math.min(mouseTime, targetItem.endTime - 0.5));
            onUpdateTrackItemTimingRef.current(
              trimmingItemIdRef.current,
              Math.round(validStart * 10) / 10,
              targetItem.endTime
            );
          } else {
            const validEnd = Math.min(durationRef.current, Math.max(mouseTime, targetItem.startTime + 0.5));
            onUpdateTrackItemTimingRef.current(
              trimmingItemIdRef.current,
              targetItem.startTime,
              Math.round(validEnd * 10) / 10
            );
          }
        }
      });
    };

    const handleMouseUp = () => {
      isScrubbingRef.current = false;
      setDraggingBlockId(null);
      setTrimmingItemId(null);
      setTrimHandleType(null);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [getTimeFromClientX]);

  const getPositionStyle = (startTime: number, endTime: number) => {
    const leftPercent = (startTime / duration) * 100;
    const widthPercent = Math.max(3, ((endTime - startTime) / duration) * 100);
    return {
      left: `${leftPercent}%`,
      width: `${widthPercent}%`,
    };
  };

  const subtitlesItems = project.activeTrackItems.filter((i) => i.trackType === 'subtitles');
  const titleItems = project.activeTrackItems.filter((i) => i.trackType === 'title_overlay');
  const imageItems = project.activeTrackItems.filter((i) => i.trackType === 'image_overlay');

  return (
    <div className="w-full bg-slate-900 border-t border-slate-800 flex flex-col select-none text-slate-200">
      {/* Top Playback Control Bar */}
      <div className="px-4 py-2 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onTogglePlay}
            disabled={!project.videoUrl}
            className="w-8 h-8 rounded-full bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 text-white flex items-center justify-center transition shadow-md"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>

          <button
            onClick={onToggleMute}
            className={`p-2 rounded-xl border transition ${
              project.trimConfig.muted
                ? 'bg-red-950/40 border-red-500/40 text-red-400'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
            title="Mudar Som Original"
          >
            {project.trimConfig.muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <span className="font-mono text-xs text-slate-300 font-bold">
            {currentTime.toFixed(1)}s <span className="text-slate-500">/</span> {duration.toFixed(1)}s
          </span>
        </div>

        {selectedTrackItemId && (
          <button
            onClick={() => onRemoveTrackItem(selectedTrackItemId)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/60 hover:bg-red-900/60 border border-red-500/40 text-red-300 rounded-xl font-bold transition text-[11px]"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Remover Elemento</span>
          </button>
        )}
      </div>

      {/* Multi-Track Editor Container */}
      <div className="p-3 overflow-x-auto">
        <div className="min-w-[600px] flex flex-col gap-2 relative">
          {/* Time Ruler Bar (Régua com Interação Instantânea) */}
          <div
            ref={timelineRulerRef}
            onMouseDown={handleStartScrubbing}
            className="h-6 bg-slate-950 rounded-lg border border-slate-800 relative cursor-pointer flex items-center px-2 text-[10px] text-slate-400 font-mono select-none"
          >
            <span>00:00</span>
            <span className="ml-auto">{duration.toFixed(0)}s</span>

            {/* AGULHA TEMPORAL GLOBAL (Playhead Line & Interactive Drag Handle) */}
            <div
              onMouseDown={handleStartScrubbing}
              className="absolute top-0 bottom-0 w-1 bg-pink-500 shadow-glow z-50 cursor-ew-resize flex flex-col items-center pointer-events-auto"
              style={{ left: `${(currentTime / duration) * 100}%` }}
            >
              {/* Playhead Head Button */}
              <div className="w-4 h-4 bg-pink-500 rounded-full border-2 border-white shadow-xl -mt-1.5 hover:scale-125 transition" />
            </div>
          </div>

          {/* TRACK 1: Video Base Track */}
          <div className="flex items-center gap-3">
            <div className="w-32 shrink-0 flex items-center gap-1.5 text-xs font-bold text-slate-300">
              <Video className="w-3.5 h-3.5 text-pink-400" />
              <span>1. Vídeo Base</span>
            </div>
            <div
              onMouseDown={handleStartScrubbing}
              className="flex-1 h-9 bg-slate-950/90 border border-slate-800 rounded-xl relative overflow-hidden flex items-center px-2 cursor-pointer"
            >
              <div
                className="absolute inset-y-0 bg-gradient-to-r from-pink-600/30 via-purple-600/30 to-indigo-600/30 border border-purple-500/40 rounded-lg pointer-events-none"
                style={{
                  left: `${(project.trimConfig.startTime / duration) * 100}%`,
                  width: `${((project.trimConfig.endTime - project.trimConfig.startTime) / duration) * 100}%`,
                }}
              />
              <span className="text-[11px] font-mono font-bold text-slate-300 z-10 pointer-events-none">
                {project.videoUrl ? 'Vídeo Original (9:16)' : 'Nenhum vídeo carregado'}
              </span>
            </div>
          </div>

          {/* TRACK 2: AI Subtitles */}
          <div className="flex items-center gap-3">
            <div className="w-32 shrink-0 flex items-center gap-1.5 text-xs font-bold text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>2. Legendas IA</span>
            </div>
            <div className="flex-1 h-8 bg-slate-950/90 border border-slate-800/80 rounded-xl relative overflow-hidden flex items-center">
              {subtitlesItems.map((item) => {
                const isSelected = selectedTrackItemId === item.id;
                return (
                  <div
                    key={item.id}
                    onMouseDown={(e) => handleBlockCenterMouseDown(e, item)}
                    className={`absolute h-6 top-1 rounded-lg px-2 text-[10px] font-bold flex items-center justify-between truncate cursor-grab active:cursor-grabbing transition ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 border border-amber-300 shadow-md z-10'
                        : 'bg-amber-950/60 border border-amber-500/40 text-amber-300 hover:bg-amber-900/60'
                    }`}
                    style={getPositionStyle(item.startTime, item.endTime)}
                  >
                    <div
                      onMouseDown={(e) => handleBlockTrimMouseDown(e, item, 'start')}
                      className="w-2.5 h-full bg-amber-300/60 hover:bg-amber-200 rounded-l cursor-ew-resize mr-1 shrink-0"
                      title="Arrastar tempo inicial"
                    />

                    <span className="truncate">💬 {item.content.text}</span>

                    <div
                      onMouseDown={(e) => handleBlockTrimMouseDown(e, item, 'end')}
                      className="w-2.5 h-full bg-amber-300/60 hover:bg-amber-200 rounded-r cursor-ew-resize ml-1 shrink-0"
                      title="Arrastar tempo final"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* TRACK 3: Title & Text Overlays */}
          <div className="flex items-center gap-3">
            <div className="w-32 shrink-0 flex items-center gap-1.5 text-xs font-bold text-slate-300">
              <Type className="w-3.5 h-3.5 text-indigo-400" />
              <span>3. Títulos</span>
            </div>
            <div className="flex-1 h-8 bg-slate-950/90 border border-slate-800/80 rounded-xl relative overflow-hidden flex items-center">
              {titleItems.map((item) => {
                const isSelected = selectedTrackItemId === item.id;
                return (
                  <div
                    key={item.id}
                    onMouseDown={(e) => handleBlockCenterMouseDown(e, item)}
                    className={`absolute h-6 top-1 rounded-lg px-1.5 text-[10px] font-bold flex items-center justify-between truncate cursor-grab active:cursor-grabbing transition ${
                      isSelected
                        ? 'bg-indigo-500 text-white border border-indigo-300 shadow-md z-10'
                        : 'bg-indigo-950/60 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-900/60'
                    }`}
                    style={getPositionStyle(item.startTime, item.endTime)}
                  >
                    <div
                      onMouseDown={(e) => handleBlockTrimMouseDown(e, item, 'start')}
                      className="w-2.5 h-full bg-indigo-300/60 hover:bg-indigo-200 rounded-l cursor-ew-resize mr-1 shrink-0"
                      title="Arrastar tempo inicial"
                    />

                    <span className="truncate">📝 {item.content.text}</span>

                    <div
                      onMouseDown={(e) => handleBlockTrimMouseDown(e, item, 'end')}
                      className="w-2.5 h-full bg-indigo-300/60 hover:bg-indigo-200 rounded-r cursor-ew-resize ml-1 shrink-0"
                      title="Arrastar tempo final"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* TRACK 4: Image Overlays */}
          <div className="flex items-center gap-3">
            <div className="w-32 shrink-0 flex items-center gap-1.5 text-xs font-bold text-slate-300">
              <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>4. Imagens</span>
            </div>
            <div className="flex-1 h-8 bg-slate-950/90 border border-slate-800/80 rounded-xl relative overflow-hidden flex items-center">
              {imageItems.map((item) => {
                const isSelected = selectedTrackItemId === item.id;
                return (
                  <div
                    key={item.id}
                    onMouseDown={(e) => handleBlockCenterMouseDown(e, item)}
                    className={`absolute h-6 top-1 rounded-lg px-1.5 text-[10px] font-bold flex items-center justify-between truncate cursor-grab active:cursor-grabbing transition ${
                      isSelected
                        ? 'bg-emerald-500 text-slate-950 border border-emerald-300 shadow-md z-10'
                        : 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60'
                    }`}
                    style={getPositionStyle(item.startTime, item.endTime)}
                  >
                    <div
                      onMouseDown={(e) => handleBlockTrimMouseDown(e, item, 'start')}
                      className="w-2.5 h-full bg-emerald-300/60 hover:bg-emerald-200 rounded-l cursor-ew-resize mr-1 shrink-0"
                    />
                    <span className="truncate">🖼️ Imagem Apoio</span>
                    <div
                      onMouseDown={(e) => handleBlockTrimMouseDown(e, item, 'end')}
                      className="w-2.5 h-full bg-emerald-300/60 hover:bg-emerald-200 rounded-r cursor-ew-resize ml-1 shrink-0"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* TRACK 5: Background Audio */}
          <div className="flex items-center gap-3">
            <div className="w-32 shrink-0 flex items-center gap-1.5 text-xs font-bold text-slate-300">
              <Music className="w-3.5 h-3.5 text-purple-400" />
              <span>5. Música BGM</span>
            </div>
            <div className="flex-1 h-8 bg-slate-950/90 border border-slate-800/80 rounded-xl relative overflow-hidden flex items-center px-2 text-[10px] text-slate-500">
              Sem trilha sonora de fundo adicionada
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
