import AdminPanel from '../AdminPanel';

const mockContract = {
  authorizeUser: async (address: string) => {
    console.log('Authorizing user:', address);
    return { hash: '0x123...abc', wait: async () => {} };
  },
  revokeAuthorization: async (address: string) => {
    console.log('Revoking user:', address);
    return { hash: '0x456...def', wait: async () => {} };
  },
  setIssuerReliability: async (address: string, score: number) => {
    console.log('Setting reliability:', address, score);
    return { hash: '0x789...ghi', wait: async () => {} };
  },
} as any;

export default function AdminPanelExample() {
  return (
    <div className="p-6 bg-background min-h-screen flex items-center justify-center">
      <AdminPanel
        contract={mockContract}
        onTransactionSubmit={(hash) => console.log('Transaction hash:', hash)}
      />
    </div>
  );
}
