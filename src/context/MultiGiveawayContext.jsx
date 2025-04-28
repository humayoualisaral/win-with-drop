'use client'
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { getNetworkConfig, isActiveNetwork } from '@/config/networkConfig';
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
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState(null);
  const [giveaways, setGiveaways] = useState([]);
  const [networkConfig, setNetworkConfig] = useState(getNetworkConfig());
  const [vrfConfig, setVrfConfig] = useState();
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [chainId, setChainId] = useState(null);

  // Check owner status function - to get latest owner status
  const checkOwnerStatus = async (contractInstance = null) => {
    try {
      if (!account) return false;
      
      let targetContract = contractInstance || contract;
      
      if (!targetContract) {
        try {
          const { contract: validContract } = await getSignerAndContract();
          targetContract = validContract;
        } catch (error) {
          console.error("Failed to get valid contract for owner check:", error);
          return false;
        }
      }
      
      const owner = await targetContract.getContractOwner();
      const isCurrentOwner = account.toLowerCase() === owner.toLowerCase();
      console.log("Owner check:", { account, owner, isCurrentOwner });
      setIsOwner(isCurrentOwner);
      return isCurrentOwner;
    } catch (err) {
      console.error("Error checking owner status:", err);
      return false;
    }
  };

  // Check admin status function
  const checkAdminStatus = async (contractInstance = null) => {
    try {
      if (!account) return false;
      
      let targetContract = contractInstance || contract;
      
      if (!targetContract) {
        try {
          const { contract: validContract } = await getSignerAndContract();
          targetContract = validContract;
        } catch (error) {
          console.error("Failed to get valid contract for admin check:", error);
          return false;
        }
      }
      
      const adminStatus = await targetContract.isAdmin(account);
      console.log("Admin check:", { account, adminStatus });
      setIsAdmin(adminStatus);
      return adminStatus;
    } catch (err) {
      console.error("Error checking admin status:", err);
      return false;
    }
  };

  // Check for existing connection on mount
  useEffect(() => {
    const checkExistingConnection = async () => {
      setInitializing(true);
      
      if (window.ethereum) {
        try {
          // Check if there's already a connected account
          const accounts = await window.ethereum.request({ 
            method: 'eth_accounts' // This gets currently connected accounts without prompting
          });
          
          if (accounts && accounts.length > 0) {
            console.log("Found existing connection:", accounts[0]);
            // There's an existing connection
            const newProvider = new ethers.BrowserProvider(window.ethereum);
            setProvider(newProvider);
            setAccount(accounts[0]);
            
            // Get chain ID and check network
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            const currentChainId = parseInt(chainId, 16);
            setChainId(currentChainId);
            const correctNetwork = isActiveNetwork(currentChainId);
            setIsCorrectNetwork(correctNetwork);
            
            try {
              const newSigner = await newProvider.getSigner();
              setSigner(newSigner);
              
              // Initialize contract with the existing connection
              await initializeContract(accounts[0], newSigner);
              setIsConnected(true);
            } catch (signerError) {
              console.error("Error getting signer from existing connection:", signerError);
            }
          }
        } catch (error) {
          console.error("Error checking existing connection:", error);
        }
      }
      
      setInitializing(false);
    };

    checkExistingConnection();
  }, [contractAddress]); // Re-run when contract address changes

  // Setup listeners for account and chain changes
  useEffect(() => {
    // Set up listeners for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', async (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          // Reinitialize with new account
          if (isConnected) {
            await initializeContract(accounts[0]);
            // Make sure to check owner and admin status whenever account changes
            await checkOwnerStatus();
            await checkAdminStatus();
          }
        } else {
          // Disconnect if no accounts
          disconnect();
        }
      });

      window.ethereum.on('chainChanged', async (newChainId) => {
        // Handle chain change
        const currentChainId = parseInt(newChainId, 16);
        setChainId(currentChainId);
        const correctNetwork = isActiveNetwork(currentChainId);
        setIsCorrectNetwork(correctNetwork);
        
        // Reinitialize contract if connected
        if (isConnected && account) {
          await initializeContract(account);
          // Re-check permissions after chain change
          await checkOwnerStatus();
          await checkAdminStatus();
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

  // Set up periodic refresh of owner and admin status
  useEffect(() => {
    if (!isConnected || !contract || !account) return;
    
    // Refresh permissions every 30 seconds to catch external changes
    const refreshInterval = setInterval(() => {
      checkOwnerStatus();
      checkAdminStatus();
    }, 30000); // 30 seconds
    
    return () => clearInterval(refreshInterval);
  }, [isConnected, contract, account]);

  // Initialize the contract with the connected account
  const initializeContract = async (currentAccount, currentSigner = null) => {
    if (!contractAddress || !currentAccount) {
      console.error("Missing contractAddress or currentAccount");
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Set up provider if not already set
      let currentProvider = provider;
      if (!currentProvider && window.ethereum) {
        currentProvider = new ethers.BrowserProvider(window.ethereum);
        setProvider(currentProvider);
      }
      
      if (!currentProvider) {
        console.error("Provider initialization failed");
        setError("Failed to initialize provider. Please check your connection.");
        setLoading(false);
        return;
      }
      
      // Check if we're on the correct network
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const currentChainId = parseInt(chainId, 16);
      setChainId(currentChainId);
      const correctNetwork = isActiveNetwork(currentChainId);
      setIsCorrectNetwork(correctNetwork);
      
      // Get signer if not provided
      if (!currentSigner) {
        try {
          currentSigner = await currentProvider.getSigner();
          console.log("Got new signer");
          setSigner(currentSigner);
        } catch (signerError) {
          console.error("Failed to get signer:", signerError);
          setError("Failed to get wallet signer. Please reconnect your wallet.");
          setLoading(false);
          return;
        }
      }
      
      // Only initialize contract if on correct network
      if (correctNetwork) {
        try {
          // Create contract instance with signer
          const newContract = new ethers.Contract(
            contractAddress,
            MULTIGIVEAWAY_ABI, 
            currentSigner // Use signer instead of provider for sending transactions
          );
          
          console.log("Contract initialized with signer");
          setContract(newContract);

          // Check if user is owner or admin using the dedicated functions
          await checkOwnerStatus(newContract);
          await checkAdminStatus(newContract);

          // Load active giveaways
          await loadGiveaways(newContract);
          
        } catch (contractError) {
          console.error("Contract initialization error:", contractError);
          setError("Failed to initialize contract. Please check your connection and try again.");
          setLoading(false);
          return;
        }
      }
      
      setLoading(false);
    } catch (err) {
      console.error("Contract initialization error:", err);
      setError(err.message || "An unknown error occurred during initialization");
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
      
      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found. Please make sure your wallet is unlocked.");
      }
      
      const currentAccount = accounts[0];
      setAccount(currentAccount);
      
      // Set signer - make sure to await this
      let newSigner;
      try {
        newSigner = await newProvider.getSigner();
        console.log("Signer acquired successfully");
        setSigner(newSigner);
      } catch (signerError) {
        console.error("Error getting signer:", signerError);
        throw new Error("Failed to get wallet signer. Please check your wallet connection.");
      }
      
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
      
      setLoading(false);
      return true;
    } catch (err) {
      console.error("Wallet connection error:", err);
      setError(err.message || "Failed to connect wallet");
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

  // Get a valid signer and contract - helper function for contract interactions
  const getSignerAndContract = async () => {
    if (!contract || !signer) {
      if (!provider) {
        throw new Error("Wallet not connected. Please connect your wallet.");
      }
      
      try {
        // Try to get a new signer
        const newSigner = await provider.getSigner();
        setSigner(newSigner);
        
        // Create a new contract instance
        const newContract = new ethers.Contract(
          contractAddress,
          MULTIGIVEAWAY_ABI,
          newSigner
        );
        
        setContract(newContract);
        
        return { signer: newSigner, contract: newContract };
      } catch (error) {
        console.error("Failed to get signer or create contract:", error);
        throw new Error("Wallet connection issue. Please reconnect your wallet.");
      }
    }
    
    return { signer, contract };
  };

  // Load all giveaways from the contract
  const loadGiveaways = async (contractInstance = null) => {
    try {
      let targetContract = contractInstance;
      
      if (!targetContract) {
        try {
          const { contract: validContract } = await getSignerAndContract();
          targetContract = validContract;
        } catch (error) {
          console.error("Failed to get valid contract:", error);
          setError("Failed to load giveaways. Please check your connection.");
          return;
        }
      }
      
      // Use the new getAllGiveaways function that returns all data at once
      const allGiveawaysData = await targetContract.getAllGiveaways();
      const loadedGiveaways = [];
      
      // Destructure the array returns
      const [ids, names, actives, completeds, participantCounts, winners] = allGiveawaysData;
      
      for (let i = 0; i < ids.length; i++) {
        loadedGiveaways.push({
          id: ids[i],
          name: names[i],
          active: actives[i],
          completed: completeds[i],
          totalParticipants: participantCounts[i],
          winner: winners[i]
        });
      }
      
      setGiveaways(loadedGiveaways);
    } catch (err) {
      console.error("Error loading giveaways:", err);
      setError("Failed to load giveaways: " + (err.message || "Unknown error"));
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
  const createGiveaway = async (name) => {
    try {
      setError(null);
      
      // Get valid signer and contract
      let validContract;
      try {
        const { contract: contractInstance } = await getSignerAndContract();
        validContract = contractInstance;
      } catch (error) {
        setError(error.message);
        return false;
      }
      
      // Get optimal gas price based on the network
      let gasPrice;
      if (networkConfig.name === 'Polygon' || networkConfig.name === 'Mumbai') {
        // For Polygon, get current gas price and increase slightly for faster confirmation
        gasPrice = await provider.getGasPrice();
        gasPrice = gasPrice.mul(110).div(100); // 10% increase
      }
      
      console.log("Creating giveaway:", name);
      
      // Submit transaction
      const tx = await validContract.createGiveaway(name, {
        gasPrice: gasPrice // This will be undefined for networks other than Polygon
      });
      
      console.log("Transaction sent:", tx.hash);
      await tx.wait();
      console.log("Transaction confirmed");
      
      // Refresh giveaways list
      await loadGiveaways(validContract);
      return tx.hash;
    } catch (err) {
      console.error("Error creating giveaway:", err);
      setError(err.message || "Failed to create giveaway");
      return false;
    }
  };

  // Set giveaway active status
  const setGiveawayActive = async (giveawayId, active) => {
    try {
      setError(null);
      
      // Get valid signer and contract
      let validContract;
      try {
        const { contract: contractInstance } = await getSignerAndContract();
        validContract = contractInstance;
      } catch (error) {
        setError(error.message);
        return false;
      }
      
      console.log(`Setting giveaway ${giveawayId} active status to ${active}`);
      
      // Submit transaction
      const tx = await validContract.setGiveawayActive(giveawayId, active);
      console.log("Transaction sent:", tx.hash);
      await tx.wait();
      console.log("Transaction confirmed");
      
      // Refresh giveaways list
      await loadGiveaways(validContract);
      return true;
    } catch (err) {
      console.error("Error setting giveaway active status:", err);
      setError(err.message || "Failed to update giveaway status");
      return false;
    }
  };

  // Add a participant to a giveaway
  const addParticipant = async (giveawayId, email) => {
    try {
      setError(null);
      
      // Get valid signer and contract
      let validContract;
      try {
        const { contract: contractInstance } = await getSignerAndContract();
        validContract = contractInstance;
      } catch (error) {
        setError(error.message);
        return false;
      }
      
      console.log(`Adding participant to giveaway ${giveawayId}: ${email}`);
      
      // Submit transaction
      const tx = await validContract.addParticipant(giveawayId, email);
      console.log("Transaction sent:", tx.hash);
      await tx.wait();
      console.log("Transaction confirmed");
      
      // Refresh giveaways list
      await loadGiveaways(validContract);
      return true;
    } catch (err) {
      console.error("Error adding participant:", err);
      setError(err.message || "Failed to add participant");
      return false;
    }
  };

  // Add multiple participants to a giveaway
  const batchAddParticipants = async (giveawayId, emails) => {
    try {
      setError(null);
      
      // Get valid signer and contract
      let validContract;
      try {
        const { contract: contractInstance } = await getSignerAndContract();
        validContract = contractInstance;
      } catch (error) {
        setError(error.message);
        return false;
      }
      
      console.log(`Batch adding ${emails.length} participants to giveaway ${giveawayId}`);
      
      // Submit transaction
      const tx = await validContract.batchAddParticipants(giveawayId, emails);
      console.log("Transaction sent:", tx.hash);
      await tx.wait();
      console.log("Transaction confirmed");
      
      // Refresh giveaways list
      await loadGiveaways(validContract);
      return tx.hash;
    } catch (err) {
      console.error("Error batch adding participants:", err);
      setError(err.message || "Failed to add participants");
      return false;
    }
  };

  // Draw a winner for a giveaway
  const drawWinner = async (giveawayId) => {
    try {
      setError(null);
      
      // Get valid signer and contract
      let validContract;
      try {
        const { contract: contractInstance } = await getSignerAndContract();
        validContract = contractInstance;
      } catch (error) {
        setError(error.message);
        return false;
      }
      
      console.log(`Drawing winner for giveaway ${giveawayId}`);
      
      // Submit transaction
      const tx = await validContract.drawWinner(giveawayId);
      console.log("Transaction sent:", tx.hash);
      await tx.wait();
      console.log("Transaction confirmed");
      
      // Refresh giveaways list
      await loadGiveaways(validContract);
      return tx.hash;
    } catch (err) {
      console.error("Error drawing winner:", err);
      setError(err.message || "Failed to draw winner");
      return false;
    }
  };

  // Get participants for a specific giveaway using the new getAllParticipants function
  const getGiveawayParticipants = async (giveawayId) => {
    try {
      // Get valid signer and contract
      let validContract;
      try {
        const { contract: contractInstance } = await getSignerAndContract();
        validContract = contractInstance;
      } catch (error) {
        setError(error.message);
        return [];
      }
      
      // Use the new getAllParticipants function
      const [emails, hasWon] = await validContract.getAllParticipants(giveawayId);
      
      const participants = [];
      for (let i = 0; i < emails.length; i++) {
        participants.push({
          index: i,
          email: emails[i],
          hasWon: hasWon[i]
        });
      }
      
      return participants;
    } catch (err) {
      console.error("Error getting participants:", err);
      setError(err.message || "Failed to get participants");
      return [];
    }
  };

  // Get the winner of a giveaway
  const getGiveawayWinner = async (giveawayId) => {
    try {
      // Get valid signer and contract
      let validContract;
      try {
        const { contract: contractInstance } = await getSignerAndContract();
        validContract = contractInstance;
      } catch (error) {
        setError(error.message);
        return null;
      }
      
      const [email, index] = await validContract.getGiveawayWinner(giveawayId);
      return { email, index: index.toNumber() };
    } catch (err) {
      console.error("Error getting winner:", err);
      setError(err.message || "Failed to get winner");
      return null;
    }
  };

  // Get giveaway details
  const getGiveawayDetails = async (giveawayId) => {
    try {
      // Get valid signer and contract
      let validContract;
      try {
        const { contract: contractInstance } = await getSignerAndContract();
        validContract = contractInstance;
      } catch (error) {
        setError(error.message);
        return null;
      }
      
      const details = await validContract.getGiveawayDetails(giveawayId);
      return {
        name: details.name,
        active: details.active,
        completed: details.completed,
        totalParticipants: details.totalParticipants.toNumber(),
        winner: details.winner
      };
    } catch (err) {
      console.error("Error getting giveaway details:", err);
      setError(err.message || "Failed to get giveaway details");
      return null;
    }
  };

  // Admin management functions
  const addAdmin = async (adminAddress) => {
    try {
      setError(null);
      
      // First check if user is still the owner
      const ownerStatus = await checkOwnerStatus();
      if (!ownerStatus) {
        setError("Only the contract owner can add admins");
        return false;
      }
      
      // Get valid signer and contract
      let validContract;
      try {
        const { contract: contractInstance } = await getSignerAndContract();
        validContract = contractInstance;
      } catch (error) {
        setError(error.message);
        return false;
      }
      
      console.log(`Adding admin: ${adminAddress}`);
      
      // Submit transaction
      const tx = await validContract.addAdmin(adminAddress);
      console.log("Transaction sent:", tx.hash);
      await tx.wait();
      console.log("Transaction confirmed");
      
      return tx.hash;
    } catch (err) {
      console.error("Error adding admin:", err);
      setError(err.message || "Failed to add admin");
      return false;
    }
  };

  const removeAdmin = async (adminAddress) => {
    try {
      setError(null);
      
      // First check if user is still the owner
      const ownerStatus = await checkOwnerStatus();
      if (!ownerStatus) {
        setError("Only the contract owner can remove admins");
        return false;
      }
      
      // Get valid signer and contract
      let validContract;
      try {
        const { contract: contractInstance } = await getSignerAndContract();
        validContract = contractInstance;
      } catch (error) {
        setError(error.message);
        return false;
      }
      
      console.log(`Removing admin: ${adminAddress}`);
      
      // Submit transaction
      const tx = await validContract.removeAdmin(adminAddress);
      console.log("Transaction sent:", tx.hash);
      await tx.wait();
      console.log("Transaction confirmed");
      
      return tx.hash;
    } catch (err) {
      console.error("Error removing admin:", err);
      setError(err.message || "Failed to remove admin");
      return false;
    }
  };

  // VRF Configuration functions
  const setKeyHash = async (keyHash) => {
    try {
      setError(null);
      
      // Check permissions first
      const ownerStatus = await checkOwnerStatus();
      const adminStatus = await checkAdminStatus();
      
      if (!ownerStatus && !adminStatus) {
        setError("Only the contract owner or admins can set key hash");
        return false;
      }
      
      // Get valid signer and contract
      let validContract;
      try {
        const { contract: contractInstance } = await getSignerAndContract();
        validContract = contractInstance;
      } catch (error) {
        setError(error.message);
        return false;
      }
      
      console.log(`Setting key hash: ${keyHash}`);
      
      // Submit transaction
      const tx = await validContract.setKeyHash(keyHash);
      console.log("Transaction sent:", tx.hash);
      await tx.wait();
      console.log("Transaction confirmed");
      
      return tx.hash;
    } catch (err) {
      console.error("Error setting key hash:", err);
      setError(err.message || "Failed to set key hash");
      return false;
    }
  };

  const setCallbackGasLimit = async (gasLimit) => {
    try {
      setError(null);
      
      // Check permissions first
      const ownerStatus = await checkOwnerStatus();
      const adminStatus = await checkAdminStatus();
      
      if (!ownerStatus && !adminStatus) {
        setError("Only the contract owner or admins can set callback gas limit");
        return false;
      }
      
      // Get valid signer and contract
      let validContract;
      try {
        const { contract: contractInstance } = await getSignerAndContract();
        validContract = contractInstance;
      } catch (error) {
        setError(error.message);
        return false;
      }
      
      console.log(`Setting callback gas limit: ${gasLimit}`);
      
      // Submit transaction
      const tx = await validContract.setCallbackGasLimit(gasLimit);
      console.log("Transaction sent:", tx.hash);
      await tx.wait();
      console.log("Transaction confirmed");
      
      return tx.hash;
    } catch (err) {
      console.error("Error setting callback gas limit:", err);
      setError(err.message || "Failed to set callback gas limit");
      return false;
    }
  };

  const setSubscriptionId = async (subscriptionId) => {
    try {
      setError(null);
      
      // Check permissions first
      const ownerStatus = await checkOwnerStatus();
      const adminStatus = await checkAdminStatus();
      
      if (!ownerStatus && !adminStatus) {
        setError("Only the contract owner or admins can set subscription ID");
        return false;
      }
      
      // Get valid signer and contract
      let validContract;
      try {
        const { contract: contractInstance } = await getSignerAndContract();
        validContract = contractInstance;
      } catch (error) {
        setError(error.message);
        return false;
      }
      
      console.log(`Setting subscription ID: ${subscriptionId}`);
      
      // Submit transaction
      const tx = await validContract.setSubscriptionId(subscriptionId);
      console.log("Transaction sent:", tx.hash);
      await tx.wait();
      console.log("Transaction confirmed");
      
      return tx.hash;
    } catch (err) {
      console.error("Error setting subscription ID:", err);
      setError(err.message || "Failed to set subscription ID");
      return false;
    }
  };

  const getChainlinkConfig = async () => {
    try {
      // Get valid contract
      let validContract;
      try {
        const { contract: contractInstance } = await getSignerAndContract();
        validContract = contractInstance;
      } catch (error) {
        setError(error.message);
        return null;
      }
      
      const config = await validContract.getChainlinkConfig();
      return {
        coordinator: config.coordinator,
        subId: config.subId.toString(),
        hash: config.hash,
        gasLimit: config.gasLimit.toString(),
        confirmations: config.confirmations
      };
    } catch (err) {
      console.error("Error getting Chainlink config:", err);
      setError(err.message || "Failed to get Chainlink configuration");
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
    initializing,
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
    getGiveawayDetails,
    
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