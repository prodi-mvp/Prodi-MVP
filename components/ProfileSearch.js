"use client";

import { useState, useEffect } from "react";

export default function ProfileSearchDeal({ onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
    const all = JSON.parse(localStorage.getItem("prodi-all-profiles") || "[]");
    const found = all
      .map((wallet) => {
        const raw = localStorage.getItem("prodi-profile-" + wallet);
        if (!raw) return null;
        try {
          const profile = JSON.parse(raw);
          return profile ? { wallet, ...profile } : null;
        } catch (e) {
          return null;
        }
      })
      .filter(Boolean);
    setResults(found);
  }, []);

  const filtered = results.filter((p) => {
    const q = query.toLowerCase();
    return (
      p.company?.toLowerCase().includes(q) ||
      p.region?.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="mb-8">
      <label className="block font-semibold mb-2">🔍 Найти компанию для сделки</label>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Введите название, регион, email"
        className="w-full border p-2 rounded mb-4"
      />

      {query && (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {filtered.length > 0 ? (
            filtered.map((p) => (
              <div
                key={p.wallet}
                onClick={() => {
                  onSelect(p);
                  setQuery("");
                }}
                className="cursor-pointer border p-3 rounded hover:bg-gray-100"
              >
                <p className="font-bold">{p.company}</p>
                <p className="text-sm text-gray-600">{p.email} • {p.region}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">Нет совпадений</p>
          )}
        </div>
      )}
    </div>
  );
}
