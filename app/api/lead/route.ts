import { NextResponse } from 'next/server';

interface LeadRecord {
  id: string;
  name: string;
  phone: string;
  topic: string;
  comment?: string;
  totalPrice?: number;
  createdAt: string;
}

// Временное хранилище заявок в памяти сервера
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
        { error: 'Пожалуйста, укажите ваше имя.' },
        { status: 400 }
      );
    }

    if (!phone) {
      return NextResponse.json(
        { error: 'Пожалуйста, укажите номер телефона.' },
        { status: 400 }
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
    };

    // Сохраняем в память
    memoryLeads.push(newLead);
    console.log('Новая заявка получена:', newLead);

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