import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'Кварта — Свежая обжарка кофе в Минске',
  description: 'Маленькая минская обжарочная бывших бариста Ани и Дмитрия. Жарим по четвергам, развозим в пятницу.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased bg-[#E5DBCB] text-[#2C221E]">
        {children}
      </body>
    </html>
  );
}