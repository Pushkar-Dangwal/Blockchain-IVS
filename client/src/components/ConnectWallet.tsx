import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, AlertCircle } from "lucide-react";

interface ConnectWalletProps {
  onConnect: () => void;
  isConnecting: boolean;
  error?: string;
}

export default function ConnectWallet({ onConnect, isConnecting, error }: ConnectWalletProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            <Wallet className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Secure Identity Verification</CardTitle>
          <CardDescription>
            Connect your MetaMask wallet to access the identity verification system on Sepolia testnet
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
          <Button
            onClick={onConnect}
            disabled={isConnecting}
            className="w-full"
            size="lg"
            data-testid="button-connect-wallet"
          >
            <Wallet className="w-5 h-5 mr-2" />
            {isConnecting ? "Connecting..." : "Connect MetaMask"}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Make sure you're on the Sepolia testnet before connecting
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
