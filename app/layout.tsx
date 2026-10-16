import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

interface LeadRecord {
  id: string;
  name: string;
  phone: string;
  normalizedPhone: string;
  topic: string;
  comment?: string;
  totalPrice?: number;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  referrer?: string;
  pageUrl?: string;
  createdAt: string;
}

const memoryLeads: LeadRecord[] = [];
const VALID_BY_OPERATORS = ['29', '33', '44', '25', '17'];
const DEDUP_WINDOW_MS = 10 * 60 * 1000; // 10 минут

function normalizeBYPhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, '');

  let normalized = '';
  if (digits.length === 12 && digits.startsWith('375')) {
    normalized = digits;
  } else if (digits.length === 11 && digits.startsWith('80')) {
    normalized = '375' + digits.slice(2);
  } else if (digits.length === 9) {
    normalized = '375' + digits;
  } else {
    return null;
  }

  const operatorCode = normalized.slice(3, 5);
  const subscriberNumber = normalized.slice(5);

  if (!VALID_BY_OPERATORS.includes(operatorCode)) {
    return null;
  }

  if (subscriberNumber.length !== 7 || /^0+$/.test(subscriberNumber)) {
    return null;
  }

  return '+' + normalized;
}

async function readStoredLeads(): Promise<LeadRecord[]> {
  const localPath = path.join(process.cwd(), 'data', 'leads.json');
  const tmpPath = path.join('/tmp', 'kvarta-leads.json');

  for (const filePath of [localPath, tmpPath]) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      // Файл ещё не создан или недоступен
    }
  }

  return memoryLeads;
}

async function saveLeadRecord(newLead: LeadRecord, existingLeads: LeadRecord[]) {
  memoryLeads.push(newLead);
  const updated = [...existingLeads, newLead];
  const payload = JSON.stringify(updated, null, 2);

  try {
    const dataDir = path.join(process.cwd(), 'data');
    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(path.join(dataDir, 'leads.json'), payload, 'utf-8');
    return;
  } catch {
    // На Vercel папка проекта read-only — сохраняем в /tmp
  }

  try {
    await fs.writeFile(path.join('/tmp', 'kvarta-leads.json'), payload, 'utf-8');
  } catch {
    // Остаётся в memoryLeads
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name || '').trim();
    const rawPhone = String(body.phone || '').trim();
    const topic = String(body.topic || 'Разовый заказ').trim();
    const comment = String(body.comment || '').trim();

    if (name.length < 2) {
      return NextResponse.json(
        { error: 'Пожалуйста, укажите ваше имя (минимум 2 символа).' },
        { status: 400 }
      );
    }

    const normalizedPhone = normalizeBYPhone(rawPhone);
    if (!normalizedPhone) {
      return NextResponse.json(
        {
          error:
            'Некорректный белорусский номер. Используйте формат +375 (29/33/44/25/17) XXX-XX-XX.',
        },
        { status: 400 }
      );
    }

    const existingLeads = await readStoredLeads();
    const nowMs = Date.now();

    const duplicate = [...existingLeads, ...memoryLeads].find((lead) => {
      if (lead.normalizedPhone !== normalizedPhone) return false;
      const createdMs = new Date(lead.createdAt).getTime();
      return nowMs - createdMs < DEDUP_WINDOW_MS;
    });

    if (duplicate) {
      return NextResponse.json(
        {
          message:
            'Мы уже получили вашу заявку пару минут назад! Аня или Дмитрий скоро свяжутся с вами.',
          deduplicated: true,
        },
        { status: 200 }
      );
    }

    const newLead: LeadRecord = {
      id: `lead_${Date.now()}`,
      name,
      phone: rawPhone,
      normalizedPhone,
      topic,
      comment,
      totalPrice: Number(body.totalPrice || 0),
      utmSource: body.utmSource || 'direct',
      utmMedium: body.utmMedium || 'none',
      utmCampaign: body.utmCampaign || 'none',
      utmContent: body.utmContent || 'none',
      utmTerm: body.utmTerm || 'none',
      referrer: body.referrer || 'direct',
      pageUrl: body.pageUrl || '',
      createdAt: new Date().toISOString(),
    };

    await saveLeadRecord(newLead, existingLeads);

    return NextResponse.json(
      {
        success: true,
        message:
          'Заявка принята! Аня или Дмитрий перезвонят вам для подтверждения заказа.',
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера при обработке заявки.' },
      { status: 500 }
    );
  }
}