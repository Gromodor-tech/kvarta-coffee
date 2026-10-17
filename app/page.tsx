'use client';

import { useState, useEffect, useRef } from 'react';
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
      'https://images.unsplash.com/photo-1559525839-b184a4d698c7?q=80&w=1200&auto=format&fit=crop',
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
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=1200&auto=format&fit=crop',
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
      'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?q=80&w=1200&auto=format&fit=crop',
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
      'https://images.unsplash.com/photo-1611162458324-aae1eb4129a4?q=80&w=1200&auto=format&fit=crop',
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
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: 2,
    name: 'Денис и команда, пр-т Победителей',
    context: 'Подписка в офис + коробка дрипов',
    message:
      'Перешли на «Кварту» всем отделом три месяца назад. Серрадо в офисной кофемашине с молоком получается плотным, без горечи, как в хорошей кофейне в центре. Отдельный респект за простоту: никаких сложных кабинетов, Дмитрий сам пишет в четверг.',
    reply: 'Денис, всегда рады завезти вам свежую партию в пятницу утром!',
    photo:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: 3,
    name: 'Илья, Грушевка',
    context: 'Самовывоз из мастерской • Колумбия Уила',
    message:
      'Захожу к Ане и Дмитрию по дороге на работу. Приятно, когда обжарщики сами стоят за баром и могут человеческим языком объяснить, какой помол выставить под домашнюю рожковую кофеварку.',
    reply: 'Илья, забегай на фильтр в эту пятницу, открыли новую Колумбию!',
    photo:
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=400&auto=format&fit=crop',
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
  if (digits === '8') return '8';

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
            dot <= value ? 'bg-[#2C1E16]' : 'bg-[#2C1E16]/20'
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
          className="absolute top-3 left-3 bg-[#FDFBF7]/95 text-[#2C1E16] text-[10px] font-bold uppercase px-2.5 py-1 border border-[#2C1E16]/10 z-10 shadow-sm"
        >
          {badgeText}
        </span>
      )}
    </div>
  );
}

export default function Home() {
  const [schedule, setSchedule] = useState({
    roastDate: 'четверг',
    deliveryDate: 'пятница',
  });

  useEffect(() => {
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();

    let diffToThursday = (4 - day + 7) % 7;
    if (day === 3 && hour >= 18) {
      diffToThursday = 7;
    } else if (day === 4 && hour < 15) {
      diffToThursday = 0;
    } else if (day === 4 && hour >= 15) {
      diffToThursday = 7;
    }

    const nextThursday = new Date(now);
    nextThursday.setDate(now.getDate() + diffToThursday);

    const nextFriday = new Date(nextThursday);
    nextFriday.setDate(nextThursday.getDate() + 1);

    const formatter = new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'long',
    });

    setSchedule({
      roastDate: `чт, ${formatter.format(nextThursday)}`,
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
  const isSubmittingRef = useRef(false);

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
    
    const hasSubInCart = orderItems.some(i => i.id === 'subscription') || id === 'subscription';
    if (!hasSubInCart) {
      setTopic(defaultTopic);
    } else {
      setTopic('Подписка');
    }

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || isSubmittingRef.current) return;

    setError('');
    setSuccessMsg('');

    if (name.trim().length < 2) {
      setError('Пожалуйста, укажите ваше имя (минимум 2 символа).');
      return;
    }

    const digits = phone.replace(/\D/g, '');
    const operator = digits.length >= 5 ? digits.slice(3, 5) : '';
    const validOperators = ['29', '33', '44', '25', '17'];

    if (
      digits.length !== 12 ||
      !digits.startsWith('375') ||
      !validOperators.includes(operator)
    ) {
      setError(
        'Укажите корректный белорусский номер (коды 29, 33, 44, 25, 17).'
      );
      return;
    }

    setLoading(true);
    isSubmittingRef.current = true;

    const params = new URLSearchParams(window.location.search);
    const utmSource = params.get('utm_source') || 'direct';
    const utmMedium = params.get('utm_medium') || 'none';
    const utmCampaign = params.get('utm_campaign') || 'none';
    const utmContent = params.get('utm_content') || 'none';
    const utmTerm = params.get('utm_term') || 'none';
    const yclid = params.get('yclid') || 'none';
    const fbclid = params.get('fbclid') || 'none';

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
          yclid,
          fbclid,
          referrer: document.referrer || 'direct',
          pageUrl: window.location.href,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || 'Ошибка связи с сервером.');
      }

      setSuccessMsg(
        data.message ||
          'Заявка принята! Аня или Дмитрий перезвонят вам в ближайшее время.'
      );
      setName('');
      setPhone('');
      setComment('');
      setOrderItems([]);
    } catch (err: unknown) {
      let message = 'Не удалось отправить заявку.';
      if (err instanceof TypeError) {
        message = 'Нет соединения. Проверьте интернет или позвоните: +375 (29) 684-11-22.';
      } else if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2C1E16] selection:bg-[#EAE1D8] selection:text-[#2C1E16] overflow-x-hidden">
      <div
        style={{ fontFamily: 'var(--font-mono), monospace' }}
        className="bg-[#2C1E16] text-[#FDFBF7] text-[11px] py-2.5 px-4 border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#EAE1D8] animate-pulse" />
            <span>
              Обжарка: <strong className="text-white">{schedule.roastDate}</strong>{' '}
              • Развозка:{' '}
              <strong className="text-white">{schedule.deliveryDate}</strong>
            </span>
          </div>
          <div className="text-[#EAE1D8] font-bold">
            Малые партии по 5 кг • Свежий урожай
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-50 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-[#2C1E16]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-3 text-left cursor-pointer group"
          >
            <div className="w-11 h-11 bg-[#2C1E16] group-hover:bg-[#EAE1D8] transition-colors text-[#FDFBF7] group-hover:text-[#2C1E16] flex items-center justify-center font-black text-lg tracking-tighter">
              КВ
            </div>
            <div>
              <span
                style={{ fontFamily: 'var(--font-display), sans-serif' }}
                className="text-lg font-black tracking-tight text-[#2C1E16] uppercase block leading-none"
              >
                КВАРТА
              </span>
              <span
                style={{ fontFamily: 'var(--font-mono), monospace' }}
                className="text-[10px] text-[#2C1E16]/80 uppercase block mt-1"
              >
                Минск • ул. Короля, 9
              </span>
            </div>
          </button>

          <nav
            style={{ fontFamily: 'var(--font-mono), monospace' }}
            className="hidden lg:flex items-center gap-8 text-xs uppercase text-[#2C1E16]"
          >
            <button
              type="button"
              onClick={() => scrollToSection('catalog')}
              className="hover:text-[#2C1E16]/60 transition-colors cursor-pointer font-bold"
            >
              [01] Зерно
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('subscription')}
              className="hover:text-[#2C1E16]/60 transition-colors cursor-pointer font-bold"
            >
              [02] Подписка
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('about')}
              className="hover:text-[#2C1E16]/60 transition-colors cursor-pointer font-bold"
            >
              [03] О нас
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('reviews')}
              className="hover:text-[#2C1E16]/60 transition-colors cursor-pointer font-bold"
            >
              [04] Отзывы
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('delivery')}
              className="hover:text-[#2C1E16]/60 transition-colors cursor-pointer font-bold"
            >
              [05] Доставка
            </button>
          </nav>

          <button
            type="button"
            onClick={() => scrollToSection('order-form')}
            style={{ fontFamily: 'var(--font-mono), monospace' }}
            className={`flex items-center gap-2.5 px-4 sm:px-5 py-3 text-xs font-bold uppercase transition-all cursor-pointer border ${
              totalPacks > 0
                ? 'bg-[#EAE1D8] text-[#2C1E16] border-[#EAE1D8] hover:bg-[#2C1E16] hover:text-[#FDFBF7]'
                : 'bg-[#2C1E16] text-[#FDFBF7] border-[#2C1E16] hover:bg-[#EAE1D8] hover:text-[#2C1E16]'
            }`}
          >
            <ShoppingBag className="w-4 h-4 shrink-0" />
            {totalPacks > 0 ? (
              <span>
                Заявка: {totalPacks} шт. ({totalPrice} BYN)
              </span>
            ) : (
              <span>Оформить заказ</span>
            )}
          </button>
        </div>
      </header>

      <section className="border-b border-[#2C1E16]/10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-span-7 p-6 sm:p-12 lg:p-16 flex flex-col justify-between space-y-10 lg:border-r border-[#2C1E16]/10">
            <div className="space-y-6">
              <div
                style={{ fontFamily: 'var(--font-mono), monospace' }}
                className="inline-flex flex-wrap items-center gap-3 text-xs uppercase text-[#2C1E16]/80 border-b border-[#2C1E16]/10 pb-2"
              >
                <a
                  href="https://yandex.by/maps/?text=Минск+улица+Короля+9"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#2C1E16] flex items-center gap-1 underline underline-offset-2"
                >
                  <span>Мастерская в Минске</span>
                  <Navigation className="w-3 h-3" />
                </a>
                <span>•</span>
                <span className="text-[#2C1E16] font-bold">
                  Свежая обжарка каждый четверг
                </span>
              </div>

              <h1
                style={{ fontFamily: 'var(--font-display), sans-serif' }}
                className="text-3xl sm:text-5xl lg:text-[54px] font-black text-[#2C1E16] uppercase leading-[1.05] tracking-tight"
              >
                КОФЕ, КОТОРЫЙ ПРИЕЗЖАЕТ К ВАМ{' '}
                <span className="text-[#2C1E16] underline decoration-[#EAE1D8] decoration-4 underline-offset-4">
                  ЧЕРЕЗ 1–3 ДНЯ
                </span>{' '}
                ПОСЛЕ РОСТЕРА
              </h1>

              <p className="text-base sm:text-lg text-[#2C1E16]/90 leading-relaxed max-w-xl">
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
                  className="bg-[#2C1E16] hover:bg-[#EAE1D8] text-[#FDFBF7] hover:text-[#2C1E16] px-7 py-4 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-3 cursor-pointer shadow-md"
                >
                  Выбрать зерно и помол
                  <ArrowUpRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection('subscription')}
                  style={{ fontFamily: 'var(--font-mono), monospace' }}
                  className="bg-transparent hover:bg-[#2C1E16] hover:text-[#FDFBF7] text-[#2C1E16] border border-[#2C1E16] px-7 py-4 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                >
                  Подписка • 49 BYN / мес
                </button>
              </div>

              <div
                style={{ fontFamily: 'var(--font-mono), monospace' }}
                className="grid grid-cols-3 border-t border-[#2C1E16]/10 pt-6 gap-4 text-xs"
              >
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-[#2C1E16]">
                    Бесплатно
                  </div>
                  <div className="text-[#2C1E16]/80 text-[11px] mt-0.5">
                    помол под ваш способ
                  </div>
                </div>
                <div className="border-l border-[#2C1E16]/10 pl-4">
                  <div className="text-xl sm:text-2xl font-bold text-[#2C1E16]">
                    24–72 ч
                  </div>
                  <div className="text-[#2C1E16]/80 text-[11px] mt-0.5">
                    от ростера до чашки
                  </div>
                </div>
                <div className="border-l border-[#2C1E16]/10 pl-4">
                  <div className="text-xl sm:text-2xl font-bold text-[#2C1E16]">
                    0 BYN
                  </div>
                  <div className="text-[#2C1E16]/80 text-[11px] mt-0.5">
                    доставка при заказе от 50 BYN
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 p-6 sm:p-12 flex flex-col justify-between bg-[#F4EFEA]/50">
            <PhotoCard
              poster="https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=1200&auto=format&fit=crop"
              alt="Свежая обжарка Кварта"
              className="w-full aspect-[4/4] border border-[#2C1E16]/10"
            />

            <div
              style={{ fontFamily: 'var(--font-mono), monospace' }}
              className="mt-6 p-4 bg-[#FDFBF7] border border-[#2C1E16]/10 text-xs space-y-2"
            >
              <div className="flex justify-between items-center font-bold text-[#2C1E16] border-b border-[#2C1E16]/10 pb-1.5">
                <span>ГРАФИК БЛИЖАЙШЕЙ ПАРТИИ</span>
                <span className="text-[#2C1E16]">{schedule.roastDate}</span>
              </div>
              <p className="text-[11px] text-[#2C1E16]/80 leading-relaxed">
                Собираем заказы до вечера среды. В четверг жарим в мастерской,
                а в пятницу развозим свежие пачки по Минску курьером.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="catalog" className="py-20 border-b border-[#2C1E16]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#2C1E16]/10 pb-8">
            <div className="space-y-2">
              <span
                style={{ fontFamily: 'var(--font-mono), monospace' }}
                className="text-xs uppercase text-[#2C1E16]/70 font-bold"
              >
                [01] СВЕЖАЯ ОБЖАРКА ЭТОЙ НЕДЕЛИ
              </span>
              <h2
                style={{ fontFamily: 'var(--font-display), sans-serif' }}
                className="text-2xl sm:text-4xl font-black text-[#2C1E16] uppercase tracking-tight"
              >
                КАТАЛОГ ЗЕРНА И ДРИПОВ
              </h2>
            </div>
            <p
              style={{ fontFamily: 'var(--font-mono), monospace' }}
              className="text-xs text-[#2C1E16]/80 max-w-md"
            >
              Выберите способ заваривания в карточке — мы бесплатно смелем
              зерно прямо перед выездом курьера.
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
                  className="bg-[#FFFFFF] border border-[#2C1E16]/15 flex flex-col justify-between transition-colors hover:border-[#2C1E16]"
                >
                  <div>
                    <div
                      style={{ fontFamily: 'var(--font-mono), monospace' }}
                      className="flex items-center justify-between px-5 py-3 border-b border-[#2C1E16]/10 text-[11px] uppercase bg-[#F4EFEA]/40"
                    >
                      <span className="font-bold text-[#2C1E16]">
                        {item.lotNumber} • {item.roastLevel}
                      </span>
                      <span className="text-[#2C1E16]/80">{item.originInfo}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 border-b border-[#2C1E16]/10">
                      <div className="sm:col-span-5 border-b sm:border-b-0 sm:border-r border-[#2C1E16]/10">
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
                              className="text-xl font-black text-[#2C1E16] uppercase leading-snug"
                            >
                              {item.name}
                            </h3>
                            <span
                              style={{
                                fontFamily: 'var(--font-mono), monospace',
                              }}
                              className="text-xl font-bold text-[#2C1E16] shrink-0"
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
                                className="text-[10px] uppercase px-2 py-0.5 bg-[#FDFBF7] border border-[#2C1E16]/15 text-[#2C1E16]"
                              >
                                {note}
                              </span>
                            ))}
                          </div>

                          <p className="text-xs text-[#2C1E16]/90 leading-relaxed">
                            {item.description}
                          </p>
                        </div>

                        <div
                          style={{ fontFamily: 'var(--font-mono), monospace' }}
                          className="grid grid-cols-2 gap-4 pt-3 border-t border-[#2C1E16]/10 text-[10px] uppercase text-[#2C1E16]/80"
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

                  <div className="p-5 space-y-4 bg-[#FDFBF7]">
                    {item.hasGrindSelector ? (
                      <div className="space-y-2">
                        <div
                          style={{ fontFamily: 'var(--font-mono), monospace' }}
                          className="flex justify-between items-center text-[11px] uppercase"
                        >
                          <span className="text-[#2C1E16]/80">
                            Выберите помол:
                          </span>
                          <span className="font-bold text-[#2C1E16]">
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
                                    ? 'bg-[#2C1E16] text-[#FDFBF7] border-[#2C1E16]'
                                    : 'bg-[#FFFFFF] text-[#2C1E16]/80 border-[#2C1E16]/15 hover:border-[#2C1E16] hover:text-[#2C1E16]'
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
                        className="py-2.5 px-3 bg-[#FFFFFF] border border-[#2C1E16]/15 flex items-center justify-between text-[11px] uppercase"
                      >
                        <span className="text-[#2C1E16]/80">Формат помола:</span>
                        <span className="font-bold text-[#2C1E16]">
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
                        className="flex-1 bg-[#2C1E16] hover:bg-[#EAE1D8] text-[#FDFBF7] hover:text-[#2C1E16] py-3.5 px-4 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                      >
                        {isJustAdded ? (
                          <>
                            <Check className="w-4 h-4" />
                            В заявке ({currentGrind})
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4" />
                            Добавить в заявку
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => scrollToSection('order-form')}
                        className="bg-[#FDFBF7] hover:bg-[#F4EFEA] text-[#2C1E16] border border-[#2C1E16]/20 hover:border-[#2C1E16] px-4 py-3.5 text-[11px] font-bold uppercase transition-all cursor-pointer shrink-0"
                      >
                        К форме ↓
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div
            id="subscription"
            className="bg-[#2C1E16] text-[#FDFBF7] p-6 sm:p-10 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
          >
            <div className="lg:col-span-8 space-y-4">
              <div
                style={{ fontFamily: 'var(--font-mono), monospace' }}
                className="inline-flex flex-wrap items-center gap-2 text-[11px] uppercase"
              >
                <span className="bg-[#FDFBF7] text-[#2C1E16] px-2.5 py-1 font-bold">
                  [02] КОФЕЙНАЯ ПОДПИСКА
                </span>
                <span className="text-[#FDFBF7]/80">
                  2 пачки по 250 г раз в месяц • Выгода до 15 BYN
                </span>
              </div>

              <h3
                style={{ fontFamily: 'var(--font-display), sans-serif' }}
                className="text-2xl sm:text-4xl font-black uppercase leading-tight"
              >
                СВЕЖИЙ ЗАПАС КОФЕ КАЖДЫЙ МЕСЯЦ БЕЗ НАПОМИНАНИЙ
              </h3>

              <p className="text-sm text-[#FDFBF7]/90 max-w-2xl leading-relaxed">
                Раз в месяц в пятницу курьер привозит вам 2 свежие пачки по 250 г
                (можно комбинировать любые сорта из каталога). Доставка по Минску
                для подписчиков всегда бесплатная.
              </p>

              <div className="pt-2 max-w-md space-y-2">
                <div
                  style={{ fontFamily: 'var(--font-mono), monospace' }}
                  className="text-[11px] uppercase text-[#FDFBF7]/80"
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
                            ? 'bg-[#FDFBF7] text-[#2C1E16] border-[#FDFBF7]'
                            : 'bg-transparent text-[#FDFBF7]/80 border-white/20 hover:text-white hover:border-white'
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
                  className="text-xs uppercase text-[#FDFBF7]/80"
                >
                  Стоимость подписки:
                </div>
                <div
                  style={{ fontFamily: 'var(--font-display), sans-serif' }}
                  className="text-4xl font-black text-white mt-1"
                >
                  49 BYN{' '}
                  <span className="text-sm font-normal text-[#FDFBF7]/70">
                    / мес
                  </span>
                </div>
                <div
                  style={{ fontFamily: 'var(--font-mono), monospace' }}
                  className="text-[11px] text-[#FDFBF7]/90 mt-1"
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
                    49,
                    grinds.subscription || 'Зерно',
                    'Подписка',
                    true
                  )
                }
                style={{ fontFamily: 'var(--font-mono), monospace' }}
                className="w-full bg-[#FDFBF7] hover:bg-transparent hover:text-white border border-[#FDFBF7] text-[#2C1E16] py-4 px-6 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                Оформить подписку
              </button>
            </div>
          </div>
        </div>
      </section>

      <section
        id="about"
        className="py-20 bg-[#F4EFEA] border-b border-[#2C1E16]/10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-6 space-y-6">
            <span
              style={{ fontFamily: 'var(--font-mono), monospace' }}
              className="text-xs uppercase text-[#2C1E16]/70 font-bold"
            >
              [03] КТО МЫ И ПОЧЕМУ СВЕЖЕСТЬ ВАЖНА
            </span>

            <h2
              style={{ fontFamily: 'var(--font-display), sans-serif' }}
              className="text-2xl sm:text-4xl font-black text-[#2C1E16] uppercase leading-tight"
            >
              «МЫ ОТКРЫЛИ КВАРТУ, ПОТОМУ ЧТО УСТАЛИ ОТ ПЕРЕСУШЕННОГО КОФЕ»
            </h2>

            <div className="space-y-4 text-sm sm:text-base text-[#2C1E16]/90 leading-relaxed">
              <p>
                Привет! Мы Аня и Дмитрий. До открытия своей мастерской мы
                несколько лет работали бариста в минских кофейнях. По нашему
                опыту, пик вкуса и ароматики зерна держится в первые недели после
                обжарки, а дальше эфирные масла быстро выветриваются.
              </p>
              <p>
                Поэтому в «Кварте» нет склада готовой продукции. Мы жарим кофе
                маленькими партиями по <strong>5 килограммов</strong> строго по
                четвергам — ровно столько, сколько вы заказали на этой неделе. В
                пятницу свежая пачка уже у вас дома или в офисе.
              </p>
            </div>

            <div
              style={{ fontFamily: 'var(--font-mono), monospace' }}
              className="p-4 bg-[#FDFBF7] border border-[#2C1E16]/10 text-xs flex items-center justify-between"
            >
              <span className="text-[#2C1E16]/80 font-bold">
                Аня и Дмитрий, основатели «Кварты»
              </span>
              <a
                href="tel:+375296841122"
                className="font-bold text-[#2C1E16] hover:underline"
              >
                +375 (29) 684-11-22
              </a>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6">
            <PhotoCard
              poster="https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?q=80&w=1200&auto=format&fit=crop"
              alt="Аня и Дмитрий в обжарочной Кварта"
              className="w-full aspect-[16/9] border border-[#2C1E16]/10"
            />
            <div className="bg-[#FDFBF7] border border-[#2C1E16]/10 p-6 space-y-5">
              <div className="grid grid-cols-12 gap-4 border-b border-[#2C1E16]/10 pb-4">
                <div
                  style={{ fontFamily: 'var(--font-mono), monospace' }}
                  className="col-span-4 text-xs font-bold uppercase text-[#2C1E16]"
                >
                  Пн — Ср
                </div>
                <div className="col-span-8 text-xs text-[#2C1E16]/80 leading-relaxed">
                  <strong className="text-[#2C1E16] block mb-0.5">
                    Принимаем заявки
                  </strong>
                  Формируем план обжарки по сортам. Мастерская открыта с 8:00 до
                  20:00.
                </div>
              </div>

              <div className="grid grid-cols-12 gap-4 border-b border-[#2C1E16]/10 pb-4">
                <div
                  style={{ fontFamily: 'var(--font-mono), monospace' }}
                  className="col-span-4 text-xs font-bold uppercase text-[#2C1E16]"
                >
                  Четверг
                </div>
                <div className="col-span-8 text-xs text-[#2C1E16]/80 leading-relaxed">
                  <strong className="text-[#2C1E16] block mb-0.5">
                    День обжарки (партии по 5 кг)
                  </strong>
                  Жарим свежее зерно, проверяем профиль и фасуем в пачки с
                  дегазационным клапаном.
                </div>
              </div>

              <div className="grid grid-cols-12 gap-4">
                <div
                  style={{ fontFamily: 'var(--font-mono), monospace' }}
                  className="col-span-4 text-xs font-bold uppercase text-[#2C1E16]"
                >
                  Пятница
                </div>
                <div className="col-span-8 text-xs text-[#2C1E16]/80 leading-relaxed">
                  <strong className="text-[#2C1E16] block mb-0.5">
                    Помол и развозка
                  </strong>
                  Мелем пачки под ваш способ и бесплатно развозим по Минску
                  заказы от 50 BYN.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="reviews" className="py-20 border-b border-[#2C1E16]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#2C1E16]/10 pb-6">
            <div>
              <span
                style={{ fontFamily: 'var(--font-mono), monospace' }}
                className="text-xs uppercase text-[#2C1E16]/70 font-bold"
              >
                [04] ОБРАТНАЯ СВЯЗЬ ПОСЛЕ ПЯТНИЧНЫХ РАЗВОЗОК
              </span>
              <h2
                style={{ fontFamily: 'var(--font-display), sans-serif' }}
                className="text-2xl sm:text-4xl font-black text-[#2C1E16] uppercase mt-1"
              >
                ЧТО ПИШУТ НАМ В ПЯТНИЦУ
              </h2>
            </div>
            <span
              style={{ fontFamily: 'var(--font-mono), monospace' }}
              className="text-xs text-[#2C1E16]/80"
            >
              Из сообщений в Instagram и Telegram мастерской
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CUSTOMER_NOTES.map((item) => (
              <div
                key={item.id}
                className="bg-[#FFFFFF] border border-[#2C1E16]/10 p-6 flex flex-col justify-between space-y-5"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-3 border-b border-[#2C1E16]/10 pb-3">
                    <img
                      src={item.photo}
                      alt={item.name}
                      loading="lazy"
                      className="w-12 h-12 object-cover border border-[#2C1E16]/10 rounded-full"
                    />
                    <div>
                      <div className="font-bold text-sm text-[#2C1E16]">
                        {item.name}
                      </div>
                      <div
                        style={{ fontFamily: 'var(--font-mono), monospace' }}
                        className="text-[10px] text-[#2C1E16]/70 uppercase"
                      >
                        {item.context}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-[#2C1E16] leading-relaxed">
                    «{item.message}»
                  </p>
                </div>

                <div
                  style={{ fontFamily: 'var(--font-mono), monospace' }}
                  className="bg-[#F4EFEA]/80 p-3 text-[11px] text-[#2C1E16]/90 border-l-2 border-[#2C1E16]"
                >
                  <strong className="text-[#2C1E16] block">Ответ Кварты:</strong>
                  {item.reply}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="delivery"
        className="py-20 bg-[#F4EFEA] border-b border-[#2C1E16]/10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-[#FDFBF7] border border-[#2C1E16]/10 p-6 sm:p-8 space-y-5">
            <PhotoCard
              poster="https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=1200&auto=format&fit=crop"
              alt="Самовывоз из мастерской Кварта"
              className="h-60 border border-[#2C1E16]/10"
            />
            <div className="space-y-3">
              <div
                style={{ fontFamily: 'var(--font-mono), monospace' }}
                className="flex items-center justify-between text-xs font-bold uppercase text-[#2C1E16]"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>[05] САМОВЫВОЗ ИЗ МАСТЕРСКОЙ</span>
                </div>
                <a
                  href="https://yandex.by/maps/?text=Минск+улица+Короля+9"
                  target="_blank"
                  rel="noreferrer"
                  className="underline text-[#2C1E16]/80 hover:text-[#2C1E16] flex items-center gap-1"
                >
                  <span>На карте</span>
                  <Navigation className="w-3 h-3" />
                </a>
              </div>
              <h3
                style={{ fontFamily: 'var(--font-display), sans-serif' }}
                className="text-xl sm:text-2xl font-black text-[#2C1E16] uppercase"
              >
                Минск, ул. Короля, 9
              </h3>
              <p className="text-xs text-[#2C1E16]/90 leading-relaxed">
                Заходите познакомиться лично: поможем выбрать сорт по вкусу,
                смелем пачку при вас и нальём свежий фильтр.
              </p>
              <div
                style={{ fontFamily: 'var(--font-mono), monospace' }}
                className="inline-flex items-center gap-2 text-xs text-[#2C1E16] font-bold pt-1"
              >
                <Clock className="w-4 h-4 text-[#2C1E16]/70" />
                Пн–Пт: 8:00–20:00 | Сб–Вс: 10:00–18:00
              </div>
            </div>
          </div>

          <div className="bg-[#FDFBF7] border border-[#2C1E16]/10 p-6 sm:p-8 space-y-5">
            <PhotoCard
              poster="https://images.unsplash.com/photo-1526367790999-0150786686a2?q=80&w=1200&auto=format&fit=crop"
              alt="Пятничная доставка по Минску"
              className="h-60 border border-[#2C1E16]/10"
            />
            <div className="space-y-3">
              <div
                style={{ fontFamily: 'var(--font-mono), monospace' }}
                className="flex items-center gap-2 text-xs font-bold uppercase text-[#2C1E16]"
              >
                <Truck className="w-4 h-4" />
                <span>КУРЬЕРСКАЯ РАЗВОЗКА</span>
              </div>
              <h3
                style={{ fontFamily: 'var(--font-display), sans-serif' }}
                className="text-xl sm:text-2xl font-black text-[#2C1E16] uppercase"
              >
                Доставка по Минску в пятницу
              </h3>
              <p className="text-xs text-[#2C1E16]/90 leading-relaxed">
                Развозим свежую четверговую обжарку каждую пятницу домой и в
                офисы. При заказе от 50 BYN или подписке доставка бесплатная.
              </p>
              <div
                style={{ fontFamily: 'var(--font-mono), monospace' }}
                className="text-xs text-[#2C1E16] font-bold pt-1"
              >
                ✓ Оплата при получении (наличными или картой курьеру)
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="order-form" className="py-20 bg-[#FDFBF7]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="bg-[#2C1E16] text-[#FDFBF7] p-6 sm:p-12 space-y-8">
            <div className="space-y-2 border-b border-white/10 pb-6">
              <span
                style={{ fontFamily: 'var(--font-mono), monospace' }}
                className="text-xs uppercase text-[#FDFBF7]/70 font-bold"
              >
                ОФОРМЛЕНИЕ ЗАЯВКИ БЕЗ ПРЕДОПЛАТЫ
              </span>
              <h2
                style={{ fontFamily: 'var(--font-display), sans-serif' }}
                className="text-2xl sm:text-3xl font-black uppercase"
              >
                ОФОРМИТЬ ЗАКАЗ
              </h2>
              <p className="text-xs text-[#FDFBF7]/90 leading-relaxed">
                Оставьте имя и белорусский номер телефона. Аня или Дмитрий
                перезвонят, чтобы согласовать пятничную доставку по Минску или
                самовывоз.
              </p>
            </div>

            <AnimatePresence>
              {orderItems.length > 0 && !successMsg && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-[#1A120D] p-4 sm:p-5 space-y-4"
                >
                  <div
                    style={{ fontFamily: 'var(--font-mono), monospace' }}
                    className="flex items-center justify-between text-[11px] uppercase text-[#FDFBF7]/80"
                  >
                    <span>Состав вашей заявки:</span>
                    <span>
                      {isFreeDelivery ? (
                        <span className="text-white font-bold">
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
                        className="flex items-center justify-between gap-3 bg-[#2C1E16] px-3.5 py-2.5 border border-white/5 text-xs"
                      >
                        <div className="min-w-0">
                          <div className="font-bold text-white truncate">
                            {item.name}
                          </div>
                          <div
                            style={{ fontFamily: 'var(--font-mono), monospace' }}
                            className="text-[11px] text-[#FDFBF7]/70"
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
                            className="w-7 h-7 bg-[#1A120D] hover:bg-[#FDFBF7] text-white hover:text-[#2C1E16] flex items-center justify-center transition cursor-pointer"
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
                            className="w-7 h-7 bg-[#1A120D] hover:bg-[#FDFBF7] text-white hover:text-[#2C1E16] flex items-center justify-center transition cursor-pointer"
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
                    <span className="text-[#FDFBF7]/90">Итого к заказу:</span>
                    <span className="font-bold text-base text-white">
                      {totalPrice} BYN
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {successMsg ? (
              <div className="bg-[#1A120D] border border-[#FDFBF7]/20 text-[#FDFBF7] p-8 text-center space-y-4">
                <Check className="w-10 h-10 text-white mx-auto" />
                <h3
                  style={{ fontFamily: 'var(--font-display), sans-serif' }}
                  className="font-black text-lg uppercase text-white"
                >
                  Заявка принята!
                </h3>
                <p
                  style={{ fontFamily: 'var(--font-mono), monospace' }}
                  className="text-xs leading-relaxed text-white/90"
                >
                  {successMsg}
                </p>
                <button
                  type="button"
                  onClick={() => setSuccessMsg('')}
                  style={{ fontFamily: 'var(--font-mono), monospace' }}
                  className="bg-[#FDFBF7] text-[#2C1E16] text-xs font-bold uppercase px-6 py-3 hover:bg-white transition cursor-pointer"
                >
                  Оформить ещё одну заявку
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label
                    style={{ fontFamily: 'var(--font-mono), monospace' }}
                    className="block text-[11px] uppercase text-[#FDFBF7]/80"
                  >
                    Тип обращения
                  </label>
                  <select
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    style={{ fontFamily: 'var(--font-mono), monospace' }}
                    className="w-full bg-[#1A120D] border border-white/10 px-4 py-3.5 text-xs text-white focus:outline-none focus:border-white transition"
                  >
                    <option value="Разовый заказ">Разовый заказ кофе</option>
                    <option value="Подписка">
                      Подписка на месяц (49 BYN / 2 пачки)
                    </option>
                    <option value="Вопрос">Вопрос по зерну или помолу</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label
                      style={{ fontFamily: 'var(--font-mono), monospace' }}
                      className="block text-[11px] uppercase text-[#FDFBF7]/80"
                    >
                      Ваше имя *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-white/50 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        required
                        maxLength={50}
                        placeholder="Алексей"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={{ fontFamily: 'var(--font-mono), monospace' }}
                        className="w-full bg-[#1A120D] border border-white/10 pl-10 pr-4 py-3.5 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-white transition"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label
                      style={{ fontFamily: 'var(--font-mono), monospace' }}
                      className="block text-[11px] uppercase text-[#FDFBF7]/80"
                    >
                      Белорусский номер *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-white/50 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                        className="w-full bg-[#1A120D] border border-white/10 pl-10 pr-4 py-3.5 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-white transition"
                      />
                    </div>
                  </div>
                </div>

                <span
                  style={{ fontFamily: 'var(--font-mono), monospace' }}
                  className="text-[10px] text-[#FDFBF7]/60 block -mt-2"
                >
                  Коды операторов РБ: 29, 33, 44, 25, 17 (принимаются форматы
                  +375 и 80).
                </span>

                <div className="space-y-2">
                  <label
                    style={{ fontFamily: 'var(--font-mono), monospace' }}
                    className="block text-[11px] uppercase text-[#FDFBF7]/80"
                  >
                    Адрес доставки или комментарий (необязательно)
                  </label>
                  <div className="relative">
                    <MessageSquare className="w-4 h-4 text-white/50 absolute left-3.5 top-3.5 pointer-events-none" />
                    <textarea
                      rows={3}
                      maxLength={500}
                      placeholder="Улица и дом для курьера в пятницу, либо напишите «самовывоз»..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      style={{ fontFamily: 'var(--font-mono), monospace' }}
                      className="w-full bg-[#1A120D] border border-white/10 pl-10 pr-4 py-3 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-white transition"
                    />
                  </div>
                </div>

                {error && (
                  <div
                    role="alert"
                    style={{ fontFamily: 'var(--font-mono), monospace' }}
                    className="bg-red-950/60 border border-red-500/50 text-red-300 p-4 text-xs flex items-start gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <div className="font-bold text-red-200">Не получилось отправить</div>
                      <div className="text-[11px] text-red-300/90">
                        {error}
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    style={{ fontFamily: 'var(--font-mono), monospace' }}
                    className="w-full bg-[#FDFBF7] hover:bg-white text-[#2C1E16] font-bold text-xs uppercase tracking-wider py-4 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {loading
                      ? 'Отправляем заявку...'
                      : totalPrice > 0
                      ? `Оформить заказ • ${totalPrice} BYN`
                      : 'Оформить заказ'}
                  </button>
                  <div className="text-center mt-4">
                    <span
                      style={{ fontFamily: 'var(--font-mono), monospace' }}
                      className="text-[10px] text-[#FDFBF7]/70 uppercase font-medium"
                    >
                      Нажимая кнопку, вы даете согласие на обработку персональных данных
                    </span>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      <footer
        style={{ fontFamily: 'var(--font-mono), monospace' }}
        className="border-t border-[#2C1E16]/10 bg-[#F4EFEA] py-10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-xs text-[#2C1E16]/80">
          <div className="space-y-2">
            <div className="font-bold text-[#2C1E16] uppercase">
              ОБЖАРКА «КВАРТА»
            </div>
            <div>Минск, ул. Короля, 9 (Пн–Пт 8:00–20:00, Сб–Вс 10:00–18:00)</div>
            <div className="text-[10px] text-[#2C1E16]/60">
              Демо-проект • Референсные данные обжарки
            </div>
          </div>
          <div className="text-left md:text-right">
            <div className="mb-1">Телефон для связи (демо):</div>
            <a
              href="tel:+375296841122"
              className="font-bold text-lg text-[#2C1E16] hover:underline"
            >
              +375 (29) 684-11-22
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}