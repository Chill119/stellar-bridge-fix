import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe, Star, ArrowUpDown, Wallet, RefreshCw } from "lucide-react";
import { useFreighterWallet } from "@/hooks/useFreighterWallet";
import { useEthereumWallet } from "@/hooks/useEthereumWallet";
import { FreighterSigningModal } from "./FreighterSigningModal";
import { useToast } from "@/hooks/use-toast";
import { executeSwap } from "@/services/swapService";

export function BridgeManagement() {
  const { walletState: stellarWallet, connect: connectStellar, signTransaction, refresh: refreshStellar } = useFreighterWallet();
  const { walletState: ethereumWallet, connect: connectEthereum } = useEthereumWallet();
  const { toast } = useToast();
  const [showSigningModal, setShowSigningModal] = useState(false);
  const [count, setCount] = useState(1);
  const [fromNetwork, setFromNetwork] = useState<string>("ethereum");
  const [toNetwork, setToNetwork] = useState<string>("stellar");
  const [token, setToken] = useState("eth");
  const [amount, setAmount] = useState("");
  const [isSwapping, setIsSwapping] = useState(false);

  const handleConnectEthereum = async () => {
    if (!ethereumWallet.isConnected) {
      await connectEthereum();
    }
  };

  const handleConnectStellar = async () => {
    if (!stellarWallet.isConnected) {
      await connectStellar();
    }
  };

  const handleCheckConnection = async () => {
    if (fromNetwork === "ethereum" && !ethereumWallet.isConnected) {
      await connectEthereum();
    } else if (toNetwork === "stellar" && !stellarWallet.isConnected) {
      await connectStellar();
    }
  };

  const handleManualCheck = () => {
    setCount(prev => prev + 1);
  };

  const handleSwapNetworks = () => {
    const temp = fromNetwork;
    setFromNetwork(toNetwork);
    setToNetwork(temp);
  };

  // Get the current balance based on selected network
  const getCurrentBalance = (): string => {
    if (fromNetwork === "ethereum" && ethereumWallet.isConnected && ethereumWallet.balance) {
      return ethereumWallet.balance;
    }
    if (fromNetwork === "stellar" && stellarWallet.isConnected && stellarWallet.balance) {
      return stellarWallet.balance;
    }
    return "0.00";
  };

  const balance = getCurrentBalance();

  const handleExecuteSwap = async () => {
    const bothConnected = 
      (fromNetwork === "ethereum" && ethereumWallet.isConnected) &&
      (toNetwork === "stellar" && stellarWallet.isConnected);
    
    if (!bothConnected) {
      toast({
        title: "Wallets not connected",
        description: "Please connect both source and destination wallets",
        variant: "destructive",
      });
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(amount) > parseFloat(balance)) {
      toast({
        title: "Insufficient balance",
        description: "Amount exceeds available balance",
        variant: "destructive",
      });
      return;
    }

    setIsSwapping(true);
    setShowSigningModal(true);

    try {
      // Always use Stellar address when dealing with Stellar swaps
      const walletAddress = stellarWallet.address || ethereumWallet.address || "";

      const result = await executeSwap({
        fromNetwork,
        toNetwork,
        token,
        amount: parseFloat(amount),
        walletAddress,
        signTransaction,
      });

      toast({
        title: "Swap successful!",
        description: `Swapped ${amount} ${token.toUpperCase()} from ${fromNetwork} to ${toNetwork}`,
      });

      // Reset form and refresh balances
      setAmount("");
      
      // Refresh Stellar balance after successful swap
      await refreshStellar();
    } catch (error) {
      toast({
        title: "Swap failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsSwapping(false);
      setShowSigningModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="bg-yellow-500/10 border-2 border-yellow-500 rounded-lg px-6 py-3 mb-6 max-w-2xl mx-auto">
          <p className="text-yellow-600 dark:text-yellow-500 font-bold text-center text-lg">
            ⚠️ BETA - DO NOT USE REAL MONEY ⚠️
          </p>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
          London Blockchain Bridge
        </h1>
        <p className="text-muted-foreground text-lg max-w-3xl mx-auto mb-8">
          Seamlessly transfer assets across multiple blockchain networks with our secure and efficient bridge protocol.
        </p>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center mb-8">
          <Button onClick={handleCheckConnection} size="lg">
            Check Freighter Connection
          </Button>
          <Button onClick={handleManualCheck} variant="secondary" size="lg">
            Manual Freighter Check
          </Button>
        </div>

        {/* Test Component */}
        <div className="max-w-md mx-auto bg-card/50 border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">React Test Component</h3>
          <p className="text-muted-foreground">Count: {count}</p>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="container mx-auto px-4 pb-12">
        <div className="grid lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {/* Left Column - Network Selection */}
          <div className="bg-card/50 border border-border rounded-xl p-6 space-y-6">
            {/* From Network */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">From Network</label>
              <Select value={fromNetwork} onValueChange={setFromNetwork}>
                <SelectTrigger className="w-full bg-background/80 border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="ethereum">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-primary" />
                      <span>Ethereum</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="polygon">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-purple-500" />
                      <span>Polygon</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              <Button 
                variant="default" 
                className="w-full mt-4"
                disabled={fromNetwork !== "ethereum" || ethereumWallet.isConnected}
                onClick={handleConnectEthereum}
              >
                {ethereumWallet.isConnected ? "Ethereum Connected" : "Connect Ethereum"}
              </Button>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleSwapNetworks}
                className="rounded-full hover:bg-primary/10"
              >
                <ArrowUpDown className="h-5 w-5" />
              </Button>
            </div>

            {/* To Network */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">To Network</label>
              <Select value={toNetwork} onValueChange={setToNetwork}>
                <SelectTrigger className="w-full bg-background/80 border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="stellar">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span>Stellar</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="solana">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-purple-500" />
                      <span>Solana</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              <Button 
                variant="default" 
                className="w-full mt-4"
                disabled={toNetwork !== "stellar" || stellarWallet.isConnected}
                onClick={handleConnectStellar}
              >
                {stellarWallet.isConnected ? "Stellar Connected" : "Connect Stellar"}
              </Button>
            </div>

            {/* Token Selection */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Token</label>
              <Select value={token} onValueChange={setToken}>
                <SelectTrigger className="w-full bg-background/80 border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="eth">ETH (Ethereum)</SelectItem>
                  <SelectItem value="usdc">USDC</SelectItem>
                  <SelectItem value="usdt">USDT</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Amount Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-muted-foreground">Amount</label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    Balance: {balance} {fromNetwork === "ethereum" ? "ETH" : "XLM"}
                  </span>
              </div>
              </div>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-background/80 border-border pr-16"
                  disabled={!ethereumWallet.isConnected && !stellarWallet.isConnected}
                  step="0.01"
                  min="0"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-7 text-xs"
                  onClick={() => setAmount(balance)}
                  disabled={!ethereumWallet.isConnected && !stellarWallet.isConnected}
                >
                  MAX
                </Button>
              </div>
            </div>

            {/* Execute Swap Button */}
            <Button
              onClick={handleExecuteSwap}
              className="w-full"
              size="lg"
              disabled={!ethereumWallet.isConnected || !stellarWallet.isConnected || isSwapping || !amount || parseFloat(amount) <= 0}
            >
              {isSwapping ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Processing Swap...
                </>
              ) : (
                <>
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  Execute Swap
                </>
              )}
            </Button>
          </div>

          {/* Right Column - Freighter Connection Status */}
          <div className="bg-card/50 border border-border rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-6">Freighter Connection Test</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Ethereum Wallet:</span>
                <span className={ethereumWallet.isConnected ? "text-green-500" : "text-muted-foreground"}>
                  {ethereumWallet.isConnected ? "Connected" : "Not Connected"}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Stellar Wallet:</span>
                <span className={stellarWallet.isConnected ? "text-green-500" : "text-muted-foreground"}>
                  {stellarWallet.isConnected ? "Connected" : "Not Connected"}
                </span>
              </div>
              
              {ethereumWallet.isConnected && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Ethereum Chain:</span>
                  <span className="text-green-500 font-medium text-sm">{ethereumWallet.chainName}</span>
                </div>
              )}
              
              {stellarWallet.isConnected && stellarWallet.network && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Stellar Network:</span>
                  <span className="text-green-500 font-medium text-sm">{stellarWallet.network}</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <Button 
                  onClick={handleConnectEthereum}
                  className="w-full"
                  disabled={ethereumWallet.isConnected}
                >
                  {ethereumWallet.isConnected ? "Ethereum Connected" : "Connect MetaMask"}
                </Button>
                {ethereumWallet.isConnected && ethereumWallet.balance && (
                  <div className="mt-2 text-sm text-center">
                    <span className="text-muted-foreground">Available: </span>
                    <span className="font-semibold text-primary">{parseFloat(ethereumWallet.balance).toFixed(4)} ETH</span>
                  </div>
                )}
              </div>
              
              <div>
                <Button 
                  onClick={handleConnectStellar}
                  className="w-full"
                  disabled={stellarWallet.isConnected}
                >
                  {stellarWallet.isConnected ? "Stellar Connected" : "Connect Freighter"}
                </Button>
                {stellarWallet.isConnected && (
                  <div className="mt-2 text-sm text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-muted-foreground">Available: </span>
                      <span className="font-semibold text-primary">
                        {stellarWallet.balance ? parseFloat(stellarWallet.balance).toFixed(4) : '0.0000'} XLM
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={refreshStellar}
                        title="Refresh balance"
                      >
                        <RefreshCw className="h-3 w-3" />
                      </Button>
                    </div>
                    {stellarWallet.balance === "0.0000" && (
                      <div className="mt-1 text-xs text-yellow-600 dark:text-yellow-500">
                        Account needs funding. <a 
                          href="https://laboratory.stellar.org/#account-creator?network=test" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="underline hover:text-yellow-700 dark:hover:text-yellow-400"
                        >
                          Fund testnet account
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <FreighterSigningModal open={showSigningModal} onOpenChange={setShowSigningModal} />
    </div>
  );
}
