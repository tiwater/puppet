import Image from 'next/image';
import './globals.css';
import { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Lab | Penless',
  description: 'Try Penless Solutions',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html data-theme="night" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <div className="flex flex-col h-screen min-h-screen w-full items-center text-base-content">
          <div className="flex justify-center w-full max-w-7xl items-center justify-between h-12 p-2">
            <a href="/" className="flex gap-2 items-center">
              <Image
                priority
                alt="logo"
                src="/logo-full-white.png"
                height={32}
                width={96}
              />
              <div className="text-lg">Lab</div>
            </a>
            <a
              href="https://app.penless.ai/"
              target="_blank"
              className="text-md hover:text-primary"
            >
              Penless Platform
            </a>
          </div>
          {children}
        </div>
      </body>
    </html>
  );
}
