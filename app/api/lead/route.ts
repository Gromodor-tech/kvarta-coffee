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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name || '').trim();
    const phone = String(body.phone || '').trim();
    const topic = String(body.topic || 'Разовый заказ').trim();
    const comment = String(body.comment || '').trim();

    if (name.length < 2) {
      return NextResponse.json(
        { error: 'Пожалуйста, укажите ваше имя (минимум 2 символа).' },
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

    // ДЕДУПЛИКАЦИЯ: защита от двойного клика и спама за последние 10 минут
    const tenMinsAgo = Date.now() - 10 * 60 * 1000;
    const isDuplicate = memoryLeads.some(
      (lead) =>
        lead.phone.replace(/\D/g, '') === digits &&
        new Date(lead.createdAt).getTime() > tenMinsAgo
    );

    if (isDuplicate) {
      return NextResponse.json(
        { error: 'Вы уже отправили заявку недавно. Пожалуйста, подождите 10 минут.' },
        { status: 429 }
      );
    }

    const newLead: LeadRecord = {
      id: `lead_${Date.now()}`,
      name,
      phone,
      topic,
      comment,
      totalPrice: Number(body.totalPrice || 0),
      createdAt: new Date().toISOString(),
      utmData: {
        source: body.utmSource || 'direct',
        medium: body.utmMedium || 'none',
        campaign: body.utmCampaign || 'none',
        content: body.utmContent || 'none',
        term: body.utmTerm || 'none',
        yclid: body.yclid || 'none',
        fbclid: body.fbclid || 'none',
        referrer: body.referrer || 'direct',
        pageUrl: body.pageUrl || '',
      },
    };

    memoryLeads.push(newLead);

    // ОПЦИОНАЛЬНАЯ ОТПРАВКА В TELEGRAM (для постоянного хранения на Serverless)
    const tgToken = process.env.TELEGRAM_BOT_TOKEN;
    const tgChatId = process.env.TELEGRAM_CHAT_ID;

    if (tgToken && tgChatId) {
      const text = [
        `☕ <b>Новая заявка «Кварта»</b>`,
        `👤 <b>Имя:</b> ${newLead.name}`,
        `📞 <b>Телефон:</b> ${newLead.phone}`,
        `📦 <b>Заказ:</b> ${newLead.topic}`,
        newLead.comment ? `💬 <b>Комментарий:</b> ${newLead.comment}` : '',
        `🔗 <b>Источник:</b> ${newLead.utmData?.source} / ${newLead.utmData?.medium} (yclid: ${newLead.utmData?.yclid}, fbclid: ${newLead.utmData?.fbclid})`,
      ]
        .filter(Boolean)
        .join('\n');

      await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: tgChatId,
          text,
          parse_mode: 'HTML',
        }),
      }).catch((err) => console.error('Ошибка отправки в Telegram:', err));
    }

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