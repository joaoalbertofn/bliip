import React, { useState, useEffect } from 'react';
import { IntegrationConfig } from '@/types/carousel';
import { loadIntegrations, saveIntegrations } from '@/lib/storage';
import { X, Check, Webhook, Key, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

interface IntegrationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IntegrationsModal: React.FC<IntegrationsModalProps> = ({ isOpen, onClose }) => {
  const [bufferApiKey, setBufferApiKey] = useState('');
  const [bufferProfileId, setBufferProfileId] = useState('');
  const [bufferProfiles, setBufferProfiles] = useState<any[]>([]);
  const [isManualProfileId, setIsManualProfileId] = useState(false);
  const [makeWebhookUrl, setMakeWebhookUrl] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);
  const [testStatus, setTestStatus] = useState<{ type: 'success' | 'error'; msg: string; details?: string } | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadIntegrations().then((cfg) => {
        if (cfg.bufferApiKey) {
          setBufferApiKey(cfg.bufferApiKey);
          fetchBufferProfiles(cfg.bufferApiKey);
        }
        if (cfg.bufferProfileId) setBufferProfileId(cfg.bufferProfileId);
        if (cfg.makeWebhookUrl) setMakeWebhookUrl(cfg.makeWebhookUrl);
        if (cfg.apiKey) setGeminiApiKey(cfg.apiKey);
      });
    }
  }, [isOpen]);

  // Testar Conexão com a API do Buffer e Carregar Perfis Conectados
  const fetchBufferProfiles = async (tokenToUse?: string) => {
    const token = tokenToUse !== undefined ? tokenToUse : bufferApiKey;
    if (!token || !token.trim()) {
      setTestStatus({
        type: 'error',
        msg: 'Insira o seu Personal Access Token do Buffer antes de testar a conexão.'
      });
      return;
    }

    try {
      setIsLoadingProfiles(true);
      setTestStatus(null);

      const res = await fetch('/api/buffer', {
        headers: {
          'Authorization': `Bearer ${token.trim()}`,
        },
      });
      const data = await res.json();

      if (res.ok && data.profiles) {
        setBufferProfiles(data.profiles);
        if (data.profiles.length > 0 && !bufferProfileId) {
          setBufferProfileId(data.profiles[0].id);
        }
        setTestStatus({
          type: 'success',
          msg: `Conexão efetuada com sucesso! ${data.profiles.length} canal(is) de rede social encontrado(s) no Buffer.`
        });
      } else {
        setTestStatus({
          type: 'error',
          msg: data.error || 'Erro ao conectar à API do Buffer.',
          details: data.details
        });
      }
    } catch (err: any) {
      setTestStatus({
        type: 'error',
        msg: 'Não foi possível conectar à API do Buffer.'
      });
    } finally {
      setIsLoadingProfiles(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const config: IntegrationConfig = {
      bufferApiKey,
      bufferProfileId,
      makeWebhookUrl,
      apiKey: geminiApiKey,
    };
    saveIntegrations(config).then(() => {
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 1000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center font-bold text-lg">
            B
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Integração Oficial do Buffer</h2>
            <p className="text-xs text-slate-400">Publicação e agendamento para Instagram</p>
          </div>
        </div>

        {/* Status Feedback */}
        {testStatus && (
          <div
            className={`my-4 p-3 rounded-xl text-xs font-medium flex flex-col gap-1 border ${
              testStatus.type === 'success'
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                : 'bg-red-950/60 border-red-500/40 text-red-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {testStatus.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              )}
              <span>{testStatus.msg}</span>
            </div>
            {testStatus.details && (
              <p className="text-[11px] opacity-80 pl-6 leading-relaxed">{testStatus.details}</p>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          {/* Chave da API do Buffer */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>Buffer API Key (Personal Access Token)</span>
              </label>

              <button
                type="button"
                onClick={() => fetchBufferProfiles()}
                disabled={isLoadingProfiles}
                className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${isLoadingProfiles ? 'animate-spin' : ''}`} />
                <span>Testar Conexão</span>
              </button>
            </div>

            <input
              type="text"
              value={bufferApiKey}
              onChange={(e) => setBufferApiKey(e.target.value)}
              placeholder="Ex: 1/5m7Nr0l2w..."
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Gere seu token no Buffer em: <strong className="text-slate-400">Settings &gt; Personal Access Tokens</strong>.
            </p>
          </div>

          {/* Seleção ou Entrada Manual do Perfil / Canal do Instagram no Buffer */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                ID do Perfil / Canal do Buffer (Channel ID)
              </label>

              {bufferProfiles.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsManualProfileId(!isManualProfileId)}
                  className="text-[10px] text-indigo-400 hover:underline font-medium"
                >
                  {isManualProfileId ? 'Selecionar da Lista' : 'Digitar ID Manualmente'}
                </button>
              )}
            </div>

            {bufferProfiles.length > 0 && !isManualProfileId ? (
              <select
                value={bufferProfileId}
                onChange={(e) => setBufferProfileId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {bufferProfiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.formatted_username || p.service_username || p.name || p.service} ({p.service.toUpperCase()})
                  </option>
                ))}
              </select>
            ) : (
              <div>
                <input
                  type="text"
                  value={bufferProfileId}
                  onChange={(e) => setBufferProfileId(e.target.value)}
                  placeholder="Ex: 6a4e92ea4048344628845bb9"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Insira o ID do seu canal (encontrado na URL do Buffer: <strong className="text-slate-400">publish.buffer.com/channels/SEU_ID/...</strong>).
                </p>
              </div>
            )}
          </div>

          <hr className="border-slate-800 my-1" />

          {/* Chave de API da IA (Google Gemini API Key) */}
          <div>
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1.5">
              <Key className="w-3.5 h-3.5 text-purple-400" />
              <span>Google Gemini API Key (IA Estrategista)</span>
            </label>
            <input
              type="text"
              value={geminiApiKey}
              onChange={(e) => setGeminiApiKey(e.target.value)}
              placeholder="Ex: AIzaSyA1b2c3d4e5..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Obtenha gratuitamente no Google AI Studio: <strong className="text-slate-400">aistudio.google.com/app/apikey</strong>.
            </p>
          </div>

          {/* Opção Alternativa de Webhook (Make.com / N8n) */}
          <div>
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1.5">
              <Webhook className="w-3.5 h-3.5 text-emerald-400" />
              <span>Webhook Opcional (Make.com / Zapier)</span>
            </label>
            <input
              type="url"
              value={makeWebhookUrl}
              onChange={(e) => setMakeWebhookUrl(e.target.value)}
              placeholder="https://hook.us1.make.com/..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-800">
            {savedSuccess ? (
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <Check className="w-4 h-4" /> Integração Salva!
              </span>
            ) : (
              <span className="text-[11px] text-slate-400">Armazenado com segurança localmente.</span>
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-glow transition"
              >
                Salvar Configurações
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
