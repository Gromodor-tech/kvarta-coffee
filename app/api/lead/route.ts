import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';

interface LeadRecord {
  id: string;
  name: string;
  phone: string;
  normalizedPhone: string;
  topic: string;
  items?: unknown[];
  totalPrice?: number;
  comment: string;
  utm: {
    source: string;
    medium: string;
    campaign: string;
    content: string;
    term: string;
    referrer: string;
    pageUrl: string;
  };
  createdAt: string;
}

// Резервное хранилище в памяти процесса для защиты от двойного клика и работы в serverless-среде
const memoryLeads: LeadRecord[] = [];
const activeRequests = new Set<string>();

function getStorageFilePath(): string {
  const localDir = path.join(process.cwd(), 'data');
  const localFile = path.join(localDir, 'leads.json');

  try {
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }
    if (!fs.existsSync(localFile)) {
      fs.writeFileSync(localFile, JSON.stringify([], null, 2), 'utf-8');
    }
    fs.accessSync(localFile, fs.constants.W_OK);
    return localFile;
  } catch {
    // Фолбэк для Vercel / Netlify, где основная директория доступна только для чтения
    const tmpFile = path.join(os.tmpdir(), 'kvarta-leads.json');
    if (!fs.existsSync(tmpFile)) {
      fs.writeFileSync(tmpFile, JSON.stringify([], null, 2), 'utf-8');
    }
    return tmpFile;
  }
}

function readLeads(): LeadRecord[] {
  try {
    const filePath = getStorageFilePath();
    const raw = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(raw || '[]');
    return Array.isArray(parsed) ? parsed : memoryLeads;
  } catch {
    return memoryLeads;
  }
}

function saveLead(newLead: LeadRecord, existingLeads: LeadRecord[]) {
  memoryLeads.push(newLead);
  try {
    const filePath = getStorageFilePath();
    const updated = [...existingLeads, newLead];
    fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Fallback to in-memory storage:', err);
  }
}

// Приведение белорусского номера (+375 или 80) к единому виду 375XXXXXXXXX
function normalizeBYPhone(phone: string): string | null {
  const cleaned = phone.replace(/\D/g, '');
  const validCodes = ['29', '33', '44', '25', '17'];

  if (cleaned.startsWith('375') && cleaned.length === 12) {
    const code = cleaned.substring(3, 5);
    return validCodes.includes(code) ? cleaned : null;
  }

  if (cleaned.startsWith('80') && cleaned.length === 11) {
    const code = cleaned.substring(2, 4);
    return validCodes.includes(code) ? '375' + cleaned.substring(2) : null;
  }

  return null;
}

// Опциональная отправка уведомления в Telegram-бот (плюс по ТЗ)
async function sendTelegramNotification(lead: LeadRecord) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const text = [
    `☕ *Новая заявка — Обжарка «Кварта»*`,
    `👤 *Имя:* ${lead.name}`,
    `📞 *Телефон:* ${lead.phone}`,
    `📦 *Заказ:* ${lead.topic}`,
    lead.comment ? `💬 *Комментарий:* ${lead.comment}` : '',
    `📊 *Источник:* ${lead.utm.source} / ${lead.utm.medium} / ${lead.utm.campaign} (объявление: ${lead.utm.content})`,
    `🔗 *Страница:* ${lead.utm.pageUrl}`,
  ]
    .filter(Boolean)
    .join('\n');

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'Markdown',
      }),
    });
  } catch (err) {
    console.warn('Telegram notification skipped:', err);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      phone,
      topic,
      items,
      totalPrice,
      comment,
      utmSource,
      utmMedium,
      utmCampaign,
      utmContent,
      utmTerm,
      referrer,
      pageUrl,
    } = body;

    if (!name || !name.trim() || !phone) {
      return NextResponse.json(
        { error: 'Пожалуйста, укажите ваше имя и номер телефона.' },
        { status: 400 }
      );
    }

    const normalizedPhone = normalizeBYPhone(phone);
    if (!normalizedPhone) {
      return NextResponse.json(
        {
          error:
            'Введите корректный белорусский номер с кодом оператора 29, 33, 44, 25 или 17 (например: +375 29 123-45-67).',
        },
        { status: 400 }
      );
    }

    // Защита от мгновенного двойного нажатия кнопки
    if (activeRequests.has(normalizedPhone)) {
      return NextResponse.json(
        {
          success: true,
          message: 'Ваша заявка уже обрабатывается. Пожалуйста, подождите!',
          isDuplicate: true,
        },
        { status: 200 }
      );
    }

    activeRequests.add(normalizedPhone);

    try {
      const leads = readLeads();
      const now = Date.now();
      const TEN_MINUTES = 10 * 60 * 1000;

      // Проверка дубликатов за последние 10 минут (и в файле, и в памяти)
      const allKnownLeads = [...leads, ...memoryLeads];
      const recentDuplicate = allKnownLeads.find((lead) => {
        const existingNorm =
          lead.normalizedPhone || normalizeBYPhone(lead.phone || '');
        const timeDiff = now - new Date(lead.createdAt).getTime();
        return existingNorm === normalizedPhone && timeDiff < TEN_MINUTES;
      });

      if (recentDuplicate) {
        return NextResponse.json(
          {
            success: true,
            message:
              'Заявка с этого номера уже принята менее 10 минут назад. Аня или Дмитрий скоро перезвонят вам!',
            isDuplicate: true,
          },
          { status: 200 }
        );
      }

      const newLead: LeadRecord = {
        id: Date.now().toString(),
        name: name.trim(),
        phone,
        normalizedPhone,
        topic: topic || 'Разовый заказ',
        items: Array.isArray(items) ? items : [],
        totalPrice: typeof totalPrice === 'number' ? totalPrice : 0,
        comment: comment ? comment.trim() : '',
        utm: {
          source: utmSource || 'direct',
          medium: utmMedium || 'none',
          campaign: utmCampaign || 'none',
          content: utmContent || 'none',
          term: utmTerm || 'none',
          referrer: referrer || 'direct',
          pageUrl: pageUrl || '',
        },
        createdAt: new Date().toISOString(),
      };

      saveLead(newLead, leads);
      await sendTelegramNotification(newLead);

      return NextResponse.json({
        success: true,
        message:
          'Заявка принята! Перезвоним вам в ближайшее время для подтверждения заказа.',
      });
    } finally {
      activeRequests.delete(normalizedPhone);
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      {
        error:
          'Не удалось сохранить заявку на сервере. Пожалуйста, попробуйте ещё раз через пару секунд.',
      },
      { status: 500 }
    );
  }
}