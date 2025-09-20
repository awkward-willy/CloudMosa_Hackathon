'use client';

import { useEffect } from 'react';

import { useNavigation } from './NavigationContext';

export default function KeyboardHandler() {
  const {
    // visual highlights
    highlightLeft,
    highlightRight,
    highlightCenter,
    highlightUp,
    highlightDown,
    highlightLeftKey,
    highlightRightKey,
    // nav behavior
    isNavOpen,
    toggleNav,
    moveSelectionUp,
    moveSelectionDown,
    selectCurrent,
  } = useNavigation();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key;

      // Always visualize key press
      switch (key) {
        case 'Escape':
          highlightLeft();
          break;
        case 'F12':
          highlightRight();
          break;
        case 'Enter':
          highlightCenter();
          break;
        case 'ArrowUp':
          highlightUp();
          break;
        case 'ArrowDown':
          highlightDown();
          break;
        case 'ArrowLeft':
          highlightLeftKey();
          break;
        case 'ArrowRight':
          highlightRightKey();
          break;
      }

      // Behavior: handle only certain keys globally
      const controlKeys = ['Escape', 'F12', 'Enter', 'ArrowUp', 'ArrowDown'];
      if (!controlKeys.includes(key)) return;

      if (key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        // Toggle NavBar open/close
        toggleNav();
        return;
      }

      // When nav is open, Up/Down/Enter are captured for menu navigation
      if (isNavOpen) {
        if (key === 'ArrowUp') {
          event.preventDefault();
          event.stopPropagation();
          moveSelectionUp();
          return;
        }
        if (key === 'ArrowDown') {
          event.preventDefault();
          event.stopPropagation();
          moveSelectionDown();
          return;
        }
        if (key === 'Enter') {
          event.preventDefault();
          event.stopPropagation();
          selectCurrent();
          return;
        }
      } else {
        // When nav is closed, let ArrowUp/Down bubble to page interactions
        if (key === 'Enter') {
          // Likely triggers default action; do not block globally
          return;
        }
        // F12 is often DevTools; avoid blocking unless you want to repurpose it
        if (key === 'F12') {
          return;
        }
      }
    };

    const handleKeyUp = (_event: KeyboardEvent) => {
      // no-op; visual highlight reset handled via timeouts
    };

    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('keyup', handleKeyUp, true);

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('keyup', handleKeyUp, true);
    };
  }, [
    highlightLeft,
    highlightRight,
    highlightCenter,
    highlightUp,
    highlightDown,
    highlightLeftKey,
    highlightRightKey,
    isNavOpen,
    toggleNav,
    moveSelectionUp,
    moveSelectionDown,
    selectCurrent,
  ]);

  return null;
}
