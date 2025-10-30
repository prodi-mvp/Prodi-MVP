"use client";

import {
  Connection,
  clusterApiUrl,
  PublicKey,
  Transaction,
  TransactionInstruction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";

/** devnet connection */
export function getConnection() {
  return new Connection(clusterApiUrl("devnet"), "confirmed");
}

/** Connect Phantom */
export async function connectPhantom() {
  if (typeof window === "undefined" || !window.solana) {
    throw new Error("Phantom not found. Install Phantom wallet.");
  }
  const p = window.solana;
  if (!p.isPhantom) throw new Error("Detected provider is not Phantom.");
  const r = await p.connect();
  return { provider: p, publicKey: r.publicKey?.toBase58() };
}

/** sha256 hex */
async function sha256Hex(text) {
  const data = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Record memo on devnet.
 * We SIGN in Phantom, but SEND via our devnet connection (to avoid network mismatch).
 */
export async function recordDealMemo({ dealId, initiator, partner, terms = {} }) {
  const p = window?.solana;
  if (!p?.isPhantom || !p.publicKey) throw new Error("Phantom wallet is not connected.");

  const connection = getConnection();
  const MEMO_PROGRAM_ID = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");

  const termsHash = await sha256Hex(JSON.stringify(terms));
  const memoPayload = {
    deal_id: dealId,
    initiator,
    partner,
    terms_hash: termsHash,
    ts: Math.floor(Date.now() / 1000),
  };
  const data = new TextEncoder().encode(JSON.stringify(memoPayload));

  const ix = new TransactionInstruction({
    keys: [],
    programId: MEMO_PROGRAM_ID,
    data,
  });

  const tx = new Transaction().add(ix);
  tx.feePayer = p.publicKey;
  const { blockhash } = await connection.getLatestBlockhash("finalized");
  tx.recentBlockhash = blockhash;

  // ✅ 1) только ПОДПИСЫВАЕМ в Phantom
  const signedTx = await p.signTransaction(tx);

  // ✅ 2) ОТПРАВЛЯЕМ мы сами в devnet
  const raw = signedTx.serialize();
  let sig;
try {
  // пропускаем preflight, чтобы не падать на "already been processed"
  sig = await connection.sendRawTransaction(raw, {
    skipPreflight: true,
    maxRetries: 2,
  });
} catch (e) {
  // если всё же словили "already been processed" — берём сигнатуру из ошибки (если есть) и продолжаем
  const msg = String(e?.message || "");
  if (!sig && /already been processed/i.test(msg) && e?.signature) {
    sig = e.signature;
  } else {
    throw e;
  }
}
await connection.confirmTransaction(sig, "confirmed");
return { signature: sig, termsHash };
}

/** Devnet airdrop helper */
export async function ensureAirdrop(publicKeyBase58, targetSol = 0.1) {
  const connection = getConnection();
  const pubkey = new PublicKey(publicKeyBase58);
  const bal = await connection.getBalance(pubkey);

  const target = Math.floor(targetSol * LAMPORTS_PER_SOL);
  if (bal >= target) return { ok: true, airdropped: 0, balanceLamports: bal };

  const need = target - bal;
  const req = Math.max(need, Math.floor(0.2 * LAMPORTS_PER_SOL));
  const sig = await connection.requestAirdrop(pubkey, req);
  await connection.confirmTransaction(sig, "confirmed");
  const newBal = await connection.getBalance(pubkey);
  return { ok: true, airdropped: newBal - bal, balanceLamports: newBal };
}

export const LAMPORTS = LAMPORTS_PER_SOL;

 