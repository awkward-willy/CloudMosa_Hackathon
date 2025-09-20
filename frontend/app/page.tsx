import Image from 'next/image';

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center space-y-4">
      <h4 className="font-bold text-gray-600">Keep Your Coins in Mind!</h4>
      {/* Logo */}
      <Image
        src="/logo-green-transparent.PNG"
        alt="CoinMind Logo"
        className="w-32 h-auto mb-2"
        width={128}
        height={128}
      />
    </main>
  );
}
