import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe, Star, ArrowUpDown } from "lucide-react";
import { useFreighterWallet } from "@/hooks/useFreighterWallet";
import { FreighterSigningModal } from "./FreighterSigningModal";

export function BridgeManagement() {
  const { walletState, connect } = useFreighterWallet();
  const [showSigningModal, setShowSigningModal] = useState(false);
  const [count, setCount] = useState(1);
  const [fromNetwork, setFromNetwork] = useState("ethereum");
  const [toNetwork, setToNetwork] = useState("stellar");
  const [token, setToken] = useState("eth");

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
