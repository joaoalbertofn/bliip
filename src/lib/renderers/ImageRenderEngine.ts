import { toPng } from 'html-to-image';
import JSZip from 'jszip';

export class ImageRenderEngine {
  /**
   * Converte um elemento DOM em uma imagem PNG em Ultra Alta Definição (1380x1725px em 3x pixel ratio).
   */
  static async renderElementToPng(element: HTMLElement): Promise<string> {
    const dataUrl = await toPng(element, {
      quality: 1.0,
      pixelRatio: 3,
      cacheBust: true,
      style: {
        transform: 'scale(1)',
        transformOrigin: 'top left',
        opacity: '1',
        visibility: 'visible',
        fontSmoothing: 'antialiased',
        textRendering: 'optimizeLegibility',
      } as any,
    });
    return dataUrl;
  }

  /**
   * Baixa uma Data URL diretamente no navegador.
   */
  static downloadDataUrl(dataUrl: string, filename: string): void {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
  }

  /**
   * Empacota um array de elementos DOM (slides) em um arquivo .ZIP.
   */
  static async renderElementsToZip(
    slideElements: HTMLElement[],
    zipName: string,
    onProgress?: (current: number, total: number) => void
  ): Promise<Blob> {
    const zip = new JSZip();
    const folder = zip.folder(zipName.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'carrossel_bliip');

    for (let i = 0; i < slideElements.length; i++) {
      const el = slideElements[i];
      if (!el) continue;
      try {
        if (onProgress) onProgress(i + 1, slideElements.length);
        const dataUrl = await ImageRenderEngine.renderElementToPng(el);
        const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
        folder?.file(`slide_${i + 1}.png`, base64Data, { base64: true });
      } catch (err) {
        console.error(`Erro ao capturar slide ${i + 1} no ImageRenderEngine:`, err);
      }
    }

    const blob = await zip.generateAsync({ type: 'blob' });
    return blob;
  }
}
