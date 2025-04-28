// Network configuration for the application
// This file contains network-specific settings for Sepolia, Amoy, and Polygon

const NETWORKS = {
  // Ethereum Testnet
  SEPOLIA: {
    id: 11155111,
    name: "Sepolia",
    rpcUrl: "https://sepolia.ethereum.org", // MetaMask will handle the actual RPC connection
    blockExplorer: "https://sepolia.etherscan.io",
    chainId: "0xaa36a7", // hex
    nativeCurrency: {
      name: "Sepolia Ether",
      symbol: "ETH",
      decimals: 18
    }
  },
  
  // Polygon Testnet - Amoy
  AMOY: {
    id: 80002,
    name: "Amoy",
    rpcUrl: "https://rpc-amoy.polygon.technology/", // Public RPC for Amoy
    blockExplorer: "https://amoy.polygonscan.com/", // Correct explorer URL
    chainId: "0x13882", // hex
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18
    }
  },
  
  // Polygon Mainnet
  POLYGON: {
    id: 137,
    name: "Polygon",
    rpcUrl: "https://polygon-rpc.com",
    blockExplorer: "https://polygonscan.com",
    chainId: "0x89", // hex
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18
    }
  }
};

// Set default network based on environment
const DEFAULT_NETWORK = process.env.NEXT_PUBLIC_DEFAULT_NETWORK || 'SEPOLIA';

// Get active network configuration
const getNetworkConfig = () => {
  const networkName = process.env.NEXT_PUBLIC_NETWORK || DEFAULT_NETWORK;
  return NETWORKS[networkName] || NETWORKS.SEPOLIA; // Default to Sepolia if not found
};

// Function to check if a network ID matches our active network
const isActiveNetwork = (chainId) => {
  const activeNetwork = getNetworkConfig();
  return chainId === activeNetwork.id || parseInt(chainId, 16) === activeNetwork.id;
};

export {
  NETWORKS,
  getNetworkConfig,
  isActiveNetwork
};