import { useState, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "./components/ThemeProvider";
import { ThemeToggle } from "./components/ThemeToggle";
import { connectWallet, type WalletConnection } from "./lib/wallet";
import ConnectWallet from "./components/ConnectWallet";
import WalletConnectionCard from "./components/WalletConnection";
import Dashboard from "./components/Dashboard";
import TransactionStatus from "./components/TransactionStatus";

function App() {
  const [wallet, setWallet] = useState<WalletConnection | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string>();
  const [lastTxHash, setLastTxHash] = useState<string>();

  const handleConnect = async () => {
    setIsConnecting(true);
    setError(undefined);
    
    try {
      const connection = await connectWallet();
      setWallet(connection);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', () => {
        window.location.reload();
      });
      
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
  }, []);

  return (
    <ThemeProvider defaultTheme="light" storageKey="ivs-ui-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div className="min-h-screen bg-background">
            {/* Header with theme toggle */}
            <div className="border-b">
              <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold">IVS</h1>
                </div>
                <ThemeToggle />
              </div>
            </div>

            <div className="container mx-auto p-6 space-y-6">
              {!wallet ? (
                <>
                  <div className="text-center space-y-2 mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                      Secure Identity Verification System
                    </h1>
                    <p className="text-muted-foreground">
                      Blockchain-based identity verification on Sepolia testnet
                    </p>
                  </div>
                  <ConnectWallet
                    onConnect={handleConnect}
                    isConnecting={isConnecting}
                    error={error}
                  />
                </>
              ) : (
                <>
                  <div className="text-center space-y-2 mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                      Identity Verification Dashboard
                    </h1>
                    <p className="text-muted-foreground">
                      Manage your blockchain identity and verification status
                    </p>
                  </div>

                  <div className="flex flex-col items-center space-y-6">
                    <WalletConnectionCard
                      account={wallet.account}
                      network={wallet.network}
                      isAdmin={wallet.isAdmin}
                    />

                    <Dashboard
                      contract={wallet.contract}
                      account={wallet.account}
                      isAdmin={wallet.isAdmin}
                    />

                    {lastTxHash && <TransactionStatus txHash={lastTxHash} />}
                  </div>
                </>
              )}
            </div>
          </div>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
