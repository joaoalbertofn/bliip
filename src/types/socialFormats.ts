export type SocialNetwork =
  | 'instagram'
  | 'facebook'
  | 'linkedin'
  | 'twitter'
  | 'tiktok'
  | 'youtube'
  | 'pinterest'
  | 'threads'
  | 'bluesky';

export type PostType =
  | 'carousel'
  | 'post'
  | 'story'
  | 'reel'
  | 'short'
  | 'event'
  | 'offer'
  | 'whats_new';

export interface SocialFormatOption {
  id: string;
  name: string;
  network: SocialNetwork;
  postType: PostType;
  description: string;
  badge?: string;
}

export const AVAILABLE_SOCIAL_FORMATS: SocialFormatOption[] = [
  {
    id: 'instagram_carousel',
    name: 'Carrossel (Instagram)',
    network: 'instagram',
    postType: 'post',
    description: 'Envia todos os slides como carrossel no feed do Instagram.',
    badge: 'Recomendado',
  },
  {
    id: 'instagram_post',
    name: 'Post Único (Instagram)',
    network: 'instagram',
    postType: 'post',
    description: 'Publica uma única imagem no feed do Instagram.',
  },
  {
    id: 'instagram_story',
    name: 'Story (Instagram)',
    network: 'instagram',
    postType: 'story',
    description: 'Envia o slide no formato Instagram Story.',
  },
  {
    id: 'instagram_reel',
    name: 'Reels (Instagram)',
    network: 'instagram',
    postType: 'reel',
    description: 'Publica no formato Instagram Reels.',
  },
  {
    id: 'facebook_post',
    name: 'Post (Facebook)',
    network: 'facebook',
    postType: 'post',
    description: 'Publica a imagem no feed do Facebook.',
  },
  {
    id: 'linkedin_post',
    name: 'Post (LinkedIn)',
    network: 'linkedin',
    postType: 'post',
    description: 'Publica no feed do LinkedIn.',
  },
  {
    id: 'twitter_post',
    name: 'Post (X / Twitter)',
    network: 'twitter',
    postType: 'post',
    description: 'Publica no perfil do X / Twitter.',
  },
];
