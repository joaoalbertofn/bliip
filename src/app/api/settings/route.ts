import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

function ensureDataDirExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readSettingsFromFile() {
  try {
    ensureDataDirExists();
    if (fs.existsSync(SETTINGS_FILE)) {
      const content = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('[Settings API] Erro ao ler configurações do disco:', err);
  }
  return {};
}

function writeSettingsToFile(data: any) {
  try {
    ensureDataDirExists();
    const current = readSettingsFromFile();
    const updated = { ...current, ...data, updatedAt: new Date().toISOString() };
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(updated, null, 2), 'utf-8');
    return updated;
  } catch (err) {
    console.error('[Settings API] Erro ao salvar configurações no disco:', err);
    throw err;
  }
}

export async function GET() {
  const settings = readSettingsFromFile();
  return NextResponse.json({ success: true, settings });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = writeSettingsToFile(body);
    return NextResponse.json({ success: true, settings: updated });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Erro ao persistir configurações no servidor' },
      { status: 500 }
    );
  }
}
