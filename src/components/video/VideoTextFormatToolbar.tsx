import React from 'react';
import {
  Highlighter,
  Bold,
  ZoomIn,
  ZoomOut,
  Trash2,
  Moon,
  RotateCw,
  Sparkles,
  Type,
} from 'lucide-react';
import { TrackItem, MultiBarPresetStyle } from '@/types/video';

interface VideoTextFormatToolbarProps {
  selectedItem: TrackItem | null;
  onUpdateColors: (id: string, primaryColor: string, textColor: string) => void;
  onUpdateMultiBar?: (id: string, preset: MultiBarPresetStyle) => void;
  onUpdateFont?: (id: string, fontFamily: string) => void;
  onUpdateTilt?: (id: string, tiltAngle: number) => void;
  onUpdateBgOpacity: (id: string, opacity: number) => void;
  onUpdateScale: (id: string, scaleDelta: number) => void;
  onRemoveItem: (id: string) => void;
}

export const VideoTextFormatToolbar: React.FC<VideoTextFormatToolbarProps> = ({
  selectedItem,
  onUpdateColors,
  onUpdateMultiBar,
  onUpdateFont,
  onUpdateTilt,
  onUpdateBgOpacity,
  onUpdateScale,
  onRemoveItem,
}) => {
  if (!selectedItem || !selectedItem.content.text) {
    return (
      <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
        <span>Selecione ou clique em um título no canvas para formatar</span>
      </div>
    );
  }

  const currentOpacity = selectedItem.content.bgOpacity !== undefined ? selectedItem.content.bgOpacity : 85;
  const currentTilt = selectedItem.content.tiltAngle || 0;
  const currentPreset = selectedItem.content.multiBarPreset || selectedItem.content.presetStyle || 'italo_black_white';
  const currentFont = selectedItem.content.fontFamily || 'Impact, sans-serif';

  return (
    <div className="flex items-center gap-2.5 bg-slate-950 px-3 py-1 rounded-xl border border-slate-800 text-xs shadow-md flex-wrap">
      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">ESTILO DE BARRAS:</span>

      {/* 1. SELETOR DE PRESET DE BARRAS DUPLAS DE ALTO CONTRASTE */}
      <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
        {[
          { id: 'italo_black_white', label: '⬛⬜ Ítalo', title: 'Preto & Branco Invertido com Sombra' },
          { id: 'caco_yellow_white', label: '🟨⬜ cacoart', title: 'Amarelo Neon & Branco' },
          { id: 'ladeira_red_white', label: '🟥⬜ Ladeira', title: 'Vermelho Alerta & Branco' },
          { id: 'wagnner_blue_white', label: '🟦⬜ Wagnner', title: 'Azul Conversão & Branco' },
        ].map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onUpdateMultiBar?.(selectedItem.id, p.id as MultiBarPresetStyle)}
            className={`px-2 py-1 text-[11px] font-bold rounded transition ${
              currentPreset === p.id
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title={p.title}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="w-px h-4 bg-slate-800" />

      {/* 2. SELETOR DE TIPOGRAFIA CURADA (Impact, Montserrat, Outfit) */}
      <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
        {[
          { id: 'Impact, sans-serif', label: 'Impact' },
          { id: 'Montserrat, sans-serif', label: 'Montserrat' },
          { id: 'Outfit, sans-serif', label: 'Outfit' },
        ].map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => onUpdateFont?.(selectedItem.id, f.id)}
            className={`px-2 py-1 text-[11px] font-bold rounded transition ${
              currentFont === f.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="w-px h-4 bg-slate-800" />

      {/* 3. SELETOR DE INCLINAÇÃO / TILT ANGLE (-3°, 0°, +3°) */}
      <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
        <RotateCw className="w-3 h-3 text-slate-400 ml-1" />
        {[
          { angle: -3, label: '-3°' },
          { angle: 0, label: '0°' },
          { angle: 3, label: '+3°' },
        ].map((t) => (
          <button
            key={t.angle}
            type="button"
            onClick={() => onUpdateTilt?.(selectedItem.id, t.angle)}
            className={`px-1.5 py-0.5 text-[10px] font-bold rounded transition ${
              currentTilt === t.angle
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="w-px h-4 bg-slate-800" />

      {/* 4. SLIDER DE OPACIDADE DO FUNDO (0% A 100%) */}
      <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800" title="Escuridão do Fundo">
        <Moon className="w-3.5 h-3.5 text-purple-400 shrink-0" />
        <input
          type="range"
          min="0"
          max="100"
          value={currentOpacity}
          onChange={(e) => onUpdateBgOpacity(selectedItem.id, Number(e.target.value))}
          className="w-16 accent-purple-500 cursor-pointer"
        />
        <span className="text-[10px] font-mono text-purple-300 font-bold min-w-[28px] text-right">
          {currentOpacity}%
        </span>
      </div>

      <div className="w-px h-4 bg-slate-800" />

      {/* 5. ESCALA / TAMANHO DA FONTE */}
      <div className="flex items-center gap-1 bg-slate-900 px-1 py-0.5 rounded-lg border border-slate-800">
        <button
          type="button"
          onClick={() => onUpdateScale(selectedItem.id, -0.1)}
          className="p-1 text-slate-400 hover:text-white transition"
          title="Diminuir Tamanho"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <span className="text-[10px] font-mono text-slate-300 font-bold px-1">
          {((selectedItem.position.scale || 1.0) * 100).toFixed(0)}%
        </span>
        <button
          type="button"
          onClick={() => onUpdateScale(selectedItem.id, 0.1)}
          className="p-1 text-slate-400 hover:text-white transition"
          title="Aumentar Tamanho"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="w-px h-4 bg-slate-800" />

      {/* BOTÃO REMOVER */}
      <button
        type="button"
        onClick={() => onRemoveItem(selectedItem.id)}
        className="p-1.5 text-red-400 hover:bg-red-950/40 rounded-lg border border-red-500/20 transition"
        title="Remover Título"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
