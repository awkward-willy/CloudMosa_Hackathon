import { Provider } from '@/components/ui/provider';

import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import ClientLayout from './components/ClientLayout';
import NavBar from './components/NavBar';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Feature Phone Demo',
  description: 'Demo website optimized for feature phones',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Provider>
          <ClientLayout>
            <div className="mx-auto flex min-h-screen flex-col items-center justify-center p-2 text-center">
              <NavBar />
              {children}
              <div className="h-8 w-full" />
            </div>
          </ClientLayout>
        </Provider>
      </body>
    </html>
  );
}