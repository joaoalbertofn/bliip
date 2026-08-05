import { NextRequest, NextResponse } from 'next/server';

const BUFFER_GRAPHQL_ENDPOINT = 'https://api.buffer.com';

// GET: Testar Conexão com a API do Buffer e listar Perfis / Canais
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') 
    ? authHeader.substring(7).trim() 
    : null;

  if (!token) {
    return NextResponse.json(
      { error: 'Por favor, insira o seu Personal Access Token do Buffer no cabeçalho Authorization.' },
      { status: 400 }
    );
  }

  const cleanToken = token;
  let allProfiles: any[] = [];
  const profileIdsSeen = new Set<string>();

  try {
    // 1. Tenta buscar via API REST v1 do Buffer (método direto por token)
    try {
      const v1Res = await fetch(`https://api.bufferapp.com/1/profiles.json?access_token=${cleanToken}`);
      if (v1Res.ok) {
        const v1Profiles = await v1Res.json();
        if (Array.isArray(v1Profiles)) {
          for (const p of v1Profiles) {
            if (p.id && !profileIdsSeen.has(p.id)) {
              profileIdsSeen.add(p.id);
              allProfiles.push({
                id: p.id,
                name: p.formatted_username || p.service_username || p.service,
                service: p.service,
                formatted_username: p.formatted_username || p.service_username,
                service_username: p.service_username,
                avatar: p.avatar_https || p.avatar,
                organizationId: p.organization_id || '',
              });
            }
          }
        }
      }
    } catch (errV1) {
      console.warn('REST v1 fetch attempt notice:', errV1);
    }

    // 2. Tenta autenticar e buscar organizações/canais via GraphQL da API do Buffer (https://api.buffer.com)
    const accountQuery = `
      query GetAccount {
        account {
          id
          email
          name
          organizations {
            id
            name
          }
        }
      }
    `;

    const accountRes = await fetch(BUFFER_GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cleanToken}`,
      },
      body: JSON.stringify({ query: accountQuery }),
    });

    const accountData = await accountRes.json();

    // Trata erro de autenticação se ambas as APIs falharem e houver erro explicito
    if (allProfiles.length === 0 && accountData.errors && accountData.errors.length > 0) {
      const authErr = accountData.errors.find((e: any) =>
        e.extensions?.code === 'UNAUTHENTICATED' ||
        e.message?.toLowerCase().includes('token') ||
        e.message?.toLowerCase().includes('user') ||
        e.message?.toLowerCase().includes('authenticated')
      );

      if (authErr || accountRes.status === 401) {
        return NextResponse.json(
          {
            error: 'Erro de Autenticação no Buffer (401): Token inválido ou expirado.',
            details: 'Verifique seu Personal Access Token nas configurações da sua conta no Buffer.'
          },
          { status: 401 }
        );
      }
    }

    const organizations = accountData.data?.account?.organizations || [];

    // Busca os canais para cada organização encontrada via GraphQL
    for (const org of organizations) {
      if (!org.id) continue;

      const channelsQuery = `
        query {
          channels(input: { organizationId: "${org.id}" }) {
            id
            name
            displayName
            service
            serviceId
            organizationId
            avatar
          }
        }
      `;

      try {
        const chanRes = await fetch(BUFFER_GRAPHQL_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${cleanToken}`,
          },
          body: JSON.stringify({ query: channelsQuery }),
        });

        const chanData = await chanRes.json();
        const channels = chanData.data?.channels || [];

        for (const ch of channels) {
          if (ch.id && !profileIdsSeen.has(ch.id)) {
            profileIdsSeen.add(ch.id);
            allProfiles.push({
              id: ch.id,
              name: ch.displayName || ch.name || ch.service,
              service: ch.service,
              formatted_username: ch.displayName || ch.name,
              service_username: ch.name,
              avatar: ch.avatar,
              organizationId: ch.organizationId || org.id,
            });
          }
        }
      } catch (errChan) {
        console.warn('GraphQL channels query notice:', errChan);
      }
    }

    return NextResponse.json({
      success: true,
      account: accountData.data?.account || null,
      organizations,
      profiles: allProfiles,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Não foi possível conectar à API do Buffer.', details: err.message },
      { status: 500 }
    );
  }
}

// POST: Publicar Post ou Criar Ideia via GraphQL / REST do Buffer
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const headerToken = authHeader?.startsWith('Bearer ') 
      ? authHeader.substring(7).trim() 
      : null;

    const body = await req.json();
    const {
      token: bodyToken,
      profileId,
      organizationId,
      title,
      text,
      mediaUrls = [],
      action = 'post',
      postType = 'carousel',
      network = 'instagram',
      scheduledAt,
      isDraft,
      publishNow = false,
    } = body;

    const rawToken = headerToken || bodyToken;

    const shouldPublishNow = publishNow || body.now === true;
    const isDraftPost = isDraft !== undefined ? isDraft : (scheduledAt ? true : false);

    console.log('[Buffer API POST] Recebida requisição:', {
      hasToken: !!rawToken,
      tokenLength: rawToken?.length,
      profileId,
      organizationId,
      action,
      postType,
      network,
      scheduledAt,
      shouldPublishNow,
      isDraftPost,
      mediaUrlsCount: mediaUrls.length,
    });

    if (!rawToken || rawToken.trim() === '') {
      console.warn('[Buffer API POST] Token ausente.');
      return NextResponse.json(
        { error: 'Por favor, insira o seu Personal Access Token do Buffer no cabeçalho Authorization.' },
        { status: 400 }
      );
    }

    const cleanToken = rawToken.trim();

    // 1. Ação Idea (GraphQL createIdea)
    if (action === 'idea') {
      const createIdeaMutation = `
        mutation CreateIdea($input: CreateIdeaInput!) {
          createIdea(input: $input) {
            ... on Idea {
              id
              content {
                title
                text
              }
            }
            ... on IdeaResponse {
              idea {
                id
              }
            }
            ... on InvalidInputError {
              message
            }
            ... on UnauthorizedError {
              message
            }
          }
        }
      `;

      const res = await fetch(BUFFER_GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cleanToken}`,
        },
        body: JSON.stringify({
          query: createIdeaMutation,
          variables: {
            input: {
              organizationId: organizationId || '',
              content: {
                title: title || 'Nova Ideia via Bliip',
                text: text || '',
              },
            },
          },
        }),
      });

      const data = await res.json();
      console.log('[Buffer API POST Idea] Resposta GraphQL:', data);
      if (data.errors && data.errors.length > 0) {
        return NextResponse.json({ success: false, error: data.errors[0]?.message }, { status: 400 });
      }
      return NextResponse.json({ success: true, data: data.data?.createIdea });
    }

// Helper para converter Data URLs (Base64) em URLs HTTPS públicas para o Buffer
async function uploadMediaToPublicUrl(mediaUrl: string): Promise<string> {
  if (!mediaUrl) return mediaUrl;

  // Se já for uma URL HTTP/HTTPS pública, não precisa converter
  if (mediaUrl.startsWith('http://') || mediaUrl.startsWith('https://')) {
    return mediaUrl;
  }

  // Se for Data URL (data:image/png;base64,...), faz upload para CDN de alta velocidade (iili.io) aceita pelo crawler do Instagram
  if (mediaUrl.startsWith('data:image/')) {
    try {
      const match = mediaUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
      if (match) {
        const mimeType = match[1];
        const base64Data = match[2];
        const buffer = Buffer.from(base64Data, 'base64');
        const ext = mimeType.includes('jpeg') || mimeType.includes('jpg') ? 'jpg' : 'png';

        // Método 1: CDN Oficial freeimage.host (URLs iili.io com cabeçalho image/png e suporte ao crawler do Instagram)
        try {
          const fd = new FormData();
          fd.append('key', '6d207e02198a847aa98d0a2a901485a5');
          fd.append('action', 'upload');
          fd.append('source', base64Data);
          fd.append('format', 'json');

          const res = await fetch('https://freeimage.host/api/1/upload', {
            method: 'POST',
            body: fd,
          });

          if (res.ok) {
            const data = await res.json();
            const cdnUrl = data?.image?.url || data?.image?.display_url || data?.image?.image?.url;
            if (cdnUrl && cdnUrl.startsWith('http')) {
              console.log('[Buffer API Upload] Imagem convertida via CDN oficial (iili.io):', cdnUrl);
              return cdnUrl;
            }
          }
        } catch (errCdn) {
          console.warn('[Buffer API Upload] CDN iili.io falhou, tentando fallback Litterbox...', errCdn);
        }

        // Método 2: Fallback Litterbox
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
              console.log('[Buffer API Upload] Imagem convertida via Litterbox:', publicUrl);
              return publicUrl;
            }
          }
        } catch (errLitter) {
          console.warn('[Buffer API Upload] Fallback Litterbox falhou:', errLitter);
        }
      }
    } catch (err) {
      console.error('[Buffer API Upload] Falha ao hospedar imagem base64:', err);
    }
  }

  return mediaUrl;
}

    // 2. Ação Post / Carrossel / Story / Reels (GraphQL createPost)
    if (!profileId) {
      console.warn('[Buffer API POST] Profile ID ausente.');
      return NextResponse.json({ error: 'ID do perfil/canal do Buffer é obrigatório.' }, { status: 400 });
    }

    // Converte todas as mídias (base64) em URLs HTTPS públicas de forma sequencial para estabilidade
    console.log(`[Buffer API POST] Convertendo ${mediaUrls.length} mídias para URLs públicas...`);
    const publicMediaUrls: string[] = [];
    for (const url of (mediaUrls || [])) {
      const publicUrl = await uploadMediaToPublicUrl(url);
      publicMediaUrls.push(publicUrl);
    }

    // Monta o array de mídias/assets para o GraphQL do Buffer
    const assets = publicMediaUrls.map((url: string) => ({
      image: { url }
    }));

    // Monta os metadados específicos para a rede social e formato
    const metadata: Record<string, any> = {};
    if (network === 'instagram') {
      let instaType = postType;
      if (instaType === 'carousel' || !instaType) instaType = 'post';

      metadata.instagram = {
        type: instaType,
        shouldShareToFeed: instaType !== 'story',
      };
    } else if (network === 'facebook') {
      metadata.facebook = {};
    } else if (network === 'linkedin') {
      metadata.linkedin = {};
    }

    const createPostMutation = `
      mutation CreatePost($input: CreatePostInput!) {
        createPost(input: $input) {
          __typename
          ... on PostActionSuccess {
            post {
              id
              text
            }
          }
          ... on InvalidInputError {
            message
          }
          ... on UnauthorizedError {
            message
          }
          ... on UnexpectedError {
            message
          }
          ... on LimitReachedError {
            message
          }
          ... on RestProxyError {
            message
          }
        }
      }
    `;

    const inputPayload: Record<string, any> = {
      channelId: profileId,
      text: text || 'Novo post criado via Bliip!',
      schedulingType: scheduledAt ? 'custom' : 'automatic',
      mode: scheduledAt ? 'customScheduled' : (shouldPublishNow ? 'shareNow' : 'addToQueue'),
      saveToDraft: isDraftPost,
    };

    if (scheduledAt) {
      inputPayload.scheduledAt = scheduledAt;
      inputPayload.dueAt = scheduledAt;
    }

    if (assets.length > 0) {
      inputPayload.assets = assets;
    }

    if (Object.keys(metadata).length > 0) {
      inputPayload.metadata = metadata;
    }

    console.log('[Buffer API POST] Enviando GraphQL createPost payload:', JSON.stringify(inputPayload, null, 2));

    const res = await fetch(BUFFER_GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cleanToken}`,
      },
      body: JSON.stringify({
        query: createPostMutation,
        variables: {
          input: inputPayload,
        },
      }),
    });

    const data = await res.json();
    console.log('[Buffer API POST] Resposta GraphQL:', JSON.stringify(data, null, 2));

    if (data.data?.createPost) {
      const postResult = data.data.createPost;

      if (postResult.__typename === 'PostActionSuccess' && postResult.post?.id) {
        return NextResponse.json({ success: true, update: postResult });
      }

      const errMsg = postResult.message || `Erro no Buffer (${postResult.__typename || 'Falha na publicação'})`;
      return NextResponse.json(
        { success: false, message: errMsg, details: postResult },
        { status: 400 }
      );
    }

    if (data.errors && data.errors.length > 0) {
      const authErr = data.errors.some((e: any) =>
        e.extensions?.code === 'UNAUTHENTICATED' ||
        e.message?.toLowerCase().includes('token') ||
        e.message?.toLowerCase().includes('user') ||
        e.message?.toLowerCase().includes('authenticated')
      );

      if (authErr || res.status === 401) {
        return NextResponse.json(
          { success: false, message: `Erro de Autenticação no Buffer (401): Token de acesso inválido ou expirado.`, details: data.errors[0]?.message },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { success: false, message: `Erro do Buffer: ${data.errors[0].message}`, details: data.errors },
        { status: 400 }
      );
    }

    // Fallback: API REST v1
    console.log('[Buffer API POST] GraphQL sem resultado direto, tentando REST v1 fallback...');
    const params = new URLSearchParams();
    params.append('access_token', cleanToken);
    params.append('profile_ids[]', profileId);
    params.append('text', text || 'Novo post criado via Bliip!');

    if (scheduledAt) {
      const timestampSec = Math.floor(new Date(scheduledAt).getTime() / 1000);
      if (!isNaN(timestampSec)) {
        params.append('scheduled_at', timestampSec.toString());
        if (isDraftPost) {
          params.append('as_draft', 'true');
        }
      } else {
        params.append('now', 'true');
      }
    } else if (shouldPublishNow) {
      params.append('now', 'true');
    } else if (isDraftPost) {
      params.append('as_draft', 'true');
    } else {
      params.append('now', 'true');
    }

    if (mediaUrls && Array.isArray(mediaUrls) && mediaUrls.length > 0) {
      params.append('media[picture]', mediaUrls[0]);
    }

    const restRes = await fetch('https://api.bufferapp.com/1/updates/create.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const restData = await restRes.json();
    console.log('[Buffer API POST] Resposta REST v1:', restData);

    if (restRes.ok && restData.success) {
      return NextResponse.json({ success: true, update: restData });
    }

    return NextResponse.json(
      { success: false, message: restData.message || 'Erro ao publicar no Buffer.', details: restData },
      { status: restRes.status || 400 }
    );
  } catch (err: any) {
    console.error('[Buffer API POST] Exceção capturada:', err);
    return NextResponse.json(
      { error: 'Falha interna ao comunicar com o Buffer.', details: err.message },
      { status: 500 }
    );
  }
}

