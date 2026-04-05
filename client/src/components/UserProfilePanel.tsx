import { useState, useEffect } from 'react';
import { Contract } from 'ethers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import { Mail, Hash, CheckCircle, XCircle, User, Calendar, AlertCircle } from 'lucide-react';
import { useIVSContract } from '../hooks/useIVSContract';
import type { UserInfo } from '../types/ivs';

interface UserProfilePanelProps {
  contract: Contract;
  userInfo: UserInfo | null;
  onUpdate: () => void;
}

export default function UserProfilePanel({ contract, userInfo, onUpdate }: UserProfilePanelProps) {
  const [email, setEmail] = useState('');
  const [verifyEmail, setVerifyEmail] = useState('');
  const [uniqueId, setUniqueId] = useState<string>('');
  const [isLoadingId, setIsLoadingId] = useState(false);
  
  const { 
    loading, 
    updateProfileHash, 
    getMyUniqueId,
    recordTransaction 
  } = useIVSContract(contract);

  useEffect(() => {
    if (userInfo?.uniqueId) {
      setUniqueId(userInfo.uniqueId);
    } else {
      loadUniqueId();
    }
  }, [userInfo]);

  const loadUniqueId = async () => {
    setIsLoadingId(true);
    try {
      const id = await getMyUniqueId();
      if (id) {
        setUniqueId(id);
      }
    } catch (error) {
      console.error('Error loading unique ID:', error);
    } finally {
      setIsLoadingId(false);
    }
  };

  const handleUpdateEmail = async () => {
    if (!email.trim()) return;
    
    try {
      await updateProfileHash(email);
      await recordTransaction('EMAIL_UPDATE');
      setEmail('');
      onUpdate();
    } catch (error) {
      console.error('Error updating email:', error);
    }
  };

  const handleVerifyEmail = async () => {
    if (!verifyEmail.trim()) return;
    
    try {
      // This would typically verify against the stored hash
      const isValid = await contract.verifyEmailOwnership(verifyEmail);
      if (isValid) {
        await recordTransaction('EMAIL_VERIFICATION');
        onUpdate();
      }
    } catch (error) {
      console.error('Error verifying email:', error);
    }
  };

  const formatUniqueId = (id: string) => {
    if (!id) return 'Not available';
    return `${id.slice(0, 8)}...${id.slice(-8)}`;
  };

  const formatTimestamp = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleString();
  };

  // Show unauthorized state
  if (!userInfo && !uniqueId && !isLoadingId) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            Authorization Required
          </CardTitle>
          <CardDescription>
            You need to be authorized to access profile features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Contact an administrator to get authorized for the Identity Verification System.
              Once authorized, you'll be able to manage your profile and verify your identity.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile Information
          </CardTitle>
          <CardDescription>
            Your identity verification profile details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Hash className="w-4 h-4" />
              Unique ID
            </Label>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-muted px-3 py-2 rounded text-sm">
                {isLoadingId ? 'Loading...' : formatUniqueId(uniqueId)}
              </code>
              {userInfo?.isAuthorized ? (
                <Badge variant="default" className="bg-green-600">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Authorized
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <XCircle className="w-3 h-3 mr-1" />
                  Unauthorized
                </Badge>
              )}
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Status
            </Label>
            <div className="flex items-center gap-2">
              {userInfo?.hasEmail ? (
                <Badge variant="default" className="bg-green-600">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <XCircle className="w-3 h-3 mr-1" />
                  Not Set
                </Badge>
              )}
            </div>
            {userInfo?.emailHash && (
              <code className="block bg-muted px-3 py-2 rounded text-xs break-all">
                Hash: {userInfo.emailHash}
              </code>
            )}
          </div>

          {userInfo?.transactions && userInfo.transactions.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Last Activity
                </Label>
                <div className="text-sm text-muted-foreground">
                  {userInfo.transactions[userInfo.transactions.length - 1]?.action} - {' '}
                  {formatTimestamp(userInfo.transactions[userInfo.transactions.length - 1]?.timestamp)}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Profile Management */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Management</CardTitle>
          <CardDescription>
            Update your profile information and verify your email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {userInfo ? (
            <>
              {/* Email Update */}
              <div className="space-y-3">
                <Label htmlFor="email">Update Email</Label>
                <div className="flex gap-2">
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                  <Button 
                    onClick={handleUpdateEmail}
                    disabled={loading || !email.trim()}
                    size="sm"
                  >
                    Update
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Your email will be hashed and stored securely on-chain
                </p>
              </div>

              <Separator />

              {/* Email Verification */}
              <div className="space-y-3">
                <Label htmlFor="verify-email">Verify Email Ownership</Label>
                <div className="flex gap-2">
                  <Input
                    id="verify-email"
                    type="email"
                    placeholder="Enter email to verify"
                    value={verifyEmail}
                    onChange={(e) => setVerifyEmail(e.target.value)}
                    disabled={loading}
                  />
                  <Button 
                    onClick={handleVerifyEmail}
                    disabled={loading || !verifyEmail.trim()}
                    variant="outline"
                    size="sm"
                  >
                    Verify
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Verify that you own the email associated with this profile
                </p>
              </div>
            </>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Profile management features are available once you're authorized by an administrator.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}