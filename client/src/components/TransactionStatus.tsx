import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Copy, ExternalLink } from "lucide-react";
import { truncateAddress } from "@/lib/wallet";
import { useToast } from "@/hooks/use-toast";

interface TransactionStatusProps {
  txHash: string;
}

export default function TransactionStatus({ txHash }: TransactionStatusProps) {
  const { toast } = useToast();

  const copyHash = () => {
    navigator.clipboard.writeText(txHash);
    toast({
      title: "Copied!",
      description: "Transaction hash copied to clipboard",
    });
  };

  const viewOnEtherscan = () => {
    window.open(`https://sepolia.etherscan.io/tx/${txHash}`, '_blank');
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium">Last Transaction</p>
              <code
                className="text-xs font-mono text-muted-foreground block truncate"
                data-testid="text-tx-hash"
              >
                {truncateAddress(txHash, 6)}
              </code>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              size="icon"
              variant="ghost"
              onClick={copyHash}
              data-testid="button-copy-tx"
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={viewOnEtherscan}
              data-testid="button-view-tx"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
