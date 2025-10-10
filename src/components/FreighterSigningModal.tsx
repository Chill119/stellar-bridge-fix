import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Loader2, Wallet } from "lucide-react";

interface FreighterSigningModalProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function FreighterSigningModal({ open, onOpenChange }: FreighterSigningModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-primary/20 bg-gradient-to-br from-card to-card/80">
        <div className="flex flex-col items-center justify-center py-8 px-4 space-y-6">
          {/* Animated wallet icon */}
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
            <div className="relative bg-primary/10 p-6 rounded-full border-2 border-primary/30">
              <Wallet className="h-12 w-12 text-primary" />
            </div>
          </div>

          {/* Status text */}
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold text-foreground">
              Waiting for Freighter approval
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Please check your Freighter wallet extension and approve the transaction
            </p>
          </div>

          {/* Loading indicator */}
          <div className="flex items-center gap-2 text-primary">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm font-medium">Waiting for signature...</span>
          </div>

          {/* Info note */}
          <div className="bg-muted/50 border border-border rounded-lg p-3 text-xs text-muted-foreground text-center max-w-xs">
            If the Freighter popup doesn't appear, click the extension icon in your browser toolbar
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
