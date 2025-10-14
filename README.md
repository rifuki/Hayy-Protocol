# StackLend Protocol 🚀

**Cross-Chain Lending Protocol between Stacks and Sui Networks**

StackLend is a revolutionary decentralized finance (DeFi) protocol that enables seamless cross-chain lending by using STX as collateral on Stacks blockchain to borrow tokens on Sui Network. The protocol bridges Bitcoin's security through Stacks with the high-performance, low-cost infrastructure of Sui blockchain.

## 🌟 Features

- **Cross-Chain Lending**: Use STX as collateral to borrow tokens on Sui Network
- **Stacks Integration**: Leverage Bitcoin's security through Stacks blockchain  
- **Sui Network**: Ultra-fast transactions with ~2 second finality and low gas fees
- **Real-Time Relayer**: Automated cross-chain transaction processing
- **User-Friendly Interface**: Modern React frontend with wallet integration
- **Secure Smart Contracts**: Audited Move contracts on Sui and Clarity contracts on Stacks

## 🏗️ Architecture

The protocol consists of four main components:

```mermaid
graph TB
    A[Frontend dApp] --> B[Stacks Contracts]
    A --> C[Sui Move Contracts]
    B --> D[Cross-Chain Relayer]
    D --> C
    
    B --> E[STX Collateral]
    C --> F[Token Borrowing]
    D --> G[Event Processing]
```

### Components

1. **Frontend (`stacklend-fe`)**: React-based user interface with Stacks and Sui wallet integration
2. **Stacks Contracts (`stacklend-stacks`)**: Clarity smart contracts for collateral management
3. **Sui Contracts (`stacklend-sui`)**: Move smart contracts for token borrowing and lending
4. **Relayer (`stacklend-relayer`)**: Node.js service for cross-chain event processing

## 📋 Contract Addresses

### Stacks Testnet

| Contract | Address |
|----------|---------|
| **Collateral V1** | `STBGS8Y6KHWQ3D2P9BTQ83VBD3ZCK7BDTWMGJY5Z.collateral-v1` |
| **Lending V1** | `STBGS8Y6KHWQ3D2P9BTQ83VBD3ZCK7BDTWMGJY5Z.lending-v1` |

### Sui Testnet

| Contract | Address | Explorer |
|----------|---------|----------|
| **BorrowController Package** | `0x...` | [View on Sui Explorer](https://testnet.suivision.xyz/) |
| **MockUSDC Pool** | `0x...` | [View on Sui Explorer](https://testnet.suivision.xyz/) |
| **sBTC Lending Pool** | `0x...` | [View on Sui Explorer](https://testnet.suivision.xyz/) |

## 🔗 Explorer Links

- **Stacks Testnet Collateral-V1**: [Stacks Explorer](https://explorer.hiro.so/txid/STBGS8Y6KHWQ3D2P9BTQ83VBD3ZCK7BDTWMGJY5Z.collateral-v1?chain=testnet)
- **Stacks Testnet Lending-V1**: [Stacks Explorer](https://explorer.hiro.so/txid/STBGS8Y6KHWQ3D2P9BTQ83VBD3ZCK7BDTWMGJY5Z.lending-v1?chain=testnet)
- **Sui Testnet**: [Sui Vision Explorer](https://testnet.suivision.xyz/)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/pnpm
- Git
- Stacks wallet (Hiro Wallet, Leather, etc.)
- Sui wallet (Sui Wallet, Suiet, Martian, etc.)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/xfajarr/stacklend.git
   cd stacklend
   ```

2. **Install dependencies for each component**
   ```bash
   # Frontend
   cd stacklend-fe
   npm install
   
   # Relayer
   cd ../stacklend-relayer
   npm install
   
   # Stacks contracts (optional, for development)
   cd ../stacklend-stacks
   npm install
   
   # Sui contracts (optional, for development)
   cd ../stacklend-sui
   sui client
   ```

3. **Configure environment variables**
   ```bash
   # In stacklend-relayer/
   cp .env.example .env
   # Edit .env with your RPC URLs and private keys
   ```

4. **Start the development servers**
   ```bash
   # Terminal 1: Start relayer
   cd stacklend-relayer
   npm start
   
   # Terminal 2: Start frontend
   cd stacklend-fe
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Relayer API: http://localhost:3000

## 💡 How It Works

1. **Deposit Collateral**: Users deposit STX tokens as collateral on Stacks blockchain
2. **Request Borrow**: Users specify the token and amount they want to borrow on Sui Network
3. **Cross-Chain Processing**: The relayer monitors Stacks events and processes requests
4. **Token Minting**: Sui Move contracts mint/transfer requested tokens to user's Sui address
5. **Repayment**: Users repay borrowed tokens on Sui to unlock their STX collateral

## 🛠️ Development

### Frontend Development

```bash
cd stacklend-fe
npm run dev        # Start development server
npm run build      # Build for production
npm run lint       # Run linting
```

### Smart Contract Development

**Stacks Contracts:**
```bash
cd stacklend-stacks
clarinet check     # Check contract syntax
clarinet test      # Run tests
clarinet deploy    # Deploy to testnet
```

**Sui Move Contracts:**
```bash
cd stacklend-sui
sui move build        # Compile contracts
sui move test         # Run tests
sui client publish    # Deploy to testnet
```

### Relayer Development

```bash
cd stacklend-relayer
npm run dev        # Start with hot reload
npm test           # Run tests
npm run docker     # Build Docker image
```

## 🧪 Testing

### Test on Testnets

1. **Get Testnet Tokens**
   - STX: [Stacks Testnet Faucet](https://explorer.hiro.so/sandbox/faucet?chain=testnet)
   - SUI: [Sui Discord Faucet](https://discord.gg/sui) (use `!faucet <your-address>` command)

2. **Connect Wallets**
   - Configure Stacks wallet for testnet
   - Install and configure Sui wallet for testnet
   - Network Details for Sui:
     - Name: Sui Testnet
     - RPC URL: https://fullnode.testnet.sui.io
     - Explorer: https://testnet.suivision.xyz/

3. **Test Flow**
   - Deposit STX collateral
   - Request token borrow
   - Verify token receipt on Sui
   - Test repayment flow

## 📚 Documentation

- [Frontend Integration Guide](./stacklend-fe/STACKS_INTEGRATION_README.md)
- [Stacks Contract Documentation](./stacklend-stacks/STACKS_INTEGRATION.md)
- [Sui Contract Documentation](./stacklend-sui/README.md)
- [Relayer Setup Guide](./stacklend-relayer/README.md)

## 🤝 Contributing

We welcome contributions! Please read our contributing guidelines and submit pull requests for any improvements.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 🔒 Security

- All smart contracts have been tested extensively
- Cross-chain transactions are validated by the relayer
- Multi-signature support for critical operations
- Regular security audits and updates

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌐 Links

- **Website**: [Coming Soon]

---

**⚠️ Disclaimer**: This protocol is currently in testnet phase. Use at your own risk and never deposit more than you can afford to lose. Always verify contract addresses before interacting with the protocol.
