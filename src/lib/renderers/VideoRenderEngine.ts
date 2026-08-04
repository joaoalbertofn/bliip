export interface VideoMetadata {
  durationSeconds: number;
  width: number;
  height: number;
}

export class VideoRenderEngine {
  /**
   * Extrai o primeiro frame de um arquivo de vídeo (ou Blob URL) e gera uma imagem de capa (poster) em PNG.
   */
  static extractVideoFrameThumbnail(videoUrl: string, timeInSeconds: number = 0.5): Promise<string> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.crossOrigin = 'anonymous';
      video.src = videoUrl;
      video.muted = true;
      video.playsInline = true;

      video.addEventListener('loadeddata', () => {
        video.currentTime = Math.min(timeInSeconds, video.duration || 0);
      });

      video.addEventListener('seeked', () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth || 1080;
          canvas.height = video.videoHeight || 1350;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/png');
            resolve(dataUrl);
          } else {
            reject(new Error('Não foi possível obter contexto do Canvas 2D'));
          }
        } catch (err) {
          reject(err);
        } finally {
          video.remove();
        }
      });

      video.addEventListener('error', (err) => {
        reject(err);
        video.remove();
      });

      video.load();
    });
  }

  /**
   * Obtém a duração e dimensões exatas de um arquivo de vídeo.
   */
  static getVideoMetadata(videoFile: File | string): Promise<VideoMetadata> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';

      const url = typeof videoFile === 'string' ? videoFile : URL.createObjectURL(videoFile);
      video.src = url;

      video.onloadedmetadata = () => {
        if (typeof videoFile !== 'string') {
          URL.revokeObjectURL(url);
        }
        resolve({
          durationSeconds: video.duration,
          width: video.videoWidth,
          height: video.videoHeight,
        });
        video.remove();
      };

      video.onerror = (err) => {
        reject(err);
        video.remove();
      };
    });
  }
}
