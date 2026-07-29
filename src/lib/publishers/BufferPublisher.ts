import { PublishingAdapter, StandardizedPostPayload, PublishResult, ChannelPublishResult } from './PublishingAdapter';
import { IntegrationConfig, SocialChannel } from '@/types/carousel';

export class BufferPublisher implements PublishingAdapter {
  id = 'buffer';
  name = 'Buffer';

  async publish(payload: StandardizedPostPayload, config: IntegrationConfig): Promise<PublishResult> {
    if (!config.bufferApiKey || config.bufferApiKey.trim() === '') {
      return { success: false, message: 'Chave da API do Buffer não configurada.' };
    }

    const cleanToken = config.bufferApiKey.trim();
    const text = payload.caption?.trim()
      ? payload.caption
      : `${payload.carouselName}\n\nPost criado via Bliip Studio`;

    // 1. Busca os perfis/canais realmente conectados no Buffer para obter os IDs de cada rede
    let bufferProfiles: any[] = [];
    try {
      const getRes = await fetch('/api/buffer', {
        headers: { Authorization: `Bearer ${cleanToken}` },
      });
      if (getRes.ok) {
        const getData = await getRes.json();
        bufferProfiles = getData.profiles || [];
      }
    } catch (e) {
      console.warn('Não foi possível obter lista de perfis do Buffer, usando profileId salvo:', e);
    }

    const targetChannels = payload.targetChannels || ['instagram', 'linkedin'];
    const channelResults: ChannelPublishResult[] = [];

    // Mapeamento de cada canal selecionado para o seu perfil no Buffer
    const publishTasks = targetChannels.map(async (channel: SocialChannel) => {
      // Encontra o perfil correspondente no Buffer para este canal
      const matchedProfile = bufferProfiles.find((p: any) => {
        const svc = p.service?.toLowerCase() || '';
        if (channel === 'instagram') return svc.includes('instagram');
        if (channel === 'linkedin') return svc.includes('linkedin');
        if (channel === 'facebook') return svc.includes('facebook');
        return false;
      });

      const profileId = matchedProfile?.id || config.bufferProfileId;
      const channelName = matchedProfile?.name || matchedProfile?.formatted_username || channel.toUpperCase();

      if (!profileId) {
        return {
          channel,
          channelName,
          success: false,
          message: `Nenhum perfil de ${channel.toUpperCase()} conectado encontrado no Buffer.`,
        };
      }

      try {
        const res = await fetch('/api/buffer', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${cleanToken}`,
          },
          body: JSON.stringify({
            profileId,
            text,
            mediaUrls: payload.mediaUrls,
            postType: 'carousel',
            network: channel,
            scheduledAt: payload.scheduledAt,
            now: !payload.scheduledAt,
          }),
        });

        const data = await res.json();

        if (res.ok && data.success) {
          return {
            channel,
            channelName,
            success: true,
            message: `Conteúdo enviado ao ${channel.toUpperCase()} (${channelName}) com sucesso!`,
          };
        } else {
          const errorMsg =
            data.message ||
            data.error ||
            (typeof data.details === 'string' ? data.details : JSON.stringify(data.details)) ||
            `Erro ao publicar no ${channel.toUpperCase()}.`;

          return {
            channel,
            channelName,
            success: false,
            message: errorMsg,
          };
        }
      } catch (err: any) {
        return {
          channel,
          channelName,
          success: false,
          message: `Falha na requisição ao Buffer para ${channel.toUpperCase()}: ${err.message}`,
        };
      }
    });

    const results = await Promise.all(publishTasks);
    results.forEach((res) => channelResults.push(res));

    const totalSuccess = channelResults.filter((r) => r.success).length;
    const totalFailed = channelResults.filter((r) => !r.success).length;

    if (totalSuccess > 0 && totalFailed === 0) {
      return {
        success: true,
        message: `Conteúdo publicado com sucesso em todas as ${totalSuccess} rede(s) selecionada(s)!`,
        channelResults,
      };
    } else if (totalSuccess > 0 && totalFailed > 0) {
      return {
        success: true,
        message: `Publicado em ${totalSuccess} rede(s), mas falhou em ${totalFailed} rede(s).`,
        channelResults,
      };
    } else {
      return {
        success: false,
        message: `Falha ao publicar em todas as redes selecionadas.`,
        channelResults,
      };
    }
  }
}
