import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon, Trash2, Plus, Sparkles } from 'lucide-react';

interface MediaTrayProps {
  mediaLibrary?: string[];
  onUploadMedia: (files: FileList | File[]) => void;
  onRemoveMedia: (index: number) => void;
  onCreateSlideFromMedia: (url: string) => void;
}

export const MediaTray: React.FC<MediaTrayProps> = ({
  mediaLibrary = [],
  onUploadMedia,
  onRemoveMedia,
  onCreateSlideFromMedia,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUploadMedia(e.target.files);
      e.target.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUploadMedia(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleThumbnailDragStart = (e: React.DragEvent<HTMLDivElement>, url: string) => {
    e.dataTransfer.setData('text/plain', url);
    e.dataTransfer.setData('text/uri-list', url);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* ÁREA DE DROPZONE MULTIPLO */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`p-3 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition ${
          isDragOver
            ? 'border-indigo-400 bg-indigo-950/50 scale-[1.01]'
            : 'border-slate-700/80 bg-slate-900/50 hover:bg-slate-900 hover:border-slate-600'
        }`}
      >
        <UploadCloud className={`w-5 h-5 mb-1 ${isDragOver ? 'text-indigo-400 animate-bounce' : 'text-slate-400'}`} />
        <p className="text-[11px] font-semibold text-slate-300">
          Solte mídias (fotos/vídeos) aqui ou clique
        </p>
        <span className="text-[10px] text-slate-500 mt-0.5">Suporta seleções múltiplas de fotos e vídeos</span>
      </div>

      {/* GRADE DE THUMBNAILS ARRASTÁVEIS ESTILO CANVA */}
      {mediaLibrary.length > 0 && (
        <div className="flex flex-col gap-2 pt-1">
          <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
            {mediaLibrary.map((url, idx) => {
              const isVid = url.startsWith('data:video/') || !!url.match(/\.(mp4|mov|webm)(\?.*)?$/i);
              return (
                <div
                  key={idx}
                  draggable
                  onDragStart={(e) => handleThumbnailDragStart(e, url)}
                  onClick={() => onCreateSlideFromMedia(url)}
                  className="group relative aspect-square rounded-lg overflow-hidden border border-slate-700 bg-slate-950 cursor-grab active:cursor-grabbing hover:border-indigo-500 hover:shadow-glow transition flex items-center justify-center"
                  title="✋ Clique para criar novo slide ou Arraste para o Canvas!"
                >
                  {isVid ? (
                    <video src={url} className="w-full h-full object-cover group-hover:scale-105 transition pointer-events-none" />
                  ) : (
                    <img src={url} alt={`Mídia ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition" />
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveMedia(idx);
                      }}
                      className="p-1 bg-red-600/90 text-white rounded-md hover:bg-red-700 transition"
                      title="Excluir da bandeja"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-indigo-300/80 bg-indigo-950/30 p-2 rounded-lg border border-indigo-900/40">
            <Sparkles className="w-3.5 h-3.5 shrink-0 text-indigo-400" />
            <span>Dica: Arraste qualquer foto direto para o slide no Canvas ou sobre + Novo Slide!</span>
          </div>
        </div>
      )}
    </div>
  );
};
