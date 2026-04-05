# Deployment Guide

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Build for production**
   ```bash
   npm run build
   ```

## Environment Setup

### Required Environment Variables

Create a `.env` file in the root directory:

```env
# Contract Configuration
VITE_CONTRACT_ADDRESS=0xE366c0D7242A2c2C66A63d9C58aDA9149C8C16EF
VITE_NETWORK=sepolia
VITE_CHAIN_ID=11155111

# Optional: Custom RPC endpoints
VITE_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
VITE_MAINNET_RPC_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID
```

### Network Configuration

The application is configured for Sepolia testnet by default. To switch networks:

1. Update `client/src/lib/config.ts`
2. Change contract address and chain ID
3. Update network settings

## Deployment Options

### Option 1: Vercel (Recommended)

1. **Connect to Vercel**
   ```bash
   npm i -g vercel
   vercel login
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

3. **Set Environment Variables**
   - Go to Vercel dashboard
   - Add environment variables from `.env`

### Option 2: Netlify

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**
   - Drag and drop `dist` folder to Netlify
   - Or use Netlify CLI:
   ```bash
   npm i -g netlify-cli
   netlify deploy --prod --dir=dist
   ```

### Option 3: Static Hosting

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Upload `dist` folder** to any static hosting service:
   - GitHub Pages
   - AWS S3 + CloudFront
   - Firebase Hosting
   - Surge.sh

## Production Checklist

- [ ] Contract address is correct for target network
- [ ] Environment variables are set
- [ ] Build completes without errors
- [ ] MetaMask integration works
- [ ] Network switching functions properly
- [ ] All features tested on target network
- [ ] Error handling works correctly
- [ ] Mobile responsiveness verified

## Troubleshooting

### Common Issues

1. **MetaMask not detected**
   - Ensure MetaMask is installed
   - Check browser compatibility
   - Verify HTTPS in production

2. **Wrong network**
   - Check chain ID configuration
   - Verify network switching logic
   - Ensure RPC endpoints are correct

3. **Contract interaction fails**
   - Verify contract address
   - Check ABI is up to date
   - Ensure wallet has sufficient gas

4. **Build errors**
   - Run `npm run check` for TypeScript errors
   - Check all imports are correct
   - Verify all dependencies are installed

### Performance Optimization

1. **Bundle Analysis**
   ```bash
   npm run build -- --analyze
   ```

2. **Code Splitting**
   - Components are already lazy-loaded
   - Consider route-based splitting for larger apps

3. **Asset Optimization**
   - Images are optimized automatically
   - Consider CDN for static assets

## Monitoring

### Error Tracking
Consider integrating:
- Sentry for error tracking
- LogRocket for session replay
- Google Analytics for usage metrics

### Performance Monitoring
- Web Vitals tracking
- Bundle size monitoring
- Load time optimization

## Security Considerations

1. **Environment Variables**
   - Never commit sensitive data
   - Use different configs for different environments
   - Validate all environment variables

2. **Contract Security**
   - Verify contract addresses
   - Use checksummed addresses
   - Implement proper error handling

3. **User Security**
   - Validate all user inputs
   - Sanitize data before display
   - Implement rate limiting where needed