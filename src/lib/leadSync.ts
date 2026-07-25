/**
 * Helper para capturar metadados do navegador/dispositivo e sincronizar o lead com o Google Sheets.
 */
export async function triggerLeadSync(user: { name?: string | null; email?: string | null }) {
  if (!user || !user.email) return;

  // Evita sincronização repetida no cliente (trava de 10 minutos por e-mail)
  const localKey = `bliip_lead_last_sync_${user.email}`;
  if (typeof window !== 'undefined') {
    const lastSync = localStorage.getItem(localKey);
    if (lastSync && Date.now() - parseInt(lastSync, 10) < 10 * 60 * 1000) {
      return;
    }
  }

  try {
    // 1. Detectar Fuso Horário (ex: America/Sao_Paulo)
    let timezone = 'America/Sao_Paulo';
    try {
      timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Sao_Paulo';
    } catch (e) {
      console.warn('Erro ao obter fuso horário:', e);
    }

    // 2. Detectar Dispositivo/Navegador amigável
    let device = 'Navegador Web';
    if (typeof navigator !== 'undefined') {
      const ua = navigator.userAgent;
      if (ua.includes('iPhone') || ua.includes('iPad')) device = 'iOS Mobile';
      else if (ua.includes('Android')) device = 'Android Mobile';
      else if (ua.includes('Macintosh')) device = 'Mac Desktop';
      else if (ua.includes('Windows')) device = 'Windows Desktop';
      else if (ua.includes('Linux')) device = 'Linux Desktop';
    }

    // 3. Capturar Origem do Tráfego (UTMs ou Referrer)
    let trafficSource = 'Direto / Orgânico';
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const utmSource = urlParams.get('utm_source');
      const utmMedium = urlParams.get('utm_medium');
      const utmCampaign = urlParams.get('utm_campaign');

      if (utmSource) {
        trafficSource = `UTM: ${utmSource}${utmMedium ? ' / ' + utmMedium : ''}${utmCampaign ? ' (' + utmCampaign + ')' : ''}`;
      } else if (document.referrer) {
        try {
          const refUrl = new URL(document.referrer);
          trafficSource = `Referral: ${refUrl.hostname}`;
        } catch {
          trafficSource = `Referral: ${document.referrer}`;
        }
      }
    }

    const timestamp = new Date().toLocaleString('pt-BR', { timeZone: timezone });

    console.log('[LeadSync Helper] Sincronizando lead:', user.email);

    const res = await fetch('/api/lead-sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: user.name || 'Usuário Bliip',
        email: user.email,
        timezone,
        device,
        trafficSource,
        timestamp,
      }),
    });

    if (res.ok) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(localKey, Date.now().toString());
      }
    }
  } catch (err) {
    console.warn('[LeadSync Helper] Falha ao disparar sincronização:', err);
  }
}
