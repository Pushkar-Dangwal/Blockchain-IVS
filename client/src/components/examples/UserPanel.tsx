import UserPanel from '../UserPanel';

const mockContract = {
  transact: async (description: string) => {
    console.log('Performing transaction:', description);
    return { hash: '0xabc...123', wait: async () => {} };
  },
  recordVerificationActivity: async (uid: string) => {
    console.log('Recording verification for:', uid);
    return { hash: '0xdef...456', wait: async () => {} };
  },
  calculateScore: async (uid: string) => {
    console.log('Calculating score for:', uid);
    return { hash: '0xghi...789', wait: async () => {} };
  },
} as any;

export default function UserPanelExample() {
  return (
    <div className="p-6 bg-background min-h-screen flex items-center justify-center">
      <UserPanel
        contract={mockContract}
        onTransactionSubmit={(hash) => console.log('Transaction hash:', hash)}
      />
    </div>
  );
}
