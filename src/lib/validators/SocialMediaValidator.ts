import { SocialChannel, Slide } from '@/types/carousel';

export interface CompatibilityWarning {
  channel: SocialChannel;
  title: string;
  message: string;
  severity: 'warning' | 'error';
  type: 'mixed_media_carousel' | 'duration_limit' | 'unsupported_format';
}

export interface CompatibilityDiagnosis {
  isCompatible: boolean;
  warnings: CompatibilityWarning[];
  compatibleChannels: SocialChannel[];
  incompatibleChannels: SocialChannel[];
}

export class SocialMediaValidator {
  /**
   * Valida se um carrossel contendo slides (que podem ter imagens ou vídeos) é compatível com os canais selecionados.
   */
  static validateCarousel(slides: Slide[], selectedChannels: SocialChannel[]): CompatibilityDiagnosis {
    const warnings: CompatibilityWarning[] = [];
    const hasVideo = slides.some((slide) =>
      slide.layers?.images?.some((img) => img.source?.mediaType === 'video' || img.source?.url?.match(/\.(mp4|mov|webm)(\?.*)?$/i))
    );

    const isMultiSlide = slides.length > 1;

    const compatibleChannels: SocialChannel[] = [];
    const incompatibleChannels: SocialChannel[] = [];

    selectedChannels.forEach((channel) => {
      // Vídeo em carrossel multi-slide não é suportado pelo LinkedIn e TikTok Photo Mode.
      // Em posts de slide único (1 vídeo + legenda), todas as redes suportam o formato de vídeo único.
      if (hasVideo && isMultiSlide) {
        if (channel === 'linkedin') {
          warnings.push({
            channel: 'linkedin',
            title: 'Carrossel com Vídeo no LinkedIn',
            message:
              'O LinkedIn não aceita vídeos em carrosséis no feed. O carrossel será exportado apenas no Instagram e Facebook, ou o vídeo será substituído por uma imagem estática de capa no LinkedIn.',
            severity: 'warning',
            type: 'mixed_media_carousel',
          });
          incompatibleChannels.push(channel);
        } else if (channel === 'tiktok') {
          warnings.push({
            channel: 'tiktok',
            title: 'Modo Foto no TikTok',
            message:
              'O modo Photo Mode do TikTok aceita apenas fotos estáticas em carrossel. Mídias em vídeo devem ser publicadas como vídeo único.',
            severity: 'warning',
            type: 'mixed_media_carousel',
          });
          incompatibleChannels.push(channel);
        } else {
          compatibleChannels.push(channel);
        }
      } else {
        compatibleChannels.push(channel);
      }
    });

    return {
      isCompatible: warnings.length === 0,
      warnings,
      compatibleChannels,
      incompatibleChannels,
    };
  }

  /**
   * Valida vídeos longos de acordo com os limites de duração de cada rede.
   */
  static validateVideoDuration(durationSeconds: number, selectedChannels: SocialChannel[]): CompatibilityDiagnosis {
    const warnings: CompatibilityWarning[] = [];
    const compatibleChannels: SocialChannel[] = [];
    const incompatibleChannels: SocialChannel[] = [];

    const MAX_LINKEDIN_VIDEO_SECONDS = 15 * 60; // 15 minutos
    const MAX_INSTAGRAM_VIDEO_SECONDS = 15 * 60; // 15 minutos

    selectedChannels.forEach((channel) => {
      if (channel === 'linkedin' && durationSeconds > MAX_LINKEDIN_VIDEO_SECONDS) {
        warnings.push({
          channel: 'linkedin',
          title: 'Limite de Duração Excedido (LinkedIn)',
          message: `Vídeo com ${Math.round(durationSeconds / 60)} minutos. O LinkedIn permite vídeos nativos de no máximo 15 minutos.`,
          severity: 'error',
          type: 'duration_limit',
        });
        incompatibleChannels.push(channel);
      } else if (channel === 'instagram' && durationSeconds > MAX_INSTAGRAM_VIDEO_SECONDS) {
        warnings.push({
          channel: 'instagram',
          title: 'Limite de Duração Excedido (Instagram)',
          message: `Vídeo com ${Math.round(durationSeconds / 60)} minutos. O Instagram permite vídeos de feed de no máximo 15 minutos.`,
          severity: 'error',
          type: 'duration_limit',
        });
        incompatibleChannels.push(channel);
      } else {
        compatibleChannels.push(channel);
      }
    });

    return {
      isCompatible: warnings.length === 0,
      warnings,
      compatibleChannels,
      incompatibleChannels,
    };
  }
}
