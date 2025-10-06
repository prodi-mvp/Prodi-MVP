"use client";

import ProfileSearchDeal from "../../components/ProfileSearchDeal";
import { useState } from "react";
import { connectWallet } from "../../lib/wallet";

export default function DealPage() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [error, setError] = useState(null);

  const handleConnect = async () => {
    try {
      const { userAddress } = await connectWallet();
      setWalletAddress(userAddress);
    } catch (err) {
      setError(err.message);
    }
  };

const [selectedPartner, setSelectedPartner] = useState(null);
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center p-4">
<ProfileSearchDeal onSelect={(p) => setSelectedPartner(p)} />
{selectedPartner && (
  <div className="mb-4 p-4 bg-green-100 border border-green-300 rounded">
    ✅ Вы выбрали: <strong>{selectedPartner.company}</strong> ({selectedPartner.email})
  </div>
)}

      <h1 className="text-2xl font-bold mb-6">Создание сделки</h1>

      {walletAddress ? (
        <p className="text-green-700 text-lg">
          ✅ Кошелёк подключён: {walletAddress}
        </p>
      ) : (
        <button
          onClick={handleConnect}
          className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800"
        >
          🔐 Подключить MetaMask
        </button>
      )}

      {error && <p className="text-red-600 mt-4">{error}</p>}

      {/* Форма сделки */}
      <form
        onSubmit={(e) => {
  e.preventDefault();
  if (!selectedPartner) {
    alert("Выберите компанию для сделки перед отправкой.");
    return;
  }
  const data = Object.fromEntries(new FormData(e.target));
  console.log("📦 Сделка с:", selectedPartner.wallet, data);
}}
        className="w-full max-w-md mt-10 bg-white p-6 rounded-xl shadow-md"
      >
        <h2 className="text-xl font-semibold mb-4">Форма сделки</h2>

        <label className="block mb-2">Маркетплейсы (через запятую):</label>
        <input name="marketplaces" className="w-full p-2 border rounded mb-4" />

        <label className="block mb-2">Регионы / Локации:</label>
        <input name="regions" className="w-full p-2 border rounded mb-4" />
        <p className="text-xs text-gray-500 mb-4">
          Можно указать город, ТЦ, страну. Добавьте "эксклюзивно", если важно.
        </p>

        <label className="block mb-2">Контроль за РРЦ:</label>
        <input name="rrc" className="w-full p-2 border rounded mb-4" />
        <p className="text-xs text-gray-500 mb-4">
          Укажите, на каких площадках поставщик обязан следить за ценой
        </p>

        <label className="block mb-2">Гарантии производителя:</label>
        <textarea name="guarantees" className="w-full p-2 border rounded mb-4" />

        <label className="block mb-2">Дополнительные условия:</label>
        <textarea name="custom" className="w-full p-2 border rounded mb-4" />

        <button
          type="submit"
          className="w-full bg-black text-white py-2 rounded hover:bg-gray-800"
        >
          📩 Отправить условия сделки
        </button>
      </form>
    </div>
  );
}
