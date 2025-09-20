export default function Page() {
  return (
    <main className="flex flex-1 flex-col items-center justify-start w-full space-y-6">
      {/* Overview Section */}
      <section className="w-full">
        <h2 className="text-lg font-bold text-gray-800 mb-2 text-left">Overview</h2>
        <hr className="border-t border-gray-300 mb-2" />
        <p className="text-base text-gray-600 text-left">
          CoinMind is a lightweight finance app designed to help you track expenses,
          manage assets, and build smarter money habits—anytime, anywhere!
        </p>
      </section>

      {/* Tips Section */}
      <section className="w-full">
        <h2 className="text-lg font-bold text-gray-800 mb-2 text-left">Tips</h2>
        <hr className="border-t border-gray-300 mb-2" />
        <p className="text-base text-gray-600 text-left">
          Update your records regularly, add notes for clarity, and use the analysis tools to understand your money flow. 
          Remember—small steps lead to smarter habits.
        </p>
      </section>

      {/* Disclaimer Section */}
      <section className="w-full">
        <h2 className="text-lg font-bold text-gray-800 mb-2 text-left">Disclaimer</h2>
        <hr className="border-t border-gray-300 mb-2" />
        <p className="text-base text-gray-600 text-left">
          All info from CoinMind is for reference. Please verify and decide at your own risk.
        </p>
      </section>

      {/* Our Teams Section */}
      <section className="w-full">
        <h2 className="text-lg font-bold text-gray-800 mb-2 text-left">Our Teams</h2>
        <hr className="border-t border-gray-300 mb-2" />
        <p className="text-base text-gray-600 text-left mb-2">
          Cup Soup — Small team, big passion:
        </p>
        <ul className="list-disc list-inside text-base text-gray-600 space-y-1 text-left">
          <li><span className="font-medium">EllaChang</span>: LLM Research & Content</li>
          <li><span className="font-medium">Kiri487</span>: UI Design</li>
          <li><span className="font-medium">SiriusKoan</span>: Backend Development</li>
          <li><span className="font-medium">Willy_awkward</span>: Frontend Development</li>
        </ul>
      </section>

      {/* Contact Section */}
      <section className="w-full">
        <h2 className="text-lg font-bold text-gray-800 mb-2 text-left">Contact Us</h2>
        <hr className="border-t border-gray-300 mb-2" />
        <p className="text-base text-gray-600 text-left">willy1118t@gmail.com</p>
      </section>

      {/* Version Info Section */}
      <section className="w-full">
        <h2 className="text-lg font-bold text-gray-800 mb-2 text-left">Version Info</h2>
        <hr className="border-t border-gray-300 mb-2" />
        <p className="text-base text-gray-600 text-left">v0.1.0 Demo</p>
      </section>

      {/* Acknowledgments Section */}
      <section className="w-full">
        <h2 className="text-lg font-bold text-gray-800 mb-2 text-left">Acknowledgments</h2>
        <hr className="border-t border-gray-300 mb-2" />
        <p className="text-base text-gray-600 text-left">CloudMosa</p>
      </section>
    </main>
  );
}