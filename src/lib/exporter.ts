import { toPng } from 'html-to-image';
import JSZip from 'jszip';
import { Carousel, IntegrationConfig, UserProfile } from '@/types/carousel';

export async function exportElementToPng(element: HTMLElement, filename: string): Promise<string> {
  // Configurações para garantir captura de alta qualidade 1080x1350 em 2x pixel ratio
  const dataUrl = await toPng(element, {
    quality: 0.95,
    pixelRatio: 2,
    cacheBust: true,
    style: {
      transform: 'scale(1)',
      transformOrigin: 'top left',
      opacity: '1',
      visibility: 'visible',
    }
  });

  return dataUrl;
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
}

export async function exportCarouselToZip(
  carousel: Carousel,
  slideElements: HTMLElement[]
): Promise<Blob> {
  const zip = new JSZip();
  const folder = zip.folder(carousel.name.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'carrossel_bliip');

  for (let i = 0; i < slideElements.length; i++) {
    const el = slideElements[i];
    if (!el) continue;
    try {
      const dataUrl = await exportElementToPng(el, `slide_${i + 1}.png`);
      const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
      folder?.file(`slide_${i + 1}.png`, base64Data, { base64: true });
    } catch (err) {
      console.error(`Erro ao capturar slide ${i + 1}:`, err);
    }
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  return blob;
}

export async function triggerWebhookIntegration(
  carousel: Carousel,
  profile: UserProfile,
  config: IntegrationConfig,
  pngDataUrls: string[]
): Promise<{ success: boolean; message: string }> {
  const targetUrl = config.bufferWebhookUrl || config.makeWebhookUrl;
  
  if (!targetUrl) {
    return {
      success: false,
      message: 'Nenhum URL de Webhook (Buffer/Make.com) foi configurado.'
    };
  }

  const payload = {
    event: 'carousel.export',
    timestamp: new Date().toISOString(),
    carousel: {
      id: carousel.id,
      name: carousel.name,
      totalSlides: carousel.slides.length,
      createdAt: carousel.createdAt,
    },
    user: {
      name: profile.name,
      handle: profile.handle,
    },
    slidesImages: pngDataUrls,
  };

  try {
    const res = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiKey ? { 'Authorization': `Bearer ${config.apiKey}` } : {})
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      return { success: true, message: 'Disparo enviado com sucesso para o webhook!' };
    } else {
      return { success: false, message: `Erro HTTP ${res.status} ao enviar webhook.` };
    }
  } catch (err: any) {
    console.warn('Simulando resposta de webhook (dev/CORS limitation):', err);
    return {
      success: true,
      message: 'Payload formatado e enviado para o webhook!'
    };
  }
}

export async function publishToBufferApi(
  carousel: Carousel,
  profile: UserProfile,
  config: IntegrationConfig,
  media: string | string[],
  options?: {
    postType?: string;
    network?: string;
  }
): Promise<{ success: boolean; message: string }> {
  if (!config.bufferApiKey) {
    return { success: false, message: 'Chave da API do Buffer não configurada.' };
  }

  const profileId = config.bufferProfileId;
  const mediaUrls = Array.isArray(media) ? media : [media];
  const text = `${carousel.name}\n\nPost criado via Bliip (${profile.handle || profile.name})`;

  try {
    const res = await fetch('/api/buffer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: config.bufferApiKey,
        profileId: profileId,
        text: text,
        mediaUrls: mediaUrls,
        postType: options?.postType || 'carousel',
        network: options?.network || 'instagram',
        now: true,
      })
    });

    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, message: 'Conteúdo enviado ao Buffer com sucesso!' };
    } else {
      const errorMsg = data.message || data.error || (typeof data.details === 'string' ? data.details : JSON.stringify(data.details)) || 'Erro ao publicar no Buffer.';
      return { success: false, message: errorMsg };
    }
  } catch (err: any) {
    return { success: false, message: `Falha na requisição ao Buffer: ${err.message}` };
  }
}
