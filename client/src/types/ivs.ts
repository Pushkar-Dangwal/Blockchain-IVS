export interface UserInfo {
  uniqueId: string;
  emailHash: string;
  hasEmail: boolean;
  isAuthorized: boolean;
  transactions: Transaction[];
}

export interface Transaction {
  timestamp: bigint;
  action: string;
}

export interface IdentityScore {
  usageFrequency: bigint;
  issuerReliability: bigint;
  lastVerification: bigint;
  transparencyScore: bigint;
  totalScore: bigint;
}

export interface ScoreBreakdown {
  usage: number;
  reliability: number;
  transparency: number;
  recency: number;
  total: number;
}

export interface VerificationResult {
  isAuthorized: boolean;
  lastVerification: bigint;
  totalScore: bigint;
  isActive?: boolean;
}

export interface UserRole {
  isAdmin: boolean;
  isAuthorized: boolean;
  hasProfile: boolean;
}

export type TransactionType = 
  | 'LOGIN'
  | 'KYC_SUBMISSION'
  | 'VERIFICATION_REQUEST'
  | 'PROFILE_UPDATE'
  | 'EMAIL_VERIFICATION'
  | 'SCORE_CALCULATION'
  | 'CUSTOM';

export interface ActivityLog {
  id: string;
  timestamp: Date;
  action: string;
  txHash?: string;
  status: 'pending' | 'success' | 'failed';
}