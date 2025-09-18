'use client';

import { useNavigation } from './NavigationContext';

export default function Keypad() {
  const { upHighlighted, downHighlighted, leftKeyHighlighted, rightKeyHighlighted } = useNavigation();

  return (
    <div className="mt-4 flex flex-col items-center space-y-1">
      <div className="flex justify-center">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded border border-gray-400 transition-colors duration-150 ${upHighlighted ? 'border-yellow-400 bg-yellow-400' : 'border-gray-400 bg-gray-100'}`}
        >
          <span className="text-xs font-bold">↑</span>
        </div>
      </div>

      <div className="flex space-x-1">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded border border-gray-400 transition-colors duration-150 ${leftKeyHighlighted ? 'border-yellow-400 bg-yellow-400' : 'border-gray-400 bg-gray-100'}`}
        >
          <span className="text-xs font-bold">←</span>
        </div>
        <div className="h-8 w-8"></div>
        <div
          className={`flex h-8 w-8 items-center justify-center rounded border border-gray-400 transition-colors duration-150 ${rightKeyHighlighted ? 'border-yellow-400 bg-yellow-400' : 'border-gray-400 bg-gray-100'}`}
        >
          <span className="text-xs font-bold">→</span>
        </div>
      </div>

      <div className="flex justify-center">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded border border-gray-400 transition-colors duration-150 ${downHighlighted ? 'border-yellow-400 bg-yellow-400' : 'border-gray-400 bg-gray-100'}`}
        >
          <span className="text-xs font-bold">↓</span>
        </div>
      </div>
    </div>
  );
}
