"use client";

import { useState, useEffect } from "react";
import { connectWallet } from "../../lib/wallet";
import { supabase } from "../../lib/supabase";

export default function ProfilePage() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [form, setForm] = useState({
    company: "",
    type: "producer",
    region: "",
    marketplaces: "",
    contact: "",
    email: "",
    website: "",
    logo: "",
    media: "",
    pitch: "",
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

  // ✅ Загружаем профиль из Supabase, если он есть
  useEffect(() => {
    const loadProfile = async () => {
      if (!walletAddress) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("wallet", walletAddress.toLowerCase())
        .single();

      if (error) {
        console.warn("Нет профиля или ошибка загрузки:", error.message);
      } else {
        setForm(data);
      }
    };

    loadProfile();
  }, [walletAddress]);

  // ✅ Отправляем профиль в Supabase
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!walletAddress) {
      alert("Сначала подключите MetaMask.");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .upsert([{ wallet: walletAddress.toLowerCase(), ...form }]);

    if (error) {
  alert("❌ Ошибка при сохранении в Supabase!");
  console.error("🧨 Supabase error details:", JSON.stringify(error, null, 2));
  return;
}

    alert("✅ Профиль сохранён!");
    window.location.href = `/company/${walletAddress.toLowerCase()}`;
  };

  return (
    <main className="min-h-screen bg-white px-6 py-12">
      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">👤 Профиль компании</h1>

        {!walletAddress ? (
          <button
            onClick={handleConnect}
            className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 mb-6"
          >
            🔐 Подключить MetaMask
          </button>
        ) : (
          <p className="text-green-600 mb-6">
            ✅ Кошелёк: {walletAddress}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block font-semibold">Название компании</label>
          <input name="company" value={form.company} onChange={handleChange} className="w-full border p-2 rounded" required />

          <label className="block font-semibold">Тип компании</label>
          <select name="type" value={form.type} onChange={handleChange} className="w-full border p-2 rounded">
            <option value="producer">Производитель</option>
            <option value="distributor">Дистрибьютор</option>
            <option value="retail">Розничная компания</option>
            <option value="agent">Строительная компания</option>
          </select>

          <label className="block font-semibold">Регион / Город</label>
          <input name="region" value={form.region} onChange={handleChange} className="w-full border p-2 rounded" required />

          <label className="block font-semibold">Маркетплейсы</label>
          <input name="marketplaces" value={form.marketplaces} onChange={handleChange} className="w-full border p-2 rounded" />

          <label className="block font-semibold">Контактное лицо</label>
          <input name="contact" value={form.contact} onChange={handleChange} className="w-full border p-2 rounded" required />

          <label className="block font-semibold">Email</label>
          <input name="email" value={form.email} onChange={handleChange} className="w-full border p-2 rounded" required />

          <label className="block font-semibold">Сайт компании</label>
          <input name="website" value={form.website} onChange={handleChange} className="w-full border p-2 rounded" />

          <label className="block font-semibold">Логотип (URL)</label>
          <input name="logo" value={form.logo} onChange={handleChange} className="w-full border p-2 rounded" />

          <label className="block font-semibold">Медиа (YouTube / ссылка)</label>
          <input name="media" value={form.media} onChange={handleChange} className="w-full border p-2 rounded" />

          <label className="block font-semibold">Описание / презентация</label>
          <textarea name="pitch" value={form.pitch} onChange={handleChange} className="w-full border p-2 rounded" rows={4} />

          <label className="block font-semibold">Приватность профиля</label>
          <select name="privacy" value={form.privacy} onChange={handleChange} className="w-full border p-2 rounded">
            <option value="public">Публичный</option>
            <option value="private">Приватный</option>
            <option value="custom">По запросу</option>
          </select>

          <button type="submit" className="w-full bg-black text-white py-2 rounded hover:bg-gray-800">
            📩 Сохранить профиль
          </button>
        </form>
      </div>
    </main>
  );
}
