import { NextRequest, NextResponse } from 'next/server';

// Endpoint para upload individual de slide (base64 -> CDN com URL HTTPS pública)
// Isso evita o estouro do limite de 4.5MB da Vercel ao enviar múltiplos slides base64 no Buffer
export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json();

    if (!image || typeof image !== 'string') {
      return NextResponse.json({ error: 'Nenhuma imagem enviada para upload.' }, { status: 400 });
    }

    // Se já for uma URL HTTP/HTTPS pública, retorna a própria URL
    if (image.startsWith('http://') || image.startsWith('https://')) {
      return NextResponse.json({ success: true, url: image });
    }

    const match = image.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
    if (!match) {
      return NextResponse.json({ error: 'Formato de imagem inválido. Esperado data:image/... base64.' }, { status: 400 });
    }

    const mimeType = match[1];
    const base64Data = match[2];
    const buffer = Buffer.from(base64Data, 'base64');
    const ext = mimeType.includes('jpeg') || mimeType.includes('jpg') ? 'jpg' : 'png';

    // Provedor 1: Litterbox (Catbox 24h temp upload) - Extremamente estável e aceito por crawlers do Instagram/LinkedIn
    try {
      const formData = new FormData();
      formData.append('reqtype', 'fileupload');
      formData.append('time', '24h');
      formData.append('fileToUpload', new Blob([buffer], { type: mimeType }), `slide.${ext}`);

      const res = await fetch('https://litterbox.catbox.moe/resources/internals/api.php', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const publicUrl = (await res.text()).trim();
        if (publicUrl.startsWith('http')) {
          console.log('[Buffer Upload CDN] Imagem hospedada via Litterbox:', publicUrl);
          return NextResponse.json({ success: true, url: publicUrl });
        }
      }
    } catch (errLitter) {
      console.warn('[Buffer Upload CDN] Provedor Litterbox falhou, tentando fallback tmpfiles.org...', errLitter);
    }

    // Provedor 2: tmpfiles.org
    try {
      const formData = new FormData();
      formData.append('file', new Blob([buffer], { type: mimeType }), `slide.${ext}`);

      const res = await fetch('https://tmpfiles.org/api/v1/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.data?.url) {
          const directUrl = data.data.url.replace('tmpfiles.org/', 'tmpfiles.org/dl/');
          console.log('[Buffer Upload CDN] Imagem hospedada via tmpfiles.org:', directUrl);
          return NextResponse.json({ success: true, url: directUrl });
        }
      }
    } catch (errTmp) {
      console.warn('[Buffer Upload CDN] Provedor tmpfiles.org falhou:', errTmp);
    }

    return NextResponse.json(
      { error: 'Não foi possível hospedar a imagem em nenhuma CDN disponível.' },
      { status: 500 }
    );
  } catch (err: any) {
    console.error('[Buffer Upload CDN Error]:', err);
    return NextResponse.json(
      { error: 'Falha no processamento de upload de imagem.', details: err.message },
      { status: 500 }
    );
  }
}
