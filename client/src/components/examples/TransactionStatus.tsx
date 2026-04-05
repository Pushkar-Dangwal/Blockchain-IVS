import TransactionStatus from '../TransactionStatus';

export default function TransactionStatusExample() {
  return (
    <div className="p-6 bg-background min-h-screen flex items-center justify-center">
      <TransactionStatus txHash="0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef" />
    </div>
  );
}
