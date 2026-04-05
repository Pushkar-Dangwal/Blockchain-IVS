import { useState } from 'react';
import { Contract, ethers } from 'ethers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import { Shield, Search, CheckCircle, XCircle, Clock, QrCode, Copy } from 'lucide-react';
import { useIVSContract } from '../hooks/useIVSContract';
import { useToast } from '../hooks/use-toast';
import type { VerificationResult } from '../types/ivs';

interface VerificationPanelProps {
  contract: Contract;
}

export default function VerificationPanel({ contract }: VerificationPanelProps) {
  const [uniqueId, setUniqueId] = useState('');
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [myUniqueId, setMyUniqueId] = useState<string>('');
  
  const { verifyIdentity, getMyUniqueId } = useIVSContract(contract);
  const { toast } = useToast();

  const handleVerifyIdentity = async () => {
    if (!uniqueId.trim()) return;
    
    setIsVerifying(true);
    try {
      // First check if the unique ID exists by getting the user address
      const userAddress = await contract.userAddressesByUniqueId(uniqueId);
      
      if (userAddress === '0x0000000000000000000000000000000000000000') {
        setVerificationResult(null);
        toast({
          title: "Verification Failed",
          description: "Unique ID not found in the system",
          variant: "destructive",
        });
        return;
      }
      
      // Get the score data (this tells us about the user's status)
      const scoreData = await contract.viewScore(uniqueId);
      
      // User exists (has unique ID) so they are authorized
      // Check if they have any activity
      const hasActivity = scoreData.usageFrequency > 0 || scoreData.totalScore > 0 || scoreData.transparencyScore > 0;
      
      setVerificationResult({
        isAuthorized: true, // They exist, so they're authorized
        lastVerification: scoreData.lastVerification,
        totalScore: scoreData.totalScore,
        isActive: hasActivity // Add activity status
      });
      
      toast({
        title: "Verification Complete",
        description: hasActivity ? "Identity verified and active" : "Identity authorized but inactive",
        variant: "default",
      });
      
    } catch (error: any) {
      console.error('Error verifying identity:', error);
      setVerificationResult(null);
      toast({
        title: "Verification Error",
        description: "Could not verify identity - unique ID may not exist or be invalid",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleGetMyId = async () => {
    try {
      const id = await getMyUniqueId();
      if (id) {
        setMyUniqueId(id);
      }
    } catch (error) {
      console.error('Error getting unique ID:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Unique ID copied to clipboard",
    });
  };

  const formatUniqueId = (id: string) => {
    if (!id) return '';
    return `${id.slice(0, 8)}...${id.slice(-8)}`;
  };

  const formatTimestamp = (timestamp: bigint) => {
    if (timestamp === 0) return 'Never';
    return new Date(Number(timestamp) * 1000).toLocaleString();
  };

  const getAuthorizationBadge = (isAuthorized: boolean, isActive?: boolean) => {
    if (!isAuthorized) {
      return (
        <Badge variant="destructive">
          <XCircle className="w-3 h-3 mr-1" />
          Unauthorized
        </Badge>
      );
    }
    
    if (isActive === false) {
      return (
        <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-300">
          <CheckCircle className="w-3 h-3 mr-1" />
          Authorized (Inactive)
        </Badge>
      );
    }
    
    return (
      <Badge className="bg-green-600">
        <CheckCircle className="w-3 h-3 mr-1" />
        Authorized (Active)
      </Badge>
    );
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Identity Verification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Identity Verification
          </CardTitle>
          <CardDescription>
            Verify the identity and authorization status of any user
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="unique-id">Unique ID</Label>
            <div className="flex gap-2">
              <Input
                id="unique-id"
                placeholder="Enter unique ID to verify"
                value={uniqueId}
                onChange={(e) => setUniqueId(e.target.value)}
                disabled={isVerifying}
              />
              <Button 
                onClick={handleVerifyIdentity}
                disabled={isVerifying || !uniqueId.trim()}
                size="sm"
              >
                <Search className="w-4 h-4 mr-2" />
                Verify
              </Button>
            </div>
          </div>

          {verificationResult && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Authorization Status</span>
                  {getAuthorizationBadge(verificationResult.isAuthorized, verificationResult.isActive)}
                </div>

                <div className="space-y-2">
                  <span className="font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Last Verification
                  </span>
                  <p className="text-sm text-muted-foreground">
                    {formatTimestamp(verificationResult.lastVerification)}
                  </p>
                </div>

                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    {verificationResult.isAuthorized 
                      ? verificationResult.isActive 
                        ? "This identity is verified, authorized, and actively using the system."
                        : "This identity is authorized but has not been active recently."
                      : "This identity is not authorized. Proceed with caution."
                    }
                  </AlertDescription>
                </Alert>
              </div>
            </>
          )}

          {uniqueId && !verificationResult && !isVerifying && (
            <Alert>
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                No verification data found for this unique ID.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* My Identity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            My Identity
          </CardTitle>
          <CardDescription>
            Your unique identity information for sharing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleGetMyId}
            variant="outline"
            className="w-full"
          >
            <Shield className="w-4 h-4 mr-2" />
            Get My Unique ID
          </Button>

          {myUniqueId && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Your Unique ID</Label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-muted px-3 py-2 rounded text-sm break-all">
                      {myUniqueId}
                    </code>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => copyToClipboard(myUniqueId)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Short Format</Label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-muted px-3 py-2 rounded text-sm">
                      {formatUniqueId(myUniqueId)}
                    </code>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => copyToClipboard(formatUniqueId(myUniqueId))}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                <Alert>
                  <QrCode className="h-4 w-4" />
                  <AlertDescription>
                    Share this ID with verifiers to prove your identity. 
                    Keep it secure as it's linked to your blockchain identity.
                  </AlertDescription>
                </Alert>
              </div>
            </>
          )}

          <Separator />

          <div className="space-y-2">
            <h4 className="font-medium">Verification Features</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• On-chain identity verification</li>
              <li>• Real-time authorization status</li>
              <li>• Identity score transparency</li>
              <li>• Immutable verification history</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}