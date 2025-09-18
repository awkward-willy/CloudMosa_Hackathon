'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { menuItems } from './routes';

interface NavigationContextType {
  leftHighlighted: boolean;
  rightHighlighted: boolean;
  centerHighlighted: boolean;
  upHighlighted: boolean;
  downHighlighted: boolean;
  leftKeyHighlighted: boolean;
  rightKeyHighlighted: boolean;
  // Navbar state
  isNavOpen: boolean;
  selectedIndex: number; // index in menuItems when nav open
  // actions
  highlightLeft: () => void;
  highlightRight: () => void;
  highlightCenter: () => void;
  highlightUp: () => void;
  highlightDown: () => void;
  highlightLeftKey: () => void;
  highlightRightKey: () => void;
  openNav: () => void;
  closeNav: () => void;
  toggleNav: () => void;
  moveSelectionUp: () => void;
  moveSelectionDown: () => void;
  selectCurrent: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [leftHighlighted, setLeftHighlighted] = useState(false);
  const [rightHighlighted, setRightHighlighted] = useState(false);
  const [centerHighlighted, setCenterHighlighted] = useState(false);
  const [upHighlighted, setUpHighlighted] = useState(false);
  const [downHighlighted, setDownHighlighted] = useState(false);
  const [leftKeyHighlighted, setLeftKeyHighlighted] = useState(false);
  const [rightKeyHighlighted, setRightKeyHighlighted] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();

  const highlightLeft = () => {
    setLeftHighlighted(true);
    setTimeout(() => setLeftHighlighted(false), 200);
  };

  const highlightRight = () => {
    setRightHighlighted(true);
    setTimeout(() => setRightHighlighted(false), 200);
  };

  const highlightCenter = () => {
    setCenterHighlighted(true);
    setTimeout(() => setCenterHighlighted(false), 200);
  };

  const highlightUp = () => {
    setUpHighlighted(true);
    setTimeout(() => setUpHighlighted(false), 200);
  };

  const highlightDown = () => {
    setDownHighlighted(true);
    setTimeout(() => setDownHighlighted(false), 200);
  };

  const highlightLeftKey = () => {
    setLeftKeyHighlighted(true);
    setTimeout(() => setLeftKeyHighlighted(false), 200);
  };

  const highlightRightKey = () => {
    setRightKeyHighlighted(true);
    setTimeout(() => setRightKeyHighlighted(false), 200);
  };

  const openNav = () => {
    setIsNavOpen(true);
  };
  const closeNav = () => {
    setIsNavOpen(false);
  };
  const toggleNav = () => {
    setIsNavOpen((v) => !v);
  };
  const moveSelectionUp = () => {
    setSelectedIndex((prev) => (prev - 1 + menuItems.length) % menuItems.length);
  };
  const moveSelectionDown = () => {
    setSelectedIndex((prev) => (prev + 1) % menuItems.length);
  };
  const selectCurrent = () => {
    const item = menuItems[selectedIndex];
    if (item) {
      router.push(item.url);
      setIsNavOpen(false);
    }
  };

  return (
    <NavigationContext.Provider value={{
      leftHighlighted,
      rightHighlighted,
      centerHighlighted,
      upHighlighted,
      downHighlighted,
      leftKeyHighlighted,
      rightKeyHighlighted,
      isNavOpen,
      selectedIndex,
      highlightLeft,
      highlightRight,
      highlightCenter,
      highlightUp,
      highlightDown,
      highlightLeftKey,
      highlightRightKey,
      openNav,
      closeNav,
      toggleNav,
      moveSelectionUp,
      moveSelectionDown,
      selectCurrent
    }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}