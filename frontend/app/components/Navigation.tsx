'use client';

import { useNavigation } from './NavigationContext';

export default function Navigation() {
  const { leftHighlighted, rightHighlighted, centerHighlighted } = useNavigation();

  return (
    <div className="fixed right-0 bottom-0 left-0 z-50 flex items-center justify-between bg-gray-800 px-2 py-1 text-xs text-white">
      <div
        className={`flex items-center rounded px-1 transition-colors duration-200 ${leftHighlighted ? 'bg-yellow-500 text-black' : 'bg-transparent'}`}
      >
        <span className="font-bold">L:</span>
        <span className="ml-1">SL</span>
      </div>
      <div
        className={`flex items-center rounded px-1 transition-colors duration-200 ${centerHighlighted ? 'bg-yellow-500 text-black' : 'bg-transparent'}`}
      >
        <span className="font-bold">Enter</span>
      </div>
      <div
        className={`flex items-center rounded px-1 transition-colors duration-200 ${rightHighlighted ? 'bg-yellow-500 text-black' : 'bg-transparent'}`}
      >
        <span className="font-bold">R:</span>
        <span className="ml-1">SR</span>
      </div>
    </div>
  );
}
