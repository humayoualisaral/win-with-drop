'use client'
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { getNetworkConfig, isActiveNetwork, getVRFConfig } from '@/config/networkConfig';
import abi from '@/Contract/Abi.json'

// Create the context
const MultiGiveawayContext = createContext();

// ABI from your import
const MULTIGIVEAWAY_ABI = abi;

export function MultiGiveawayProvider({ children, contractAddress }) {
  const [contract, setContract] = useState(null);
  const [signer, setSigner] = useState(null);
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [giveaways, setGiveaways] = useState([]);
  const [networkConfig, setNetworkConfig] = useState(getNetworkConfig());
  const [vrfConfig, setVrfConfig] = useState(getVRFConfig());
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [chainId, setChainId] = useState(null);

  // Setup listeners for account and chain changes
  useEffect(() => {
    // Set up listeners for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          // Reinitialize with new account
          if (isConnected) {
            initializeContract(accounts[0]);
          }
        } else {
          // Disconnect if no accounts
          disconnect();
        }
      });

      window.ethereum.on('chainChanged', (newChainId) => {
        // Handle chain change
        const currentChainId = parseInt(newChainId, 16);
        setChainId(currentChainId);
        const correctNetwork = isActiveNetwork(currentChainId);
        setIsCorrectNetwork(correctNetwork);
        
        // Reinitialize contract if connected
        if (isConnected && account) {
          initializeContract(account);
        }
      });
    }

    return () => {
      // Clean up listeners
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, [account, isConnected, contractAddress]);

  // Initialize the contract with the connected account
  const initializeContract = async (currentAccount, currentSigner = null) => {
    if (!contractAddress || !currentAccount || !provider) return;
    
    try {
      setLoading(true);
      
      // Check if we're on the correct network
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const currentChainId = parseInt(chainId, 16);
      setChainId(currentChainId);
      const correctNetwork = isActiveNetwork(currentChainId);
      setIsCorrectNetwork(correctNetwork);
      
      // Get signer if not provided
      if (!currentSigner) {
        currentSigner = await provider.getSigner();
        setSigner(currentSigner);
      }
      
      // Only initialize contract if on correct network
      if (correctNetwork) {
        // Create contract instance with signer
        const contract = new ethers.Contract(
          contractAddress,
          MULTIGIVEAWAY_ABI, 
          currentSigner // Use signer instead of provider for sending transactions
        );
        setContract(contract);

        // Check if user is owner or admin
        const owner = await contract.getContractOwner();
        setIsOwner(currentAccount.toLowerCase() === owner.toLowerCase());
        
        const adminStatus = await contract.isAdmin(currentAccount);
        setIsAdmin(adminStatus);

        // Load active giveaways
        await loadGiveaways(contract);
      }
      
      setLoading(false);
    } catch (err) {
      console.error("Contract initialization error:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  // Connect wallet function to be called from button click
  const connectWallet = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if ethereum is available
      if (!window.ethereum) {
        throw new Error("Please install MetaMask or another Web3 provider");
      }

      // Connect to provider
      const newProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(newProvider);

      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const currentAccount = accounts[0];
      setAccount(currentAccount);
      
      // Set signer - make sure to await this
      const newSigner = await newProvider.getSigner();
      setSigner(newSigner);
      
      // Get current chain ID and check if it's the correct network
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const currentChainId = parseInt(chainId, 16);
      setChainId(currentChainId);
      const correctNetwork = isActiveNetwork(currentChainId);
      setIsCorrectNetwork(correctNetwork);
      
      // If not on correct network, prompt to switch
      if (!correctNetwork) {
        const switched = await switchNetwork();
        if (!switched) {
          setError(`Please switch to ${networkConfig.name} network to use this application`);
          setLoading(false);
          return false;
        }
      }
      
      // Set connected state
      setIsConnected(true);
      
      // Initialize contract with the connected account and signer
      await initializeContract(currentAccount, newSigner);
      
      return true;
    } catch (err) {
      console.error("Wallet connection error:", err);
      setError(err.message);
      setLoading(false);
      return false;
    }
  };

  // Disconnect wallet function
  const disconnect = () => {
    setAccount(null);
    setSigner(null);
    setContract(null);
    setIsOwner(false);
    setIsAdmin(false);
    setIsConnected(false);
    setGiveaways([]);
    setError(null);
  };

  // Load all giveaways from the contract
  const loadGiveaways = async (contractInstance = contract) => {
    if (!contractInstance) return;
    
    try {
      const giveawayCount = await contractInstance.giveawayCount();
      const loadedGiveaways = [];
      
      for (let i = 0; i < giveawayCount.toNumber(); i++) {
        const details = await contractInstance.getGiveawayDetails(i);
        
        loadedGiveaways.push({
          id: i,
          name: details.name,
          active: details.active,
          completed: details.completed,
          totalParticipants: details.totalParticipants.toNumber(),
          winner: details.winner
        });
      }
      
      setGiveaways(loadedGiveaways);
    } catch (err) {
      console.error("Error loading giveaways:", err);
      setError("Failed to load giveaways");
    }
  };

  // Switch to the correct network
  const switchNetwork = async () => {
    if (!window.ethereum) return false;
    
    try {
      // Try to switch to the correct network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: networkConfig.chainId }],
      });
      
      // Update isCorrectNetwork state
      setIsCorrectNetwork(true);
      return true;
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: networkConfig.chainId,
                chainName: networkConfig.name,
                nativeCurrency: networkConfig.nativeCurrency,
                rpcUrls: [networkConfig.rpcUrl],
                blockExplorerUrls: [networkConfig.blockExplorer]
              },
            ],
          });
          
          // After adding, try to switch again
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: networkConfig.chainId }],
          });
          
          // Update isCorrectNetwork state
          setIsCorrectNetwork(true);
          return true;
        } catch (addError) {
          console.error("Failed to add network", addError);
          setError(`Failed to add ${networkConfig.name} network to your wallet`);
          return false;
        }
      } else {
        console.error("Failed to switch network", switchError);
        setError(`Failed to switch to ${networkConfig.name} network`);
        return false;
      }
    }
  };

  // Create a new giveaway
// Create a new giveaway
const createGiveaway = async (name) => {
  try {
    // Double check we have what we need
    if (!contract) {
      console.error("Contract is not initialized");
      setError("Contract is not initialized. Please reconnect your wallet.");
      return false;
    }
    
    if (!signer) {
      console.error("Signer is not available");
      
      // Try to get signer again if provider exists
      if (provider) {
        try {
          const newSigner = await provider.getSigner();
          setSigner(newSigner);
          
          // Create a new contract instance with the new signer
          const newContract = new ethers.Contract(
            contractAddress,
            MULTIGIVEAWAY_ABI,
            newSigner
          );
          
          setContract(newContract);
          
          // Now try to create giveaway with this new contract
          const tx = await newContract.createGiveaway(name);
          await tx.wait();
          await loadGiveaways();
          return true;
        } catch (signerError) {
          console.error("Failed to get new signer:", signerError);
          setError("Wallet connection issue. Please disconnect and reconnect your wallet.");
          return false;
        }
      } else {
        setError("Wallet not connected properly. Please reconnect your wallet.");
        return false;
      }
    }
    
    // Get optimal gas price based on the network
    let gasPrice;
    if (networkConfig.name === 'Polygon' || networkConfig.name === 'Mumbai') {
      // For Polygon, get current gas price and increase slightly for faster confirmation
      gasPrice = await provider.getGasPrice();
      gasPrice = gasPrice.mul(110).div(100); // 10% increase
    }
    
    console.log("Creating giveaway with parameters:", {
      name,
      contractAddress,
      signerAddress: await signer.getAddress(),
      hasProvider: !!provider,
      gasPrice: gasPrice ? gasPrice.toString() : undefined
    });
    
    // Try the transaction
    const tx = await contract.createGiveaway(name, {
      gasPrice: gasPrice // This will be undefined for networks other than Polygon
    });
    console.log("Transaction sent:", tx.hash);
    await tx.wait();
    await loadGiveaways();
    return true;
  } catch (err) {
    console.error("Error creating giveaway:", err);
    setError(err.message || "Unknown error creating giveaway");
    return false;
  }
};

  // Set giveaway active status
  const setGiveawayActive = async (giveawayId, active) => {
    if (!contract || !signer) {
      setError("Contract or signer not initialized");
      return false;
    }
    
    try {
      const contractWithSigner = contract.connect(signer);
      const tx = await contractWithSigner.setGiveawayActive(giveawayId, active);
      await tx.wait();
      await loadGiveaways();
      return true;
    } catch (err) {
      console.error("Error setting giveaway active status:", err);
      setError(err.message);
      return false;
    }
  };

  // Add a participant to a giveaway
  const addParticipant = async (giveawayId, email) => {
    if (!contract || !signer) {
      setError("Contract or signer not initialized");
      return false;
    }
    
    try {
      const contractWithSigner = contract.connect(signer);
      const tx = await contractWithSigner.addParticipant(giveawayId, email);
      await tx.wait();
      await loadGiveaways();
      return true;
    } catch (err) {
      console.error("Error adding participant:", err);
      setError(err.message);
      return false;
    }
  };

  // Add multiple participants to a giveaway
  const batchAddParticipants = async (giveawayId, emails) => {
    if (!contract || !signer) {
      setError("Contract or signer not initialized");
      return false;
    }
    
    try {
      const contractWithSigner = contract.connect(signer);
      const tx = await contractWithSigner.batchAddParticipants(giveawayId, emails);
      await tx.wait();
      await loadGiveaways();
      return true;
    } catch (err) {
      console.error("Error batch adding participants:", err);
      setError(err.message);
      return false;
    }
  };

  // Draw a winner for a giveaway
  const drawWinner = async (giveawayId) => {
    if (!contract || !signer) {
      setError("Contract or signer not initialized");
      return false;
    }
    
    try {
      const contractWithSigner = contract.connect(signer);
      const tx = await contractWithSigner.drawWinner(giveawayId);
      await tx.wait();
      await loadGiveaways();
      return true;
    } catch (err) {
      console.error("Error drawing winner:", err);
      setError(err.message);
      return false;
    }
  };

  // Get participants for a specific giveaway
  const getGiveawayParticipants = async (giveawayId) => {
    if (!contract) return [];
    
    try {
      const count = await contract.getGiveawayParticipantsCount(giveawayId);
      const participants = [];
      
      for (let i = 0; i < count.toNumber(); i++) {
        const [email, hasWon] = await contract.getGiveawayParticipant(giveawayId, i);
        participants.push({ index: i, email, hasWon });
      }
      
      return participants;
    } catch (err) {
      console.error("Error getting participants:", err);
      setError(err.message);
      return [];
    }
  };

  // Get the winner of a giveaway
  const getGiveawayWinner = async (giveawayId) => {
    if (!contract) return null;
    
    try {
      const [email, index] = await contract.getGiveawayWinner(giveawayId);
      return { email, index: index.toNumber() };
    } catch (err) {
      console.error("Error getting winner:", err);
      setError(err.message);
      return null;
    }
  };

  // Admin management functions
  const addAdmin = async (adminAddress) => {
    if (!contract || !signer || !isOwner) {
      setError("Contract not initialized or not owner");
      return false;
    }
    
    try {
      const contractWithSigner = contract.connect(signer);
      const tx = await contractWithSigner.addAdmin(adminAddress);
      await tx.wait();
      return true;
    } catch (err) {
      console.error("Error adding admin:", err);
      setError(err.message);
      return false;
    }
  };

  const removeAdmin = async (adminAddress) => {
    if (!contract || !signer || !isOwner) {
      setError("Contract not initialized or not owner");
      return false;
    }
    
    try {
      const contractWithSigner = contract.connect(signer);
      const tx = await contractWithSigner.removeAdmin(adminAddress);
      await tx.wait();
      return true;
    } catch (err) {
      console.error("Error removing admin:", err);
      setError(err.message);
      return false;
    }
  };

  // VRF Configuration functions
  const setKeyHash = async (keyHash) => {
    if (!contract || !signer || (!isOwner && !isAdmin)) {
      setError("Contract not initialized or insufficient permissions");
      return false;
    }
    
    try {
      const contractWithSigner = contract.connect(signer);
      const tx = await contractWithSigner.setKeyHash(keyHash);
      await tx.wait();
      return true;
    } catch (err) {
      console.error("Error setting key hash:", err);
      setError(err.message);
      return false;
    }
  };

  const setCallbackGasLimit = async (gasLimit) => {
    if (!contract || !signer || (!isOwner && !isAdmin)) {
      setError("Contract not initialized or insufficient permissions");
      return false;
    }
    
    try {
      const contractWithSigner = contract.connect(signer);
      const tx = await contractWithSigner.setCallbackGasLimit(gasLimit);
      await tx.wait();
      return true;
    } catch (err) {
      console.error("Error setting callback gas limit:", err);
      setError(err.message);
      return false;
    }
  };

  const setSubscriptionId = async (subscriptionId) => {
    if (!contract || !signer || (!isOwner && !isAdmin)) {
      setError("Contract not initialized or insufficient permissions");
      return false;
    }
    
    try {
      const contractWithSigner = contract.connect(signer);
      const tx = await contractWithSigner.setSubscriptionId(subscriptionId);
      await tx.wait();
      return true;
    } catch (err) {
      console.error("Error setting subscription ID:", err);
      setError(err.message);
      return false;
    }
  };

  const getChainlinkConfig = async () => {
    if (!contract) return null;
    
    try {
      const config = await contract.getChainlinkConfig();
      return {
        coordinator: config.coordinator,
        subId: config.subId.toString(),
        hash: config.hash,
        gasLimit: config.gasLimit.toString(),
        confirmations: config.confirmations
      };
    } catch (err) {
      console.error("Error getting Chainlink config:", err);
      setError(err.message);
      return null;
    }
  };

  // Export all the functions and state variables
  const contextValue = {
    // Contract state
    contract,
    account,
    isOwner,
    isAdmin,
    loading,
    error,
    giveaways,
    networkConfig,
    vrfConfig,
    isCorrectNetwork,
    isConnected,
    chainId,
    
    // Wallet functions
    connectWallet,
    disconnect,
    
    // Network functions
    switchNetwork,
    
    // Contract functions
    loadGiveaways,
    createGiveaway,
    setGiveawayActive,
    addParticipant,
    batchAddParticipants,
    drawWinner,
    getGiveawayParticipants,
    getGiveawayWinner,
    
    // Admin functions
    addAdmin,
    removeAdmin,
    
    // VRF config functions
    setKeyHash,
    setCallbackGasLimit,
    setSubscriptionId,
    getChainlinkConfig
  };

  return (
    <MultiGiveawayContext.Provider value={contextValue}>
      {children}
    </MultiGiveawayContext.Provider>
  );
}

// Hook to use the context
export function useMultiGiveaway() {
  const context = useContext(MultiGiveawayContext);
  if (context === undefined) {
    throw new Error('useMultiGiveaway must be used within a MultiGiveawayProvider');
  }
  return context;
}