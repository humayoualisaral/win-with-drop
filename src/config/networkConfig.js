// Network configuration for the application
// This file contains all network-specific settings

const NETWORKS = {
  // Ethereum Testnets
  SEPOLIA: {
    id: 11155111,
    name: "Sepolia",
    rpcUrl: "https://sepolia.infura.io/v3/YOUR_INFURA_KEY", // Replace with your Infura key
    blockExplorer: "https://sepolia.etherscan.io",
    chainId: "0xaa36a7", // hex
    nativeCurrency: {
      name: "Sepolia Ether",
      symbol: "ETH",
      decimals: 18
    },
    // Chainlink VRF Config for Sepolia
    vrf: {
      vrfCoordinator: "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625",
      linkToken: "0x779877A7B0D9E8603169DdbD7836e478b4624789",
      keyHash: "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c" // 150 gwei key hash
    }
  },
  
  // Polygon Networks
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
    },
    // Chainlink VRF Config for Polygon
    vrf: {
      vrfCoordinator: "0xAE975071Be8F8eE67addBC1A82488F1C24858067",
      linkToken: "0xb0897686c545045aFc77CF20eC7A532E3120E0F1",
      keyHash: "0xcc294a196eeeb44da2888d17c0625cc88d70d9760a69d58d853ba6581a9ab0cd" // 500 gwei key hash
    }
  },
  
  MUMBAI: {
    id: 80001,
    name: "Mumbai",
    rpcUrl: "https://rpc-mumbai.maticvigil.com",
    blockExplorer: "https://mumbai.polygonscan.com",
    chainId: "0x13881", // hex
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18
    },
    // Chainlink VRF Config for Mumbai
    vrf: {
      vrfCoordinator: "0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed",
      linkToken: "0x326C977E6efc84E512bB9C30f76E30c160eD06FB",
      keyHash: "0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f" // 500 gwei key hash
    }
  }
};

// Set default network based on environment variable
// You can set this in your .env file or before starting your app
// DEFAULT_NETWORK=SEPOLIA npm start
// or
// DEFAULT_NETWORK=POLYGON npm start
const DEFAULT_NETWORK = process.env.REACT_APP_DEFAULT_NETWORK || 'SEPOLIA';

// Get active network configuration
const getNetworkConfig = () => {
  const networkName = process.env.REACT_APP_NETWORK || DEFAULT_NETWORK;
  return NETWORKS[networkName] || NETWORKS.SEPOLIA; // Default to Sepolia if not found
};

// Function to check if a network ID matches our active network
const isActiveNetwork = (chainId) => {
  const activeNetwork = getNetworkConfig();
  return chainId === activeNetwork.id || parseInt(chainId, 16) === activeNetwork.id;
};

// Get VRF configuration for the current network
const getVRFConfig = () => {
  return getNetworkConfig().vrf;
};

export {
  NETWORKS,
  getNetworkConfig,
  isActiveNetwork,
  getVRFConfig
};