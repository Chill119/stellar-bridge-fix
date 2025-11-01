import * as StellarSdk from "stellar-sdk";

interface SwapParams {
  fromNetwork: string;
  toNetwork: string;
  token: string;
  amount: number;
  walletAddress: string;
  signTransaction: (xdr: string, network?: string, networkPassphrase?: string) => Promise<{ signedXdr: string; signerAddress: string }>;
}

interface SwapResult {
  transactionHash: string;
  status: "success" | "pending" | "failed";
  fromNetwork: string;
  toNetwork: string;
  amount: number;
  token: string;
}

export async function executeSwap(params: SwapParams): Promise<SwapResult> {
  const { fromNetwork, toNetwork, token, amount, walletAddress, signTransaction } = params;

  // Validate networks
  if (fromNetwork === toNetwork) {
    throw new Error("Source and destination networks must be different");
  }

  // For Stellar network interactions
  if (toNetwork === "stellar" || fromNetwork === "stellar") {
    return await executeStellarSwap(params);
  }

  // For other networks (Ethereum, Polygon, Solana)
  return await executeGenericSwap(params);
}

async function executeStellarSwap(params: SwapParams): Promise<SwapResult> {
  const { fromNetwork, toNetwork, token, amount, walletAddress, signTransaction } = params;

  try {
    // Use testnet for development
    const server = new StellarSdk.Horizon.Server("https://horizon-testnet.stellar.org");
    const networkPassphrase = StellarSdk.Networks.TESTNET;

    // Load source account
    let sourceAccount;
    try {
      sourceAccount = await server.loadAccount(walletAddress);
    } catch (error: any) {
      if (error?.response?.status === 404) {
        throw new Error("Stellar account not funded. Please visit https://laboratory.stellar.org/#account-creator?network=test to create and fund your testnet account with at least 1 XLM.");
      }
      throw error;
    }

    // Create a simple payment transaction as a placeholder
    // In production, this would interact with a bridge contract
    const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase,
    })
      .addOperation(
        StellarSdk.Operation.payment({
          destination: walletAddress, // In production, this would be the bridge address
          asset: StellarSdk.Asset.native(),
          amount: amount.toString(),
        })
      )
      .addMemo(StellarSdk.Memo.text(`Bridge: ${fromNetwork} to ${toNetwork}`))
      .setTimeout(180)
      .build();

    // Get XDR for signing
    const xdr = transaction.toXDR();
    
    console.log("Creating Stellar transaction for signing...");
    console.log("Transaction XDR (preview):", xdr.substring(0, 50) + "...");

    // Sign transaction via Freighter - only pass network name
    const { signedXdr } = await signTransaction(xdr, "TESTNET");

    // Parse signed transaction
    const signedTransaction = StellarSdk.TransactionBuilder.fromXDR(
      signedXdr,
      networkPassphrase
    );

    // Submit to network
    console.log("Submitting signed transaction to Stellar network...");
    
    try {
      const result = await server.submitTransaction(signedTransaction as any);
      console.log("Transaction submitted successfully:", result.hash);

      return {
        transactionHash: result.hash,
        status: "success",
        fromNetwork,
        toNetwork,
        amount,
        token,
      };
    } catch (submitError: any) {
      console.error("Transaction submission failed:", submitError);
      
      // Log detailed error information from Horizon
      if (submitError.response?.data) {
        console.error("Horizon error details:", JSON.stringify(submitError.response.data, null, 2));
      }
      
      // Check for specific Horizon errors
      if (submitError.response?.data?.extras?.result_codes) {
        const resultCodes = submitError.response.data.extras.result_codes;
        console.error("Transaction result codes:", resultCodes);
        
        if (resultCodes.transaction === "tx_bad_seq") {
          throw new Error("Transaction sequence number mismatch. Please try again.");
        }
        if (resultCodes.transaction === "tx_insufficient_balance") {
          throw new Error("Insufficient balance to complete the transaction.");
        }
        if (resultCodes.transaction === "tx_bad_auth") {
          throw new Error("Transaction authentication failed. Please check your wallet.");
        }
      }
      
      throw new Error(`Transaction submission failed: ${submitError.message || "Unknown error"}`);
    }
  } catch (error) {
    console.error("Stellar swap error:", error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes("account not funded")) {
        throw error; // Pass through the helpful error message
      }
      if (error.message.includes("Transaction submission failed")) {
        throw error; // Pass through detailed error
      }
      throw new Error(`Stellar swap failed: ${error.message}`);
    }
    throw new Error("Stellar swap failed: Unknown error");
  }
}

async function executeGenericSwap(params: SwapParams): Promise<SwapResult> {
  const { fromNetwork, toNetwork, token, amount } = params;

  // Simulate swap process for non-Stellar networks
  // In production, this would interact with Ethereum/Polygon/Solana bridge contracts
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate 80% success rate
      if (Math.random() > 0.2) {
        resolve({
          transactionHash: `0x${Array.from({ length: 64 }, () => 
            Math.floor(Math.random() * 16).toString(16)
          ).join("")}`,
          status: "success",
          fromNetwork,
          toNetwork,
          amount,
          token,
        });
      } else {
        reject(new Error("Simulated network error"));
      }
    }, 2000);
  });
}
