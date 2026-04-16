# Secure Identity Verification System (IVS)

A modern web application frontend for a blockchain-based Identity Verification System that manages user authorization, identity scoring, and verification activities on Ethereum.

## 🔗 System Architecture & Repositories

This project follows a modular architecture with separate repositories for blockchain/frontend and machine learning components:

- **Blockchain + Frontend (This Repo)**: Smart contract integration, identity management, and user interface  
- **ML Fraud Detection Pipeline**: https://github.com/Pushkar-Dangwal/Isolation-model  
  - Implements Deep Isolation Forest and LightGBM for anomaly detection and fraud risk classification

## 🚀 Features

### Core Functionality
- **Wallet Integration**: MetaMask/WalletConnect support with automatic network switching
- **Role-Based Access**: Admin dashboard and user portal with different capabilities
- **Identity Management**: Secure email verification and profile management
- **Identity Scoring**: Real-time score calculation with transparent breakdown
- **Transaction History**: Complete activity logging and timeline
- **Public Verification**: Third-party identity verification interface

### Admin Features
- Authorize/revoke user access
- Set issuer reliability scores
- Verify email hashes
- User management dashboard
- System configuration

### User Features
- Profile management with email verification
- Identity score tracking and improvement
- Transaction history and activity logging
- Verification activity recording
- Real-time score updates

### Technical Features
- **Modern Stack**: React 18, TypeScript, Tailwind CSS
- **Web3 Integration**: ethers.js v6 for blockchain interaction
- **State Management**: React Query for server state
- **UI Components**: Radix UI with custom styling
- **Theme Support**: Dark/light mode with system preference
- **Responsive Design**: Mobile-first approach
- **Real-time Updates**: Live transaction monitoring

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Radix UI
- **Web3**: ethers.js v6
- **State Management**: TanStack Query (React Query)
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Package Manager**: npm

## 📋 Prerequisites

- Node.js 18+ 
- MetaMask browser extension
- Access to Sepolia testnet ETH

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ivs-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

5. **Connect your wallet**
   - Install MetaMask if not already installed
   - Switch to Sepolia testnet
   - Connect your wallet to the application

## 🔧 Configuration

### Contract Configuration
The contract address and network settings are configured in `client/src/lib/config.ts`:

```typescript
export const config = {
  contract: {
    address: "0xE366c0D7242A2c2C66A63d9C58aDA9149C8C16EF",
    network: "sepolia",
    chainId: 11155111,
  },
  // ... other settings
};
```

### Environment Variables
Create a `.env` file in the root directory for any sensitive configuration:

```env
VITE_CONTRACT_ADDRESS=0xE366c0D7242A2c2C66A63d9C58aDA9149C8C16EF
VITE_NETWORK=sepolia
```

## 📱 Usage

### For Regular Users

1. **Connect Wallet**: Click "Connect Wallet" and approve the connection
2. **Get Authorized**: Request authorization from an admin
3. **Set Up Profile**: Add and verify your email address
4. **Record Activities**: Log transactions and verification activities
5. **Monitor Score**: Track your identity score and improvements

### For Administrators

1. **Connect Admin Wallet**: Connect with an admin-authorized wallet
2. **Manage Users**: Authorize new users or revoke access
3. **Set Reliability**: Configure issuer reliability scores
4. **Verify Data**: Verify user email hashes and data integrity
5. **Monitor System**: View system statistics and user activities

## 🏗 Project Structure

```
client/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # Reusable UI components
│   │   ├── Dashboard.tsx   # Main dashboard
│   │   ├── UserProfilePanel.tsx
│   │   ├── IdentityScorePanel.tsx
│   │   ├── TransactionHistoryPanel.tsx
│   │   ├── VerificationPanel.tsx
│   │   └── AdminManagementPanel.tsx
│   ├── hooks/              # Custom React hooks
│   │   ├── useIVSContract.ts
│   │   └── use-toast.ts
│   ├── lib/                # Utility libraries
│   │   ├── wallet.ts       # Wallet connection logic
│   │   ├── config.ts       # App configuration
│   │   └── utils.ts        # Helper functions
│   ├── types/              # TypeScript type definitions
│   │   ├── ivs.ts          # IVS-specific types
│   │   └── ethereum.d.ts   # Ethereum types
│   └── abi/                # Contract ABIs
│       └── IVS.json        # IVS contract ABI
```

## 🔐 Security Features

- **Input Validation**: Client-side validation for all user inputs
- **Secure Hashing**: Email hashing for privacy protection
- **Wallet Signatures**: Transaction signing for authentication
- **Rate Limiting**: Protection against spam transactions
- **Network Verification**: Automatic network switching and validation

## 🎨 UI/UX Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark/Light Mode**: Theme switching with system preference detection
- **Loading States**: Clear feedback for pending transactions
- **Error Handling**: User-friendly error messages
- **Toast Notifications**: Real-time feedback for user actions
- **Progress Indicators**: Visual feedback for multi-step processes

## 📊 Identity Scoring System

The identity score is calculated based on:

- **Usage Frequency (25%)**: How often the user interacts with the system
- **Issuer Reliability (30%)**: Reliability score set by administrators
- **Transparency Score (15%)**: Number of verification activities
- **Recency Bonus (30 points)**: Recent activity within 30 days (10 points if stale)

## 🔗 Smart Contract Integration

The frontend integrates with the Secure Identity Verification System smart contract deployed on Sepolia testnet:

**Contract Address**: `0x02AA01eE1B2563618efb94FDDe34D59575c58415`

### Key Contract Functions
- `authorizeUser()` - Admin authorizes new users
- `updateProfileHash()` - Users update email hash
- `calculateScore()` - Calculate identity score
- `verifyIdentityOnChain()` - Public identity verification
- `recordVerificationActivity()` - Log verification events

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel/Netlify
The built files in the `dist` directory can be deployed to any static hosting service.

### Environment Configuration
Ensure production environment variables are set:
- Contract addresses for mainnet/testnet
- RPC endpoints
- Explorer URLs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation in the `/docs` folder
- Review the smart contract documentation

## 🔮 Future Enhancements

- QR code generation for identity sharing
- Multi-signature wallet support
- Advanced analytics dashboard
- Mobile app development
- Integration with other identity providers
- Batch operations for administrators
- Advanced search and filtering
- Export functionality for reports
