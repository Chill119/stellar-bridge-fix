import { useState, useEffect, useCallback } from "react";
import {
  FreighterWalletState,
  FreighterWalletError,
  getFreighterWalletState,
  signStellarTransaction,
  requestFreighterAccess,
} from "@/services/freighterWallet";
import { toast } from "sonner";

export function useFreighterWallet() {
  const [walletState, setWalletState] = useState<FreighterWalletState>({
    isConnected: false,
    isAllowed: false,
    address: null,
    network: null,
    networkPassphrase: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSigning, setIsSigning] = useState(false);

  // Check wallet state on mount and set up listeners
  useEffect(() => {
    let mounted = true;

    const checkWallet = async () => {
      try {
        const state = await getFreighterWalletState();
        if (mounted) {
          setWalletState(state);
        }
      } catch (error) {
        console.error("Failed to check wallet:", error);
        if (mounted) {
          setWalletState({
            isConnected: false,
            isAllowed: false,
            address: null,
            network: null,
            networkPassphrase: null,
          });
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    checkWallet();

    // Listen for account changes
    const handleAccountChange = () => {
      console.log("Freighter account changed");
      checkWallet();
    };

    // Listen for network changes
    const handleNetworkChange = () => {
      console.log("Freighter network changed");
      checkWallet();
    };

    // Note: Freighter doesn't have standard event listeners like MetaMask
    // You might need to poll or use other methods depending on Freighter's API

    return () => {
      mounted = false;
    };
  }, []);

  /**
   * Request access to Freighter wallet
   */
  const connect = useCallback(async () => {
    try {
      setIsLoading(true);
      const address = await requestFreighterAccess();
      
      // Refresh wallet state
      const state = await getFreighterWalletState();
      setWalletState(state);
      
      toast.success("Connected to Freighter wallet", {
        description: `Address: ${address.slice(0, 8)}...${address.slice(-8)}`,
      });
      
      return address;
    } catch (error) {
      if (error instanceof FreighterWalletError) {
        toast.error("Failed to connect", {
          description: error.message,
        });
      } else {
        toast.error("Failed to connect to Freighter", {
          description: "Please make sure Freighter is installed and unlocked",
        });
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Sign a transaction XDR
   */
  const signTransaction = useCallback(
    async (xdr: string, network?: string, networkPassphrase?: string) => {
      try {
        setIsSigning(true);
        
        const result = await signStellarTransaction(xdr, network, networkPassphrase);
        
        toast.success("Transaction signed successfully", {
          description: `Signed by ${result.signerAddress.slice(0, 8)}...`,
        });
        
        return result;
      } catch (error) {
        if (error instanceof FreighterWalletError) {
          if (error.code === "USER_DECLINED") {
            toast.error("Transaction declined", {
              description: "You declined to sign the transaction",
            });
          } else if (error.code === "NETWORK_MISMATCH") {
            toast.error("Network mismatch", {
              description: error.message,
            });
          } else {
            toast.error("Failed to sign transaction", {
              description: error.message,
            });
          }
        } else {
          toast.error("Failed to sign transaction", {
            description: "An unexpected error occurred",
          });
        }
        throw error;
      } finally {
        setIsSigning(false);
      }
    },
    []
  );

  /**
   * Refresh wallet state
   */
  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      const state = await getFreighterWalletState();
      setWalletState(state);
    } catch (error) {
      console.error("Failed to refresh wallet:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    walletState,
    isLoading,
    isSigning,
    connect,
    signTransaction,
    refresh,
  };
}
