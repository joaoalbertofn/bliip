import { SocialChannel, IntegrationConfig } from '@/types/carousel';

export interface StandardizedPostPayload {
  carouselId: string;
  carouselName: string;
  caption: string;
  mediaUrls: string[];
  targetChannels: SocialChannel[];
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
