import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wallet, Shield, Copy, ExternalLink } from "lucide-react";
import { truncateAddress, CONTRACT_ADDRESS } from "@/lib/wallet";
import { useToast } from "@/hooks/use-toast";

interface WalletConnectionProps {
  account: string;
  network: string;
  isAdmin: boolean;
}

export default function WalletConnection({ account, network, isAdmin }: WalletConnectionProps) {
  const { toast } = useToast();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const openEtherscan = () => {
    window.open(`https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`, '_blank');
  };

  return (
    <Card className="w-full max-w-4xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Wallet Connection</h2>
        </div>
        {isAdmin && (
          <Badge variant="default" className="gap-1" data-testid="badge-admin-role">
            <Shield className="w-3 h-3" />
            Admin
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Connected Wallet</p>
          <div className="flex items-center gap-2">
            <code className="text-sm font-mono" data-testid="text-wallet-address">
              {truncateAddress(account)}
            </code>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={() => copyToClipboard(account, "Wallet address")}
              data-testid="button-copy-wallet"
            >
              <Copy className="w-3 h-3" />
            </Button>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Network</p>
          <Badge variant="secondary" className="font-mono text-xs" data-testid="badge-network">
            {network}
          </Badge>
        </div>

        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Contract Address</p>
          <div className="flex items-center gap-2">
            <code className="text-sm font-mono" data-testid="text-contract-address">
              {truncateAddress(CONTRACT_ADDRESS)}
            </code>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={() => copyToClipboard(CONTRACT_ADDRESS, "Contract address")}
              data-testid="button-copy-contract"
            >
              <Copy className="w-3 h-3" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={openEtherscan}
              data-testid="button-etherscan"
            >
              <ExternalLink className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
