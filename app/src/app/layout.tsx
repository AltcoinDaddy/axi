import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Axi — Private DeFi Intent Router",
  description:
    "Shield your DeFi trades from MEV and front-running. Route swaps and lending through iExec Nox confidential contracts without revealing your strategy.",
  keywords: [
    "DeFi",
    "privacy",
    "MEV protection",
    "Nox",
    "iExec",
    "confidential computing",
    "intent-based trading",
  ],
};

import { WalletProvider } from "@/context/WalletContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen">
        <WalletProvider>
          <div className="grid-bg fixed inset-0 -z-10 opacity-30" />
          <div className="fixed inset-0 -z-10 bg-gradient-to-b from-transparent via-transparent to-[hsl(222_47%_6%/0.9)]" />
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}
