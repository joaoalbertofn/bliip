import { get, set } from 'idb-keyval';
import { Carousel, Slide, UserProfile, IntegrationConfig, ContentType, LayoutStyle, SocialChannel, SavedSlideTemplate, PlannedContentIdea } from '@/types/carousel';
import { VerticalVideoProject } from '@/types/video';
import { SlideTheme } from '@/lib/themes';

const USER_PROFILE_KEY = 'bliip_user_profile';
const CAROUSELS_KEY = 'bliip_carousels';
const INTEGRATIONS_KEY = 'bliip_integrations';
const USER_PREFERENCES_KEY = 'bliip_user_preferences';
const VERTICAL_VIDEO_DRAFT_KEY = 'bliip_vertical_video_draft';
const VERTICAL_VIDEO_BLOB_KEY = 'bliip_vertical_video_blob';

export interface UserCreationPreferences {
  layoutStyle: LayoutStyle;
  contentType: ContentType;
  selectedChannels: SocialChannel[];
  aspectRatio: '4:5' | '1:1';
  theme?: SlideTheme;
}

export const DEFAULT_USER_PREFERENCES: UserCreationPreferences = {
  layoutStyle: 'twitter',
  contentType: 'text_1_image',
  selectedChannels: ['instagram', 'linkedin'],
  aspectRatio: '4:5',
  theme: 'dark',
};

export const DEFAULT_USER_PROFILE: UserProfile = {
  name: 'João Alberto',
  handle: '@joaoalbertofn',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&h=250&q=80',
};

// Helpers de Sincronização Permanente com o Servidor (/api/settings)
async function syncServerSettings(key: string, data: any) {
  if (typeof window === 'undefined') return;
  try {
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [key]: data }),
    });
  } catch (err) {
    console.warn(`[Sync Server] Erro ao sincronizar ${key} com o disco:`, err);
  }
}

async function fetchServerSetting(key: string) {
  if (typeof window === 'undefined') return null;
  try {
    const res = await fetch('/api/settings');
    if (res.ok) {
      const json = await res.json();
      return json?.settings?.[key] || null;
    }
  } catch (err) {
    console.warn(`[Sync Server] Erro ao buscar ${key} do disco:`, err);
  }
  return null;
}

// Sanitizador defensivo de Perfil do Usuário (Preserva 100% o businessProfile do Quiz)
export function sanitizeUserProfile(data: any): UserProfile {
  if (!data || typeof data !== 'object') return DEFAULT_USER_PROFILE;
  return {
    name: typeof data.name === 'string' && data.name.trim() !== '' ? data.name : DEFAULT_USER_PROFILE.name,
    handle: typeof data.handle === 'string' ? data.handle : DEFAULT_USER_PROFILE.handle,
    avatarUrl: typeof data.avatarUrl === 'string' && data.avatarUrl.trim() !== '' ? data.avatarUrl : DEFAULT_USER_PROFILE.avatarUrl,
    businessProfile: data.businessProfile && typeof data.businessProfile === 'object' ? data.businessProfile : undefined,
  };
}

function cleanMarkString(str: string): string {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/<mark[^>]*>/gi, '<mark>')
    .replace(/["'\s]*(?:bg-[a-z0-9-]+|text-[a-z0-9-]+|px-\d+|rounded|font-[a-z]+|inline|\[box-decoration-break:clone\]|\[-webkit-box-decoration-break:clone\]|class=)+["'\s>]*/gi, '');
}

// Sanitizador defensivo de Slide
export function sanitizeSlide(s: any): Slide {
  const contentType: ContentType = 
    s?.contentType === 'text_only' || s?.type === 'text_only'
      ? 'text_only'
      : s?.contentType === 'text_2_images' || s?.type === 'text_2_images'
      ? 'text_2_images'
      : 'text_1_image';

  const layoutStyle: LayoutStyle = 
    s?.layoutStyle === 'immersive' || s?.style === 'immersive'
      ? 'immersive'
      : 'twitter';

  const imageLayout = s?.imageLayout === 'vertical' || s?.imageLayout === 'horizontal' ? s.imageLayout : 'horizontal';

  const images = Array.isArray(s?.layers?.images)
    ? s.layers.images.map((img: any) => ({
        ...img,
        title: typeof img?.title === 'string' ? img.title : undefined,
        scale: typeof img?.scale === 'number' && !isNaN(img.scale) ? img.scale : 1,
        offsetX: typeof img?.offsetX === 'number' && !isNaN(img.offsetX) ? img.offsetX : 0,
        offsetY: typeof img?.offsetY === 'number' && !isNaN(img.offsetY) ? img.offsetY : 0,
      }))
    : [];

  return {
    id: typeof s?.id === 'string' && s.id ? s.id : `slide_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    contentType,
    layoutStyle,
    imageLayout,
    templateId: typeof s?.templateId === 'string' ? s.templateId : undefined,
    theme: s?.theme,
    title: typeof s?.title === 'string' ? s.title : undefined,
    newsTitle: typeof s?.newsTitle === 'string' ? s.newsTitle : undefined,
    imageLabels: Array.isArray(s?.imageLabels) ? s.imageLabels : undefined,
    textAlignment: s?.textAlignment === 'center' || s?.textAlignment === 'right' ? s.textAlignment : 'left',
    titleAlignment: s?.titleAlignment === 'center' || s?.titleAlignment === 'right' ? s.titleAlignment : 'left',
    background: typeof s?.background === 'string' && s.background ? s.background : '#ffffff',
    layers: {
      text: Array.isArray(s?.layers?.text)
        ? s.layers.text.map((t: any) => ({
            ...t,
            content: cleanMarkString(t?.content),
          }))
        : [],
      images,
    },
  };
}

// Sanitizador defensivo de Carrossel
export function sanitizeCarousel(c: any): Carousel {
  const rawSlides = Array.isArray(c?.slides) ? c.slides : [];
  return {
    id: typeof c?.id === 'string' && c.id ? c.id : `carousel_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: typeof c?.name === 'string' && c.name.trim() !== '' ? c.name : 'Carrossel Sem Nome',
    createdAt: typeof c?.createdAt === 'string' ? c.createdAt : new Date().toISOString(),
    updatedAt: typeof c?.updatedAt === 'string' ? c.updatedAt : new Date().toISOString(),
    status: c?.status === 'published' ? 'published' : c?.status === 'sent' ? 'sent' : c?.status === 'scheduled' ? 'scheduled' : 'draft',
    scheduledAt: typeof c?.scheduledAt === 'string' ? c.scheduledAt : undefined,
    aspectRatio: c?.aspectRatio === '1:1' ? '1:1' : '4:5',
    mediaLibrary: Array.isArray(c?.mediaLibrary) ? c.mediaLibrary : [],
    caption: typeof c?.caption === 'string' ? c.caption : '',
    selectedChannels: Array.isArray(c?.selectedChannels) && c.selectedChannels.length > 0
      ? c.selectedChannels
      : ['instagram', 'linkedin'],
    slides: rawSlides.map(sanitizeSlide),
  };
}

// Sanitizador defensivo de Integrações
export function sanitizeIntegrations(config: any): IntegrationConfig {
  if (!config || typeof config !== 'object') return { bufferApiKey: '' };
  return {
    bufferApiKey: typeof config.bufferApiKey === 'string' ? config.bufferApiKey : '',
    bufferProfileId: typeof config.bufferProfileId === 'string' ? config.bufferProfileId : undefined,
    bufferWebhookUrl: typeof config.bufferWebhookUrl === 'string' ? config.bufferWebhookUrl : undefined,
    makeWebhookUrl: typeof config.makeWebhookUrl === 'string' ? config.makeWebhookUrl : undefined,
    apiKey: typeof config.apiKey === 'string' ? config.apiKey : undefined,
  };
}

// Helper de Perfil com Fallback Triplo: IndexedDB -> localStorage -> Servidor (/api/settings)
export async function loadUserProfile(): Promise<UserProfile> {
  if (typeof window === 'undefined') return DEFAULT_USER_PROFILE;
  let loadedProfile: UserProfile | null = null;

  try {
    const val = await get<any>(USER_PROFILE_KEY);
    if (val) loadedProfile = sanitizeUserProfile(val);
    if (!loadedProfile || !loadedProfile.businessProfile) {
      const localVal = localStorage.getItem(USER_PROFILE_KEY);
      if (localVal) loadedProfile = sanitizeUserProfile(JSON.parse(localVal));
    }
  } catch (e) {
    console.warn('Erro ao carregar perfil do IndexedDB:', e);
  }

  // Se não houver perfil local ou se estiver sem o perfil de negócio, recupera backup do disco do servidor
  if (!loadedProfile || !loadedProfile.businessProfile) {
    const serverProfile = await fetchServerSetting('userProfile');
    if (serverProfile) {
      const sanitizedServer = sanitizeUserProfile(serverProfile);
      if (sanitizedServer) {
        loadedProfile = loadedProfile
          ? { ...loadedProfile, businessProfile: sanitizedServer.businessProfile || loadedProfile.businessProfile }
          : sanitizedServer;

        // Atualiza armazenamento do navegador
        await set(USER_PROFILE_KEY, loadedProfile);
        localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(loadedProfile));
      }
    }
  }

  return loadedProfile || DEFAULT_USER_PROFILE;
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  if (typeof window === 'undefined') return;
  const sanitized = sanitizeUserProfile(profile);
  try {
    await set(USER_PROFILE_KEY, sanitized);
  } catch (e) {
    console.warn('Fallback para localStorage ao salvar perfil:', e);
  }
  localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(sanitized));
  // Sincroniza permanentemente no arquivo settings.json no servidor
  syncServerSettings('userProfile', sanitized);
}

export async function loadUserPreferences(): Promise<UserCreationPreferences> {
  if (typeof window === 'undefined') return DEFAULT_USER_PREFERENCES;
  try {
    const val = await get<any>(USER_PREFERENCES_KEY);
    if (val) return { ...DEFAULT_USER_PREFERENCES, ...val };
    const localVal = localStorage.getItem(USER_PREFERENCES_KEY);
    if (localVal) return { ...DEFAULT_USER_PREFERENCES, ...JSON.parse(localVal) };
  } catch (e) {
    console.warn('Erro ao carregar preferências:', e);
  }
  return DEFAULT_USER_PREFERENCES;
}

export async function saveUserPreferences(prefs: Partial<UserCreationPreferences>): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const current = await loadUserPreferences();
    const updated = { ...current, ...prefs };
    await set(USER_PREFERENCES_KEY, updated);
    localStorage.setItem(USER_PREFERENCES_KEY, JSON.stringify(updated));
    syncServerSettings('userPreferences', updated);
  } catch (e) {
    console.warn('Fallback para localStorage ao salvar preferências:', e);
  }
}

export async function loadCarousels(): Promise<Carousel[]> {
  if (typeof window === 'undefined') return [];
  try {
    const val = await get<any[]>(CAROUSELS_KEY);
    if (val && Array.isArray(val)) return val.map(sanitizeCarousel);

    const localVal = localStorage.getItem(CAROUSELS_KEY);
    if (localVal) {
      const parsed = JSON.parse(localVal);
      if (Array.isArray(parsed)) return parsed.map(sanitizeCarousel);
    }
  } catch (e) {
    console.warn('Erro ao carregar carrosséis do IndexedDB:', e);
  }
  return [];
}

export async function saveCarousels(carousels: Carousel[]): Promise<void> {
  if (typeof window === 'undefined') return;
  const sanitized = Array.isArray(carousels) ? carousels.map(sanitizeCarousel) : [];
  try {
    await set(CAROUSELS_KEY, sanitized);
  } catch (e) {
    console.warn('Fallback para localStorage ao salvar carrosséis:', e);
  }
  try {
    localStorage.setItem(CAROUSELS_KEY, JSON.stringify(sanitized));
  } catch (err) {
    console.error('LocalStorage quota exceeded, indexedDB handling:', err);
  }
}

// Helper de Integrações com Fallback Triplo: IndexedDB -> localStorage -> Servidor (/api/settings)
export async function loadIntegrations(): Promise<IntegrationConfig> {
  if (typeof window === 'undefined') return { bufferApiKey: '' };
  let loadedCfg: IntegrationConfig | null = null;
  try {
    const val = await get<any>(INTEGRATIONS_KEY);
    if (val) loadedCfg = sanitizeIntegrations(val);
    if (!loadedCfg || !loadedCfg.bufferApiKey) {
      const localVal = localStorage.getItem(INTEGRATIONS_KEY);
      if (localVal) loadedCfg = sanitizeIntegrations(JSON.parse(localVal));
    }
  } catch (e) {
    console.warn('Erro ao carregar integrações:', e);
  }

  // Se o armazenamento local estiver vazio ou sem chaves, resgata backup permanente do servidor
  if (!loadedCfg || (!loadedCfg.bufferApiKey && !loadedCfg.apiKey)) {
    const serverIntegrations = await fetchServerSetting('integrations');
    if (serverIntegrations) {
      loadedCfg = sanitizeIntegrations(serverIntegrations);
      await set(INTEGRATIONS_KEY, loadedCfg);
      localStorage.setItem(INTEGRATIONS_KEY, JSON.stringify(loadedCfg));
    }
  }

  return loadedCfg || { bufferApiKey: '' };
}

export async function saveIntegrations(config: IntegrationConfig): Promise<void> {
  if (typeof window === 'undefined') return;
  const sanitized = sanitizeIntegrations(config);
  try {
    await set(INTEGRATIONS_KEY, sanitized);
  } catch (e) {
    console.warn('Fallback para localStorage ao salvar integrações:', e);
  }
  try {
    localStorage.setItem(INTEGRATIONS_KEY, JSON.stringify(sanitized));
  } catch (err) {
    console.error('Erro ao salvar integrações no localStorage:', err);
  }
  // Sincroniza permanentemente no disco do servidor
  syncServerSettings('integrations', sanitized);
}

const SAVED_TEMPLATES_KEY = 'bliip_saved_slide_templates';

export async function loadSavedSlideTemplates(): Promise<SavedSlideTemplate[]> {
  if (typeof window === 'undefined') return [];
  try {
    const val = await get<any>(SAVED_TEMPLATES_KEY);
    if (Array.isArray(val)) return val;
    const localVal = localStorage.getItem(SAVED_TEMPLATES_KEY);
    if (localVal) return JSON.parse(localVal);
  } catch (e) {
    console.warn('Erro ao carregar modelos de slides salvos:', e);
  }
  return [];
}

export async function saveSavedSlideTemplates(templates: SavedSlideTemplate[]): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    await set(SAVED_TEMPLATES_KEY, templates);
  } catch (e) {
    console.warn('Fallback para localStorage ao salvar modelos de slides:', e);
  }
  try {
    localStorage.setItem(SAVED_TEMPLATES_KEY, JSON.stringify(templates));
  } catch (err) {
    console.error('Erro ao salvar modelos de slides no localStorage:', err);
  }
}

const PLANNED_CONTENT_KEY = 'bliip_planned_content_ideas';
const CHAT_HISTORY_KEY = 'bliip_chat_history_v1';

export async function loadPlannedContentIdeas(): Promise<PlannedContentIdea[]> {
  if (typeof window === 'undefined') return [];
  let raw: any[] = [];
  try {
    const val = await get<any>(PLANNED_CONTENT_KEY);
    if (Array.isArray(val)) raw = val;
    else {
      const localVal = localStorage.getItem(PLANNED_CONTENT_KEY);
      if (localVal) raw = JSON.parse(localVal);
    }
  } catch (e) {
    console.warn('Erro ao carregar ideias de conteúdo planejadas:', e);
  }

  return raw.map((idea) => ({
    ...idea,
    slidesContent: Array.isArray(idea.slidesContent)
      ? idea.slidesContent.map((sc: any) => ({
          ...sc,
          bodyText: cleanMarkString(sc.bodyText),
        }))
      : [],
    caption: cleanMarkString(idea.caption),
  }));
}

export async function savePlannedContentIdeas(ideas: PlannedContentIdea[]): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    await set(PLANNED_CONTENT_KEY, ideas);
  } catch (e) {
    console.warn('Fallback para localStorage ao salvar ideias planejadas:', e);
  }
  try {
    localStorage.setItem(PLANNED_CONTENT_KEY, JSON.stringify(ideas));
  } catch (err) {
    console.error('Erro ao salvar ideias planejadas no localStorage:', err);
  }
}

export async function loadChatHistory(): Promise<any[]> {
  if (typeof window === 'undefined') return [];
  try {
    const val = await get<any>(CHAT_HISTORY_KEY);
    if (Array.isArray(val)) return val;
    const localVal = localStorage.getItem(CHAT_HISTORY_KEY);
    if (localVal) return JSON.parse(localVal);
  } catch (e) {
    console.warn('Erro ao carregar histórico do chat:', e);
  }
  return [];
}

export async function saveChatHistory(messages: any[]): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    await set(CHAT_HISTORY_KEY, messages);
  } catch (e) {}
  try {
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
  } catch (err) {}
}

export async function saveVerticalVideoDraft(project: VerticalVideoProject, videoBlob?: Blob): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    // Evita salvar Blob URL temporária que expira
    const serializableProject = { ...project };
    await set(VERTICAL_VIDEO_DRAFT_KEY, serializableProject);
    if (videoBlob) {
      await set(VERTICAL_VIDEO_BLOB_KEY, videoBlob);
    }
  } catch (e) {
    console.warn('Erro ao salvar rascunho de vídeo vertical no IndexedDB:', e);
  }
}

export async function loadVerticalVideoDraft(): Promise<{ project: VerticalVideoProject | null; videoBlob: Blob | null }> {
  if (typeof window === 'undefined') return { project: null, videoBlob: null };
  try {
    const project = await get<VerticalVideoProject>(VERTICAL_VIDEO_DRAFT_KEY);
    const videoBlob = await get<Blob>(VERTICAL_VIDEO_BLOB_KEY);
    return { project: project || null, videoBlob: videoBlob || null };
  } catch (e) {
    console.warn('Erro ao carregar rascunho de vídeo vertical do IndexedDB:', e);
  }
  return { project: null, videoBlob: null };
}
