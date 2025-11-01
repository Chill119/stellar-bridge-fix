import {
  isConnected,
  isAllowed,
  requestAccess,
  getAddress,
  getNetwork,
  signTransaction,
} from "@stellar/freighter-api";

export interface FreighterWalletState {
  isConnected: boolean;
  isAllowed: boolean;
  address: string | null;
  network: string | null;
  networkPassphrase: string | null;
  balance: string | null;
}

export class FreighterWalletError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = "FreighterWalletError";
  }
}

/**
 * Check if Freighter wallet is installed and connected
 */
export async function checkFreighterConnection(): Promise<boolean> {
  try {
    const result = await isConnected();
    return result.isConnected;
  } catch (error) {
    console.error("Failed to check Freighter connection:", error);
    return false;
  }
}

/**
 * Request access to user's Freighter wallet
 */
export async function requestFreighterAccess(): Promise<string> {
  try {
    const result = await requestAccess();
    
    if (result.error) {
      throw new FreighterWalletError(result.error, "ACCESS_DENIED");
    }
    
    if (!result.address) {
      throw new FreighterWalletError("No address returned from Freighter", "NO_ADDRESS");
    }
    
    return result.address;
  } catch (error) {
    if (error instanceof FreighterWalletError) {
      throw error;
    }
    throw new FreighterWalletError(
      "Failed to request Freighter access. Make sure Freighter is installed and unlocked.",
      "REQUEST_FAILED"
    );
  }
}

/**
 * Get the current Freighter wallet address
 */
export async function getFreighterAddress(): Promise<string> {
  try {
    const result = await getAddress();
    
    if (result.error) {
      throw new FreighterWalletError(result.error, "GET_ADDRESS_FAILED");
    }
    
    if (!result.address) {
      // Try requesting access if no address is available
      return await requestFreighterAccess();
    }
    
    return result.address;
  } catch (error) {
    if (error instanceof FreighterWalletError) {
      throw error;
    }
    throw new FreighterWalletError("Failed to get Freighter address", "GET_ADDRESS_FAILED");
  }
}

/**
 * Get current network from Freighter
 */
export async function getFreighterNetwork(): Promise<{ network: string; networkPassphrase: string }> {
  try {
    const result = await getNetwork();
    
    if (result.error) {
      throw new FreighterWalletError(result.error, "GET_NETWORK_FAILED");
    }
    
    return {
      network: result.network,
      networkPassphrase: result.networkPassphrase,
    };
  } catch (error) {
    if (error instanceof FreighterWalletError) {
      throw error;
    }
    throw new FreighterWalletError("Failed to get Freighter network", "GET_NETWORK_FAILED");
  }
}

/**
 * Sign a Stellar transaction XDR using Freighter
 * @param xdr - Transaction XDR string to sign
 * @param network - Optional network name (defaults to current Freighter network)
 * @param networkPassphrase - Optional custom network passphrase
 */
export async function signStellarTransaction(
  xdr: string,
  network?: string,
  networkPassphrase?: string
): Promise<{ signedXdr: string; signerAddress: string }> {
  try {
    // Validate XDR
    if (!xdr || typeof xdr !== "string") {
      throw new FreighterWalletError("Invalid XDR string", "INVALID_XDR");
    }

    console.log("=== Freighter Signing Process Started ===");
    console.log("XDR length:", xdr.length);
    console.log("Network:", network || "not specified");
    console.log("Network Passphrase:", networkPassphrase ? "provided" : "not provided");

    // Check if Freighter is connected
    const connected = await checkFreighterConnection();
    if (!connected) {
      throw new FreighterWalletError(
        "Freighter is not connected. Please install and unlock Freighter extension.",
        "NOT_CONNECTED"
      );
    }

    // Verify user has granted access
    const allowedResult = await isAllowed();
    if (!allowedResult.isAllowed) {
      console.log("User access not granted, requesting...");
      await requestFreighterAccess();
    }

    // Ensure window is focused to prevent popup blocking
    if (typeof window !== 'undefined') {
      window.focus();
      console.log("Window focused for popup");
    }

    // Get network info if not provided
    let signOptions: { network?: string; networkPassphrase?: string } = {};
    
    if (network) {
      signOptions.network = network;
      console.log("Using specified network:", network);
    } else if (networkPassphrase) {
      signOptions.networkPassphrase = networkPassphrase;
      console.log("Using provided network passphrase");
    } else {
      // Use current Freighter network
      const currentNetwork = await getFreighterNetwork();
      signOptions.networkPassphrase = currentNetwork.networkPassphrase;
      console.log("Using current Freighter network:", currentNetwork.network);
    }

    console.log("=== Opening Freighter popup for signature ===");
    console.log("Sign options:", JSON.stringify(signOptions));
    
    // Sign the transaction - this will trigger the wallet popup
    const result = await signTransaction(xdr, signOptions);
    
    console.log("=== Freighter returned result ===");
    console.log("Has error:", !!result.error);
    console.log("Has signed XDR:", !!result.signedTxXdr);
    console.log("Signer address:", result.signerAddress || "none");
    
    if (result.error) {
      console.error("Freighter error:", result.error);
      
      // Handle specific error cases
      if (result.error.includes("User declined") || result.error.includes("rejected")) {
        throw new FreighterWalletError("User declined to sign the transaction", "USER_DECLINED");
      }
      if (result.error.toLowerCase().includes("locked")) {
        throw new FreighterWalletError("Wallet is locked. Please unlock Freighter and try again.", "WALLET_LOCKED");
      }
      if (result.error.includes("network")) {
        throw new FreighterWalletError(
          "Network mismatch. Please switch Freighter to TESTNET.",
          "NETWORK_MISMATCH"
        );
      }
      if (result.error.toLowerCase().includes("popup") || result.error.toLowerCase().includes("blocked")) {
        throw new FreighterWalletError(
          "Popup blocked. Please allow popups for this site and try again.",
          "POPUP_BLOCKED"
        );
      }
      throw new FreighterWalletError(result.error, "SIGNING_FAILED");
    }
    
    if (!result.signedTxXdr) {
      throw new FreighterWalletError("No signed XDR returned from Freighter", "NO_SIGNED_XDR");
    }
    
    console.log("=== Transaction signed successfully ===");
    console.log("Signed XDR length:", result.signedTxXdr.length);
    
    return {
      signedXdr: result.signedTxXdr,
      signerAddress: result.signerAddress,
    };
  } catch (error) {
    console.error("=== Freighter signing error ===", error);
    
    if (error instanceof FreighterWalletError) {
      throw error;
    }
    
    // Handle unexpected errors
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    throw new FreighterWalletError(
      `Failed to sign transaction: ${errorMessage}. Make sure Freighter is installed, unlocked, and set to TESTNET.`,
      "SIGNING_ERROR"
    );
  }
}


/**
 * Get Stellar account balance
 */
export async function getStellarBalance(address: string, network: string): Promise<string> {
  try {
    const StellarSdk = await import("stellar-sdk");
    // Make network comparison case-insensitive
    const networkUpper = network.toUpperCase();
    const serverUrl = networkUpper === "TESTNET" || networkUpper.includes("TEST")
      ? "https://horizon-testnet.stellar.org"
      : "https://horizon.stellar.org";
    
    const server = new StellarSdk.Horizon.Server(serverUrl);
    const account = await server.loadAccount(address);
    
    // Get native XLM balance
    const nativeBalance = account.balances.find(
      (balance: any) => balance.asset_type === 'native'
    );
    
    return nativeBalance ? parseFloat(nativeBalance.balance).toFixed(4) : "0.0000";
  } catch (error: any) {
    // Handle 404 - account doesn't exist (unfunded)
    if (error?.response?.status === 404) {
      console.log("Stellar account not yet funded");
      return "0.0000";
    }
    console.error("Error fetching Stellar balance:", error);
    return "0.0000";
  }
}

/**
 * Get complete wallet state
 */
export async function getFreighterWalletState(): Promise<FreighterWalletState> {
  try {
    const connected = await checkFreighterConnection();
    
    if (!connected) {
      return {
        isConnected: false,
        isAllowed: false,
        address: null,
        network: null,
        networkPassphrase: null,
        balance: null,
      };
    }

    const allowedResult = await isAllowed();
    const isUserAllowed = allowedResult.isAllowed;
    
    let address = null;
    let network = null;
    let networkPassphrase = null;
    let balance = null;
    
    if (isUserAllowed) {
      try {
        const addressResult = await getAddress();
        address = addressResult.address || null;
        
        const networkResult = await getNetwork();
        network = networkResult.network;
        networkPassphrase = networkResult.networkPassphrase;

        // Get balance if we have address and network
        if (address && network) {
          balance = await getStellarBalance(address, network);
        }
      } catch (error) {
        console.error("Failed to get wallet details:", error);
      }
    }
    
    return {
      isConnected: connected,
      isAllowed: isUserAllowed,
      address,
      network,
      networkPassphrase,
      balance,
    };
  } catch (error) {
    console.error("Failed to get Freighter wallet state:", error);
    return {
      isConnected: false,
      isAllowed: false,
      address: null,
      network: null,
      networkPassphrase: null,
      balance: null,
    };
  }
}
