import { get, set } from 'idb-keyval';
import { Carousel, UserProfile, IntegrationConfig } from '@/types/carousel';

const USER_PROFILE_KEY = 'bliip_user_profile';
const CAROUSELS_KEY = 'bliip_carousels';
const INTEGRATIONS_KEY = 'bliip_integrations';

export const DEFAULT_USER_PROFILE: UserProfile = {
  name: 'Bruno Perini',
  handle: '@bruno_perini',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&h=250&q=80',
};

// Helper com fallback transparente entre IndexedDB e localStorage
export async function loadUserProfile(): Promise<UserProfile> {
  if (typeof window === 'undefined') return DEFAULT_USER_PROFILE;
  try {
    const val = await get<UserProfile>(USER_PROFILE_KEY);
    if (val && val.name) return val;
    
    const localVal = localStorage.getItem(USER_PROFILE_KEY);
    if (localVal) return JSON.parse(localVal);
  } catch (e) {
    console.warn('Erro ao carregar perfil do IndexedDB:', e);
  }
  return DEFAULT_USER_PROFILE;
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    await set(USER_PROFILE_KEY, profile);
  } catch (e) {
    console.warn('Fallback para localStorage ao salvar perfil:', e);
  }
  localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
}

export async function loadCarousels(): Promise<Carousel[]> {
  if (typeof window === 'undefined') return [];
  try {
    const val = await get<Carousel[]>(CAROUSELS_KEY);
    if (val && Array.isArray(val)) return val;

    const localVal = localStorage.getItem(CAROUSELS_KEY);
    if (localVal) return JSON.parse(localVal);
  } catch (e) {
    console.warn('Erro ao carregar carrosséis do IndexedDB:', e);
  }
  return [];
}

export async function saveCarousels(carousels: Carousel[]): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    await set(CAROUSELS_KEY, carousels);
  } catch (e) {
    console.warn('Fallback para localStorage ao salvar carrosséis:', e);
  }
  try {
    localStorage.setItem(CAROUSELS_KEY, JSON.stringify(carousels));
  } catch (err) {
    console.error('LocalStorage quota exceeded, indexedDB handling:', err);
  }
}

export async function loadIntegrations(): Promise<IntegrationConfig> {
  const defaultKey = '';
  if (typeof window === 'undefined') return { bufferApiKey: defaultKey };
  try {
    const val = await get<IntegrationConfig>(INTEGRATIONS_KEY);
    if (val) return { bufferApiKey: defaultKey, ...val };
    const localVal = localStorage.getItem(INTEGRATIONS_KEY);
    if (localVal) return { bufferApiKey: defaultKey, ...JSON.parse(localVal) };
  } catch (e) {
    console.warn('Erro ao carregar integrações:', e);
  }
  return { bufferApiKey: defaultKey };
}

export async function saveIntegrations(config: IntegrationConfig): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    await set(INTEGRATIONS_KEY, config);
  } catch (e) {
    console.warn('Fallback para localStorage ao salvar integrações:', e);
  }
  localStorage.setItem(INTEGRATIONS_KEY, JSON.stringify(config));
}
