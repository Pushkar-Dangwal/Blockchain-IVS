import { BrowserProvider, Contract } from "ethers";
import IVS_ABI from "../abi/IVS.json";
import { config } from "./config";

export const CONTRACT_ADDRESS = "0x02AA01eE1B2563618efb94FDDe34D59575c58415"; // Updated contract address

export interface WalletConnection {
  account: string;
  network: string;
  contract: Contract;
  isAdmin: boolean;
  chainId: number;
}

export async function connectWallet(): Promise<WalletConnection> {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed. Please install MetaMask to use this application.");
  }

  // Request account access
  await window.ethereum.request({ method: 'eth_requestAccounts' });

  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();

  const net = await provider.getNetwork();
  const chainId = Number(net.chainId);
  
  // Check if we're on the correct network
  if (chainId !== config.contract.chainId) {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${config.contract.chainId.toString(16)}` }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: `0x${config.contract.chainId.toString(16)}`,
            chainName: config.networks.sepolia.name,
            rpcUrls: [config.networks.sepolia.rpcUrl],
            blockExplorerUrls: [config.networks.sepolia.explorerUrl],
            nativeCurrency: {
              name: config.networks.sepolia.currency,
              symbol: config.networks.sepolia.currency,
              decimals: 18,
            },
          }],
        });
      } else {
        throw switchError;
      }
    }
  }

  const networkName = net.name === "unknown" ? `Chain ID: ${net.chainId}` : net.name;
  const contract = new Contract(CONTRACT_ADDRESS, IVS_ABI.abi, signer);

  let isAdmin = false;
  try {
    const adminRole = await contract.ADMIN_ROLE();
    isAdmin = await contract.hasRole(adminRole, address);
  } catch (error) {
    console.error("Role check error:", error);
  }

  return {
    account: address,
    network: networkName,
    contract,
    isAdmin,
    chainId,
  };
}

export function truncateAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export async function switchToNetwork(chainId: number): Promise<void> {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed");
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${chainId.toString(16)}` }],
    });
  } catch (error: any) {
    if (error.code === 4902) {
      // Network not added to MetaMask
      const network = Object.values(config.networks).find(n => n.chainId === chainId);
      if (network) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: `0x${chainId.toString(16)}`,
            chainName: network.name,
            rpcUrls: [network.rpcUrl],
            blockExplorerUrls: [network.explorerUrl],
            nativeCurrency: {
              name: network.currency,
              symbol: network.currency,
              decimals: 18,
            },
          }],
        });
      }
    } else {
      throw error;
    }
  }
}
