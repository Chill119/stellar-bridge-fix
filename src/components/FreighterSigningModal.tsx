import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Wallet } from "lucide-react";

interface FreighterSigningModalProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function FreighterSigningModal({ open, onOpenChange }: FreighterSigningModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-md border-primary/20 bg-gradient-to-br from-card to-card/80"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogTitle className="text-xl font-semibold text-center">
          Waiting for wallet approval
        </DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground text-center">
          A popup window should appear from your wallet extension
        </DialogDescription>
        <div className="flex flex-col items-center justify-center py-4 px-4 space-y-6">
          {/* Animated wallet icon */}
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
            <div className="relative bg-primary/10 p-6 rounded-full border-2 border-primary/30">
              <Wallet className="h-12 w-12 text-primary" />
            </div>
          </div>

          {/* Loading indicator */}
          <div className="flex items-center gap-2 text-primary">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm font-medium">Waiting for signature...</span>
          </div>

          {/* Info note */}
          <div className="bg-muted/50 border border-border rounded-lg p-3 text-xs text-muted-foreground text-center max-w-xs">
            <p className="font-medium mb-1">Can't see the wallet popup?</p>
            <ul className="text-left space-y-1">
              <li>• Click the wallet extension icon in your browser toolbar</li>
              <li>• Check if popups are blocked (look for a blocked popup icon in your address bar)</li>
              <li>• Make sure your wallet is unlocked</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
