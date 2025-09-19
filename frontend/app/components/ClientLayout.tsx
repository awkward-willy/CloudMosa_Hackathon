'use client';

import { ReactNode } from 'react';

import KeyboardHandler from './KeyboardHandler';
import Navigation from './Navigation';
import { NavigationProvider } from './NavigationContext';

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <NavigationProvider>
      <KeyboardHandler />
      <div className="min-h-screen pb-6">{children}</div>
      <Navigation />
    </NavigationProvider>
  );
}
