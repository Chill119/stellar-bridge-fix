import { useState, useCallback, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { connectEthereumWallet, getEthereumWalletState, EthereumWalletState } from "@/services/ethereumWallet";

export function useEthereumWallet() {
  const [walletState, setWalletState] = useState<EthereumWalletState>({
    isConnected: false,
    address: null,
    chainId: null,
    chainName: null,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Check initial wallet state
  useEffect(() => {
    const checkWallet = async () => {
      const state = await getEthereumWalletState();
      setWalletState(state);
    };
    checkWallet();

    // Listen for account changes
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      const ethereum = (window as any).ethereum;
      
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          setWalletState({
            isConnected: false,
            address: null,
            chainId: null,
            chainName: null,
          });
        } else {
          checkWallet();
        }
      };

      const handleChainChanged = () => {
        checkWallet();
      };

      ethereum.on('accountsChanged', handleAccountsChanged);
      ethereum.on('chainChanged', handleChainChanged);

      return () => {
        ethereum.removeListener('accountsChanged', handleAccountsChanged);
        ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  const connect = useCallback(async () => {
    setIsLoading(true);
    try {
      window.focus(); // Help prevent popup blockers
      
      const result = await connectEthereumWallet();
      
      setWalletState({
        isConnected: true,
        address: result.address,
        chainId: result.chainId,
        chainName: result.chainName,
      });

      toast({
        title: "Wallet connected",
        description: `Connected to ${result.chainName}`,
      });

      return result;
    } catch (error) {
      toast({
        title: "Connection failed",
        description: error instanceof Error ? error.message : "Failed to connect wallet",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    const state = await getEthereumWalletState();
    setWalletState(state);
  }, []);

  return {
    walletState,
    isLoading,
    connect,
    refresh,
  };
}
