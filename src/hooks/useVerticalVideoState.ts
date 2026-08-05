import { useState, useCallback, useRef, useEffect } from 'react';
import {
  VerticalVideoProject,
  TrackItem,
  TrackType,
  BliipVideoTemplate,
  SubtitleWord,
} from '@/types/video';
import { SocialChannel } from '@/types/carousel';
import { DEFAULT_VIDEO_TEMPLATES } from '@/data/defaultVideoPresets';
import { saveVerticalVideoDraft, loadVerticalVideoDraft } from '@/lib/storage';

export function useVerticalVideoState() {
  const [project, setProject] = useState<VerticalVideoProject>({
    id: `video_${Date.now()}`,
    name: 'Novo Vídeo Vertical 9:16',
    videoUrl: '',
    duration: 0,
    trimConfig: {
      startTime: 0,
      endTime: 0,
      muted: false,
    },
    hookConfig: {
      enabled: false,
      text: 'O segredo que ninguém te contou...',
      style: 'neon',
      durationSec: 3.0,
    },
    activeTrackItems: [],
    postCaption: '',
    selectedChannels: ['instagram', 'tiktok', 'youtube', 'linkedin'],
    aspectRatio: '9:16',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [selectedTrackItemId, setSelectedTrackItemId] = useState<string | null>(null);

  const [availableTemplates, setAvailableTemplates] = useState<BliipVideoTemplate[]>(DEFAULT_VIDEO_TEMPLATES);

  // Referência do Blob do vídeo original para persistência local
  const videoBlobRef = useRef<Blob | null>(null);
  const isLoadedFromCacheRef = useRef<boolean>(false);

  // CARREGA RASCUNHO AUTO-SALVO DO INDEXEDDB AO INICIAR / RECARREGAR A TELA
  useEffect(() => {
    async function restoreDraft() {
      const { project: cachedProject, videoBlob } = await loadVerticalVideoDraft();
      if (cachedProject) {
        let restoredUrl = cachedProject.videoUrl || '';
        if (videoBlob) {
          videoBlobRef.current = videoBlob;
          restoredUrl = URL.createObjectURL(videoBlob);
        }

        setProject({
          ...cachedProject,
          videoUrl: restoredUrl,
        });
        isLoadedFromCacheRef.current = true;
      }
    }
    restoreDraft();
  }, []);

  // AUTO-SAVE REATIVO DO RASCUNHO COM DEBOUNCE SEMPRE QUE O PROJETO MUDAR
  useEffect(() => {
    if (!project.id) return;
    const timer = setTimeout(() => {
      saveVerticalVideoDraft(project, videoBlobRef.current || undefined);
    }, 400);

    return () => clearTimeout(timer);
  }, [project]);

  // Carrega arquivo de vídeo via Blob / File Input / Drag & Drop
  const handleVideoUpload = useCallback((file: File) => {
    videoBlobRef.current = file;
    const url = URL.createObjectURL(file);
    const videoElement = document.createElement('video');
    videoElement.src = url;

    videoElement.onloadedmetadata = () => {
      const dur = Math.round(videoElement.duration * 10) / 10 || 30;
      setProject((prev) => {
        const nextState = {
          ...prev,
          videoUrl: url,
          duration: dur,
          trimConfig: {
            startTime: 0,
            endTime: dur,
            muted: false,
          },
          updatedAt: new Date().toISOString(),
        };
        saveVerticalVideoDraft(nextState, file);
        return nextState;
      });
      setCurrentTime(0);
      setIsPlaying(false);
    };
  }, []);

  // Alterna o estado de Mute do áudio
  const toggleMute = useCallback(() => {
    setProject((prev) => ({
      ...prev,
      trimConfig: {
        ...prev.trimConfig,
        muted: !prev.trimConfig.muted,
      },
    }));
  }, []);

  // Ajusta o intervalo de corte do vídeo principal
  const updateTrimConfig = useCallback((startTime: number, endTime: number) => {
    setProject((prev) => ({
      ...prev,
      trimConfig: {
        ...prev.trimConfig,
        startTime,
        endTime,
      },
    }));
  }, []);

  // Adiciona um novo item de Overlay (Título / Imagem / Legenda) à Timeline e Canvas
  const addTrackItemFromTemplate = useCallback((template: BliipVideoTemplate) => {
    const newItemId = `item_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    
    let trackType: TrackType = 'title_overlay';
    if (template.category === 'subtitle_style') trackType = 'subtitles';
    if (template.category === 'hook_3s') trackType = 'title_overlay';

    const newItem: TrackItem = {
      id: newItemId,
      trackType,
      startTime: currentTime,
      endTime: Math.min(project.duration || 30, currentTime + (template.defaultDurationSec || 5.0)),
      position: {
        x: template.layout.defaultPositionX,
        y: template.layout.defaultPositionY,
        scale: template.layout.defaultScale || 1.0,
      },
      content: {
        text: template.name,
        presetStyle: template.id,
        templateId: template.id,
        colors: {
          primary: template.style.backgroundColor || '#0F172A',
          secondary: '#6366F1',
          text: template.style.color || '#FFFFFF',
        },
      },
    };

    setProject((prev) => ({
      ...prev,
      activeTrackItems: [...prev.activeTrackItems, newItem],
    }));

    setSelectedTrackItemId(newItemId);
  }, [currentTime, project.duration]);

  // Adiciona imagem de apoio customizada
  const addImageOverlay = useCallback((imageUrl: string) => {
    const newItemId = `img_${Date.now()}`;
    const newItem: TrackItem = {
      id: newItemId,
      trackType: 'image_overlay',
      startTime: currentTime,
      endTime: Math.min(project.duration || 30, currentTime + 5.0),
      position: {
        x: 50,
        y: 50,
        scale: 1.0,
      },
      content: {
        imageUrl,
      },
    };

    setProject((prev) => ({
      ...prev,
      activeTrackItems: [...prev.activeTrackItems, newItem],
    }));

    setSelectedTrackItemId(newItemId);
  }, [currentTime, project.duration]);

  // Atualiza as cores e marca-texto de um item
  const updateTrackItemColors = useCallback((id: string, primary: string, text: string) => {
    setProject((prev) => ({
      ...prev,
      activeTrackItems: prev.activeTrackItems.map((item) =>
        item.id === id
          ? {
              ...item,
              content: {
                ...item.content,
                colors: {
                  primary,
                  secondary: '#6366F1',
                  text,
                },
              },
            }
          : item
      ),
    }));
  }, []);

  // Atualiza o preset de barras duplas (Ítalo Nobre, cacoartfilm, Ladeira, Wagnner)
  const updateTrackItemMultiBar = useCallback((id: string, multiBarPreset: any) => {
    setProject((prev) => ({
      ...prev,
      activeTrackItems: prev.activeTrackItems.map((item) =>
        item.id === id
          ? {
              ...item,
              content: {
                ...item.content,
                multiBarPreset,
                presetStyle: multiBarPreset,
              },
            }
          : item
      ),
    }));
  }, []);

  // Atualiza a fonte curada do título (Impact, Montserrat, Outfit)
  const updateTrackItemFont = useCallback((id: string, fontFamily: string) => {
    setProject((prev) => ({
      ...prev,
      activeTrackItems: prev.activeTrackItems.map((item) =>
        item.id === id
          ? {
              ...item,
              content: {
                ...item.content,
                fontFamily,
              },
            }
          : item
      ),
    }));
  }, []);

  // Atualiza a inclinação / tilt em graus (-3, 0, +3)
  const updateTrackItemTilt = useCallback((id: string, tiltAngle: number) => {
    setProject((prev) => ({
      ...prev,
      activeTrackItems: prev.activeTrackItems.map((item) =>
        item.id === id
          ? {
              ...item,
              content: {
                ...item.content,
                tiltAngle,
              },
            }
          : item
      ),
    }));
  }, []);

  // Atualiza a opacidade do fundo escuro pílula (0% a 100%)
  const updateTrackItemBgOpacity = useCallback((id: string, bgOpacity: number) => {
    setProject((prev) => ({
      ...prev,
      activeTrackItems: prev.activeTrackItems.map((item) =>
        item.id === id
          ? {
              ...item,
              content: {
                ...item.content,
                bgOpacity,
              },
            }
          : item
      ),
    }));
  }, []);

  // Atualiza a largura do container para quebra de linha de texto (width)
  const updateTrackItemWidth = useCallback((id: string, width: number) => {
    setProject((prev) => ({
      ...prev,
      activeTrackItems: prev.activeTrackItems.map((item) =>
        item.id === id
          ? {
              ...item,
              position: {
                ...item.position,
                width: Math.max(120, Math.min(330, width)),
              },
            }
          : item
      ),
    }));
  }, []);

  // Atualiza a escala (tamanho) de um item
  const updateTrackItemScale = useCallback((id: string, scaleDelta: number) => {
    setProject((prev) => ({
      ...prev,
      activeTrackItems: prev.activeTrackItems.map((item) =>
        item.id === id
          ? {
              ...item,
              position: {
                ...item.position,
                scale: Math.max(0.5, Math.min(3.0, (item.position.scale || 1.0) + scaleDelta)),
              },
            }
          : item
      ),
    }));
  }, []);

  // Atualiza a posição X/Y/Scale de um item no Canvas
  const updateTrackItemPosition = useCallback((id: string, x: number, y: number, scale?: number) => {
    setProject((prev) => ({
      ...prev,
      activeTrackItems: prev.activeTrackItems.map((item) =>
        item.id === id
          ? {
              ...item,
              position: {
                ...item.position,
                x,
                y,
                scale: scale ?? item.position.scale,
              },
            }
          : item
      ),
    }));
  }, []);

  // Atualiza o texto in-place de um item de título
  const updateTrackItemText = useCallback((id: string, text: string) => {
    setProject((prev) => ({
      ...prev,
      activeTrackItems: prev.activeTrackItems.map((item) =>
        item.id === id
          ? {
              ...item,
              content: {
                ...item.content,
                text,
              },
            }
          : item
      ),
    }));
  }, []);

  // Atualiza o timing de um item na Timeline (startTime / endTime)
  const updateTrackItemTiming = useCallback((id: string, startTime: number, endTime: number) => {
    setProject((prev) => ({
      ...prev,
      activeTrackItems: prev.activeTrackItems.map((item) =>
        item.id === id
          ? {
              ...item,
              startTime,
              endTime,
            }
          : item
      ),
    }));
  }, []);

  // Remove um item da Timeline/Canvas
  const removeTrackItem = useCallback((id: string) => {
    setProject((prev) => ({
      ...prev,
      activeTrackItems: prev.activeTrackItems.filter((item) => item.id !== id),
    }));
    if (selectedTrackItemId === id) setSelectedTrackItemId(null);
  }, [selectedTrackItemId]);

  // Gera Legendas Dinâmicas Simuladas por IA
  const generateAISubtitles = useCallback(() => {
    const sampleWords: SubtitleWord[] = [
      { id: 'w1', word: 'Aprenda', start: 0.5, end: 1.2 },
      { id: 'w2', word: 'como', start: 1.3, end: 1.6 },
      { id: 'w3', word: 'criar', start: 1.7, end: 2.1 },
      { id: 'w4', word: 'conteúdo', start: 2.2, end: 2.8 },
      { id: 'w5', word: 'viral', start: 2.9, end: 3.4 },
      { id: 'w6', word: 'em', start: 3.5, end: 3.7 },
      { id: 'w7', word: 'vídeo', start: 3.8, end: 4.2 },
      { id: 'w8', word: 'usando', start: 4.3, end: 4.8 },
      { id: 'w9', word: 'o', start: 4.9, end: 5.0 },
      { id: 'w10', word: 'Bliip!', start: 5.1, end: 5.8 },
    ];

    const newItemId = `sub_${Date.now()}`;
    const newItem: TrackItem = {
      id: newItemId,
      trackType: 'subtitles',
      startTime: 0,
      endTime: project.duration || 30,
      position: { x: 50, y: 70, scale: 1.0 },
      content: {
        text: 'Aprenda como criar conteúdo viral em vídeo usando o Bliip!',
        presetStyle: 'sub_style_hormozi_yellow',
        wordTimestamps: sampleWords,
      },
    };

    setProject((prev) => ({
      ...prev,
      activeTrackItems: [
        ...prev.activeTrackItems.filter((item) => item.trackType !== 'subtitles'),
        newItem,
      ],
    }));

    setSelectedTrackItemId(newItemId);
  }, [project.duration]);

  // Importa pacote de templates JSON customizados
  const importJSONTemplatePackage = useCallback((jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      const newTemplates: BliipVideoTemplate[] = Array.isArray(parsed) ? parsed : [parsed];
      
      setAvailableTemplates((prev) => {
        const existingIds = new Set(prev.map((t) => t.id));
        const filtered = newTemplates.filter((t) => t.id && !existingIds.has(t.id));
        return [...prev, ...filtered];
      });
      return true;
    } catch (e) {
      console.error('Erro ao importar pacote de templates JSON:', e);
      return false;
    }
  }, []);

  // Atualiza a legenda externa do post
  const updatePostCaption = useCallback((caption: string) => {
    setProject((prev) => ({ ...prev, postCaption: caption }));
  }, []);

  // Alterna canal de publicação ativado
  const toggleChannel = useCallback((channel: SocialChannel) => {
    setProject((prev) => {
      const exists = prev.selectedChannels.includes(channel);
      return {
        ...prev,
        selectedChannels: exists
          ? prev.selectedChannels.filter((c) => c !== channel)
          : [...prev.selectedChannels, channel],
      };
    });
  }, []);

  return {
    project,
    setProject,
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
  };
}
