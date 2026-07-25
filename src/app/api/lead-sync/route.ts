import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_SHEETS_WEBHOOK_URL =
  'https://script.google.com/macros/s/AKfycbxeGKFyLqV-xPKpVHtewIroBEOY21L9aJ1aXaJvMWpUqmXWE6k5-chdK6uskSOBuOOadw/exec';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, timezone, device, trafficSource, timestamp } = body;

    if (!email) {
      return NextResponse.json({ success: false, message: 'E-mail é obrigatório' }, { status: 400 });
    }

    const payload = {
      name: name || 'Usuário Bliip',
      email: email.trim().toLowerCase(),
      timezone: timezone || 'America/Sao_Paulo',
      device: device || 'Navegador Web',
      trafficSource: trafficSource || 'Direto / Orgânico',
      timestamp: timestamp || new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
    };

    console.log('[Lead Sync API] Enviando lead para o Google Sheets:', payload);

    // Dispara a requisição POST para o Google Apps Script Webhook
    const response = await fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      redirect: 'follow',
    });

    let textData = '';
    try {
      textData = await response.text();
      const jsonData = JSON.parse(textData);
      return NextResponse.json({ success: true, details: jsonData });
    } catch {
      return NextResponse.json({ success: true, raw: textData });
    }
  } catch (error: any) {
    console.error('[Lead Sync API] Erro ao sincronizar lead:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Falha ao sincronizar lead' },
      { status: 500 }
    );
  }
}
