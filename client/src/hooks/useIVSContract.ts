import { useState, useCallback } from 'react';
import { Contract } from 'ethers';
import { useToast } from './use-toast';
import type { UserInfo, IdentityScore, VerificationResult, Transaction } from '../types/ivs';

export function useIVSContract(contract: Contract) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleTransaction = useCallback(async (
    operation: () => Promise<any>,
    successMessage: string,
    onSuccess?: (result: any) => void
  ) => {
    setLoading(true);
    try {
      const result = await operation();
      
      if (result.hash) {
        toast({
          title: "Transaction Submitted",
          description: `Transaction hash: ${result.hash.slice(0, 10)}...`,
        });
        
        const receipt = await result.wait();
        if (receipt.status === 1) {
          toast({
            title: "Success",
            description: successMessage,
          });
          
          // Auto-refresh after successful transaction
          setTimeout(() => {
            window.location.reload();
          }, 2000);
          
          onSuccess?.(receipt);
        } else {
          throw new Error("Transaction failed");
        }
      } else {
        onSuccess?.(result);
      }
      
      return result;
    } catch (error: any) {
      console.error('Transaction error:', error);
      toast({
        title: "Error",
        description: error.message || "Transaction failed",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Admin functions
  const authorizeUser = useCallback(async (userAddress: string) => {
    return handleTransaction(
      () => contract.authorizeUser(userAddress),
      `User ${userAddress} has been authorized`
    );
  }, [contract, handleTransaction]);

  const revokeAuthorization = useCallback(async (userAddress: string) => {
    return handleTransaction(
      () => contract.revokeAuthorization(userAddress),
      `Authorization revoked for ${userAddress}`
    );
  }, [contract, handleTransaction]);

  const setIssuerReliability = useCallback(async (uniqueId: string, reliability: number) => {
    return handleTransaction(
      () => contract.setIssuerReliability(uniqueId, reliability),
      `Issuer reliability set to ${reliability}`
    );
  }, [contract, handleTransaction]);

  // User functions
  const updateProfileHash = useCallback(async (email: string) => {
    return handleTransaction(
      () => contract.updateProfileHash(email),
      "Email hash updated successfully"
    );
  }, [contract, handleTransaction]);

  const recordTransaction = useCallback(async (action: string) => {
    return handleTransaction(
      () => contract.transact(action),
      `Transaction recorded: ${action}`
    );
  }, [contract, handleTransaction]);

  const recordVerificationActivity = useCallback(async () => {
    return handleTransaction(
      () => contract.recordVerificationActivity(),
      "Verification activity recorded"
    );
  }, [contract, handleTransaction]);

  const calculateScore = useCallback(async () => {
    return handleTransaction(
      () => contract.calculateScore(),
      "Identity score calculated"
    );
  }, [contract, handleTransaction]);

  // View functions
  const getUserInfo = useCallback(async (): Promise<UserInfo | null> => {
    try {
      const info = await contract.viewMyInfo();
      return {
        uniqueId: info.uniqueId,
        emailHash: info.emailHash,
        hasEmail: info.hasEmail,
        isAuthorized: info.isAuthorized,
        transactions: info.transactions.map((tx: any) => ({
          timestamp: tx.timestamp,
          action: tx.action
        }))
      };
    } catch (error: any) {
      // Check if it's an authorization error
      if (error.code === 'CALL_EXCEPTION' || error.message?.includes('not authorized')) {
        console.log('User is not authorized');
        return null;
      }
      console.error('Error fetching user info:', error);
      throw error;
    }
  }, [contract]);

  const getScore = useCallback(async (uniqueId: string): Promise<IdentityScore | null> => {
    try {
      return await contract.viewScore(uniqueId);
    } catch (error: any) {
      if (error.code === 'CALL_EXCEPTION') {
        console.log('Score not available for this unique ID');
        return null;
      }
      console.error('Error fetching score:', error);
      throw error;
    }
  }, [contract]);

  const getMyUniqueId = useCallback(async (): Promise<string | null> => {
    try {
      const uniqueId = await contract.getMyUniqueId();
      return uniqueId;
    } catch (error: any) {
      // Check if it's an authorization error
      if (error.code === 'CALL_EXCEPTION' || error.message?.includes('not authorized')) {
        console.log('User is not authorized - no unique ID available');
        return null;
      }
      console.error('Error fetching unique ID:', error);
      throw error;
    }
  }, [contract]);

  const verifyIdentity = useCallback(async (uniqueId: string): Promise<VerificationResult | null> => {
    try {
      // First try to get the user address from the unique ID
      const userAddress = await contract.userAddressesByUniqueId(uniqueId);
      
      if (userAddress === '0x0000000000000000000000000000000000000000') {
        console.log('Unique ID not found');
        return null;
      }
      
      // Now call verifyIdentityOnChain
      const result = await contract.verifyIdentityOnChain(uniqueId);
      return {
        isAuthorized: result.isAuthorized,
        lastVerification: result.lastVerification,
        totalScore: result.totalScore
      };
    } catch (error: any) {
      if (error.code === 'CALL_EXCEPTION') {
        console.log('Identity verification failed - ID may not exist');
        return null;
      }
      console.error('Error verifying identity:', error);
      throw error;
    }
  }, [contract]);

  const getTransactions = useCallback(async (): Promise<Transaction[]> => {
    try {
      const transactions = await contract.viewMyTransactions();
      return transactions.map((tx: any) => ({
        timestamp: tx.timestamp,
        action: tx.action
      }));
    } catch (error: any) {
      if (error.code === 'CALL_EXCEPTION' || error.message?.includes('not authorized')) {
        console.log('User is not authorized - no transactions available');
        return [];
      }
      console.error('Error fetching transactions:', error);
      return [];
    }
  }, [contract]);

  return {
    loading,
    // Admin functions
    authorizeUser,
    revokeAuthorization,
    setIssuerReliability,
    // User functions
    updateProfileHash,
    recordTransaction,
    recordVerificationActivity,
    calculateScore,
    // View functions
    getUserInfo,
    getScore,
    getMyUniqueId,
    verifyIdentity,
    getTransactions,
  };
}