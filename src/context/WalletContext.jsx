// context/WalletContext.jsx
'use client'
import { createContext, useContext, useState, useEffect } from 'react';

// Create the context
const WalletContext = createContext();

// Custom hook to use the wallet context
export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

// Provider component
export function WalletProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [chainId, setChainId] = useState(null);
  const [provider, setProvider] = useState(null);

  // Initialize wallet connection
  useEffect(() => {
    const initWallet = async () => {
      // Check if ethereum is available (window.ethereum injected by MetaMask)
      if (typeof window !== 'undefined' && window.ethereum) {
        setProvider(window.ethereum);

        try {
          // Get current chain ID
          const chainId = await window.ethereum.request({ method: 'eth_chainId' });
          setChainId(chainId);

          // Check if already connected
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            setIsConnected(true);
          }
        } catch (error) {
          console.error('Error initializing wallet:', error);
        }
      }
    };

    initWallet();
  }, []);

  // Setup event listeners for wallet state changes
  useEffect(() => {
    if (!provider) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        // User disconnected wallet
        setAccount(null);
        setIsConnected(false);
      } else {
        // User switched accounts or connected
        setAccount(accounts[0]);
        setIsConnected(true);
      }
    };

    const handleChainChanged = (chainId) => {
      setChainId(chainId);
    };

    const handleDisconnect = (error) => {
      console.log('Wallet disconnected:', error);
      setAccount(null);
      setIsConnected(false);
    };

    // Subscribe to events
    provider.on('accountsChanged', handleAccountsChanged);
    provider.on('chainChanged', handleChainChanged);
    provider.on('disconnect', handleDisconnect);

    // Cleanup function
    return () => {
      if (provider) {
        provider.removeListener('accountsChanged', handleAccountsChanged);
        provider.removeListener('chainChanged', handleChainChanged);
        provider.removeListener('disconnect', handleDisconnect);
      }
    };
  }, [provider]);

  // Connect wallet function
  const connectWallet = async () => {
    if (!provider) {
      alert('Please install MetaMask or another Ethereum wallet');
      return;
    }

    setIsConnecting(true);
    try {
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet function (not all wallets support this)
  const disconnectWallet = () => {
    // Most wallets don't have a direct disconnect method
    // Just reset our state and inform the user
    setAccount(null);
    setIsConnected(false);
    alert('To fully disconnect, please use your wallet interface');
  };

  // Context value
  const value = {
    account,
    isConnected,
    isConnecting,
    chainId,
    connectWallet,
    disconnectWallet,
    provider
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}