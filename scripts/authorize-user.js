const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Read the ABI file
const abiPath = path.join(__dirname, '../client/src/abi/IVS.json');
const IVS_ABI = JSON.parse(fs.readFileSync(abiPath, 'utf8'));

// Configuration
const CONTRACT_ADDRESS = "0x02AA01eE1B2563618efb94FDDe34D59575c58415"; // Updated contract address
const RPC_URL = "https://rpc.sepolia.org"; // Public Sepolia RPC (no API key needed)

// You'll need to provide these
const ADMIN_PRIVATE_KEY = "a1e2a44e037eed36af7d6fbdf1719a7507ef52f732958a58961326491c76f060"; // Set this as environment variable
const USER_ADDRESS_TO_AUTHORIZE = "0x73Dd4627eA3aF28D827B048CeA73B6ab0589D235"; // The address you want to authorize

async function authorizeUser() {
    try {
        console.log("🚀 Starting user authorization process...");
        
        // Validate inputs
        if (!ADMIN_PRIVATE_KEY) {
            throw new Error("ADMIN_PRIVATE_KEY environment variable is required");
        }
        
        if (!USER_ADDRESS_TO_AUTHORIZE) {
            throw new Error("USER_ADDRESS environment variable is required");
        }

        // Connect to Sepolia network
        console.log("🌐 Connecting to Sepolia network...");
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        
        // Create wallet from private key
        const adminWallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);
        console.log(`👤 Admin wallet: ${adminWallet.address}`);
        
        // Connect to contract
        console.log("📄 Connecting to IVS contract...");
        const contract = new ethers.Contract(CONTRACT_ADDRESS, IVS_ABI.abi, adminWallet);
        
        // Verify admin role
        console.log("🔐 Verifying admin permissions...");
        const adminRole = await contract.ADMIN_ROLE();
        const isAdmin = await contract.hasRole(adminRole, adminWallet.address);
        
        if (!isAdmin) {
            throw new Error(`Address ${adminWallet.address} does not have admin role`);
        }
        
        console.log("✅ Admin role verified");
        
        // Check if user is already authorized
        console.log(`🔍 Checking authorization status for ${USER_ADDRESS_TO_AUTHORIZE}...`);
        
        // Authorize the user
        console.log(`📝 Authorizing user: ${USER_ADDRESS_TO_AUTHORIZE}...`);
        const tx = await contract.authorizeUser(USER_ADDRESS_TO_AUTHORIZE);
        
        console.log(`⏳ Transaction submitted: ${tx.hash}`);
        console.log("⏳ Waiting for confirmation...");
        
        const receipt = await tx.wait();
        
        if (receipt.status === 1) {
            console.log("🎉 User authorization successful!");
            console.log(`📋 Transaction hash: ${receipt.hash}`);
            console.log(`⛽ Gas used: ${receipt.gasUsed.toString()}`);
            
            // Get the unique ID from the event
            const event = receipt.logs.find(log => {
                try {
                    const parsed = contract.interface.parseLog(log);
                    return parsed.name === 'UserAuthorized';
                } catch (e) {
                    return false;
                }
            });
            
            if (event) {
                const parsedEvent = contract.interface.parseLog(event);
                console.log(`🆔 Unique ID assigned: ${parsedEvent.args.uniqueId}`);
            }
            
            console.log(`🔗 View on Etherscan: https://sepolia.etherscan.io/tx/${receipt.hash}`);
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
        }
        
        process.exit(1);
    }
}

// Run the script
authorizeUser();