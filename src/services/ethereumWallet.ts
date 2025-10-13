export interface EthereumWalletState {
  isConnected: boolean;
  address: string | null;
  chainId: string | null;
  chainName: string | null;
}

export class EthereumWalletError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EthereumWalletError";
  }
}

const CHAIN_NAMES: Record<string, string> = {
  "0x1": "Ethereum Mainnet",
  "0x89": "Polygon Mainnet",
  "0xaa36a7": "Sepolia Testnet",
  "0x5": "Goerli Testnet",
};

export async function checkEthereumWallet(): Promise<boolean> {
  if (typeof window === 'undefined') {
    return false;
  }

  const ethereum = (window as any).ethereum;
  return !!ethereum;
}

export async function connectEthereumWallet(): Promise<{
  address: string;
  chainId: string;
  chainName: string;
}> {
  if (!await checkEthereumWallet()) {
    throw new EthereumWalletError(
      "MetaMask or compatible Ethereum wallet not detected. Please install MetaMask."
    );
  }

  const ethereum = (window as any).ethereum;

  try {
    // Request account access
    const accounts = await ethereum.request({
      method: 'eth_requestAccounts',
    });

    if (!accounts || accounts.length === 0) {
      throw new EthereumWalletError("No accounts found");
    }

    // Get chain ID
    const chainId = await ethereum.request({
      method: 'eth_chainId',
    });

    return {
      address: accounts[0],
      chainId,
      chainName: CHAIN_NAMES[chainId] || `Chain ${chainId}`,
    };
  } catch (error: any) {
    if (error.code === 4001) {
      throw new EthereumWalletError("User rejected the connection request");
    }
    throw new EthereumWalletError(
      error.message || "Failed to connect to Ethereum wallet"
    );
  }
}

export async function getEthereumAddress(): Promise<string | null> {
  if (!await checkEthereumWallet()) {
    return null;
  }

  const ethereum = (window as any).ethereum;

  try {
    const accounts = await ethereum.request({
      method: 'eth_accounts',
    });

    return accounts && accounts.length > 0 ? accounts[0] : null;
  } catch (error) {
    console.error("Error getting Ethereum address:", error);
    return null;
  }
}

export async function getEthereumChainId(): Promise<string | null> {
  if (!await checkEthereumWallet()) {
    return null;
  }

  const ethereum = (window as any).ethereum;

  try {
    const chainId = await ethereum.request({
      method: 'eth_chainId',
    });

    return chainId;
  } catch (error) {
    console.error("Error getting chain ID:", error);
    return null;
  }
}

export async function getEthereumWalletState(): Promise<EthereumWalletState> {
  const hasWallet = await checkEthereumWallet();

  if (!hasWallet) {
    return {
      isConnected: false,
      address: null,
      chainId: null,
      chainName: null,
    };
  }

  const address = await getEthereumAddress();
  const chainId = await getEthereumChainId();

  return {
    isConnected: !!address,
    address,
    chainId,
    chainName: chainId ? CHAIN_NAMES[chainId] || `Chain ${chainId}` : null,
  };
}

export async function switchEthereumChain(chainId: string): Promise<void> {
  if (!await checkEthereumWallet()) {
    throw new EthereumWalletError("Ethereum wallet not detected");
  }

  const ethereum = (window as any).ethereum;

  try {
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId }],
    });
  } catch (error: any) {
    if (error.code === 4902) {
      throw new EthereumWalletError("Chain not added to wallet");
    }
    throw new EthereumWalletError(
      error.message || "Failed to switch chain"
    );
  }
}
