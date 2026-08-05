import { SocialChannel, IntegrationConfig } from '@/types/carousel';

export interface StandardizedPostPayload {
  carouselId: string;
  carouselName: string;
  caption: string;
  mediaUrls: string[];
  targetChannels: SocialChannel[];
  scheduledAt?: string; // Data e hora ISO para agendamento (ex: 2026-07-28T10:00:00.000Z)
  isDraft?: boolean; // Se true, salva como rascunho no Buffer
  publishNow?: boolean; // Se true, publica imediatamente nas redes
}

export interface ChannelPublishResult {
  channel: SocialChannel;
  channelName?: string;
  success: boolean;
  message: string;
}

export interface PublishResult {
  success: boolean;
  message: string;
  channelResults?: ChannelPublishResult[];
  details?: any;
}

export interface PublishingAdapter {
  id: string;
  name: string;
  publish(payload: StandardizedPostPayload, config: IntegrationConfig): Promise<PublishResult>;
}
