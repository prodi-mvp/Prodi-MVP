import { ethers } from "ethers";

export const connectWallet = async () => {
  // Проверяем, что код выполняется в браузере
  if (typeof window === "undefined") {
    console.warn("⚠️ window is undefined — SSR render, skipping connect");
    return null;
  }

  // Проверяем, что MetaMask доступен
  if (!window.ethereum) {
    alert("🦊 MetaMask не найден. Установите расширение и обновите страницу.");
    return null;
  }

  try {
    // Запрашиваем доступ к аккаунтам
    await window.ethereum.request({ method: "eth_requestAccounts" });

    // Создаём провайдера и signer
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const userAddress = await signer.getAddress();

    console.log("✅ MetaMask подключен:", userAddress);
    return { provider, signer, userAddress };
  } catch (error) {
    console.error("❌ Ошибка при подключении MetaMask:", error);
    alert("Ошибка при подключении кошелька. Проверьте MetaMask.");
    return null;
  }
};
