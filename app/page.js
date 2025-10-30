"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function HomePage() {
  const router = useRouter();
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("prodi-profile");
    if (saved) setHasProfile(true);
  }, []);

  const handleDealClick = () => {
    if (!hasProfile) {
      alert("Please create your profile first.");
      router.push("/profile");
    } else {
      router.push("/deal");
    }
  };

  return (
    <main className="min-h-screen bg-white text-gray-900 font-sans px-6 py-12">
      {/* Hero */}
      <section className="text-center max-w-3xl mx-auto">
        <h1 className="text-5xl font-bold mb-4">Prodi</h1>
        <p className="text-lg text-gray-700 mb-6">
          Web3 platform for B2B deals. Fix terms on-chain, protect territories and pricing, and build provable reputation.
        </p>

        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={handleDealClick}
            className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition"
          >
            📄 Create a Deal
          </button>

          <Link
            href="/profile"
            className="bg-gray-200 text-black px-6 py-3 rounded-lg hover:bg-gray-300 transition"
          >
            📝 Create profile
          </Link>
        </div>
      </section>

      {/* Who is it for */}
      <section className="mt-20 max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          Who needs Prodi?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 border rounded-xl bg-gray-50">
            <h3 className="text-xl font-bold mb-2">🔧 Manufacturers</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Territory & marketplace protection</li>
              <li>RRP / MAP control</li>
              <li>On-chain brand reputation</li>
              <li>Direct access to new distributors</li>
            </ul>
          </div>

          <div className="p-6 border rounded-xl bg-gray-50">
            <h3 className="text-xl font-bold mb-2">🚚 Distributors</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Clear guarantees from producers</li>
              <li>Exclusivity by region / channels</li>
              <li>History of reliable deals</li>
              <li>No unnecessary middlemen</li>
            </ul>
          </div>

          <div className="p-6 border rounded-xl bg-gray-50">
            <h3 className="text-xl font-bold mb-2">🏪 Retail</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Predictable margins</li>
              <li>Responsible suppliers</li>
              <li>Public brand reputation</li>
              <li>Ability to fix custom terms</li>
            </ul>
          </div>

          <div className="p-6 border rounded-xl bg-gray-50">
            <h3 className="text-xl font-bold mb-2">👁 Validators / Buyers</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Trusted brands & products</li>
              <li>Tokenized participation in the network</li>
              <li>Help build an honest Web3 economy</li>
            </ul>
          </div>
        </div>
      </section>

      <footer className="mt-24 text-center text-sm text-gray-500">
        Prodi © {new Date().getFullYear()}
      </footer>
    </main>
  );
}
