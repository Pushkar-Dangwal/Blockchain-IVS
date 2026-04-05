import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';

// Read the ABI file
const abiPath = path.join(process.cwd(), '../client/src/abi/IVS.json');
const IVS_ABI = JSON.parse(fs.readFileSync(abiPath, 'utf8'));

// Configuration
const CONTRACT_ADDRESS = "0x02AA01eE1B2563618efb94FDDe34D59575c58415";

// Multiple RPC endpoints to try
const RPC_ENDPOINTS = [
    "https://rpc.ankr.com/eth_sepolia",
    "https://sepolia.blockpi.network/v1/rpc/public", 
    "https://rpc.sepolia.org",
    "https://sepolia.gateway.tenderly.co",
    "https://sepolia.drpc.org"
];

// Function to find a working RPC endpoint
async function findWorkingRPC() {
    for (const rpcUrl of RPC_ENDPOINTS) {
        try {
            console.log(`🔍 Trying RPC: ${rpcUrl}`);
            const provider = new ethers.JsonRpcProvider(rpcUrl);
            
            // Test the connection by getting the latest block
            await provider.getBlockNumber();
            console.log(`✅ Connected successfully to: ${rpcUrl}`);
            return provider;
        } catch (error) {
            console.log(`❌ Failed to connect to: ${rpcUrl}`);
            continue;
        }
    }
    throw new Error("❌ Could not connect to any Sepolia RPC endpoint");
}

// Get from command line arguments or environment variables
const ADMIN_PRIVATE_KEY = process.argv[2] || process.env.ADMIN_PRIVATE_KEY;
const USER_ADDRESS_TO_AUTHORIZE = process.argv[3] || process.env.USER_ADDRESS;

async function authorizeUser() {
    try {
        console.log("🚀 Starting user authorization process...");
        
        // Validate inputs
        if (!ADMIN_PRIVATE_KEY) {
            console.log("❌ Admin private key is required");
            console.log("Usage: node scripts/authorize-user.mjs <ADMIN_PRIVATE_KEY> <USER_ADDRESS>");
            console.log("Or set ADMIN_PRIVATE_KEY and USER_ADDRESS environment variables");
            process.exit(1);
        }
        
        if (!USER_ADDRESS_TO_AUTHORIZE) {
            console.log("❌ User address to authorize is required");
            console.log("Usage: node scripts/authorize-user.mjs <ADMIN_PRIVATE_KEY> <USER_ADDRESS>");
            console.log("Or set ADMIN_PRIVATE_KEY and USER_ADDRESS environment variables");
            process.exit(1);
        }

        // Validate address format
        if (!ethers.isAddress(USER_ADDRESS_TO_AUTHORIZE)) {
            throw new Error(`Invalid Ethereum address: ${USER_ADDRESS_TO_AUTHORIZE}`);
        }

        // Connect to Sepolia network
        console.log("🌐 Connecting to Sepolia network...");
        const provider = await findWorkingRPC();
        
        // Test connection
        const network = await provider.getNetwork();
        console.log(`📡 Connected to network: ${network.name} (Chain ID: ${network.chainId})`);
        
        // Create wallet from private key
        const adminWallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);
        console.log(`👤 Admin wallet: ${adminWallet.address}`);
        
        // Check admin wallet balance
        const balance = await provider.getBalance(adminWallet.address);
        console.log(`💰 Admin wallet balance: ${ethers.formatEther(balance)} ETH`);
        
        if (balance === 0n) {
            console.log("⚠️  Warning: Admin wallet has no ETH for gas fees");
        }
        
        // Connect to contract
        console.log("📄 Connecting to IVS contract...");
        const contract = new ethers.Contract(CONTRACT_ADDRESS, IVS_ABI.abi, adminWallet);
        
        // Verify admin role
        console.log("🔐 Verifying admin permissions...");
        const adminRole = await contract.ADMIN_ROLE();
        const isAdmin = await contract.hasRole(adminRole, adminWallet.address);
        
        if (!isAdmin) {
            throw new Error(`❌ Address ${adminWallet.address} does not have admin role`);
        }
        
        console.log("✅ Admin role verified");
        
        // Check if user is already authorized (this will help us understand the current state)
        console.log(`🔍 Checking current state for ${USER_ADDRESS_TO_AUTHORIZE}...`);
        
        try {
            // Try to get user info to see if they're already authorized
            const userInfo = await contract.viewMyInfo({ from: USER_ADDRESS_TO_AUTHORIZE });
            console.log("ℹ️  User is already authorized with unique ID:", userInfo.uniqueId);
            console.log("❓ Do you want to continue anyway? (This will fail but won't hurt)");
        } catch (error) {
            console.log("ℹ️  User is not yet authorized (this is expected)");
        }
        
        // Estimate gas
        console.log("⛽ Estimating gas...");
        const gasEstimate = await contract.authorizeUser.estimateGas(USER_ADDRESS_TO_AUTHORIZE);
        console.log(`⛽ Estimated gas: ${gasEstimate.toString()}`);
        
        // Get current gas price
        const gasPrice = await provider.getFeeData();
        console.log(`⛽ Current gas price: ${ethers.formatUnits(gasPrice.gasPrice, 'gwei')} gwei`);
        
        // Authorize the user
        console.log(`📝 Authorizing user: ${USER_ADDRESS_TO_AUTHORIZE}...`);
        const tx = await contract.authorizeUser(USER_ADDRESS_TO_AUTHORIZE, {
            gasLimit: gasEstimate * 120n / 100n // Add 20% buffer
        });
        
        console.log(`⏳ Transaction submitted: ${tx.hash}`);
        console.log("⏳ Waiting for confirmation...");
        
        const receipt = await tx.wait();
        
        if (receipt.status === 1) {
            console.log("🎉 User authorization successful!");
            console.log(`📋 Transaction hash: ${receipt.hash}`);
            console.log(`⛽ Gas used: ${receipt.gasUsed.toString()}`);
            console.log(`💰 Transaction cost: ${ethers.formatEther(receipt.gasUsed * receipt.gasPrice)} ETH`);
            
            // Parse events to get the unique ID
            console.log("📋 Parsing transaction events...");
            for (const log of receipt.logs) {
                try {
                    const parsedLog = contract.interface.parseLog(log);
                    if (parsedLog.name === 'UserAuthorized') {
                        console.log(`🆔 Unique ID assigned: ${parsedLog.args.uniqueId}`);
                        console.log(`👤 User address: ${parsedLog.args.userAddress}`);
                    }
                } catch (e) {
                    // Skip logs that don't match our contract
                }
            }
            
            console.log(`🔗 View on Etherscan: https://sepolia.etherscan.io/tx/${receipt.hash}`);
            console.log("✅ User can now access the IVS application!");
            
        } else {
            throw new Error("Transaction failed");
        }
        
    } catch (error) {
        console.error("❌ Error:", error.message);
        
        if (error.code === 'CALL_EXCEPTION') {
            console.error("💡 This might be because:");
            console.error("   - User is already authorized");
            console.error("   - Admin doesn't have sufficient permissions");
            console.error("   - Contract address is incorrect");
            console.error("   - Network connection issues");
        }
        
        if (error.code === 'INSUFFICIENT_FUNDS') {
            console.error("💡 Admin wallet needs more ETH for gas fees");
        }
        
        if (error.code === 'NETWORK_ERROR') {
            console.error("💡 Network connection problem - check your internet connection");
        }
        
        process.exit(1);
    }
}

// Show usage if no arguments
if (process.argv.length < 4 && !process.env.ADMIN_PRIVATE_KEY) {
    console.log("🔧 IVS User Authorization Script");
    console.log("================================");
    console.log("");
    console.log("Usage:");
    console.log("  node scripts/authorize-user.mjs <ADMIN_PRIVATE_KEY> <USER_ADDRESS>");
    console.log("");
    console.log("Or set environment variables:");
    console.log("  ADMIN_PRIVATE_KEY=your_private_key");
    console.log("  USER_ADDRESS=0x...");
    console.log("  node scripts/authorize-user.mjs");
    console.log("");
    console.log("Example:");
    console.log("  node scripts/authorize-user.mjs 0x1234... 0x5678...");
    console.log("");
    process.exit(1);
}

// Run the script
authorizeUser();