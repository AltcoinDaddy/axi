import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Axi | Confidential Intent Router",
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
import { ThemeProvider } from "@/components/ThemeProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 relative">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <WalletProvider>
            {children}
          </WalletProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
