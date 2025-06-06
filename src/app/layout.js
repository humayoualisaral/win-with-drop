import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { MultiGiveawayProvider } from "@/context/MultiGiveawayContext";
import { ActiveGiveawayProvider } from "@/context/ActiveGiveaway";
import { TransactionProvider } from "@/context/TransactionContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  const getContractAddress = () => {
    // Check which network we're using
    const network = process.env.NEXT_PUBLIC_NETWORK || process.env.NEXT_PUBLIC_DEFAULT_NETWORK || 'SEPOLIA';
    
    // Return the appropriate contract address based on network
    if (network === 'SEPOLIA') {
      return process.env.NEXT_PUBLIC_SEPOLIA_CONTRACT_ADDRESS;
    } else if (network === 'POLYGON') {
      return process.env.NEXT_PUBLIC_POLYGON_CONTRACT_ADDRESS;
    } else if (network === 'AMOY') {
      return process.env.NEXT_PUBLIC_AMOY_CONTRACT_ADDRESS;
    }
    
    // Default to Sepolia contract address
    return process.env.NEXT_PUBLIC_SEPOLIA_CONTRACT_ADDRESS;
  };

  const contractAddress = getContractAddress();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >

        <TransactionProvider>
          <MultiGiveawayProvider contractAddress={contractAddress}>
            <ActiveGiveawayProvider>
              {children}
            </ActiveGiveawayProvider>
          </MultiGiveawayProvider>
        </TransactionProvider>
      </body>
    </html>
  );
}