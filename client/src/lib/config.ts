// Environment configuration for the IVS application

export const config = {
  // Contract configuration
  contract: {
    address: "0x02AA01eE1B2563618efb94FDDe34D59575c58415", // Updated contract address
    network: "sepolia",
    chainId: 11155111,
  },
  
  // Network configuration
  networks: {
    sepolia: {
      name: "Sepolia Testnet",
      chainId: 11155111,
      rpcUrl: "https://sepolia.infura.io/v3/",
      explorerUrl: "https://sepolia.etherscan.io",
      currency: "SepoliaETH"
    },
    mainnet: {
      name: "Ethereum Mainnet",
      chainId: 1,
      rpcUrl: "https://mainnet.infura.io/v3/",
      explorerUrl: "https://etherscan.io",
      currency: "ETH"
    }
  },
  
  // Application settings
  app: {
    name: "Secure Identity Verification System",
    version: "1.0.0",
    description: "Blockchain-based identity verification on Ethereum",
  },
  
  // Feature flags
  features: {
    qrCodeGeneration: true,
    emailEncryption: true,
    realTimeUpdates: true,
    darkMode: true,
  },
  
  // UI configuration
  ui: {
    defaultTheme: "light",
    animationDuration: 200,
    toastDuration: 5000,
  },
  
  // Scoring system constants
  scoring: {
    weights: {
      usage: 25,
      reliability: 30,
      transparency: 15,
    },
    recency: {
      period: 30 * 24 * 60 * 60, // 30 days in seconds
      recentPoints: 30,
      stalePoints: 10,
    },
    maxReliability: 10,
  },
  
  // Transaction types
  transactionTypes: [
    { value: 'LOGIN', label: 'Login' },
    { value: 'KYC_SUBMISSION', label: 'KYC Submission' },
    { value: 'VERIFICATION_REQUEST', label: 'Verification Request' },
    { value: 'PROFILE_UPDATE', label: 'Profile Update' },
    { value: 'EMAIL_VERIFICATION', label: 'Email Verification' },
    { value: 'SCORE_CALCULATION', label: 'Score Calculation' },
    { value: 'CUSTOM', label: 'Custom Action' },
  ],
} as const;

export type NetworkName = keyof typeof config.networks;
export type TransactionType = typeof config.transactionTypes[number]['value'];