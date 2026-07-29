import React, { useState } from 'react';
import { UserProfile, BusinessProfileQuiz } from '@/types/carousel';
import { X, Upload, Check, User, Sparkles, Target, Award, ShieldAlert, Layers } from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSave: (newProfile: UserProfile) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<'identity' | 'business'>('identity');

  // Identidade
  const [name, setName] = useState(profile.name);
  const [handle, setHandle] = useState(profile.handle || '');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);

  // Business Quiz
  const [niche, setNiche] = useState(profile.businessProfile?.niche || '');
  const [resultsDelivered, setResultsDelivered] = useState(profile.businessProfile?.resultsDelivered || '');
  const [audiencePainPoints, setAudiencePainPoints] = useState(profile.businessProfile?.audiencePainPoints || '');
  const [socialProofMediaTypes, setSocialProofMediaTypes] = useState(profile.businessProfile?.socialProofMediaTypes || '');
  const [biggestClientPain, setBiggestClientPain] = useState(profile.businessProfile?.biggestClientPain || '');
  const [methodOrToolName, setMethodOrToolName] = useState(profile.businessProfile?.methodOrToolName || '');
  const [methodHowItWorks, setMethodHowItWorks] = useState(profile.businessProfile?.methodHowItWorks || '');
  const [customSystemPrompt, setCustomSystemPrompt] = useState(profile.businessProfile?.customSystemPrompt || '');

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatarUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const businessProfile: BusinessProfileQuiz = {
      niche,
      resultsDelivered,
      audiencePainPoints,
      socialProofMediaTypes,
      biggestClientPain,
      methodOrToolName,
      methodHowItWorks,
      customSystemPrompt,
    };

    onSave({
      name,
      handle,
      avatarUrl,
      businessProfile,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto scrollbar-thin flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-white mb-1">Configurações de Perfil & Negócio</h2>
        <p className="text-xs text-slate-400 mb-4">
          Defina sua marca visual e alimente a IA Estrategista com as informações do seu negócio.
        </p>

        {/* Abas */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 mb-5">
          <button
            type="button"
            onClick={() => setActiveTab('identity')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
              activeTab === 'identity'
                ? 'bg-indigo-600 text-white shadow-glow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Identidade Visual</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('business')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
              activeTab === 'business'
                ? 'bg-purple-600 text-white shadow-glow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Perfil do Negócio (IA)</span>
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
          {/* ABA 1: IDENTIDADE VISUAL */}
          {activeTab === 'identity' && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col items-center justify-center gap-3">
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-indigo-500 shadow-glow">
                  <img
                    src={avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250'}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-2 rounded-lg border border-slate-700 flex items-center gap-2 transition">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Trocar Foto de Perfil</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Seu Nome Completo
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ex: João Alberto"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  @Handle do Instagram (Assinatura)
                </label>
                <input
                  type="text"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder="ex: @joaoalbertofn"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>
            </div>
          )}

          {/* ABA 2: QUIZ PERFIL DO NEGÓCIO PARA IA */}
          {activeTab === 'business' && (
            <div className="flex flex-col gap-3.5 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
              <div className="p-3 bg-purple-950/40 border border-purple-500/30 rounded-xl text-purple-200 text-xs leading-relaxed flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
                <span>
                  Estas 7 perguntas alimentam o cérebro da <strong>IA Estrategista</strong> para gerar planejamentos editoriais e roteiros perfeitos para a sua audiência.
                </span>
              </div>

              {/* Q1: Nicho / Especialidade */}
              <div>
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1">
                  <Target className="w-3.5 h-3.5 text-indigo-400" />
                  <span>1. Qual é o seu Nicho e Especialidade?</span>
                </label>
                <input
                  type="text"
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  placeholder="ex: Marketing Digital para Dentistas / Finanças Pessoais"
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-purple-500 font-medium"
                />
              </div>

              {/* Q2: Resultados Entregues */}
              <div>
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1">
                  <Award className="w-3.5 h-3.5 text-emerald-400" />
                  <span>2. Quais os Principais Resultados você Entrega?</span>
                </label>
                <input
                  type="text"
                  value={resultsDelivered}
                  onChange={(e) => setResultsDelivered(e.target.value)}
                  placeholder="ex: Captação diária de pacientes particulares de alto ticket"
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-purple-500 font-medium"
                />
              </div>

              {/* Q3: Dores da Audiência */}
              <div>
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  <span>3. Quais são as Principais Dores da sua Audiência?</span>
                </label>
                <textarea
                  value={audiencePainPoints}
                  onChange={(e) => setAudiencePainPoints(e.target.value)}
                  rows={2}
                  placeholder="ex: Depender de convênios que pagam pouco, falta de tempo para postar..."
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2.5 text-white text-xs focus:outline-none focus:ring-1 focus:ring-purple-500 font-medium resize-none"
                />
              </div>

              {/* Q4: Maior Dor do Cliente */}
              <div>
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                  <span>4. Qual é a Maior Frustração/Medo do seu Cliente Ideal?</span>
                </label>
                <input
                  type="text"
                  value={biggestClientPain}
                  onChange={(e) => setBiggestClientPain(e.target.value)}
                  placeholder="ex: Ver o consultório vazio enquanto o concorrente cresce no Instagram"
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-purple-500 font-medium"
                />
              </div>

              {/* Q5: Provas Sociais Disponíveis */}
              <div>
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1">
                  <Layers className="w-3.5 h-3.5 text-sky-400" />
                  <span>5. Que Tipos de Provas Visuais você Possui?</span>
                </label>
                <input
                  type="text"
                  value={socialProofMediaTypes}
                  onChange={(e) => setSocialProofMediaTypes(e.target.value)}
                  placeholder="ex: Prints de faturamento, fotos Antes/Depois de procedimentos"
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-purple-500 font-medium"
                />
              </div>

              {/* Q6: Nome do Método / Framework */}
              <div>
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>6. Qual o Nome do seu Método, Framework ou Ferramenta?</span>
                </label>
                <input
                  type="text"
                  value={methodOrToolName}
                  onChange={(e) => setMethodOrToolName(e.target.value)}
                  placeholder="ex: Método OdontoHighTicket / Framework Bliip 7Hs"
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-purple-500 font-medium"
                />
              </div>

              {/* Q7: Como Funciona o Método */}
              <div>
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>7. Resuma Como Funciona esse Método em 3 Passos:</span>
                </label>
                <textarea
                  value={methodHowItWorks}
                  onChange={(e) => setMethodHowItWorks(e.target.value)}
                  rows={2}
                  placeholder="ex: 1. Posicionamento visual de autoridade; 2. Anúncios locais de oferta direta; 3. Script de fechamento WhatsApp."
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2.5 text-white text-xs focus:outline-none focus:ring-1 focus:ring-purple-500 font-medium resize-none"
                />
              </div>

              {/* Campo 8: System Prompt Editável da IA */}
              <div className="pt-2 border-t border-slate-800/80 mt-2">
                <label className="text-xs font-semibold text-purple-300 flex items-center justify-between mb-1">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>8. Instruções do Sistema da IA (System Prompt Editável)</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-normal">Opcional (Personalize as regras da IA)</span>
                </label>
                <textarea
                  value={customSystemPrompt}
                  onChange={(e) => setCustomSystemPrompt(e.target.value)}
                  rows={5}
                  placeholder="Deixe em branco para usar as regras padrão do Bliip (Conversacional em 2 passos + Estruturação de Carrosséis). Ou digite aqui instruções personalizadas para o comportamento da IA..."
                  className="w-full bg-slate-950 border border-purple-900/40 rounded-lg p-3 text-purple-100 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-purple-500 resize-y leading-relaxed"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  💡 Você pode personalizar como a IA fala, quais perguntas faz ou como monta seus roteiros.
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl shadow-glow transition flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Salvar Configurações</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
