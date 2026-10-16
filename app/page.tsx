'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Truck,
  ArrowUpRight,
  Check,
  ShoppingBag,
  User,
  Phone,
  MessageSquare,
  Plus,
  Minus,
  Trash2,
  AlertCircle,
  Clock,
  Navigation,
} from 'lucide-react';

type GrindType = 'Зерно' | 'Фильтр' | 'Эспрессо' | 'Турка';

interface CatalogItem {
  id: string;
  lotNumber: string;
  name: string;
  price: number;
  weight: string;
  roastLevel: string;
  originInfo: string;
  notes: string[];
  description: string;
  acidity: number;
  density: number;
  posterSrc: string;
  hasGrindSelector: boolean;
  defaultGrind?: GrindType;
}

interface OrderItem {
  key: string;
  id: string;
  name: string;
  price: number;
  grind: string;
  qty: number;
}

const GRIND_OPTIONS: GrindType[] = ['Зерно', 'Фильтр', 'Эспрессо', 'Турка'];

const CATALOG_ITEMS: CatalogItem[] = [
  {
    id: 'ethiopia',
    lotNumber: 'ЛОТ №01',
    name: 'Эфиопия Иргачеффе',
    price: 32,
    weight: '250 г',
    roastLevel: 'Светлая обжарка',
    originInfo: 'Мытая обработка • 1950 м',
    notes: ['Цветочный', 'Бергамот', 'Персик'],
    description:
      'Лёгкий и чайный профиль с ярким ароматом бергамота и жасмина. Лучше всего раскрывается в воронке V60, капельной кофеварке и аэропрессе.',
    acidity: 5,
    density: 2,
    posterSrc:
      'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?q=75&w=600&auto=format&fit=crop',
    hasGrindSelector: true,
    defaultGrind: 'Фильтр',
  },
  {
    id: 'colombia',
    lotNumber: 'ЛОТ №02',
    name: 'Колумбия Уила',
    price: 29,
    weight: '250 г',
    roastLevel: 'Средняя обжарка',
    originInfo: 'Мытая обработка • 1750 м',
    notes: ['Карамель', 'Красное яблоко', 'Тростниковый сахар'],
    description:
      'Универсальное сбалансированное зерно на каждый день. Сладкое послевкусие мягкой карамели и сочная кислинка печёного яблока.',
    acidity: 3,
    density: 4,
    posterSrc:
      'https://images.unsplash.com/photo-1511920170033-f8396924c348?q=75&w=600&auto=format&fit=crop',
    hasGrindSelector: true,
    defaultGrind: 'Зерно',
  },
  {
    id: 'brazil',
    lotNumber: 'ЛОТ №03',
    name: 'Бразилия Серрадо',
    price: 26,
    weight: '250 г',
    roastLevel: 'Под эспрессо',
    originInfo: 'Натуральная обработка • 1100 м',
    notes: ['Жареный орех', 'Тёмный шоколад', 'Какао'],
    description:
      'Плотный классический профиль без лишней кислотности. Даёт густую орехово-шоколадную пенку крема в рожковой кофеварке, автомате и гейзере.',
    acidity: 1,
    density: 5,
    posterSrc:
      'https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?q=75&w=600&auto=format&fit=crop',
    hasGrindSelector: true,
    defaultGrind: 'Эспрессо',
  },
  {
    id: 'drips',
    lotNumber: 'БОКС №04',
    name: 'Дрип-пакеты, ассорти',
    price: 18,
    weight: '10 шт × 12 г',
    roastLevel: 'Фильтр-обжарка',
    originInfo: 'Эфиопия (4) • Колумбия (3) • Бразилия (3)',
    notes: ['В офис', 'Домой', 'В поездку'],
    description:
      'Свежемолотый кофе в индивидуальных фильтр-пакетах, запаянных с азотом. Нужна только любимая кружка и горячая вода.',
    acidity: 3,
    density: 3,
    posterSrc:
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=75&w=600&auto=format&fit=crop',
    hasGrindSelector: false,
  },
];

const CUSTOMER_NOTES = [
  {
    id: 1,
    name: 'Катя, ул. Восточная',
    context: 'Берёт Эфиопию Иргачеффе (помол под воронку)',
    message:
      'Ребята, спасибо за пятничную доставку! Открыла пачку с датой обжарки «вчера» — аромат бергамота на всю кухню. Очень выручает, что мелете прямо перед выездом курьера, дома кофемолки пока нет.',
    reply: 'Катя, спасибо! В следующий четверг жарим свежий урожай Иргачеффе :)',
    photo:
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=75&w=400&auto=format&fit=crop',
  },
  {
    id: 2,
    name: 'Денис и команда, пр-т Победителей',
    context: 'Подписка в офис + коробка дрипов',
    message:
      'Перешли на «Кварту» всем отделом три месяца назад. Серрадо в офисной кофемашине с молоком получается плотным, без горечи, как в хорошей кофейне в центре. Отдельный респект за простоту: никаких сложных кабинетов, Дима сам пишет в четверг.',
    reply: 'Денис, всегда рады завезти вам свежую партию в пятницу утром!',
    photo:
      'https://images.unsplash.com/photo-1511920170033-f8396924c348?q=75&w=400&auto=format&fit=crop',
  },
  {
    id: 3,
    name: 'Илья, Грушевка',
    context: 'Самовывоз с ул. Короля, 9 • Колумбия Уила',
    message:
      'Захожу к Ане и Диме на Короля по дороге на работу. Приятно, когда обжарщики сами стояли за баром и могут человеческим языком объяснить, какой помол выставить под домашнюю рожковую кофеварку.',
    reply: 'Илья, забегай на фильтр в эту пятницу, открыли новую Колумбию!',
    photo:
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=75&w=400&auto=format&fit=crop',
  },
];

function formatBYPhoneInput(raw: string, prevValue = ''): string {
  const isDeleting = raw.length < prevValue.length;
  let digits = raw.replace(/\D/g, '');
  const prevDigits = prevValue.replace(/\D/g, '');

  if (isDeleting && digits.length === prevDigits.length && digits.length > 0) {
    digits = digits.slice(0, -1);
  }

  if (!digits) return '';

  if (isDeleting && digits.length <= 3 && '375'.startsWith(digits)) {
    return '';
  }

  if (digits.startsWith('80')) {
    digits = '375' + digits.slice(2);
  } else if (digits.startsWith('8') && digits.length > 1) {
    digits = '375' + digits.slice(1);
  } else if (
    ['29', '33', '44', '25', '17'].some((code) => digits.startsWith(code))
  ) {
    digits = '375' + digits;
  } else if (!digits.startsWith('375')) {
    if ('375'.startsWith(digits)) {
      return '+' + digits;
    }
    digits = '375' + digits;
  }

  digits = digits.slice(0, 12);

  let result = '+375';
  if (digits.length > 3) {
    result += ' (' + digits.slice(3, 5);
  }
  if (digits.length > 5) {
    result += ') ' + digits.slice(5, 8);
  }
  if (digits.length > 8) {
    result += '-' + digits.slice(8, 10);
  }
  if (digits.length > 10) {
    result += '-' + digits.slice(10, 12);
  }

  return result;
}

function TasteDots({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((dot) => (
        <span
          key={dot}
          className={`w-2 h-2 rounded-full ${
            dot <= value ? 'bg-[#BCA38F]' : 'bg-[#44332B]/15'
          }`}
        />
      ))}
    </div>
  );
}

function PhotoCard({
  poster,
  alt,
  className = '',
  badgeText,
}: {
  poster: string;
  alt: string;
  className?: string;
  badgeText?: string;
}) {
  return (
    <div
      aria-label={alt}
      className={`relative overflow-hidden group ${className}`}
    >
      <img
        src={poster}
        alt={alt}
        loading="lazy"
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
      />
      {badgeText && (
        <span
          style={{ fontFamily: 'var(--font-mono), monospace' }}
          className="absolute top-3 left-3 bg-[#F5EEE7]/95 text-[#44332B] text-[10px] font-bold uppercase px-2.5 py-1 border border-[#44332B]/20 z-10 shadow-sm"
        >
          {badgeText}
        </span>
      )}
    </div>
  );
}

export default function Home() {
  const [schedule, setSchedule] = useState({
    roastDate: 'ближайший четверг',
    deliveryDate: 'пятница',
  });

  useEffect(() => {
    const now = new Date();
    const day = now.getDay();
    const diffToThursday = (4 - day + 7) % 7;
    const nextThursday = new Date(now);
    nextThursday.setDate(now.getDate() + diffToThursday);

    const nextFriday = new Date(nextThursday);
    nextFriday.setDate(nextThursday.getDate() + 1);

    const formatter = new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'long',
    });

    setSchedule({
      roastDate:
        day === 4
          ? 'сегодня (четверг)'
          : `чт, ${formatter.format(nextThursday)}`,
      deliveryDate: `пт, ${formatter.format(nextFriday)}`,
    });
  }, []);

  const [grinds, setGrinds] = useState<Record<string, GrindType>>({
    ethiopia: 'Фильтр',
    colombia: 'Зерно',
    brazil: 'Эспрессо',
    subscription: 'Зерно',
  });

  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [justAddedKey, setJustAddedKey] = useState<string | null>(null);

  const [topic, setTopic] = useState('Разовый заказ');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [comment, setComment] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAddToOrder = (
    id: string,
    itemName: string,
    price: number,
    grind: string,
    defaultTopic: 'Разовый заказ' | 'Подписка',
    scrollImmediately = false
  ) => {
    const key = `${id}-${grind}`;
    setTopic(defaultTopic);

    setOrderItems((prev) => {
      const existing = prev.find((item) => item.key === key);
      if (existing) {
        return prev.map((item) =>
          item.key === key ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { key, id, name: itemName, price, grind, qty: 1 }];
    });

    setJustAddedKey(id);
    setTimeout(() => {
      setJustAddedKey((prev) => (prev === id ? null : prev));
    }, 1400);

    if (scrollImmediately) {
      scrollToSection('order-form');
    }
  };

  const updateItemQty = (key: string, delta: number) => {
    setOrderItems((prev) =>
      prev
        .map((item) =>
          item.key === key ? { ...item, qty: item.qty + delta } : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  const removeItem = (key: string) => {
    setOrderItems((prev) => prev.filter((item) => item.key !== key));
  };

  const totalPacks = orderItems.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = orderItems.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );
  const hasSubscription = orderItems.some((item) => item.id === 'subscription');
  const isFreeDelivery = totalPrice >= 50 || hasSubscription;

  const remainingBatchPacks = Math.max(0, 20 - totalPacks * 2);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setError('');
    setSuccessMsg('');

    // СТРОГАЯ ВАЛИДАЦИЯ НОМЕРА ПЕРЕД ОТПРАВКОЙ (Исправляет код '56' и другие)
    const digits = phone.replace(/\D/g, '');
    const operator = digits.length >= 5 ? digits.slice(3, 5) : '';
    const validOperators = ['29', '33', '44', '25', '17'];

    if (digits.length !== 12 || !digits.startsWith('375') || !validOperators.includes(operator)) {
      setError('Укажите корректный код оператора (29, 33, 44, 25 или 17) и полный номер телефона.');
      return;
    }

    setLoading(true);

    const params = new URLSearchParams(window.location.search);
    const utmSource = params.get('utm_source') || 'direct';
    const utmMedium = params.get('utm_medium') || 'none';
    const utmCampaign = params.get('utm_campaign') || 'none';
    const utmContent = params.get('utm_content') || 'none';
    const utmTerm = params.get('utm_term') || 'none';

    const orderSummary =
      orderItems.length > 0
        ? orderItems
            .map(
              (item) =>
                `${item.name} [помол: ${item.grind}] × ${item.qty} шт. (${
                  item.price * item.qty
                } BYN)`
            )
            .join('; ') + ` | Сумма: ${totalPrice} BYN`
        : 'Без предвыбора в каталоге';

    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone,
          topic: `${topic} (${orderSummary})`,
          items: orderItems,
          totalPrice,
          comment: comment.trim(),
          utmSource,
          utmMedium,
          utmCampaign,
          utmContent,
          utmTerm,
          referrer: document.referrer || 'direct',
          pageUrl: window.location.origin + window.location.pathname,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Ошибка отправки заявки');
      }

      setSuccessMsg(
        data.message ||
          'Заявка у нас! Аня или Дмитрий перезвонят вам в ближайшее время.'
      );
      setName('');
      setPhone('');
      setComment('');
      setOrderItems([]);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Не удалось отправить заявку. Проверьте соединение.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5EEE7] text-[#44332B] selection:bg-[#BCA38F] selection:text-[#44332B] overflow-x-hidden">
      <div
        style={{ fontFamily: 'var(--font-mono), monospace' }}
        className="bg-[#44332B] text-[#F5EEE7] text-[11px] py-2.5 px-4 border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#BCA38F] animate-pulse" />
            <span>
              Обжарка: <strong className="text-white">{schedule.roastDate}</strong>{' '}
              • Развозка:{' '}
              <strong className="text-white">{schedule.deliveryDate}</strong>
            </span>
          </div>
          <div className="text-[#BCA38F] font-bold">
            ⚡ Остаток партии этого четверга: {remainingBatchPacks} пач. доступно
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-50 bg-[#F5EEE7]/95 backdrop-blur-md border-b border-[#44332B]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-3 text-left cursor-pointer group"
          >
            <div className="w-11 h-11 bg-[#44332B] group-hover:bg-[#BCA38F] transition-colors text-[#F5EEE7] group-hover:text-[#44332B] flex items-center justify-center font-black text-lg tracking-tighter">
              КВ
            </div>
            <div>
              <span
                style={{ fontFamily: 'var(--font-display), sans-serif' }}
                className="text-lg font-black tracking-tight text-[#44332B] uppercase block leading-none"
              >
                КВАРТА
              </span>
              <span
                style={{ fontFamily: 'var(--font-mono), monospace' }}
                className="text-[10px] text-[#685348] uppercase block mt-1"
              >
                Минск • ул. Короля, 9
              </span>
            </div>
          </button>

          <nav
            style={{ fontFamily: 'var(--font-mono), monospace' }}
            className="hidden lg:flex items-center gap-8 text-xs uppercase text-[#44332B]"
          >
            <button
              type="button"
              onClick={() => scrollToSection('catalog')}
              className="hover:text-[#BCA38F] transition-colors cursor-pointer font-bold"
            >
              [01] Зерно
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('subscription')}
              className="hover:text-[#BCA38F] transition-colors cursor-pointer font-bold"
            >
              [02] Подписка
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('about')}
              className="hover:text-[#BCA38F] transition-colors cursor-pointer font-bold"
            >
              [03] Аня и Дима
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('reviews')}
              className="hover:text-[#BCA38F] transition-colors cursor-pointer font-bold"
            >
              [04] Отзывы
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('delivery')}
              className="hover:text-[#BCA38F] transition-colors cursor-pointer font-bold"
            >
              [05] Самовывоз
            </button>
          </nav>

          <button
            type="button"
            onClick={() => scrollToSection('order-form')}
            style={{ fontFamily: 'var(--font-mono), monospace' }}
            className={`flex items-center gap-2.5 px-4 sm:px-5 py-3 text-xs font-bold uppercase transition-all cursor-pointer border ${
              totalPacks > 0
                ? 'bg-[#BCA38F] text-[#44332B] border-[#BCA38F] hover:bg-[#44332B] hover:text-[#F5EEE7]'
                : 'bg-[#44332B] text-[#F5EEE7] border-[#44332B] hover:bg-[#BCA38F] hover:text-[#44332B]'
            }`}
          >
            <ShoppingBag className="w-4 h-4 shrink-0" />
            {totalPacks > 0 ? (
              <span>
                Заявка: {totalPacks} шт. ({totalPrice} BYN)
              </span>
            ) : (
              <span>Оставить заявку</span>
            )}
          </button>
        </div>
      </header>

      <section className="border-b border-[#44332B]/20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-span-7 p-6 sm:p-12 lg:p-16 flex flex-col justify-between space-y-10 lg:border-r border-[#44332B]/20">
            <div className="space-y-6">
              <div
                style={{ fontFamily: 'var(--font-mono), monospace' }}
                className="inline-flex flex-wrap items-center gap-3 text-xs uppercase text-[#685348] border-b border-[#44332B]/20 pb-2"
              >
                <a
                  href="https://yandex.by/maps/?text=Минск+улица+Короля+9"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#BCA38F] flex items-center gap-1 underline underline-offset-2"
                >
                  <span>Минск, ул. Короля, 9</span>
                  <Navigation className="w-3 h-3" />
                </a>
                <span>•</span>
                <span className="text-[#BCA38F] font-bold">
                  Партии по 5 кг в четверг
                </span>
              </div>

              <h1
                style={{ fontFamily: 'var(--font-display), sans-serif' }}
                className="text-3xl sm:text-5xl lg:text-[54px] font-black text-[#44332B] uppercase leading-[1.05] tracking-tight"
              >
                КОФЕ, КОТОРЫЙ ПРИЕЗЖАЕТ К ВАМ НА{' '}
                <span className="text-[#BCA38F]">1–3 ДЕНЬ</span> ПОСЛЕ РОСТЕРА
              </h1>

              <p className="text-base sm:text-lg text-[#5A453A] leading-relaxed max-w-xl">
                Маленькая минская обжарочная бывших бариста Ани и Дмитрия. Мы не
                храним кофе на складах месяцами: жарим под заказ в четверг,
                бесплатно мелем под вашу воронку, турку или рожок и развозим по
                Минску в пятницу.
              </p>
            </div>

            <div className="space-y-8">
              <div className="flex flex-wrap gap-4">
                <button
                  type="button"
                  onClick={() => scrollToSection('catalog')}
                  style={{ fontFamily: 'var(--font-mono), monospace' }}
                  className="bg-[#BCA38F] hover:bg-[#44332B] text-[#44332B] hover:text-[#F5EEE7] px-7 py-4 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-3 cursor-pointer shadow-md"
                >
                  Выбрать зерно и помол
                  <ArrowUpRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection('subscription')}
                  style={{ fontFamily: 'var(--font-mono), monospace' }}
                  className="bg-transparent hover:bg-[#44332B] hover:text-[#F5EEE7] text-[#44332B] border border-[#44332B] px-7 py-4 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                >
                  Подписка • 54 BYN / мес
                </button>
              </div>

              <div
                style={{ fontFamily: 'var(--font-mono), monospace' }}
                className="grid grid-cols-3 border-t border-[#44332B]/20 pt-6 gap-4 text-xs"
              >
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-[#44332B]">
                    5 кг
                  </div>
                  <div className="text-[#685348] text-[11px] mt-0.5">
                    партия ростера
                  </div>
                </div>
                <div className="border-l border-[#44332B]/20 pl-4">
                  <div className="text-xl sm:text-2xl font-bold text-[#44332B]">
                    24–72 ч
                  </div>
                  <div className="text-[#685348] text-[11px] mt-0.5">
                    до чашки
                  </div>
                </div>
                <div className="border-l border-[#44332B]/20 pl-4">
                  <div className="text-xl sm:text-2xl font-bold text-[#BCA38F]">
                    0 BYN
                  </div>
                  <div className="text-[#685348] text-[11px] mt-0.5">
                    помол и доставка от 50 BYN
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 p-6 sm:p-12 flex flex-col justify-between bg-[#EBE1D7]/60">
            <PhotoCard
              poster="https://images.unsplash.com/photo-1518832553480-cd0e625ed3e6?q=75&w=600&auto=format&fit=crop"
              alt="Ростер мастерской Кварта в Минске"
              className="w-full aspect-[4/4] border border-[#44332B]/20"
            />

            <div
              style={{ fontFamily: 'var(--font-mono), monospace' }}
              className="mt-6 p-4 bg-[#F5EEE7] border border-[#44332B]/20 text-xs space-y-2"
            >
              <div className="flex justify-between items-center font-bold text-[#44332B] border-b border-[#44332B]/15 pb-1.5">
                <span>ПАРТИЯ ЭТОГО ЧЕТВЕРГА</span>
                <span className="text-[#BCA38F]">
                  СВОБОДНО: {remainingBatchPacks} ПАЧЕК
                </span>
              </div>
              <p className="text-[11px] text-[#685348] leading-relaxed">
                Собираем заказы до вечера среды. В четверг жарим на ул. Короля, 9,
                а в пятницу развозим свежие пачки по Минску.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="catalog" className="py-20 border-b border-[#44332B]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#44332B]/20 pb-8">
            <div className="space-y-2">
              <span
                style={{ fontFamily: 'var(--font-mono), monospace' }}
                className="text-xs uppercase text-[#BCA38F] font-bold"
              >
                [01] СВЕЖАЯ ОБЖАРКА ЭТОЙ НЕДЕЛИ
              </span>
              <h2
                style={{ fontFamily: 'var(--font-display), sans-serif' }}
                className="text-2xl sm:text-4xl font-black text-[#44332B] uppercase tracking-tight"
              >
                КАТАЛОГ ЗЕРНА И ДРИПОВ
              </h2>
            </div>
            <p
              style={{ fontFamily: 'var(--font-mono), monospace' }}
              className="text-xs text-[#685348] max-w-md"
            >
              Выберите способ заваривания на этикетке — мы бесплатно смелем
              зерно перед выездом курьера.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {CATALOG_ITEMS.map((item) => {
              const currentGrind = item.hasGrindSelector
                ? grinds[item.id] || 'Зерно'
                : 'Дрип-пакет (молотый)';
              const isJustAdded = justAddedKey === item.id;

              return (
                <article
                  key={item.id}
                  className="bg-[#FCF9F6] border border-[#44332B]/25 flex flex-col justify-between transition-colors hover:border-[#44332B]"
                >
                  <div>
                    <div
                      style={{ fontFamily: 'var(--font-mono), monospace' }}
                      className="flex items-center justify-between px-5 py-3 border-b border-[#44332B]/20 text-[11px] uppercase bg-[#EBE1D7]/60"
                    >
                      <span className="font-bold text-[#44332B]">
                        {item.lotNumber} • {item.roastLevel}
                      </span>
                      <span className="text-[#685348]">{item.originInfo}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 border-b border-[#44332B]/20">
                      <div className="sm:col-span-5 border-b sm:border-b-0 sm:border-r border-[#44332B]/20">
                        <PhotoCard
                          poster={item.posterSrc}
                          alt={item.name}
                          badgeText={item.weight}
                          className="h-56 sm:h-full min-h-[220px]"
                        />
                      </div>

                      <div className="sm:col-span-7 p-5 flex flex-col justify-between space-y-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-start gap-2">
                            <h3
                              style={{
                                fontFamily: 'var(--font-display), sans-serif',
                              }}
                              className="text-xl font-black text-[#44332B] uppercase leading-snug"
                            >
                              {item.name}
                            </h3>
                            <span
                              style={{
                                fontFamily: 'var(--font-mono), monospace',
                              }}
                              className="text-xl font-bold text-[#BCA38F] shrink-0"
                            >
                              {item.price} BYN
                            </span>
                          </div>

                          <div
                            style={{ fontFamily: 'var(--font-mono), monospace' }}
                            className="flex flex-wrap gap-1.5"
                          >
                            {item.notes.map((note) => (
                              <span
                                key={note}
                                className="text-[10px] uppercase px-2 py-0.5 bg-[#F5EEE7] border border-[#44332B]/20 text-[#44332B]"
                              >
                                {note}
                              </span>
                            ))}
                          </div>

                          <p className="text-xs text-[#5A453A] leading-relaxed">
                            {item.description}
                          </p>
                        </div>

                        <div
                          style={{ fontFamily: 'var(--font-mono), monospace' }}
                          className="grid grid-cols-2 gap-4 pt-3 border-t border-[#44332B]/15 text-[10px] uppercase text-[#685348]"
                        >
                          <div className="flex items-center justify-between">
                            <span>Кислинка</span>
                            <TasteDots value={item.acidity} />
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Плотность</span>
                            <TasteDots value={item.density} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 space-y-4 bg-[#F5EEE7]/60">
                    {item.hasGrindSelector ? (
                      <div className="space-y-2">
                        <div
                          style={{ fontFamily: 'var(--font-mono), monospace' }}
                          className="flex justify-between items-center text-[11px] uppercase"
                        >
                          <span className="text-[#685348]">
                            Выберите помол:
                          </span>
                          <span className="font-bold text-[#44332B]">
                            {currentGrind}
                          </span>
                        </div>
                        <div
                          style={{ fontFamily: 'var(--font-mono), monospace' }}
                          className="grid grid-cols-4 gap-1.5"
                        >
                          {GRIND_OPTIONS.map((grindOption) => {
                            const active = currentGrind === grindOption;
                            return (
                              <button
                                key={grindOption}
                                type="button"
                                onClick={() =>
                                  setGrinds((prev) => ({
                                    ...prev,
                                    [item.id]: grindOption,
                                  }))
                                }
                                className={`py-2 px-1 text-[11px] font-bold uppercase border transition-all cursor-pointer ${
                                  active
                                    ? 'bg-[#44332B] text-[#F5EEE7] border-[#44332B]'
                                    : 'bg-[#FCF9F6] text-[#685348] border-[#44332B]/20 hover:border-[#44332B] hover:text-[#44332B]'
                                }`}
                              >
                                {grindOption}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div
                        style={{ fontFamily: 'var(--font-mono), monospace' }}
                        className="py-2.5 px-3 bg-[#FCF9F6] border border-[#44332B]/20 flex items-center justify-between text-[11px] uppercase"
                      >
                        <span className="text-[#685348]">Формат помола:</span>
                        <span className="font-bold text-[#44332B]">
                          Уже смолот в 10 фильтр-пакетах
                        </span>
                      </div>
                    )}

                    <div
                      style={{ fontFamily: 'var(--font-mono), monospace' }}
                      className="flex gap-2"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          handleAddToOrder(
                            item.id,
                            item.name,
                            item.price,
                            currentGrind,
                            'Разовый заказ',
                            false
                          )
                        }
                        className="flex-1 bg-[#BCA38F] hover:bg-[#44332B] hover:text-[#F5EEE7] text-[#44332B] py-3.5 px-4 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                      >
                        {isJustAdded ? (
                          <>
                            <Check className="w-4 h-4" />
                            Добавлено в заявку
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4" />
                            Заказать • {item.price} BYN
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleAddToOrder(
                            item.id,
                            item.name,
                            item.price,
                            currentGrind,
                            'Разовый заказ',
                            true
                          )
                        }
                        className="bg-[#44332B] hover:bg-[#BCA38F] text-[#F5EEE7] hover:text-[#44332B] px-4 py-3.5 text-[11px] font-bold uppercase transition-all cursor-pointer shrink-0"
                      >
                        Оформить сразу
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div
            id="subscription"
            className="bg-[#44332B] text-[#F5EEE7] border border-[#44332B] p-6 sm:p-10 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
          >
            <div className="lg:col-span-8 space-y-4">
              <div
                style={{ fontFamily: 'var(--font-mono), monospace' }}
                className="inline-flex flex-wrap items-center gap-2 text-[11px] uppercase"
              >
                <span className="bg-[#BCA38F] text-[#44332B] px-2.5 py-1 font-bold">
                  [02] КОФЕЙНАЯ ПОДПИСКА
                </span>
                <span className="text-[#D4C5BB]">
                  2 пачки по 250 г раз в месяц • Бесплатная доставка по Минску
                </span>
              </div>

              <h3
                style={{ fontFamily: 'var(--font-display), sans-serif' }}
                className="text-2xl sm:text-4xl font-black uppercase leading-tight"
              >
                СВЕЖИЙ ЗАПАС КОФЕ КАЖДЫЙ МЕСЯЦ БЕЗ НАПОМИНАНИЙ
              </h3>

              <p className="text-sm text-[#D4C5BB] max-w-2xl leading-relaxed">
                Раз в месяц в пятницу курьер привозит вам 2 свежие пачки по 250 г
                (можно комбинировать любые сорта из каталога). Доставка по Минску
                для подписчиков всегда бесплатная.
              </p>

              <div className="pt-2 max-w-md space-y-2">
                <div
                  style={{ fontFamily: 'var(--font-mono), monospace' }}
                  className="text-[11px] uppercase text-[#D4C5BB]"
                >
                  Выберите помол для вашей подписки:
                </div>
                <div
                  style={{ fontFamily: 'var(--font-mono), monospace' }}
                  className="grid grid-cols-4 gap-2"
                >
                  {GRIND_OPTIONS.map((grindOption) => {
                    const active = grinds.subscription === grindOption;
                    return (
                      <button
                        key={grindOption}
                        type="button"
                        onClick={() =>
                          setGrinds((prev) => ({
                            ...prev,
                            subscription: grindOption,
                          }))
                        }
                        className={`py-2 px-2 text-xs font-bold uppercase border transition-all cursor-pointer ${
                          active
                            ? 'bg-[#BCA38F] text-[#44332B] border-[#BCA38F]'
                            : 'bg-[#58443A] text-[#D4C5BB] border-white/15 hover:text-white'
                        }`}
                      >
                        {grindOption}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 lg:border-l border-white/15 lg:pl-8 flex flex-col justify-between space-y-6">
              <div>
                <div
                  style={{ fontFamily: 'var(--font-mono), monospace' }}
                  className="text-xs uppercase text-[#D4C5BB]"
                >
                  Стоимость подписки:
                </div>
                <div
                  style={{ fontFamily: 'var(--font-display), sans-serif' }}
                  className="text-4xl font-black text-white mt-1"
                >
                  54 BYN{' '}
                  <span className="text-sm font-normal text-[#D4C5BB]">
                    / мес
                  </span>
                </div>
                <div
                  style={{ fontFamily: 'var(--font-mono), monospace' }}
                  className="text-[11px] text-emerald-400 mt-1"
                >
                  ✓ Доставка по Минску включена бесплатно
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  handleAddToOrder(
                    'subscription',
                    'Подписка (2 пачки по 250 г / мес)',
                    54,
                    grinds.subscription || 'Зерно',
                    'Подписка',
                    true
                  )
                }
                style={{ fontFamily: 'var(--font-mono), monospace' }}
                className="w-full bg-[#BCA38F] hover:bg-[#F5EEE7] hover:text-[#44332B] text-[#44332B] py-4 px-6 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                Оформить подписку
              </button>
            </div>
          </div>
        </div>
      </section>

      <section
        id="about"
        className="py-20 bg-[#EBE1D7] border-b border-[#44332B]/20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-6 space-y-6">
            <span
              style={{ fontFamily: 'var(--font-mono), monospace' }}
              className="text-xs uppercase text-[#BCA38F] font-bold"
            >
              [03] КТО МЫ И ПОЧЕМУ СВЕЖЕСТЬ ВАЖНА
            </span>

            <h2
              style={{ fontFamily: 'var(--font-display), sans-serif' }}
              className="text-2xl sm:text-4xl font-black text-[#44332B] uppercase leading-tight"
            >
              «МЫ ОТКРЫЛИ КВАРТУ В 2019 ГОДУ, ПОТОМУ ЧТО УСТАЛИ ОТ ПЕРЕСУШЕННОГО КОФЕ»
            </h2>

            <div className="space-y-4 text-sm sm:text-base text-[#5A453A] leading-relaxed">
              <p>
                Привет! Мы Аня и Дмитрий. До открытия своей мастерской на улице
                Короля мы несколько лет работали бариста в минских кофейнях. Там
                мы поняли простую вещь: даже самое дорогое зерно теряет до 60%
                ароматических масел уже через месяц после обжарки.
              </p>
              <p>
                Поэтому в «Кварте» нет склада готовой продукции. Мы жарим кофе
                маленькими партиями по <strong>5 килограммов</strong> строго по
                четвергам — ровно столько, сколько вы заказали на этой неделе. В
                пятницу пачка уже у вас дома или в офисе.
              </p>
            </div>

            <div
              style={{ fontFamily: 'var(--font-mono), monospace' }}
              className="p-4 bg-[#F5EEE7] border border-[#44332B]/20 text-xs flex items-center justify-between"
            >
              <span>Аня и Дмитрий, основатели «Кварты»</span>
              <a
                href="tel:+375291234567"
                className="font-bold text-[#BCA38F] hover:underline"
              >
                +375 (29) 123-45-67
              </a>
            </div>
          </div>

          <div className="lg:col-span-6 bg-[#F5EEE7] border border-[#44332B]/20 p-6 sm:p-8 space-y-6">
            <div
              style={{ fontFamily: 'var(--font-mono), monospace' }}
              className="text-xs font-bold uppercase text-[#44332B] border-b border-[#44332B]/20 pb-3"
            >
              КАК УСТРОЕНА НАША НЕДЕЛЯ В МАСТЕРСКОЙ:
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-12 gap-4 border-b border-[#44332B]/15 pb-4">
                <div
                  style={{ fontFamily: 'var(--font-mono), monospace' }}
                  className="col-span-4 text-xs font-bold uppercase text-[#BCA38F]"
                >
                  Пн — Ср
                </div>
                <div className="col-span-8 text-xs text-[#5A453A] leading-relaxed">
                  <strong className="text-[#44332B] block mb-0.5">
                    Принимаем заявки и консультируем
                  </strong>
                  Формируем план обжарки по сортам. Мастерская на Короля, 9
                  открыта с 8:00 до 20:00.
                </div>
              </div>

              <div className="grid grid-cols-12 gap-4 border-b border-[#44332B]/15 pb-4">
                <div
                  style={{ fontFamily: 'var(--font-mono), monospace' }}
                  className="col-span-4 text-xs font-bold uppercase text-[#BCA38F]"
                >
                  Четверг
                </div>
                <div className="col-span-8 text-xs text-[#5A453A] leading-relaxed">
                  <strong className="text-[#44332B] block mb-0.5">
                    День обжарки (партии по 5 кг)
                  </strong>
                  Жарим Эфиопию, Колумбию и Бразилию, проверяем профиль и фасуем
                  в пачки с клапаном.
                </div>
              </div>

              <div className="grid grid-cols-12 gap-4">
                <div
                  style={{ fontFamily: 'var(--font-mono), monospace' }}
                  className="col-span-4 text-xs font-bold uppercase text-[#BCA38F]"
                >
                  Пятница
                </div>
                <div className="col-span-8 text-xs text-[#5A453A] leading-relaxed">
                  <strong className="text-[#44332B] block mb-0.5">
                    Помол и развозка по Минску
                  </strong>
                  Мелем пачки под ваш способ и развозим по домам и офисам Минска.
                  От 50 BYN — доставка бесплатная.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="reviews" className="py-20 border-b border-[#44332B]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#44332B]/20 pb-6">
            <div>
              <span
                style={{ fontFamily: 'var(--font-mono), monospace' }}
                className="text-xs uppercase text-[#BCA38F] font-bold"
              >
                [04] ОБРАТНАЯ СВЯЗЬ ПОСЛЕ ПЯТНИЧНЫХ РАЗВОЗОК
              </span>
              <h2
                style={{ fontFamily: 'var(--font-display), sans-serif' }}
                className="text-2xl sm:text-4xl font-black text-[#44332B] uppercase mt-1"
              >
                ЧТО ПИШУТ НАМ В ПЯТНИЦУ УТРОМ
              </h2>
            </div>
            <span
              style={{ fontFamily: 'var(--font-mono), monospace' }}
              className="text-xs text-[#685348]"
            >
              Из сообщений в Instagram и Telegram мастерской
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CUSTOMER_NOTES.map((item) => (
              <div
                key={item.id}
                className="bg-[#FCF9F6] border border-[#44332B]/20 p-6 flex flex-col justify-between space-y-5"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-3 border-b border-[#44332B]/15 pb-3">
                    <img
                      src={item.photo}
                      alt={item.name}
                      loading="lazy"
                      className="w-12 h-12 object-cover border border-[#44332B]/20"
                    />
                    <div>
                      <div className="font-bold text-sm text-[#44332B]">
                        {item.name}
                      </div>
                      <div
                        style={{ fontFamily: 'var(--font-mono), monospace' }}
                        className="text-[10px] text-[#BCA38F] uppercase"
                      >
                        {item.context}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-[#44332B] leading-relaxed">
                    «{item.message}»
                  </p>
                </div>

                <div
                  style={{ fontFamily: 'var(--font-mono), monospace' }}
                  className="bg-[#EBE1D7]/70 p-3 text-[11px] text-[#5A453A] border-l-2 border-[#BCA38F]"
                >
                  <strong className="text-[#44332B] block">Ответ Кварты:</strong>
                  {item.reply}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="delivery"
        className="py-20 bg-[#EBE1D7] border-b border-[#44332B]/20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-[#F5EEE7] border border-[#44332B]/20 p-6 sm:p-8 space-y-5">
            <PhotoCard
              poster="https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=75&w=600&auto=format&fit=crop"
              alt="Мастерская Кварта на Короля, 9"
              className="h-60 border border-[#44332B]/20"
            />
            <div className="space-y-3">
              <div
                style={{ fontFamily: 'var(--font-mono), monospace' }}
                className="flex items-center justify-between text-xs font-bold uppercase text-[#BCA38F]"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>[05] САМОВЫВОЗ ИЗ МАСТЕРСКОЙ</span>
                </div>
                <a
                  href="https://yandex.by/maps/?text=Минск+улица+Короля+9"
                  target="_blank"
                  rel="noreferrer"
                  className="underline text-[#44332B] hover:text-[#BCA38F] flex items-center gap-1"
                >
                  <span>На карте</span>
                  <Navigation className="w-3 h-3" />
                </a>
              </div>
              <h3
                style={{ fontFamily: 'var(--font-display), sans-serif' }}
                className="text-xl sm:text-2xl font-black text-[#44332B] uppercase"
              >
                Минск, ул. Короля, 9
              </h3>
              <p className="text-xs text-[#5A453A] leading-relaxed">
                Заходите познакомиться лично: поможем выбрать сорт по вкусу,
                смелем пачку при вас и нальём свежий фильтр.
              </p>
              <div
                style={{ fontFamily: 'var(--font-mono), monospace' }}
                className="inline-flex items-center gap-2 text-xs text-[#44332B] font-bold pt-1"
              >
                <Clock className="w-4 h-4 text-[#BCA38F]" />
                Пн–Пт: 8:00–20:00 | Сб–Вс: 10:00–18:00
              </div>
            </div>
          </div>

          <div className="bg-[#F5EEE7] border border-[#44332B]/20 p-6 sm:p-8 space-y-5">
            <PhotoCard
              poster="https://images.unsplash.com/photo-1526367790999-0150786686a2?q=75&w=600&auto=format&fit=crop"
              alt="Пятничная доставка по Минску"
              className="h-60 border border-[#44332B]/20"
            />
            <div className="space-y-3">
              <div
                style={{ fontFamily: 'var(--font-mono), monospace' }}
                className="flex items-center gap-2 text-xs font-bold uppercase text-[#BCA38F]"
              >
                <Truck className="w-4 h-4" />
                <span>КУРЬЕРСКАЯ РАЗВОЗКА</span>
              </div>
              <h3
                style={{ fontFamily: 'var(--font-display), sans-serif' }}
                className="text-xl sm:text-2xl font-black text-[#44332B] uppercase"
              >
                Доставка по Минску в пятницу
              </h3>
              <p className="text-xs text-[#5A453A] leading-relaxed">
                Развозим свежую четверговую обжарку каждую пятницу домой и в
                офисы. При заказе от 50 BYN или подписке доставка бесплатная.
              </p>
              <div
                style={{ fontFamily: 'var(--font-mono), monospace' }}
                className="text-xs text-[#44332B] font-bold pt-1"
              >
                ✓ Оплата при получении (наличными или картой курьеру)
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="order-form" className="py-20 bg-[#F5EEE7]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="bg-[#44332B] text-[#F5EEE7] border border-[#44332B] p-6 sm:p-12 space-y-8">
            <div className="space-y-2 border-b border-white/15 pb-6">
              <span
                style={{ fontFamily: 'var(--font-mono), monospace' }}
                className="text-xs uppercase text-[#BCA38F] font-bold"
              >
                ОФОРМЛЕНИЕ ЗАЯВКИ БЕЗ ПРЕДОПЛАТЫ
              </span>
              <h2
                style={{ fontFamily: 'var(--font-display), sans-serif' }}
                className="text-2xl sm:text-3xl font-black uppercase"
              >
                ЗАКАЗАТЬ СВЕЖУЮ ОБЖАРКУ
              </h2>
              <p className="text-xs text-[#D4C5BB] leading-relaxed">
                Оставьте имя и белорусский номер телефона. Менеджер перезвонит,
                чтобы согласовать пятничную доставку по Минску или самовывоз с
                Короля, 9.
              </p>
            </div>

            <AnimatePresence>
              {orderItems.length > 0 && !successMsg && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-[#58443A] border border-white/15 p-4 sm:p-5 space-y-4"
                >
                  <div
                    style={{ fontFamily: 'var(--font-mono), monospace' }}
                    className="flex items-center justify-between text-[11px] uppercase text-[#D4C5BB]"
                  >
                    <span>Состав вашей заявки:</span>
                    <span>
                      {isFreeDelivery ? (
                        <span className="text-emerald-400 font-bold">
                          ✓ Доставка по Минску 0 BYN
                        </span>
                      ) : (
                        <span>
                          До бесплатной доставки: {50 - totalPrice} BYN
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {orderItems.map((item) => (
                      <div
                        key={item.key}
                        className="flex items-center justify-between gap-3 bg-[#44332B] px-3.5 py-2.5 border border-white/10 text-xs"
                      >
                        <div className="min-w-0">
                          <div className="font-bold text-white truncate">
                            {item.name}
                          </div>
                          <div
                            style={{ fontFamily: 'var(--font-mono), monospace' }}
                            className="text-[11px] text-[#BCA38F]"
                          >
                            Помол: {item.grind} • {item.price} BYN
                          </div>
                        </div>

                        <div
                          style={{ fontFamily: 'var(--font-mono), monospace' }}
                          className="flex items-center gap-2 shrink-0"
                        >
                          <button
                            type="button"
                            onClick={() => updateItemQty(item.key, -1)}
                            className="w-7 h-7 bg-[#58443A] hover:bg-[#BCA38F] text-white hover:text-[#44332B] flex items-center justify-center transition cursor-pointer"
                            aria-label="Уменьшить количество"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-bold w-5 text-center">
                            {item.qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateItemQty(item.key, 1)}
                            className="w-7 h-7 bg-[#58443A] hover:bg-[#BCA38F] text-white hover:text-[#44332B] flex items-center justify-center transition cursor-pointer"
                            aria-label="Увеличить количество"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeItem(item.key)}
                            className="w-7 h-7 bg-red-950/60 hover:bg-red-600 text-red-300 hover:text-white flex items-center justify-center transition ml-1 cursor-pointer"
                            aria-label="Удалить позицию"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div
                    style={{ fontFamily: 'var(--font-mono), monospace' }}
                    className="flex items-center justify-between pt-3 border-t border-white/10 text-xs"
                  >
                    <span className="text-[#D4C5BB]">Итого к заказу:</span>
                    <span className="font-bold text-base text-[#BCA38F]">
                      {totalPrice} BYN
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {successMsg ? (
              <div className="bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 p-8 text-center space-y-4">
                <Check className="w-10 h-10 text-emerald-400 mx-auto" />
                <h3
                  style={{ fontFamily: 'var(--font-display), sans-serif' }}
                  className="font-black text-lg uppercase text-white"
                >
                  Заявка принята!
                </h3>
                <p
                  style={{ fontFamily: 'var(--font-mono), monospace' }}
                  className="text-xs leading-relaxed"
                >
                  {successMsg}
                </p>
                <button
                  type="button"
                  onClick={() => setSuccessMsg('')}
                  style={{ fontFamily: 'var(--font-mono), monospace' }}
                  className="bg-emerald-500 text-black text-xs font-bold uppercase px-6 py-3 hover:bg-emerald-400 transition cursor-pointer"
                >
                  Оформить ещё одну заявку
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label
                    style={{ fontFamily: 'var(--font-mono), monospace' }}
                    className="block text-[11px] uppercase text-[#D4C5BB]"
                  >
                    Тип обращения
                  </label>
                  <select
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    style={{ fontFamily: 'var(--font-mono), monospace' }}
                    className="w-full bg-[#58443A] border border-white/15 px-4 py-3.5 text-xs text-white focus:outline-none focus:border-[#BCA38F] transition"
                  >
                    <option value="Разовый заказ">Разовый заказ кофе</option>
                    <option value="Подписка">
                      Подписка на месяц (54 BYN / 2 пачки)
                    </option>
                    <option value="Вопрос">Вопрос по зерну или помолу</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label
                      style={{ fontFamily: 'var(--font-mono), monospace' }}
                      className="block text-[11px] uppercase text-[#D4C5BB]"
                    >
                      Ваше имя *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-[#BCA38F] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        required
                        placeholder="Алексей"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={{ fontFamily: 'var(--font-mono), monospace' }}
                        className="w-full bg-[#58443A] border border-white/15 pl-10 pr-4 py-3.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#BCA38F] transition"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label
                      style={{ fontFamily: 'var(--font-mono), monospace' }}
                      className="block text-[11px] uppercase text-[#D4C5BB]"
                    >
                      Белорусский номер *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-[#BCA38F] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="tel"
                        required
                        placeholder="+375 (29) 123-45-67"
                        value={phone}
                        onChange={(e) =>
                          setPhone((prev) =>
                            formatBYPhoneInput(e.target.value, prev)
                          )
                        }
                        style={{ fontFamily: 'var(--font-mono), monospace' }}
                        className="w-full bg-[#58443A] border border-white/15 pl-10 pr-4 py-3.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#BCA38F] transition"
                      />
                    </div>
                  </div>
                </div>

                <span
                  style={{ fontFamily: 'var(--font-mono), monospace' }}
                  className="text-[10px] text-[#D4C5BB]/70 block -mt-2"
                >
                  Коды операторов РБ: 29, 33, 44, 25, 17 (принимаются форматы
                  +375 и 80).
                </span>

                <div className="space-y-2">
                  <label
                    style={{ fontFamily: 'var(--font-mono), monospace' }}
                    className="block text-[11px] uppercase text-[#D4C5BB]"
                  >
                    Адрес пятничной доставки или комментарий (необязательно)
                  </label>
                  <div className="relative">
                    <MessageSquare className="w-4 h-4 text-[#BCA38F] absolute left-3.5 top-3.5 pointer-events-none" />
                    <textarea
                      rows={3}
                      placeholder="Улица и дом для курьера в пятницу, либо напишите «самовывоз с Короля, 9»..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      style={{ fontFamily: 'var(--font-mono), monospace' }}
                      className="w-full bg-[#58443A] border border-white/15 pl-10 pr-4 py-3 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#BCA38F] transition"
                    />
                  </div>
                </div>

                {error && (
                  <div
                    style={{ fontFamily: 'var(--font-mono), monospace' }}
                    className="bg-red-950/60 border border-red-500/50 text-red-300 p-4 text-xs flex items-start gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <div className="font-bold text-red-200">Ошибка ввода</div>
                      <div className="text-[11px] text-red-300/80">
                        {error}
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  style={{ fontFamily: 'var(--font-mono), monospace' }}
                  className="w-full bg-[#BCA38F] hover:bg-[#F5EEE7] hover:text-[#44332B] text-[#44332B] font-bold text-xs uppercase tracking-wider py-4 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {loading
                    ? 'Отправляем заявку...'
                    : totalPrice > 0
                    ? `Отправить заявку • ${totalPrice} BYN`
                    : 'Отправить заявку'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <footer
        style={{ fontFamily: 'var(--font-mono), monospace' }}
        className="border-t border-[#44332B]/20 bg-[#EBE1D7] py-10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-[#5A453A]">
          <div>
            <strong className="text-[#44332B] uppercase">
              ОБЖАРКА «КВАРТА»
            </strong>{' '}
            • Минск, ул. Короля, 9 (Пн–Пт 8:00–20:00, Сб–Вс 10:00–18:00)
          </div>
          <div>
            Телефон для связи:{' '}
            <a
              href="tel:+375291234567"
              className="font-bold text-[#44332B] underline"
            >
              +375 (29) 123-45-67
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}