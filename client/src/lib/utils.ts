import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function truncateAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function formatTimestamp(timestamp: bigint | number): string {
  const date = new Date(Number(timestamp) * 1000);
  return date.toLocaleString();
}

export function formatUniqueId(id: string, chars = 8): string {
  if (!id) return 'Not available';
  return `${id.slice(0, chars)}...${id.slice(-chars)}`;
}

export function getEtherscanUrl(txHash: string, network = 'sepolia'): string {
  const baseUrl = network === 'mainnet' 
    ? 'https://etherscan.io' 
    : `https://${network}.etherscan.io`;
  return `${baseUrl}/tx/${txHash}`;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function hashEmail(email: string): string {
  // This is a simple hash for demo purposes
  // In production, use a proper cryptographic hash
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    const char = email.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(16);
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  if (score >= 40) return 'text-orange-600';
  return 'text-red-600';
}

export function getScoreGrade(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Poor';
}

export function formatBytes32(bytes32: string): string {
  if (!bytes32 || bytes32 === '0x0000000000000000000000000000000000000000000000000000000000000000') {
    return 'Not set';
  }
  return `${bytes32.slice(0, 10)}...${bytes32.slice(-8)}`;
}

export function timeAgo(timestamp: bigint | number): string {
  const now = Date.now();
  const time = Number(timestamp) * 1000;
  const diff = now - time;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return `${seconds} second${seconds > 1 ? 's' : ''} ago`;
}

export function generateQRCodeData(uniqueId: string): string {
  // Generate QR code data for identity verification
  return JSON.stringify({
    type: 'IVS_IDENTITY',
    uniqueId,
    timestamp: Date.now(),
    version: '1.0'
  });
}

export function parseQRCodeData(data: string): { uniqueId: string; timestamp: number } | null {
  try {
    const parsed = JSON.parse(data);
    if (parsed.type === 'IVS_IDENTITY' && parsed.uniqueId) {
      return {
        uniqueId: parsed.uniqueId,
        timestamp: parsed.timestamp
      };
    }
  } catch (error) {
    console.error('Error parsing QR code data:', error);
  }
  return null;
}