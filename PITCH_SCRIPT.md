# Axi Pitch Script

*Read this slowly and naturally. Pause at the line breaks.*

---

## 1. The Hook (30s)
**[ SCREEN: Title Slide or Axi Dashboard ]**

DeFi is broken because everyone can see your cards. 

Right now, when you make a trade on the blockchain, the whole world sees exactly how much money you are moving before the trade even finishes. Sneaky "MEV bots" use this public information to cut in line, change prices, and steal your money in hidden slippage.

Hi, we built **Axi**. 
It's a Confidential Dark Pool designed to completely eliminate MEV in DeFi.

Axi uses ultra-secure hardware—iExec NOX Enclaves—to encrypt your trade amount. 
You still submit a trade, but the numbers are mathematically hidden. 

Bots can't attack what they can't see.

---

## 2. The Demo (60s)
**[ SCREEN: Axi Dashboard (axi.pilot.kurolabshq.xyz) ]**

Let's see it live on Ethereum Sepolia. 

Here on my dashboard, my wallet balances are completely hidden on the blockchain. 
If I click 'Decrypt', the NOX SDK prompts my wallet to sign a secure request. 
It proves that only I have the key to reveal my own money.

*( ACTION: Click Decrypt, sign MetaMask )*

**[ SCREEN: Switch to Swap Page ]**

Now, let's make a trade. We'll swap WETH for USDC. 
I'll submit two trades to meet our 'Minimum Batch Size' requirement, which guarantees your order is never sent alone.

*( ACTION: Enter 0.001 WETH. Click 'Shield & Swap'. Sign MetaMask. Repeat one more time )*

These orders are now pending. 
Because of Axi's encryption, anyone spying on the blockchain just sees random scrambled letters, not 0.001 WETH.

**[ SCREEN: Switch to Batches Page ]**

Behind the scenes, Axi doesn't just send your hidden trade alone. 
Our relayer grouped these trades together into a "Batch".
It decrypted the *total sum* in a secure vault, and sent one giant, anonymous trade to Uniswap.

*( ACTION: Hit the Refresh button on your browser )*

If I refresh the page... There it is! 
My trade was "BATCHED" successfully. 
We just completed a trade on a public blockchain with total privacy, completely immune to bot attacks.

---

## 3. The Close (15s)
**[ SCREEN: Show GitHub or Final Slide ]**

Our live deployment proves this technology works flawlessly. 

Next up, we want to make the pricing engine smarter and move the app to faster networks like Arbitrum so it's cheaper to use. 

Axi proves we can finally have Wall Street-level privacy natively on Ethereum. Thank you!
