// lib/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  { global: { headers: {} } }
);

// Проставляем заголовок для RLS (если будем ужесточать политики)
export function setProdiWalletHeader(wallet) {
  try {
    if (wallet) supabase.headers["x-prodi-wallet"] = String(wallet);
  } catch {}
}
