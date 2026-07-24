import { get, set } from 'idb-keyval';
import { Carousel, Slide, UserProfile, IntegrationConfig, ContentType, LayoutStyle } from '@/types/carousel';

const USER_PROFILE_KEY = 'bliip_user_profile';
const CAROUSELS_KEY = 'bliip_carousels';
const INTEGRATIONS_KEY = 'bliip_integrations';

export const DEFAULT_USER_PROFILE: UserProfile = {
  name: 'Bruno Perini',
  handle: '@bruno_perini',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&h=250&q=80',
};

// Sanitizador defensivo de Perfil do Usuário
export function sanitizeUserProfile(data: any): UserProfile {
  if (!data || typeof data !== 'object') return DEFAULT_USER_PROFILE;
  return {
    name: typeof data.name === 'string' && data.name.trim() !== '' ? data.name : DEFAULT_USER_PROFILE.name,
    handle: typeof data.handle === 'string' ? data.handle : DEFAULT_USER_PROFILE.handle,
    avatarUrl: typeof data.avatarUrl === 'string' && data.avatarUrl.trim() !== '' ? data.avatarUrl : DEFAULT_USER_PROFILE.avatarUrl,
  };
}

// Sanitizador defensivo de Slide
export function sanitizeSlide(s: any): Slide {
  const contentType: ContentType = 
    s?.contentType === 'text_only' || s?.contentType === 'text_1_image' || s?.contentType === 'text_2_images'
      ? s.contentType
      : s?.layout === 'text_only' || s?.layout === 'text_1_image' || s?.layout === 'text_2_images'
      ? s.layout
      : 'text_1_image';

  const layoutStyle: LayoutStyle = 
    s?.layoutStyle === 'immersive' || s?.style === 'immersive'
      ? 'immersive'
      : 'twitter';

  const imageLayout = s?.imageLayout === 'vertical' || s?.imageLayout === 'horizontal' ? s.imageLayout : 'horizontal';

  const images = Array.isArray(s?.layers?.images)
    ? s.layers.images.map((img: any) => ({
        ...img,
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
    background: typeof s?.background === 'string' && s.background ? s.background : '#ffffff',
    layers: {
      text: Array.isArray(s?.layers?.text) ? s.layers.text : [],
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
    status: c?.status === 'sent' ? 'sent' : 'draft',
    aspectRatio: c?.aspectRatio === '1:1' ? '1:1' : '4:5',
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

// Helper com fallback transparente entre IndexedDB e localStorage
export async function loadUserProfile(): Promise<UserProfile> {
  if (typeof window === 'undefined') return DEFAULT_USER_PROFILE;
  try {
    const val = await get<any>(USER_PROFILE_KEY);
    if (val) return sanitizeUserProfile(val);
    
    const localVal = localStorage.getItem(USER_PROFILE_KEY);
    if (localVal) return sanitizeUserProfile(JSON.parse(localVal));
  } catch (e) {
    console.warn('Erro ao carregar perfil do IndexedDB:', e);
  }
  return DEFAULT_USER_PROFILE;
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

export async function loadIntegrations(): Promise<IntegrationConfig> {
  if (typeof window === 'undefined') return { bufferApiKey: '' };
  try {
    const val = await get<any>(INTEGRATIONS_KEY);
    if (val) return sanitizeIntegrations(val);
    const localVal = localStorage.getItem(INTEGRATIONS_KEY);
    if (localVal) return sanitizeIntegrations(JSON.parse(localVal));
  } catch (e) {
    console.warn('Erro ao carregar integrações:', e);
  }
  return { bufferApiKey: '' };
}

export async function saveIntegrations(config: IntegrationConfig): Promise<void> {
  if (typeof window === 'undefined') return;
  const sanitized = sanitizeIntegrations(config);
  try {
    await set(INTEGRATIONS_KEY, sanitized);
  } catch (e) {
    console.warn('Fallback para localStorage ao salvar integrações:', e);
  }
  localStorage.setItem(INTEGRATIONS_KEY, JSON.stringify(sanitized));
}
