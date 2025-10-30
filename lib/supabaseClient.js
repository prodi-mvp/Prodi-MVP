import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  { global: { headers: {} } }
);

export function setProdiWalletHeader(wallet) {
  try {
    supabase?.headers && (supabase.headers["x-prodi-wallet"] = String(wallet || ""));
  } catch {}
}
