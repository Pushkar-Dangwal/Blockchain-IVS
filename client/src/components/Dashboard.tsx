import { useState, useEffect, useCallback } from 'react';
import { Contract } from 'ethers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Shield, User, Activity, BarChart3, Settings, AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { useIVSContract } from '../hooks/useIVSContract';
import UserProfilePanel from './UserProfilePanel';
import IdentityScorePanel from './IdentityScorePanel';
import TransactionHistoryPanel from './TransactionHistoryPanel';
import VerificationPanel from './VerificationPanel';
import AdminManagementPanel from './AdminManagementPanel';
import type { UserInfo, UserRole } from '../types/ivs';

interface DashboardProps {
  contract: Contract;
  account: string;
  isAdmin: boolean;
}

export default function Dashboard({ contract, account, isAdmin }: DashboardProps) {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [userRole, setUserRole] = useState<UserRole>({
    isAdmin,
    isAuthorized: false,
    hasProfile: false
  });
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const { getUserInfo, getMyUniqueId } = useIVSContract(contract);

  useEffect(() => {
    loadUserData();
  }, [account, refreshKey]);

  // Function to trigger refresh
  const refreshData = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  const loadUserData = async () => {
    setIsLoading(true);
    setAuthError(null);
    
    try {
      // First check if user is authorized by trying to get their unique ID
      const uniqueId = await getMyUniqueId();
      
      if (uniqueId) {
        // User is authorized, now get full info
        const info = await getUserInfo();
        setUserInfo(info);
        
        if (info) {
          setUserRole(prev => ({
            ...prev,
            isAuthorized: info.isAuthorized,
            hasProfile: info.hasEmail
          }));
        }
      } else {
        // User is not authorized
        setUserRole(prev => ({
          ...prev,
          isAuthorized: false,
          hasProfile: false
        }));
      }
    } catch (error: any) {
      console.error('Error loading user data:', error);
      
      // Check if it's an authorization error
      if (error.message?.includes('not authorized') || error.code === 'CALL_EXCEPTION') {
        setAuthError('User is not authorized to access the system');
        setUserRole(prev => ({
          ...prev,
          isAuthorized: false,
          hasProfile: false
        }));
      } else {
        setAuthError('Failed to load user data');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = () => {
    if (isAdmin) {
      return <Badge variant="default" className="bg-purple-600"><Shield className="w-3 h-3 mr-1" />Admin</Badge>;
    }
    if (userRole.isAuthorized) {
      return <Badge variant="default" className="bg-green-600"><User className="w-3 h-3 mr-1" />Authorized</Badge>;
    }
    return <Badge variant="secondary"><User className="w-3 h-3 mr-1" />Unauthorized</Badge>;
  };

  // Show loading state
  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Shield className="w-6 h-6 animate-spin" />
            Loading...
          </CardTitle>
          <CardDescription>
            Checking your authorization status...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Show unauthorized state for non-admin users
  if (!isAdmin && (!userRole.isAuthorized || authError)) {
    return (
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <AlertCircle className="w-6 h-6 text-orange-500" />
            Access Required
          </CardTitle>
          <CardDescription>
            You need to be authorized by an admin to access the Identity Verification System.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Connected as: <code className="bg-muted px-2 py-1 rounded">{account}</code>
          </p>
          
          {authError && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{authError}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Button onClick={loadUserData} variant="outline" className="w-full">
              Check Authorization Status
            </Button>
            <p className="text-xs text-muted-foreground">
              Contact an administrator to get authorized
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-6xl space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-6 h-6" />
                Identity Verification Dashboard
              </CardTitle>
              <CardDescription>
                Connected as: {account}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshData}
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              {getStatusBadge()}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Dashboard */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="score" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Score
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="verify" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Verify
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="admin" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Admin
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <UserProfilePanel 
            contract={contract} 
            userInfo={userInfo}
            onUpdate={() => {
              loadUserData();
              refreshData();
            }}
          />
        </TabsContent>

        <TabsContent value="score" className="space-y-4">
          <IdentityScorePanel 
            contract={contract}
            uniqueId={userInfo?.uniqueId}
            onUpdate={refreshData}
          />
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <TransactionHistoryPanel 
            contract={contract}
            transactions={userInfo?.transactions || []}
            onUpdate={refreshData}
          />
        </TabsContent>

        <TabsContent value="verify" className="space-y-4">
          <VerificationPanel contract={contract} />
        </TabsContent>

        {isAdmin && (
          <TabsContent value="admin" className="space-y-4">
            <AdminManagementPanel 
              contract={contract} 
              onUpdate={refreshData}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}