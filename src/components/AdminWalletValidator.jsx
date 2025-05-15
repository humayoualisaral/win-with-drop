"use client"
import { useState, useEffect, useCallback } from "react"
import { CheckCircle, XCircle, Wallet, Plus, Trash2, Loader2 } from 'lucide-react'
import { useMultiGiveaway } from '@/context/MultiGiveawayContext'
import { useTransaction } from "@/context/TransactionContext"

export default function AdminWalletAddressInput() {
  const [address, setAddress] = useState('')
  const [isValid, setIsValid] = useState(false)
  const [isTouched, setIsTouched] = useState(false)
  const [isAdminAlready, setIsAdminAlready] = useState(false)
  const [adminList, setAdminList] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [operationMessage, setOperationMessage] = useState({ type: '', message: '' })
  const [showPopup, setShowPopup] = useState(false)
  const [ownerStatus, setOwnerStatus] = useState(false)
  const [ownerLoading, setOwnerLoading] = useState(true)

  // Get transaction functions from context
  const { startTransaction, completeTransaction, failTransaction } = useTransaction()

  // Get context functions and state
  const { 
    addAdmin, 
    removeAdmin, 
    contract, 
    loading: contextLoading,
    initializing,
    error: contextError,
    isConnected,
    account
  } = useMultiGiveaway()

  // Updated color scheme to match the purple grid background from EmailValidator
  const colors = {
    primary: "#513763", // Deep purple that matches the background theme
    secondary: "#8E4FC3", // Lighter purple for secondary elements
    success: "#EAAE08", // Gold color for success states
    error: "#dc2626", // Red for errors
    background: "rgba(183, 140, 219, 0.1)", // Very light purple bg
    card: "#ffffff", // White for cards
    text: "#2D1B36", // Deep purple text
    lightText: "#64748b", // Slate-500 - softer secondary text
    border: "#B78CDB", // Light purple border
    highlight: "rgba(234, 174, 8, 0.18)", // Light gold for highlights
    tableHeaderBg: "#513763", // Dark purple for table headers
    tableStripeBg: "rgba(183, 140, 219, 0.05)", // Very light purple for table striping
    buttonGradient: "linear-gradient(135deg, rgb(234 179 8) 0%, #8E4FC3 100%)", // Purple gradient for buttons
    cardBoxShadow: "0 8px 30px rgba(183, 140, 219, 0.2)", // Soft purple shadow
    dangerGradient: "linear-gradient(135deg, #ff4d4d 0%, #c53030 100%)" // Red gradient for danger buttons
  }
  
  // Validate Ethereum wallet address (0x followed by 40 hex characters)
  const validateWalletAddress = (addr) => {
    const ethereumRegex = /^0x[a-fA-F0-9]{40}$/
    return ethereumRegex.test(addr)
  }

  // Check owner status directly from the component
  const checkOwnerStatus = useCallback(async () => {
    if (!contract || !account) {
      setOwnerStatus(false)
      setOwnerLoading(false)
      return false
    }
    
    try {
      setOwnerLoading(true)
      const owner = await contract.getContractOwner()
      const isCurrentOwner = account.toLowerCase() === owner.toLowerCase()
      
      setOwnerStatus(isCurrentOwner)
      setOwnerLoading(false)
      return isCurrentOwner
    } catch (err) {
      console.error("Error checking owner status:", err)
      setOwnerStatus(false)
      setOwnerLoading(false)
      return false
    }
  }, [contract, account])

  // Check if an address is already an admin
  const checkIfAddressIsAdmin = useCallback(async (addr) => {
    if (!contract || !addr || !validateWalletAddress(addr)) return false
    
    try {
      const isAdmin = await contract.isAdmin(addr)
      return isAdmin
    } catch (error) {
      console.error("Error checking admin status:", error)
      return false
    }
  }, [contract])

  // Fetch owner status whenever contract or account changes
  useEffect(() => {
    // Only check when we have both contract and account
    if (contract && account && !initializing) {
      // We use an IIFE to avoid issues with useEffect's cleanup
      const fetchOwnerStatus = async () => {
        await checkOwnerStatus()
      }
      
      fetchOwnerStatus()
    } else {
      // Reset owner loading when conditions aren't met
      setOwnerLoading(false)
    }
  }, [contract, account, initializing, checkOwnerStatus])

  // Validate address and check if it's already an admin when address changes
  useEffect(() => {
    const validateAndCheck = async () => {
      if (!address) {
        setIsValid(false)
        setIsAdminAlready(false)
        return
      }
      
      const valid = validateWalletAddress(address)
      setIsValid(valid)
      
      if (valid && contract) {
        const isAdmin = await checkIfAddressIsAdmin(address)
        setIsAdminAlready(isAdmin)
      }
    }
    
    validateAndCheck()
  }, [address, contract, checkIfAddressIsAdmin])

  // Close popup after 5 seconds
  useEffect(() => {
    let timer
    if (showPopup) {
      timer = setTimeout(() => {
        setShowPopup(false)
      }, 5000)
    }
    return () => clearTimeout(timer)
  }, [showPopup])

  const handleInputChange = (e) => {
    setAddress(e.target.value)
    if (!isTouched) setIsTouched(true)
    // Reset operation message when input changes
    setOperationMessage({ type: '', message: '' })
  }

  const handleAddAdmin = async () => {
    if (!isValid || isAdminAlready) return
    
    setIsLoading(true)
    setOperationMessage({ type: '', message: '' })
    
    // Start transaction with function name
    startTransaction("addAdmin")
    
    try {
      const txHash = await addAdmin(address)
      
      if (txHash) {
        // Update transaction to success state with transaction id
        completeTransaction(txHash)
        
        setOperationMessage({ 
          type: 'success', 
          message: `Successfully added ${address} as admin` 
        })
        setAddress('')
        setIsTouched(false)
        setShowPopup(true)
      } else {
        // Handle transaction error
        failTransaction(contextError || "Failed to add admin. Please try again.")
        
        setOperationMessage({ 
          type: 'error', 
          message: 'Failed to add admin. Please try again.' 
        })
        setShowPopup(true)
      }
    } catch (error) {
      console.error("Error adding admin:", error)
      // Handle exception
      failTransaction(error.message || "An error occurred while adding admin.")
      
      setOperationMessage({ 
        type: 'error', 
        message: `Error: ${error.message || 'Unknown error occurred'}` 
      })
      setShowPopup(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveAdmin = async () => {
    if (!isValid || !isAdminAlready) return
    
    setIsLoading(true)
    setOperationMessage({ type: '', message: '' })
    
    // Start transaction with function name
    startTransaction("removeAdmin")
    
    try {
      const txHash = await removeAdmin(address)
      
      if (txHash) {
        // Update transaction to success state with transaction id
        completeTransaction(txHash)
        
        setOperationMessage({ 
          type: 'success', 
          message: `Successfully removed ${address} from admins` 
        })
        setAddress('')
        setIsTouched(false)
        setShowPopup(true)
      } else {
        // Handle transaction error
        failTransaction(contextError || "Failed to remove admin. Please try again.")
        
        setOperationMessage({ 
          type: 'error', 
          message: 'Failed to remove admin. Please try again.' 
        })
        setShowPopup(true)
      }
    } catch (error) {
      console.error("Error removing admin:", error)
      // Handle exception
      failTransaction(error.message || "An error occurred while removing admin.")
      
      setOperationMessage({ 
        type: 'error', 
        message: `Error: ${error.message || 'Unknown error occurred'}` 
      })
      setShowPopup(true)
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading state during initialization or owner status check
  if (initializing || ownerLoading) {
    return (
      <div className="p-8 pt-[90px]">
        <div className="w-full max-w-xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden" style={{ boxShadow: colors.cardBoxShadow }}>
          <div className="w-full p-6 flex items-center relative overflow-hidden" style={{ 
            background: colors.buttonGradient,
          }}>
            {/* Decorative elements */}
            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white opacity-10"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-white opacity-5"></div>
            
            <Wallet className="mr-3 text-white relative z-10" size={28} />
            <h2 className="text-2xl font-bold text-white relative z-10">Admin Management</h2>
          </div>
          <div className="p-8 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: colors.background }}>
              <Loader2 className="animate-spin" style={{ color: colors.secondary }} size={36} />
            </div>
            <p className="text-lg" style={{ color: colors.primary }}>
              {initializing ? "Initializing wallet connection..." : "Checking permissions..."}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Show connection needed message if not connected
  if (!isConnected) {
    return (
      <div className="p-8 pt-[90px]">
        <div className="w-full max-w-xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden" style={{ boxShadow: colors.cardBoxShadow }}>
          <div className="w-full p-6 flex items-center relative overflow-hidden" style={{ 
            background: colors.buttonGradient,
          }}>
            {/* Decorative elements */}
            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white opacity-10"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-white opacity-5"></div>
            
            <Wallet className="mr-3 text-white relative z-10" size={28} />
            <h2 className="text-2xl font-bold text-white relative z-10">Admin Management</h2>
          </div>
          <div className="p-8 text-center">
            <div className="inline-block p-4 rounded-full mb-4" style={{ background: colors.background }}>
              <XCircle size={36} style={{ color: colors.secondary }} />
            </div>
            <p className="text-lg" style={{ color: colors.secondary }}>
              Please connect your wallet to manage admins.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Check if user has permission to manage admins
  if (!ownerStatus) {
    return (
      <div className="p-8 pt-[90px]">
        <div className="w-full max-w-xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden" style={{ boxShadow: colors.cardBoxShadow }}>
          <div className="w-full p-6 flex items-center relative overflow-hidden" style={{ 
            background: colors.buttonGradient,
          }}>
            {/* Decorative elements */}
            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white opacity-10"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-white opacity-5"></div>
            
            <Wallet className="mr-3 text-white relative z-10" size={28} />
            <h2 className="text-2xl font-bold text-white relative z-10">Admin Management</h2>
          </div>
          <div className="p-8 text-center">
            <div className="inline-block p-4 rounded-full mb-4" style={{ background: "rgba(239, 68, 68, 0.1)" }}>
              <XCircle size={36} color={colors.error} />
            </div>
            <p className="text-lg" style={{ color: colors.error }}>
              Only the contract owner can manage admins. 
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 pt-[90px]">
      <div className="w-full max-w-xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden" style={{ boxShadow: colors.cardBoxShadow }}>
        {/* Header Section */}
        <div className="w-full p-6 flex items-center relative overflow-hidden" style={{ 
          background: colors.buttonGradient,
        }}>
          {/* Decorative elements */}
          <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white opacity-10"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-white opacity-5"></div>
          
          <Wallet className="mr-3 text-white relative z-10" size={28} />
          <h2 className="text-2xl font-bold text-white relative z-10">Admin Management</h2>
        </div>
        
        {/* Loading indicator if context is still loading */}
        {contextLoading && (
          <div className="p-8 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: colors.background }}>
              <Loader2 className="animate-spin" style={{ color: colors.secondary }} size={36} />
            </div>
            <p className="text-lg" style={{ color: colors.primary }}>
              Loading admin information...
            </p>
          </div>
        )}
        
        {/* Content Section - Only show when not in context loading state */}
        {!contextLoading && (
          <div className="p-8">
            <div className="relative">
              <input
                type="text"
                value={address}
                onChange={handleInputChange}
                placeholder="0x..."
                className="w-full px-4 py-4 text-lg rounded-lg border-2 focus:outline-none transition-all"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.7)",
                  borderColor: isTouched 
                    ? isValid 
                      ? isAdminAlready ? colors.error : colors.success
                      : colors.error 
                    : colors.border,
                  boxShadow: isTouched && isValid && !isAdminAlready ? `0 0 15px rgba(234, 174, 8, 0.2)` : '0 0 15px rgba(183, 140, 219,.1)',
                  color: colors.text
                }}
                disabled={isLoading}
              />
              
              {isTouched && (
                <div className="absolute right-4 top-4">
                  {isValid ? (
                    <CheckCircle 
                      color={isAdminAlready ? colors.error : colors.success} 
                      size={24} 
                    />
                  ) : (
                    <XCircle color={colors.error} size={24} />
                  )}
                </div>
              )}
            </div>
            
            {/* Validation messages */}
            {isTouched && !isValid && address && (
              <p className="mt-3 text-red-600 text-sm">
                Please enter a valid wallet address (0x followed by 40 hex characters)
              </p>
            )}
            
            {isTouched && isValid && isAdminAlready && (
              <p className="mt-3 text-sm" style={{ color: colors.secondary }}>
                This address is already an admin. You can only remove it.
              </p>
            )}
            
            {/* Context error display */}
            {contextError && (
              <div className="mt-4 p-3 rounded-lg bg-red-100 text-red-800">
                {contextError}
              </div>
            )}
            
            {/* Action buttons */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <button
                onClick={handleAddAdmin}
                disabled={!isValid || isAdminAlready || isLoading}
                className="py-3 px-6 rounded-lg text-lg font-medium transition-all flex items-center justify-center shadow-md"
                style={{
                  background: isValid && !isAdminAlready && !isLoading ? colors.buttonGradient : '#e2e8f0',
                  color: isValid && !isAdminAlready && !isLoading ? 'white' : colors.lightText,
                  cursor: isValid && !isAdminAlready && !isLoading ? 'pointer' : 'not-allowed',
                  boxShadow: isValid && !isAdminAlready && !isLoading ? "0 4px 15px rgba(81, 55, 99, 0.4)" : "none",
                  opacity: isValid && !isAdminAlready && !isLoading ? 1 : 0.5,
                }}
              >
                {isLoading ? (
                  <Loader2 size={20} className="mr-2 animate-spin" />
                ) : (
                  <Plus size={20} className="mr-2" />
                )}
                Add Admin
              </button>
              
              <button
                onClick={handleRemoveAdmin}
                disabled={!isValid || !isAdminAlready || isLoading}
                className="py-3 px-6 rounded-lg text-lg font-medium transition-all flex items-center justify-center shadow-md"
                style={{
                  background: isValid && isAdminAlready && !isLoading ? colors.dangerGradient : '#e2e8f0',
                  color: isValid && isAdminAlready && !isLoading ? 'white' : colors.lightText,
                  cursor: isValid && isAdminAlready && !isLoading ? 'pointer' : 'not-allowed',
                  boxShadow: isValid && isAdminAlready && !isLoading ? "0 4px 15px rgba(220, 38, 38, 0.4)" : "none",
                  opacity: isValid && isAdminAlready && !isLoading ? 1 : 0.5,
                }}
              >
                {isLoading ? (
                  <Loader2 size={20} className="mr-2 animate-spin" />
                ) : (
                  <Trash2 size={20} className="mr-2" />
                )}
                Remove Admin
              </button>
            </div>
            
            {/* Transaction processing indicator */}
            {isLoading && (
              <div className="mt-6 p-4 rounded-lg text-center" style={{ backgroundColor: colors.background, color: colors.secondary }}>
                <div className="flex items-center justify-center">
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Processing transaction... Please confirm in your wallet
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Improved Popup Message - Styled similarly to the EmailValidator component */}
      {showPopup && operationMessage.message && (
        <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowPopup(false)}></div>
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden w-full max-w-md z-10 transform transition-all"
               style={{ boxShadow: colors.cardBoxShadow }}>
            {/* Popup Header with gradient background */}
            <div 
              className="p-6 relative overflow-hidden" 
              style={{ 
                background: operationMessage.type === 'success' 
                  ? colors.buttonGradient
                  : colors.dangerGradient
              }}
            >
              {/* Decorative elements */}
              <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white opacity-10"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-white opacity-5"></div>
              
              <h3 className="text-2xl font-bold text-white text-center relative z-10">
                {operationMessage.type === 'success' ? 'Success' : 'Error'}
              </h3>
            </div>
            
            <div className="p-6">
              <div className="flex items-center justify-center mb-6">
                {operationMessage.type === 'success' ? (
                  <div className="w-20 h-20 rounded-full flex items-center justify-center" 
                       style={{ background: "rgba(234, 174, 8, 0.1)" }}>
                    <CheckCircle size={50} color={colors.success} />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-full flex items-center justify-center"
                       style={{ background: "rgba(239, 68, 68, 0.1)" }}>
                    <XCircle size={50} color={colors.error} />
                  </div>
                )}
              </div>
              
              <p className="text-center text-lg mb-6" style={{ color: colors.text }}>
                {operationMessage.message}
              </p>
              
              <div className="flex justify-center">
                <button
                  onClick={() => setShowPopup(false)}
                  className="px-8 py-3 rounded-lg font-medium shadow-md transition-all hover:shadow-lg hover:opacity-90 active:opacity-75"
                  style={{
                    background: colors.buttonGradient,
                    color: "white",
                    boxShadow: "0 4px 15px rgba(81, 55, 99, 0.4)"
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}