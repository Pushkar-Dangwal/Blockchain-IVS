# Alternative Sepolia RPC Endpoints

If one RPC endpoint doesn't work, try these alternatives:

## Public RPC Endpoints (No API Key Required)

1. **Sepolia.org** (Primary)
   ```
   https://rpc.sepolia.org
   ```

2. **Ethereum Foundation**
   ```
   https://sepolia.gateway.tenderly.co
   ```

3. **Ankr**
   ```
   https://rpc.ankr.com/eth_sepolia
   ```

4. **BlockPI**
   ```
   https://sepolia.blockpi.network/v1/rpc/public
   ```

5. **Chainstack**
   ```
   https://sepolia.drpc.org
   ```

## How to Change RPC Endpoint

Edit the `RPC_URL` in the script:

```javascript
const RPC_URL = "https://rpc.sepolia.org"; // Change this line
```

## Test RPC Endpoint

You can test if an RPC endpoint is working by running:

```bash
curl -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' https://rpc.sepolia.org
```

This should return the current block number if the endpoint is working.