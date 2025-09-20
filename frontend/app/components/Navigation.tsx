'use client';

import { useNavigation } from './NavigationContext';

export default function Navigation() {
  const { leftHighlighted, rightHighlighted } = useNavigation();

  return (
    <div className="fixed right-0 bottom-0 left-0 z-50 flex items-center justify-between bg-gray-800 px-2 py-1 text-xs text-white">
      <div
        className={`flex items-center rounded px-1 transition-colors duration-200 ${leftHighlighted ? 'bg-yellow-500 text-black' : 'bg-transparent'}`}
      >
        <span style={{ marginLeft: '10px', fontSize: '20px' }}>≡</span>
      </div>

      <div
        className={`flex items-center rounded px-1 transition-colors duration-200  ${rightHighlighted ? 'bg-yellow-500 text-black' : 'bg-transparent'}`}
      >
        <span style={{ marginRight: '10px' }}>❬</span>
      </div>
    </div>
  );
}
