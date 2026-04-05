import { useState, useEffect } from 'react';
import { Contract } from 'ethers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Activity, Clock, Plus, Filter, ExternalLink } from 'lucide-react';
import { useIVSContract } from '../hooks/useIVSContract';
import type { Transaction, TransactionType } from '../types/ivs';

interface TransactionHistoryPanelProps {
  contract: Contract;
  transactions: Transaction[];
  onUpdate?: () => void;
}

const TRANSACTION_TYPES: { value: TransactionType; label: string }[] = [
  { value: 'LOGIN', label: 'Login' },
  { value: 'KYC_SUBMISSION', label: 'KYC Submission' },
  { value: 'VERIFICATION_REQUEST', label: 'Verification Request' },
  { value: 'PROFILE_UPDATE', label: 'Profile Update' },
  { value: 'EMAIL_VERIFICATION', label: 'Email Verification' },
  { value: 'SCORE_CALCULATION', label: 'Score Calculation' },
  { value: 'CUSTOM', label: 'Custom Action' },
];

export default function TransactionHistoryPanel({ contract, transactions, onUpdate }: TransactionHistoryPanelProps) {
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>(transactions);
  const [filterType, setFilterType] = useState<string>('all');
  const [customAction, setCustomAction] = useState('');
  const [selectedType, setSelectedType] = useState<TransactionType>('LOGIN');
  
  const { loading, recordTransaction } = useIVSContract(contract);

  useEffect(() => {
    filterTransactions();
  }, [transactions, filterType]);

  const filterTransactions = () => {
    if (filterType === 'all') {
      setFilteredTransactions(transactions);
    } else {
      setFilteredTransactions(
        transactions.filter(tx => 
          tx.action.toLowerCase().includes(filterType.toLowerCase())
        )
      );
    }
  };

  const handleAddTransaction = async () => {
    const action = selectedType === 'CUSTOM' ? customAction : selectedType;
    if (!action.trim()) return;

    try {
      await recordTransaction(action);
      setCustomAction('');
      onUpdate?.(); // Trigger refresh
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  const formatTimestamp = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleString();
  };

  const getActionBadge = (action: string) => {
    const actionUpper = action.toUpperCase();
    
    if (actionUpper.includes('LOGIN')) return <Badge variant="default">Login</Badge>;
    if (actionUpper.includes('KYC')) return <Badge className="bg-blue-600">KYC</Badge>;
    if (actionUpper.includes('VERIFICATION')) return <Badge className="bg-green-600">Verification</Badge>;
    if (actionUpper.includes('PROFILE') || actionUpper.includes('EMAIL')) return <Badge className="bg-purple-600">Profile</Badge>;
    if (actionUpper.includes('SCORE')) return <Badge className="bg-orange-600">Score</Badge>;
    
    return <Badge variant="secondary">Custom</Badge>;
  };

  const getEtherscanUrl = (txHash: string) => {
    // Assuming Sepolia testnet
    return `https://sepolia.etherscan.io/tx/${txHash}`;
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Transaction History */}
      <Card className="md:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Transaction History
              </CardTitle>
              <CardDescription>
                Your activity log and transaction history
              </CardDescription>
            </div>
            <Badge variant="outline">
              {filteredTransactions.length} transactions
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filter */}
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4" />
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Transactions</SelectItem>
                <SelectItem value="login">Login</SelectItem>
                <SelectItem value="kyc">KYC</SelectItem>
                <SelectItem value="verification">Verification</SelectItem>
                <SelectItem value="profile">Profile</SelectItem>
                <SelectItem value="score">Score</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <ScrollArea className="h-96">
            {filteredTransactions.length > 0 ? (
              <div className="space-y-3">
                {filteredTransactions
                  .sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
                  .map((tx, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            {getActionBadge(tx.action)}
                            <span className="text-sm font-medium">{tx.action}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatTimestamp(tx.timestamp)}
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No transactions found</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {filterType === 'all' 
                    ? 'Start using the system to see your activity here'
                    : 'No transactions match the current filter'
                  }
                </p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Add Transaction */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Record Activity
          </CardTitle>
          <CardDescription>
            Log a new transaction or activity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Transaction Type</label>
            <Select value={selectedType} onValueChange={(value) => setSelectedType(value as TransactionType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TRANSACTION_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedType === 'CUSTOM' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Custom Action</label>
              <Input
                placeholder="Enter custom action"
                value={customAction}
                onChange={(e) => setCustomAction(e.target.value)}
                disabled={loading}
              />
            </div>
          )}

          <Button 
            onClick={handleAddTransaction}
            disabled={loading || (selectedType === 'CUSTOM' && !customAction.trim())}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Record Transaction
          </Button>

          <Separator />

          <div className="space-y-2 text-sm">
            <h4 className="font-medium">Quick Stats</h4>
            <div className="space-y-1 text-muted-foreground">
              <div className="flex justify-between">
                <span>Total Transactions:</span>
                <span>{transactions.length}</span>
              </div>
              <div className="flex justify-between">
                <span>This Month:</span>
                <span>
                  {transactions.filter(tx => {
                    const txDate = new Date(Number(tx.timestamp) * 1000);
                    const now = new Date();
                    return txDate.getMonth() === now.getMonth() && 
                           txDate.getFullYear() === now.getFullYear();
                  }).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Last 7 Days:</span>
                <span>
                  {transactions.filter(tx => {
                    const txDate = new Date(Number(tx.timestamp) * 1000);
                    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                    return txDate >= weekAgo;
                  }).length}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}