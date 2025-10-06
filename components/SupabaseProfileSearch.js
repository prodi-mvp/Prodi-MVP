"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import Link from "next/link";

export default function SupabaseProfileSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
    const fetchProfiles = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Ошибка загрузки профилей:", error.message);
      } else {
        setResults(data || []);
      }
    };

    fetchProfiles();
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
    <div className="my-8">
      <h2 className="text-xl font-semibold mb-2">🔍 Найти партнёра</h2>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Введите название, регион или email"
        className="w-full border p-2 rounded mb-4"
      />

      {query && (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {filtered.length > 0 ? (
            filtered.map((p) => (
              <div
                key={p.wallet}
                className="border p-3 rounded flex justify-between items-center"
              >
                <div>
                  <p className="font-bold">{p.company}</p>
                  <p className="text-sm text-gray-600">
                    {p.email} • {p.region}
                  </p>
                </div>
                <Link
                  href={`/company/${p.wallet}`}
                  className="text-blue-600 hover:underline"
                >
                  Посмотреть профиль
                </Link>
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
