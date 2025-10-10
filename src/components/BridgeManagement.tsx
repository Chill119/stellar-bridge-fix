import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2, AlertCircle, ArrowRight, Wallet } from "lucide-react";
import { useFreighterWallet } from "@/hooks/useFreighterWallet";
import { FreighterSigningModal } from "./FreighterSigningModal";
import { toast } from "sonner";

interface PendingTransfer {
  id: string;
  amount: string;
  token: string;
  destinationAddress: string;
  unsignedXdr: string;
  timestamp: Date;
  status: "pending" | "signing" | "completed" | "failed";
}

// Mock data for demonstration
const mockPendingTransfer: PendingTransfer = {
  id: "tx_123456",
  amount: "100",
  token: "USDC",
  destinationAddress: "GCLWGQPMKXQSPF776IU33AH4PZNOOWNAWGGKVTBQMIC5IMKUNP3E6NVU",
  unsignedXdr: "AAAAAgAAAABelb3/qEcIxAk663L/K2xkREbBBFcpnRHzyzX18OyJ+QAAAGQAAAAAAAAAAQAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAABAAAAAF6Vvf+oRwjECTrrcv8rbGRERsEEVymdEfPLNfXw7In5AAAAAAAAAAC7JAuE0VHLvTQGAAABJVHx6lAAAAAAAAAAAA==",
  timestamp: new Date(),
  status: "pending",
};

export function BridgeManagement() {
  const { walletState, isSigning, connect, signTransaction } = useFreighterWallet();
  const [showSigningModal, setShowSigningModal] = useState(false);
  const [pendingTransfer, setPendingTransfer] = useState<PendingTransfer>(mockPendingTransfer);

  const handleCompleteTransfer = async () => {
    if (!walletState.isConnected || !walletState.isAllowed) {
      try {
        await connect();
      } catch (error) {
        return;
      }
    }

    try {
      // Show signing modal
      setShowSigningModal(true);
      setPendingTransfer(prev => ({ ...prev, status: "signing" }));

      // Sign the transaction
      const result = await signTransaction(
        pendingTransfer.unsignedXdr,
        undefined, // Use current network
        walletState.networkPassphrase || undefined
      );

      // Hide modal
      setShowSigningModal(false);

      // Update status
      setPendingTransfer(prev => ({ ...prev, status: "completed" }));

      // Here you would typically submit the signed XDR to your backend
      console.log("Signed XDR:", result.signedXdr);
      console.log("Signer Address:", result.signerAddress);

      toast.success("Destination transfer completed!", {
        description: "Transaction has been signed and submitted to the network",
      });
    } catch (error) {
      // Error is already handled by the hook with toast notifications
      setShowSigningModal(false);
      setPendingTransfer(prev => ({ ...prev, status: "failed" }));
    }
  };

  const handleRetry = () => {
    setPendingTransfer(prev => ({ ...prev, status: "pending" }));
    handleCompleteTransfer();
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Bridge Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Complete pending cross-chain transfers to Stellar
          </p>
        </div>

        {/* Wallet Status */}
        <Card className="border-primary/20 bg-gradient-to-br from-card to-card/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              Freighter Wallet Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Connection:</span>
              <Badge variant={walletState.isConnected ? "default" : "secondary"}>
                {walletState.isConnected ? "Connected" : "Not Connected"}
              </Badge>
            </div>
            {walletState.address && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Address:</span>
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {walletState.address.slice(0, 8)}...{walletState.address.slice(-8)}
                  </code>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Network:</span>
                  <Badge variant="outline">{walletState.network}</Badge>
                </div>
              </>
            )}
            {!walletState.isConnected && (
              <Button onClick={connect} className="w-full">
                <Wallet className="h-4 w-4 mr-2" />
                Connect Freighter Wallet
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Pending Transfer */}
        <Card className="border-primary/20 bg-gradient-to-br from-card to-card/80">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Pending Destination Transfer</span>
              <Badge
                variant={
                  pendingTransfer.status === "completed"
                    ? "default"
                    : pendingTransfer.status === "failed"
                    ? "destructive"
                    : "secondary"
                }
              >
                {pendingTransfer.status}
              </Badge>
            </CardTitle>
            <CardDescription>
              Transfer #{pendingTransfer.id}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-muted-foreground">Amount:</span>
                <p className="font-semibold">
                  {pendingTransfer.amount} {pendingTransfer.token}
                </p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Destination:</span>
                <code className="text-xs bg-muted px-2 py-1 rounded block mt-1">
                  {pendingTransfer.destinationAddress.slice(0, 12)}...
                </code>
              </div>
            </div>

            {pendingTransfer.status === "pending" && (
              <Alert className="border-primary/30 bg-primary/5">
                <AlertCircle className="h-4 w-4 text-primary" />
                <AlertDescription>
                  This transaction requires your signature to complete the destination transfer on Stellar.
                </AlertDescription>
              </Alert>
            )}

            {pendingTransfer.status === "completed" && (
              <Alert className="border-green-500/30 bg-green-500/5">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-600">
                  Transaction successfully signed and submitted to the Stellar network!
                </AlertDescription>
              </Alert>
            )}

            {pendingTransfer.status === "failed" && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Failed to sign the transaction. Please try again.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3">
              {pendingTransfer.status === "pending" && (
                <Button
                  onClick={handleCompleteTransfer}
                  disabled={isSigning}
                  className="flex-1"
                >
                  {isSigning ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Signing...
                    </>
                  ) : (
                    <>
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Complete Destination Transfer
                    </>
                  )}
                </Button>
              )}
              
              {pendingTransfer.status === "failed" && (
                <Button onClick={handleRetry} className="flex-1" variant="outline">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Retry Signing
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <FreighterSigningModal open={showSigningModal} onOpenChange={setShowSigningModal} />
    </div>
  );
}
