"use client";

import { useState } from "react";
import { connectWallet } from "../../lib/wallet";

export default function ProfilePage() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [form, setForm] = useState({
    company: "",
    region: "",
    marketplaces: "",
    contact: "",
    email: "",
    privacy: "public",
  });

  const handleConnect = async () => {
    const { userAddress } = await connectWallet();
    setWalletAddress(userAddress);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

    const handleSubmit = (e) => {
    e.preventDefault();

    if (!walletAddress) {
      alert("Сначала подключите MetaMask.");
      return;
    }

    const key = `prodi-profile-${walletAddress.toLowerCase()}`;
    localStorage.setItem(key, JSON.stringify(form));

    // 🔥 Добавим в общий список кошельков
    const all = JSON.parse(localStorage.getItem("prodi-all-profiles") || "[]");
    if (!all.includes(walletAddress.toLowerCase())) {
      all.push(walletAddress.toLowerCase());
      localStorage.setItem("prodi-all-profiles", JSON.stringify(all));
    }

    alert("✅ Профиль сохранён!");
    window.location.href = `/company/${walletAddress.toLowerCase()}`;
  };

  return (
    <main className="min-h-screen bg-white text-gray-900 font-sans px-6 py-12">
      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">👤 Профиль участника Prodi</h1>

        {!walletAddress ? (
          <button
            onClick={handleConnect}
            className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 mb-6"
          >
            🔐 Подключить MetaMask
          </button>
        ) : (
          <p className="text-green-600 mb-6">
            ✅ Кошелёк подключён: {walletAddress}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-semibold">Название компании</label>
            <input
              name="company"
              value={form.company}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            />
          </div>

          <div>
            <label className="block font-semibold">Регион / Город</label>
            <input
              name="region"
              value={form.region}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            />
          </div>

          <div>
            <label className="block font-semibold">Маркетплейсы (через запятую)</label>
            <input
              name="marketplaces"
              value={form.marketplaces}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block font-semibold">Контактное лицо</label>
            <input
              name="contact"
              value={form.contact}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block font-semibold">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block font-semibold">Приватность профиля</label>
            <select
              name="privacy"
              value={form.privacy}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            >
              <option value="public">Публичный</option>
              <option value="private">Приватный</option>
              <option value="custom">По запросу</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded hover:bg-gray-800"
          >
            📩 Сохранить профиль
          </button>
        </form>
      </div>
    </main>
  );
}
