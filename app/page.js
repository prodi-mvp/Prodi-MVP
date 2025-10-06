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
      alert("Сначала нужно зарегистрироваться.");
      router.push("/profile");
    } else {
      router.push("/deal");
    }
  };

  return (
    <main className="min-h-screen bg-white text-gray-900 font-sans px-6 py-12">
      {/* Hero section */}
      <section className="text-center max-w-3xl mx-auto">
        <h1 className="text-5xl font-bold mb-4">Prodi</h1>
        <p className="text-xl text-gray-700 mb-6">
          Web3-платформа для B2B-сделок, где условия фиксируются в блокчейне Ethereum,
          который уже используют такие корпорации как Walmart и Sony.
          Вы можете регулировать уровень прозрачности условий для сторонних наблюдателей.
          Репутация вашего бизнеса будет захеширована на тысячелетия в блоках.  
          Стройте бизнес на века, выбирая только ответственных партнёров.
        </p>

        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={handleDealClick}
            className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition"
          >
            📄 Создать сделку
          </button>

          <Link
            href="/profile"
            className="bg-gray-200 text-black px-6 py-3 rounded-lg hover:bg-gray-300 transition"
          >
            📝 Зарегистрировать профиль
          </Link>
        </div>
      </section>

      {/* Целевая аудитория */}
      <section className="mt-20 max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          Кому и зачем нужен Prodi?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Производитель */}
          <div className="p-6 border rounded-xl bg-gray-50">
            <h3 className="text-xl font-bold mb-2">🔧 Производителям</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Защита регионалности ваших дилеров и фиксирование политики по маркетплейсам</li>
              <li>Контроль за РРЦ</li>
              <li>Репутация бренда - ваш капитал</li>
              <li>Прямой доступ к поиску новых дистрибуторов</li>
            </ul>
          </div>

          {/* Дистрибьютор */}
          <div className="p-6 border rounded-xl bg-gray-50">
            <h3 className="text-xl font-bold mb-2">🚚 Дистрибьюторам</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Прозрачные условия и гарантии производителя</li>
              <li>Защита эксклюзивов по регионам</li>
              <li>История надежности сделок</li>
              <li>Исключение лишних посредников</li>
            </ul>
          </div>

          {/* Розница */}
          <div className="p-6 border rounded-xl bg-gray-50">
            <h3 className="text-xl font-bold mb-2">🏪 Розничным компаниям</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Понятная маржинальность</li>
              <li>Ответственные поставщики</li>
              <li>Публичная репутация бренда</li>
              <li>Возможность фиксировать особые условия и гарантии</li>
            </ul>
          </div>

          {/* Потребитель */}
          <div className="p-6 border rounded-xl bg-gray-50">
            <h3 className="text-xl font-bold mb-2">👁 Потребителям и валидаторам</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Товары с проверенной репутацией</li>
              <li>Возможность получить токен prd в качестве доли владения системой построения ответственных продаж</li>
              <li>Формирование честной Web3-экономики будущего</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Ethereum блок */}
      <section className="mt-20 max-w-3xl mx-auto text-center">
        <h2 className="text-xl font-semibold mb-4">💠 Построено на Ethereum</h2>
        <p className="text-gray-700">
          Все сделки фиксируются через смарт-контракты в сети Ethereum и Polygon zkEVM.  
          Это значит — никто не сможет изменить условия задним числом,  
          а репутация — это цифровой след, а не табличка в Excel.
        </p>
        <img
          src="https://cryptologos.cc/logos/ethereum-eth-logo.png"
          alt="Ethereum Logo"
          className="w-12 h-12 mx-auto mt-4"
        />
      </section>

      {/* Футер */}
      <footer className="mt-24 text-center text-sm text-gray-500">
        Prodi © {new Date().getFullYear()} — B2B на доверии. Без посредников. Без демпинга.
      </footer>
    </main>
  );
}
