import WalletConnection from '../WalletConnection';

export default function WalletConnectionExample() {
  return (
    <div className="p-6 bg-background min-h-screen flex items-center justify-center">
      <WalletConnection
        account="0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
        network="sepolia"
        isAdmin={true}
      />
    </div>
  );
}
