import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, FileCheck, Calculator, Activity } from "lucide-react";
import { Contract } from "ethers";
import { useToast } from "@/hooks/use-toast";

interface UserPanelProps {
  contract: Contract;
  onTransactionSubmit?: (hash: string) => void;
}

export default function UserPanel({ contract, onTransactionSubmit }: UserPanelProps) {
  const [uid, setUid] = useState("");
  const [isTransacting, setIsTransacting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const { toast } = useToast();

  const performTransaction = async () => {
    setIsTransacting(true);
    try {
      const tx = await contract.transact("User Verification");
      toast({
        title: "Transaction Submitted",
        description: "Processing verification transaction...",
      });
      await tx.wait();
      onTransactionSubmit?.(tx.hash);
      toast({
        title: "Success",
        description: "Transaction completed successfully",
      });
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to perform transaction",
        variant: "destructive",
      });
    } finally {
      setIsTransacting(false);
    }
  };

  const recordVerification = async () => {
    if (!uid) {
      toast({
        title: "Error",
        description: "Please enter a unique ID",
        variant: "destructive",
      });
      return;
    }

    setIsRecording(true);
    try {
      const tx = await contract.recordVerificationActivity(uid);
      toast({
        title: "Transaction Submitted",
        description: "Recording verification activity...",
      });
      await tx.wait();
      onTransactionSubmit?.(tx.hash);
      toast({
        title: "Success",
        description: "Verification activity recorded successfully",
      });
      setUid("");
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to record verification",
        variant: "destructive",
      });
    } finally {
      setIsRecording(false);
    }
  };

  const calculateScore = async () => {
    if (!uid) {
      toast({
        title: "Error",
        description: "Please enter a unique ID",
        variant: "destructive",
      });
      return;
    }

    setIsCalculating(true);
    try {
      const tx = await contract.calculateScore(uid);
      toast({
        title: "Transaction Submitted",
        description: "Calculating trust score...",
      });
      await tx.wait();
      onTransactionSubmit?.(tx.hash);
      toast({
        title: "Success",
        description: "Trust score calculated successfully",
      });
      setUid("");
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to calculate score",
        variant: "destructive",
      });
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="w-full max-w-4xl space-y-6">
      <div className="flex items-center gap-2">
        <User className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-semibold">User Panel</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Verification Actions
          </CardTitle>
          <CardDescription>
            Perform verification operations and manage trust scores
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="unique-id">Unique Identifier</Label>
            <Input
              id="unique-id"
              placeholder="Enter unique ID for verification"
              value={uid}
              onChange={(e) => setUid(e.target.value)}
              data-testid="input-unique-id"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={performTransaction}
              disabled={isTransacting}
              variant="secondary"
              className="w-full h-auto flex-col gap-2 py-6"
              data-testid="button-perform-transaction"
            >
              <Activity className="w-6 h-6" />
              <div className="text-center">
                <div className="font-semibold">
                  {isTransacting ? "Processing..." : "Perform Transaction"}
                </div>
                <div className="text-xs text-muted-foreground font-normal">
                  Execute verification transaction
                </div>
              </div>
            </Button>

            <Button
              onClick={recordVerification}
              disabled={isRecording || !uid}
              variant="default"
              className="w-full h-auto flex-col gap-2 py-6"
              data-testid="button-record-verification"
            >
              <FileCheck className="w-6 h-6" />
              <div className="text-center">
                <div className="font-semibold">
                  {isRecording ? "Recording..." : "Record Verification"}
                </div>
                <div className="text-xs opacity-90 font-normal">
                  Log verification activity
                </div>
              </div>
            </Button>

            <Button
              onClick={calculateScore}
              disabled={isCalculating || !uid}
              variant="default"
              className="w-full h-auto flex-col gap-2 py-6"
              data-testid="button-calculate-score"
            >
              <Calculator className="w-6 h-6" />
              <div className="text-center">
                <div className="font-semibold">
                  {isCalculating ? "Calculating..." : "Calculate Score"}
                </div>
                <div className="text-xs opacity-90 font-normal">
                  Compute trust score
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
