import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe, Star, ArrowUpDown, Wallet, RefreshCw } from "lucide-react";
import { useFreighterWallet } from "@/hooks/useFreighterWallet";
import { FreighterSigningModal } from "./FreighterSigningModal";
import { useToast } from "@/hooks/use-toast";
import { executeSwap } from "@/services/swapService";

export function BridgeManagement() {
  const { walletState, connect, signTransaction } = useFreighterWallet();
  const { toast } = useToast();
  const [showSigningModal, setShowSigningModal] = useState(false);
  const [count, setCount] = useState(1);
  const [fromNetwork, setFromNetwork] = useState("ethereum");
  const [toNetwork, setToNetwork] = useState("stellar");
  const [token, setToken] = useState("eth");
  const [amount, setAmount] = useState("");
  const [balance, setBalance] = useState("0.00");
  const [isSwapping, setIsSwapping] = useState(false);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  const handleCheckConnection = async () => {
    if (!walletState.isConnected) {
      await connect();
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

  const handleRefreshBalance = async () => {
    if (!walletState.isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingBalance(true);
    try {
      // Simulate balance fetch - in production, query blockchain
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockBalance = (Math.random() * 10).toFixed(4);
      setBalance(mockBalance);
      toast({
        title: "Balance updated",
        description: `Current balance: ${mockBalance} ${token.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Failed to fetch balance",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsLoadingBalance(false);
    }
  };

  const handleExecuteSwap = async () => {
    if (!walletState.isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first",
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
      const result = await executeSwap({
        fromNetwork,
        toNetwork,
        token,
        amount: parseFloat(amount),
        walletAddress: walletState.address || "",
        signTransaction,
      });

      setShowSigningModal(false);
      
      toast({
        title: "Swap successful!",
        description: `Swapped ${amount} ${token.toUpperCase()} from ${fromNetwork} to ${toNetwork}`,
      });

      // Reset form
      setAmount("");
      handleRefreshBalance();
    } catch (error) {
      setShowSigningModal(false);
      toast({
        title: "Swap failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsSwapping(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="container mx-auto px-4 py-12 text-center">
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
                disabled={fromNetwork !== "ethereum"}
              >
                Connect ethereum
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
                disabled={toNetwork !== "stellar"}
              >
                Connect stellar
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
                    Balance: {balance} {token.toUpperCase()}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={handleRefreshBalance}
                    disabled={!walletState.isConnected || isLoadingBalance}
                  >
                    <RefreshCw className={`h-3 w-3 ${isLoadingBalance ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-background/80 border-border pr-16"
                  disabled={!walletState.isConnected}
                  step="0.01"
                  min="0"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-7 text-xs"
                  onClick={() => setAmount(balance)}
                  disabled={!walletState.isConnected}
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
              disabled={!walletState.isConnected || isSwapping || !amount || parseFloat(amount) <= 0}
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
                <span className="text-muted-foreground">Freighter Installed:</span>
                <span className="text-green-500 font-medium">Yes</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Connection Status:</span>
                <span className={walletState.isConnected ? "text-green-500" : "text-red-500"}>
                  {walletState.isConnected ? "Connected" : "Disconnected"}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Permission Status:</span>
                <span className="text-green-500 font-medium">Granted</span>
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={handleCheckConnection}
                className="w-full"
                disabled={walletState.isConnected}
              >
                Connect to Freighter
              </Button>
              
              <Button 
                variant="secondary"
                className="w-full"
                onClick={() => window.open('chrome://extensions', '_blank')}
              >
                Open Freighter Extension
              </Button>
            </div>
          </div>
        </div>
      </div>

      <FreighterSigningModal open={showSigningModal} onOpenChange={setShowSigningModal} />
    </div>
  );
}
