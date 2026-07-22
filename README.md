# Axi — Private DeFi Intent Router

> Shield your DeFi trades from MEV and front-running. Axi provides the privacy of a Dark Pool by routing encrypted intents through the NOX Protocol and Intel SGX TEEs without ever revealing your strategy to the public mempool.

![License](https://img.shields.io/badge/license-MIT-blue)
![Network](https://img.shields.io/badge/network-Sepolia-purple)
![Built With](https://img.shields.io/badge/built%20with-iExec%20Nox-00d4aa)


* **Challenge:** Integrate Nox into real open-source DeFi protocols for privacy.
* **Our Approach:** Intent-based architecture + Nox encryption + batch execution.
* **Key Innovation:** Individual swap amounts are never visible — not in the mempool, not on Etherscan, not anywhere on-chain.

---

##  What is Axi?

Axi acts as a **Confidential, Intent-Based Dark Pool**, but operates technically as a **Confidential Router**. By leveraging Fully Homomorphic Encryption (FHE) via the [NOX Protocol](https://docs.iex.ec/axi-protocol/getting-started/welcome) and Intel SGX Trusted Execution Environments (TEEs), Axi completely encrypts your portfolio and your trades.

**The Problem:** DeFi is transparent by default. Every swap amount, trading strategy, and portfolio position is visible to MEV bots, front-runners, and sandwich attackers who extract billions of dollars in hidden slippage every year. Furthermore, on-chain wallets have zero privacy.

**The Solution:** Axi guarantees mathematically that no one—not even block producers or MEV searchers—can see the size of your trade or your wallet balance. 
- **Confidential Vaults:** Deposits are stored as encrypted `euint256` handles — nobody can see your balance. 
- **Batch Auctions (The Magic):** When you submit an intent to swap, the amount is encrypted. An off-chain Relayer aggregates multiple users' intents into a single batch and sends them to a Secure TEE Enclave. The Enclave decrypts them in total isolation, calculates the aggregate volume, and executes a single massive bulk trade on Uniswap. 
- **MEV-Proof:** Because individual trade sizes are perfectly obfuscated within the crowd, bots see one large aggregated trade and cannot extract value from individual users.

---

##  How Axi Integrates iExec Nox

To satisfy the core hackathon requirements, Axi deeply integrates the iExec Nox technology stack across both the frontend and smart contracts:

1. **Frontend Encryption (`@iexec-nox/handle`)**: 
   - Located in `app/src/lib/nox.ts`.
   - Before any transaction is sent to the blockchain, the user's intent (e.g., swapping 100 USDC) is encrypted directly in the browser using the Nox Handle client. 
   - We only submit the encrypted `handle` and `handleProof` on-chain, ensuring 100% data confidentiality in the mempool.
   
2. **Confidential Smart Contracts (`@iexec-nox/nox-protocol-contracts`)**:
   - Located in `contracts/AxiVault.sol` and `contracts/ConfidentialIntentPool.sol`.
   - The contracts import `Nox`, `euint256`, and `externalEuint256`.
   - Balances are stored as encrypted types: `mapping(address => mapping(address => euint256)) private _balances;`.
   - We utilize Nox's arithmetic operations (`Nox.add`, `Nox.sub`) to update user balances entirely inside the TEE without decrypting the values on the public ledger.

---

##  Key Features

| Feature | Description |
|---------|-------------|
|  **Encrypted Intents** | Swap amounts encrypted via Nox SDK — invisible on-chain |
|  **Intent Batching** | Compatible intents grouped to maximize privacy |
|  **DeFi Integration** | Routes through Uniswap V3 and Aave V3 |
|  **Confidential Vault** | ERC-7984 encrypted balances — only you can see your balance |
|  **MEV Protection** | Aggregated batch trades prevent sandwich attacks |
|  **Standard Wallets** | Works with MetaMask, Rabby, Rainbow — no special wallet needed |

---

##  Architecture

```text
User → Nox JS SDK (encrypt) → Axi Router → Intent Pool (encrypted queue)
                                                        ↓
                                              Batch Formation (TEE)
                                                        ↓
                                          Uniswap/Aave (aggregated trade)
                                                        ↓
                                        Proportional distribution (encrypted)
```

---

## ⚡ Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/axi.git
cd axi

# Install smart contract dependencies
npm install

# Install frontend dependencies
cd app && npm install && cd ..
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your Sepolia RPC URL and deployer private key
```

### 3. Compile & Test Smart Contracts

```bash
# Compile contracts using Nox solc
npx hardhat compile

# Run tests (requires Docker for Nox TEE simulation)
npx hardhat test
```

### 4. Deploy to Sepolia

```bash
npx hardhat ignition deploy ./ignition/modules/Axi.ts --network sepolia
```

### 5. Run the Frontend

```bash
cd app
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

##  Project Structure

```text
axi/
├── contracts/                    # Solidity smart contracts
│   ├── AxiRouter.sol             # Core intent router
│   ├── AxiVault.sol              # Confidential vault (encrypted balances)
│   ├── ConfidentialIntentPool.sol# Encrypted intent queue
│   ├── interfaces/               # DeFi protocol interfaces
│   └── wrappers/                 # ERC-20 → ERC-7984 wrappers
├── test/                         # Hardhat tests
├── app/                          # Next.js frontend
│   └── src/
│       ├── app/                  # Pages (swap, vault, dashboard, batches)
│       ├── components/           # UI components
│       └── lib/                  # Nox SDK integration, contract helpers
├── hardhat.config.ts             # Hardhat 3 + Nox plugin config
└── README.md                     # This file
```

---

##  Smart Contracts

| Contract | Purpose |
|----------|---------|
| `AxiRouter` | Orchestrates encrypted intent submission and batch execution |
| `AxiVault` | Stores deposits with encrypted balances (`euint256`) |
| `ConfidentialIntentPool` | Queue of encrypted intents waiting for batching |
| `WrappedConfidentialETH` | ERC-20 WETH → ERC-7984 cWETH wrapper |
| `WrappedConfidentialUSDC` | ERC-20 USDC → ERC-7984 cUSDC wrapper |

---

##  Frontend Pages

| Page | Route | Description |
|------|-------|-------------|
| Landing | `/` | Hero, stats, how-it-works |
| Swap | `/swap` | Submit encrypted swap intents |
| Vault | `/vault` | Deposit/withdraw with encrypted balances |
| Dashboard | `/dashboard` | Encrypted portfolio + intent history |
| Batches | `/batches` | Public batch explorer (amounts hidden) |

---

##  Tech Stack

- **Smart Contracts:** Solidity 0.8.35 + Nox Solidity Library
- **Testing:** Hardhat 3 + Nox Hardhat Plugin
- **Frontend:** Next.js 15 + Tailwind CSS
- **Wallet:** Viem + EIP-1193
- **Privacy:** iExec Nox (TEE + Encrypted Types)
- **Tokens:** ERC-7984 Confidential Token Standard
- **Network:** Ethereum Sepolia Testnet

