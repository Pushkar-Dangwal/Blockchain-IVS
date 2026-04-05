import ConnectWallet from '../ConnectWallet';

export default function ConnectWalletExample() {
  return (
    <ConnectWallet
      onConnect={() => console.log('Connect wallet clicked')}
      isConnecting={false}
    />
  );
}
