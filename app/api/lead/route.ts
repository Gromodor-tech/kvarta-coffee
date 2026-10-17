import { NextResponse } from 'next/server';

interface LeadRecord {
  id: string;
  name: string;
  phone: string;
  topic: string;
  comment?: string;
  totalPrice?: number;
  createdAt: string;
  utmData?: {
    source?: string;
    medium?: string;
    campaign?: string;
    content?: string;
    term?: string;
    yclid?: string;
    fbclid?: string;
    referrer?: string;
    pageUrl?: string;
  };
}

const memoryLeads: LeadRecord[] = [];

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export async function POST(request: Request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Невалидный формат JSON.' },
        { status: 400 }
      );
    }

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Неверное тело запроса.' },
        { status: 400 }
      );
    }

    const name = String(body.name || '').trim();
    const phone = String(body.phone || '').trim();
    const topic = String(body.topic || 'Разовый заказ').trim().slice(0, 600);
    const comment = String(body.comment || '').trim().slice(0, 500);

    if (name.length < 2 || name.length > 50) {
      return NextResponse.json(
        { error: 'Укажите корректное имя (от 2 до 50 символов).' },
        { status: 400 }
      );
    }

    const digits = phone.replace(/\D/g, '');
    const operator = digits.length >= 5 ? digits.slice(3, 5) : '';
    const validOperators = ['29', '33', '44', '25', '17'];

    if (
      digits.length !== 12 ||
      !digits.startsWith('375') ||
      !validOperators.includes(operator)
    ) {
      return NextResponse.json(
        { error: 'Укажите корректный белорусский номер (коды 29, 33, 44, 25, 17).' },
        { status: 400 }
      );
    }

    const tenMinsAgo = Date.now() - 10 * 60 * 1000;
    const isDuplicate = memoryLeads.some(
      (lead) =>
        lead.phone.replace(/\D/g, '') === digits &&
        new Date(lead.createdAt).getTime() > tenMinsAgo
    );

    if (isDuplicate) {
      return NextResponse.json(
        { 
          success: true, 
          isDuplicate: true,
          message: 'Заявка с этого номера уже была отправлена недавно. Менеджер уже обрабатывает её!' 
        },
        { status: 200 }
      );
    }

    const utmData = {
      source: String(body.utmSource || 'direct').slice(0, 50),
      medium: String(body.utmMedium || 'none').slice(0, 50),
      campaign: String(body.utmCampaign || 'none').slice(0, 50),
      content: String(body.utmContent || 'none').slice(0, 50),
      term: String(body.utmTerm || 'none').slice(0, 50),
      yclid: String(body.yclid || 'none').slice(0, 100),
      fbclid: String(body.fbclid || 'none').slice(0, 100),
      referrer: String(body.referrer || 'direct').slice(0, 100),
      pageUrl: String(body.pageUrl || '').slice(0, 200),
    };

    const newLead: LeadRecord = {
      id: crypto.randomUUID(),
      name,
      phone,
      topic,
      comment,
      totalPrice: Number(body.totalPrice || 0),
      createdAt: new Date().toISOString(),
      utmData,
    };

    memoryLeads.push(newLead);

    const tgToken = process.env.TELEGRAM_BOT_TOKEN;
    const tgChatId = process.env.TELEGRAM_CHAT_ID;

    if (tgToken && tgChatId) {
      const text = [
        `☕ <b>Новая заявка «Кварта»</b>`,
        `👤 <b>Имя:</b> ${escapeHtml(newLead.name)}`,
        `📞 <b>Телефон:</b> ${escapeHtml(newLead.phone)}`,
        `📦 <b>Заказ:</b> ${escapeHtml(newLead.topic)}`,
        newLead.comment ? `💬 <b>Комментарий:</b> ${escapeHtml(newLead.comment)}` : '',
        `🔗 <b>Реклама / Метки:</b>`,
        `• source: ${escapeHtml(utmData.source)}`,
        `• medium: ${escapeHtml(utmData.medium)}`,
        `• campaign: ${escapeHtml(utmData.campaign)}`,
        `• content: ${escapeHtml(utmData.content)}`,
        `• term: ${escapeHtml(utmData.term)}`,
        `• yclid: ${escapeHtml(utmData.yclid)}`,
        `• fbclid: ${escapeHtml(utmData.fbclid)}`,
        `• referrer: ${escapeHtml(utmData.referrer)}`,
        `📄 <b>Страница:</b> ${escapeHtml(utmData.pageUrl)}`,
      ]
        .filter(Boolean)
        .join('\n');

      const tgRes = await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: tgChatId,
          text,
          parse_mode: 'HTML',
        }),
      });

      if (!tgRes.ok) {
        const errorText = await tgRes.text();
        console.error('Telegram API Error:', errorText);
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Заявка принята! Аня или Дмитрий перезвонят вам для подтверждения заказа.',
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('API Error:', err);
    return NextResponse.json(
      { error: 'Не удалось отправить заявку. Позвоните нам: +375 (29) 684-11-22.' },
      { status: 500 }
    );
  }
}