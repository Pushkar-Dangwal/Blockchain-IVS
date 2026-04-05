import { useState } from 'react';
import { Contract } from 'ethers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { Slider } from './ui/slider';
import { Alert, AlertDescription } from './ui/alert';
import { Settings, UserPlus, UserMinus, Shield, Hash, AlertTriangle } from 'lucide-react';
import { useIVSContract } from '../hooks/useIVSContract';
import { isAddress } from 'ethers';

interface AdminManagementPanelProps {
  contract: Contract;
  onUpdate?: () => void;
}

export default function AdminManagementPanel({ contract, onUpdate }: AdminManagementPanelProps) {
  const [userAddress, setUserAddress] = useState('');
  const [revokeAddress, setRevokeAddress] = useState('');
  const [reliabilityUniqueId, setReliabilityUniqueId] = useState('');
  const [reliabilityScore, setReliabilityScore] = useState([5]);
  const [verifyUniqueId, setVerifyUniqueId] = useState('');
  const [verifyEmailHash, setVerifyEmailHash] = useState('');
  const [verificationResult, setVerificationResult] = useState<boolean | null>(null);
  
  const { 
    loading, 
    authorizeUser, 
    revokeAuthorization, 
    setIssuerReliability 
  } = useIVSContract(contract);

  const handleAuthorizeUser = async () => {
    if (!isAddress(userAddress)) {
      return;
    }
    
    try {
      await authorizeUser(userAddress);
      setUserAddress('');
      onUpdate?.(); // Trigger refresh
    } catch (error) {
      console.error('Error authorizing user:', error);
    }
  };

  const handleRevokeAuthorization = async () => {
    if (!isAddress(revokeAddress)) {
      return;
    }
    
    try {
      await revokeAuthorization(revokeAddress);
      setRevokeAddress('');
      onUpdate?.(); // Trigger refresh
    } catch (error) {
      console.error('Error revoking authorization:', error);
    }
  };

  const handleSetReliability = async () => {
    if (!reliabilityUniqueId.trim()) return;
    
    try {
      await setIssuerReliability(reliabilityUniqueId, reliabilityScore[0]);
      setReliabilityUniqueId('');
      setReliabilityScore([5]);
      onUpdate?.(); // Trigger refresh
    } catch (error) {
      console.error('Error setting reliability:', error);
    }
  };

  const handleVerifyEmailHash = async () => {
    if (!verifyUniqueId.trim() || !verifyEmailHash.trim()) return;
    
    try {
      const result = await contract.adminVerifyEmailHash(verifyUniqueId, verifyEmailHash);
      setVerificationResult(result);
    } catch (error) {
      console.error('Error verifying email hash:', error);
      setVerificationResult(null);
    }
  };

  const isValidAddress = (address: string) => {
    return address && isAddress(address);
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* User Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            User Management
          </CardTitle>
          <CardDescription>
            Authorize and manage user access to the system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Authorize User */}
          <div className="space-y-3">
            <Label htmlFor="authorize-address" className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Authorize New User
            </Label>
            <div className="flex gap-2">
              <Input
                id="authorize-address"
                placeholder="0x..."
                value={userAddress}
                onChange={(e) => setUserAddress(e.target.value)}
                disabled={loading}
                className={!userAddress ? '' : isValidAddress(userAddress) ? 'border-green-500' : 'border-red-500'}
              />
              <Button 
                onClick={handleAuthorizeUser}
                disabled={loading || !isValidAddress(userAddress)}
                size="sm"
              >
                Authorize
              </Button>
            </div>
            {userAddress && !isValidAddress(userAddress) && (
              <p className="text-xs text-red-500">Invalid Ethereum address</p>
            )}
          </div>

          <Separator />

          {/* Revoke Authorization */}
          <div className="space-y-3">
            <Label htmlFor="revoke-address" className="flex items-center gap-2">
              <UserMinus className="w-4 h-4" />
              Revoke User Authorization
            </Label>
            <div className="flex gap-2">
              <Input
                id="revoke-address"
                placeholder="0x..."
                value={revokeAddress}
                onChange={(e) => setRevokeAddress(e.target.value)}
                disabled={loading}
                className={!revokeAddress ? '' : isValidAddress(revokeAddress) ? 'border-green-500' : 'border-red-500'}
              />
              <Button 
                onClick={handleRevokeAuthorization}
                disabled={loading || !isValidAddress(revokeAddress)}
                variant="destructive"
                size="sm"
              >
                Revoke
              </Button>
            </div>
            {revokeAddress && !isValidAddress(revokeAddress) && (
              <p className="text-xs text-red-500">Invalid Ethereum address</p>
            )}
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              User management actions are permanent and recorded on-chain. 
              Ensure addresses are correct before submitting.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* System Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            System Configuration
          </CardTitle>
          <CardDescription>
            Configure system parameters and verify user data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Set Issuer Reliability */}
          <div className="space-y-3">
            <Label>Set Issuer Reliability Score</Label>
            <Input
              placeholder="Unique ID"
              value={reliabilityUniqueId}
              onChange={(e) => setReliabilityUniqueId(e.target.value)}
              disabled={loading}
            />
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Reliability Score</span>
                <Badge variant="outline">{reliabilityScore[0]}/10</Badge>
              </div>
              <Slider
                value={reliabilityScore}
                onValueChange={setReliabilityScore}
                max={10}
                min={0}
                step={1}
                className="w-full"
              />
            </div>
            <Button 
              onClick={handleSetReliability}
              disabled={loading || !reliabilityUniqueId.trim()}
              className="w-full"
            >
              Set Reliability Score
            </Button>
          </div>

          <Separator />

          {/* Verify Email Hash */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Hash className="w-4 h-4" />
              Verify Email Hash
            </Label>
            <Input
              placeholder="Unique ID"
              value={verifyUniqueId}
              onChange={(e) => setVerifyUniqueId(e.target.value)}
              disabled={loading}
            />
            <Input
              placeholder="Email Hash"
              value={verifyEmailHash}
              onChange={(e) => setVerifyEmailHash(e.target.value)}
              disabled={loading}
            />
            <Button 
              onClick={handleVerifyEmailHash}
              disabled={loading || !verifyUniqueId.trim() || !verifyEmailHash.trim()}
              variant="outline"
              className="w-full"
            >
              Verify Hash
            </Button>
            
            {verificationResult !== null && (
              <Alert>
                {verificationResult ? (
                  <>
                    <Shield className="h-4 w-4" />
                    <AlertDescription className="text-green-600">
                      Email hash verification successful
                    </AlertDescription>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-red-600">
                      Email hash verification failed
                    </AlertDescription>
                  </>
                )}
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>System Information</CardTitle>
          <CardDescription>
            Current system configuration and scoring parameters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="space-y-1">
              <p className="font-medium">Usage Weight</p>
              <p className="text-muted-foreground">25%</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium">Reliability Weight</p>
              <p className="text-muted-foreground">30%</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium">Transparency Weight</p>
              <p className="text-muted-foreground">15%</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium">Recency Period</p>
              <p className="text-muted-foreground">30 days</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium">Recent Bonus</p>
              <p className="text-muted-foreground">30 points</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium">Stale Bonus</p>
              <p className="text-muted-foreground">10 points</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium">Max Reliability</p>
              <p className="text-muted-foreground">10</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium">Network</p>
              <p className="text-muted-foreground">Sepolia</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}