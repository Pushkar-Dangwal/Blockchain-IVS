import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';

// Read the ABI file
const abiPath = path.join(process.cwd(), 'client/src/abi/IVS.json');
const IVS_ABI = JSON.parse(fs.readFileSync(abiPath, 'utf8'));

// Configuration
const CONTRACT_ADDRESS = "0x02AA01eE1B2563618efb94FDDe34D59575c58415"; // Updated contract address

// Get from command line arguments
const ADMIN_PRIVATE_KEY = process.argv[2];
const USER_ADDRESS_TO_AUTHORIZE = process.argv[3];

async function authorizeUser() {
    try {
        console.log("🚀 IVS User Authorization");
        console.log("========================");
        
        if (!ADMIN_PRIVATE_KEY || !USER_ADDRESS_TO_AUTHORIZE) {
            console.log("Usage: node authorize-simple.mjs <ADMIN_PRIVATE_KEY> <USER_ADDRESS>");
            console.log("Example: node authorize-simple.mjs 0x1234... 0x5678...");
            process.exit(1);
        }

        // Validate address format
        if (!ethers.isAddress(USER_ADDRESS_TO_AUTHORIZE)) {
            throw new Error(`Invalid address: ${USER_ADDRESS_TO_AUTHORIZE}`);
        }

        // Try Alchemy public endpoint first
        console.log("🌐 Connecting to Sepolia...");
        let provider;
        
        try {
            // Alchemy public endpoint
            provider = new ethers.JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/demo");
            await provider.getBlockNumber(); // Test connection
            console.log("✅ Connected via Alchemy");
        } catch (e) {
            try {
                // Fallback to Ankr
                provider = new ethers.JsonRpcProvider("https://rpc.ankr.com/eth_sepolia");
                await provider.getBlockNumber();
                console.log("✅ Connected via Ankr");
            } catch (e2) {
                throw new Error("❌ Could not connect to Sepolia network");
            }
        }
        
        // Create wallet
        const adminWallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);
        console.log(`👤 Admin: ${adminWallet.address}`);
        
        // Check balance
        const balance = await provider.getBalance(adminWallet.address);
        console.log(`💰 Balance: ${ethers.formatEther(balance)} ETH`);
        
        if (balance === 0n) {
            console.log("⚠️  Warning: No ETH for gas fees!");
        }
        
        // Connect to contract
        const contract = new ethers.Contract(CONTRACT_ADDRESS, IVS_ABI.abi, adminWallet);
        
        // Check admin role
        console.log("🔐 Checking admin role...");
        const adminRole = await contract.ADMIN_ROLE();
        const isAdmin = await contract.hasRole(adminRole, adminWallet.address);
        
        if (!isAdmin) {
            throw new Error(`❌ ${adminWallet.address} is not an admin`);
        }
        console.log("✅ Admin role confirmed");
        
        // Authorize user
        console.log(`📝 Authorizing: ${USER_ADDRESS_TO_AUTHORIZE}`);
        
        const tx = await contract.authorizeUser(USER_ADDRESS_TO_AUTHORIZE);
        console.log(`⏳ TX: ${tx.hash}`);
        
        const receipt = await tx.wait();
        
        if (receipt.status === 1) {
            console.log("🎉 SUCCESS!");
            console.log(`⛽ Gas used: ${receipt.gasUsed}`);
            
            // Find the UserAuthorized event
            for (const log of receipt.logs) {
                try {
                    const parsed = contract.interface.parseLog(log);
                    if (parsed.name === 'UserAuthorized') {
                        console.log(`🆔 Unique ID: ${parsed.args.uniqueId}`);
                    }
                } catch (e) {}
            }
            
            console.log(`🔗 Etherscan: https://sepolia.etherscan.io/tx/${receipt.hash}`);
            console.log("✅ User can now access the IVS app!");
        } else {
            throw new Error("Transaction failed");
        }
        
    } catch (error) {
        console.error("❌ Error:", error.message);
        
        if (error.reason) {
            console.error("💡 Reason:", error.reason);
        }
        
        if (error.message.includes("already authorized")) {
            console.log("ℹ️  User is already authorized - they can use the app!");
        }
        
        process.exit(1);
    }
}

authorizeUser();