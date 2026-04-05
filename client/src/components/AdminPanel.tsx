import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, ShieldCheck, ShieldX, Settings } from "lucide-react";
import { Contract } from "ethers";
import { useToast } from "@/hooks/use-toast";

interface AdminPanelProps {
  contract: Contract;
  onTransactionSubmit?: (hash: string) => void;
}

export default function AdminPanel({ contract, onTransactionSubmit }: AdminPanelProps) {
  const [userAddress, setUserAddress] = useState("");
  const [reliability, setReliability] = useState("");
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const authorizeUser = async () => {
    if (!userAddress) {
      toast({
        title: "Error",
        description: "Please enter a user address",
        variant: "destructive",
      });
      return;
    }

    setIsAuthorizing(true);
    try {
      const tx = await contract.authorizeUser(userAddress);
      toast({
        title: "Transaction Submitted",
        description: "Authorizing user...",
      });
      await tx.wait();
      onTransactionSubmit?.(tx.hash);
      toast({
        title: "Success",
        description: "User authorized successfully",
      });
      setUserAddress("");
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to authorize user",
        variant: "destructive",
      });
    } finally {
      setIsAuthorizing(false);
    }
  };

  const revokeUser = async () => {
    if (!userAddress) {
      toast({
        title: "Error",
        description: "Please enter a user address",
        variant: "destructive",
      });
      return;
    }

    setIsRevoking(true);
    try {
      const tx = await contract.revokeAuthorization(userAddress);
      toast({
        title: "Transaction Submitted",
        description: "Revoking authorization...",
      });
      await tx.wait();
      onTransactionSubmit?.(tx.hash);
      toast({
        title: "Success",
        description: "Authorization revoked successfully",
      });
      setUserAddress("");
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to revoke authorization",
        variant: "destructive",
      });
    } finally {
      setIsRevoking(false);
    }
  };

  const updateReliability = async () => {
    if (!userAddress || !reliability) {
      toast({
        title: "Error",
        description: "Please enter both address and reliability score",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);
    try {
      const tx = await contract.setIssuerReliability(userAddress, parseInt(reliability));
      toast({
        title: "Transaction Submitted",
        description: "Updating reliability score...",
      });
      await tx.wait();
      onTransactionSubmit?.(tx.hash);
      toast({
        title: "Success",
        description: "Reliability score updated successfully",
      });
      setUserAddress("");
      setReliability("");
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update reliability",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="w-full max-w-4xl space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-semibold">Admin Panel</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" />
              User Authorization
            </CardTitle>
            <CardDescription>
              Grant or revoke user access to the system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="auth-address">User Address</Label>
              <Input
                id="auth-address"
                placeholder="0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
                value={userAddress}
                onChange={(e) => setUserAddress(e.target.value)}
                className="font-mono"
                data-testid="input-user-address"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={authorizeUser}
                disabled={isAuthorizing}
                className="flex-1"
                data-testid="button-authorize"
              >
                <ShieldCheck className="w-4 h-4 mr-2" />
                {isAuthorizing ? "Authorizing..." : "Authorize"}
              </Button>
              <Button
                onClick={revokeUser}
                disabled={isRevoking}
                variant="destructive"
                className="flex-1"
                data-testid="button-revoke"
              >
                <ShieldX className="w-4 h-4 mr-2" />
                {isRevoking ? "Revoking..." : "Revoke"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Issuer Reliability
            </CardTitle>
            <CardDescription>
              Set reliability score for verification issuers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reliability-address">Issuer Address</Label>
              <Input
                id="reliability-address"
                placeholder="0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
                value={userAddress}
                onChange={(e) => setUserAddress(e.target.value)}
                className="font-mono"
                data-testid="input-issuer-address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reliability-score">Reliability Score (0-100)</Label>
              <Input
                id="reliability-score"
                type="number"
                placeholder="85"
                min="0"
                max="100"
                value={reliability}
                onChange={(e) => setReliability(e.target.value)}
                data-testid="input-reliability-score"
              />
            </div>
            <Button
              onClick={updateReliability}
              disabled={isUpdating}
              className="w-full"
              data-testid="button-update-reliability"
            >
              {isUpdating ? "Updating..." : "Update Reliability"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
