import React from 'react';
import { AlertTriangle, Check, X, ShieldAlert } from 'lucide-react';
import { SocialChannel } from '@/types/carousel';

interface MediaCompatibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmRemoveIncompatibleChannels: () => void;
  onConfirmUseCoverImageForLinkedIn: () => void;
  incompatibleChannels: SocialChannel[];
}

export const MediaCompatibilityModal: React.FC<MediaCompatibilityModalProps> = ({
  isOpen,
  onClose,
  onConfirmRemoveIncompatibleChannels,
  onConfirmUseCoverImageForLinkedIn,
  incompatibleChannels,
}) => {
  if (!isOpen) return null;

  const hasLinkedin = incompatibleChannels.includes('linkedin');
  const hasTiktok = incompatibleChannels.includes('tiktok');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Aviso de Compatibilidade de Mídia</h3>
            <p className="text-xs text-amber-300/80 font-medium">
              Detectamos que um dos slides agora possui um vídeo.
            </p>
          </div>
        </div>

        <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl text-xs text-slate-300 leading-relaxed mb-6 flex flex-col gap-2">
          <p>
            Carrosséis contendo mídias em vídeo são suportados nativamente pelo <strong className="text-pink-400">Instagram</strong> e <strong className="text-indigo-400">Facebook</strong>.
          </p>
          {hasLinkedin && (
            <p className="text-slate-400">
              • <strong className="text-blue-400">LinkedIn:</strong> Não aceita vídeos em carrosséis multi-slide.
            </p>
          )}
          {hasTiktok && (
            <p className="text-slate-400">
              • <strong className="text-slate-200">TikTok:</strong> O modo Photo Mode aceita apenas fotos estáticas.
            </p>
          )}
          <p className="text-slate-400 pt-1 font-semibold">
            Como você gostaria de prosseguir para essa publicação?
          </p>
        </div>

        <div className="flex flex-col gap-2.5">
          <button
            onClick={onConfirmRemoveIncompatibleChannels}
            className="w-full py-3 px-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white rounded-xl font-bold text-xs shadow-glow transition flex items-center justify-between"
          >
            <span>Continuar apenas com redes compatíveis (Instagram / Facebook)</span>
            <Check className="w-4 h-4" />
          </button>

          <button
            onClick={onConfirmUseCoverImageForLinkedIn}
            className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 font-semibold text-xs transition flex items-center justify-between"
          >
            <span>Manter todas as redes (Usando a imagem de capa do vídeo no LinkedIn)</span>
            <Check className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
