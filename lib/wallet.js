import { ethers } from "ethers";

export const connectWallet = async () => {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask не найден. Установите расширение.");
  }

  await window.ethereum.request({ method: "eth_requestAccounts" });

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const userAddress = await signer.getAddress();

  return { provider, signer, userAddress };
};
