import React, { useState } from 'react';
import {
  Film,
  Sparkles,
  ArrowLeft,
  Share2,
} from 'lucide-react';
import { UserProfile } from '@/types/carousel';
import { useVerticalVideoState } from '@/hooks/useVerticalVideoState';
import { VideoCanvas916 } from '../video/VideoCanvas916';
import { VideoTimelineTrimmer } from '../video/VideoTimelineTrimmer';
import { VideoSidebarControls } from '../video/VideoSidebarControls';
import { VideoSocialPostPreviewPanel } from '../video/VideoSocialPostPreviewPanel';
import { VideoTextFormatToolbar } from '../video/VideoTextFormatToolbar';

interface VerticalVideoCreatorViewProps {
  profile: UserProfile;
  onBackToDashboard: () => void;
  onOpenExportModal?: () => void;
}

export const VerticalVideoCreatorView: React.FC<VerticalVideoCreatorViewProps> = ({
  profile,
  onBackToDashboard,
  onOpenExportModal,
}) => {
  const {
    project,
    currentTime,
    setCurrentTime,
    isPlaying,
    setIsPlaying,
    selectedTrackItemId,
    setSelectedTrackItemId,
    availableTemplates,
    handleVideoUpload,
    toggleMute,
    updateTrimConfig,
    addTrackItemFromTemplate,
    addImageOverlay,
    updateTrackItemPosition,
    updateTrackItemText,
    updateTrackItemColors,
    updateTrackItemMultiBar,
    updateTrackItemFont,
    updateTrackItemTilt,
    updateTrackItemBgOpacity,
    updateTrackItemWidth,
    updateTrackItemScale,
    updateTrackItemTiming,
    removeTrackItem,
    generateAISubtitles,
    importJSONTemplatePackage,
    updatePostCaption,
    toggleChannel,
  } = useVerticalVideoState();

  const [isRightPanelOpen, setIsRightPanelOpen] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const selectedItem = project.activeTrackItems.find((i) => i.id === selectedTrackItemId) || null;

  const handleExportVideo = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      if (onOpenExportModal) {
        onOpenExportModal();
      } else {
        alert(`Projeto de vídeo 9:16 exportado com sucesso para ${project.selectedChannels.join(', ')}!`);
      }
    }, 1200);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden select-none">
      {/* TOP WORKSPACE NAVBAR */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToDashboard}
            className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-200 transition"
            title="Voltar ao Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-pink-600 to-purple-600 flex items-center justify-center shadow-glow">
              <Film className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-xs font-bold text-white flex items-center gap-2">
                <span>Criador de Vídeos Verticais (9:16)</span>
                <span className="px-2 py-0.5 rounded-full bg-purple-950 border border-purple-500/40 text-purple-300 text-[10px] font-mono">
                  PRO
                </span>
              </h1>
            </div>
          </div>
        </div>

        {/* TOOLBOX DE FORMATAÇÃO DE TEXTO NO SUB-HEADER SUPERIOR */}
        <VideoTextFormatToolbar
          selectedItem={selectedItem}
          onUpdateColors={updateTrackItemColors}
          onUpdateMultiBar={updateTrackItemMultiBar}
          onUpdateFont={updateTrackItemFont}
          onUpdateTilt={updateTrackItemTilt}
          onUpdateBgOpacity={updateTrackItemBgOpacity}
          onUpdateScale={updateTrackItemScale}
          onRemoveItem={removeTrackItem}
        />

        {/* Export & Publish Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportVideo}
            disabled={isExporting}
            className="px-4 py-2 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg transition flex items-center gap-2 disabled:opacity-50"
          >
            <Share2 className="w-4 h-4" />
            <span>{isExporting ? 'Processando Vídeo MP4...' : 'Exportar & Publicar via Buffer'}</span>
          </button>
        </div>
      </header>

      {/* THREE-COLUMN WORKSPACE BODY */}
      <div className="flex-1 flex overflow-hidden">
        {/* COLUNA 1: PAINEL ESQUERDO DE CONTROLES (Largura w-96 idêntica ao carrossel) */}
        <aside className="w-96 shrink-0 h-full border-r border-slate-800 bg-slate-900 overflow-hidden">
          <VideoSidebarControls
            project={project}
            availableTemplates={availableTemplates}
            onAddTemplate={addTrackItemFromTemplate}
            onAddImage={addImageOverlay}
            onGenerateSubtitles={generateAISubtitles}
            onUpdatePostCaption={updatePostCaption}
            onToggleChannel={toggleChannel}
            onImportJSONPackage={importJSONTemplatePackage}
          />
        </aside>

        {/* COLUNA 2: WORKSPACE CENTRAL DE EDIÇÃO (Canvas 9:16 + Timeline Multi-Track) */}
        <main className="flex-1 h-full flex flex-col overflow-hidden bg-slate-950 relative">
          {/* Viewport Canvas 9:16 Superior */}
          <div className="flex-1 overflow-hidden relative flex items-center justify-center">
            <VideoCanvas916
              project={project}
              currentTime={currentTime}
              isPlaying={isPlaying}
              selectedTrackItemId={selectedTrackItemId}
              onVideoUpload={handleVideoUpload}
              onSelectTrackItem={setSelectedTrackItemId}
              onUpdateItemPosition={updateTrackItemPosition}
              onUpdateItemWidth={updateTrackItemWidth}
              onUpdateItemText={updateTrackItemText}
              onTimeUpdate={setCurrentTime}
              onAddTemplateFromDrop={addTrackItemFromTemplate}
            />
          </div>

          {/* Timeline Multi-Track Inferior */}
          <div className="h-56 shrink-0 z-20">
            <VideoTimelineTrimmer
              project={project}
              currentTime={currentTime}
              isPlaying={isPlaying}
              selectedTrackItemId={selectedTrackItemId}
              onTimeUpdate={setCurrentTime}
              onTogglePlay={() => setIsPlaying(!isPlaying)}
              onToggleMute={toggleMute}
              onSelectTrackItem={setSelectedTrackItemId}
              onRemoveTrackItem={removeTrackItem}
              onUpdateTrackItemTiming={updateTrackItemTiming}
            />
          </div>
        </main>

        {/* COLUNA 3: PAINEL DIREITO RECOLHÍVEL (Social Post Preview + Legenda Global + Mockups Empilhados) */}
        <VideoSocialPostPreviewPanel
          project={project}
          profile={profile}
          selectedChannels={project.selectedChannels}
          caption={project.postCaption}
          onCaptionChange={updatePostCaption}
          onToggleChannel={toggleChannel}
          isOpen={isRightPanelOpen}
          onToggleOpen={() => setIsRightPanelOpen(!isRightPanelOpen)}
        />
      </div>
    </div>
  );
};
