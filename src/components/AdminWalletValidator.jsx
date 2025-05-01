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

  // Color scheme
  const colors = {
    primary: '#000',          // Black
    secondary: '#513763',     // Cyan
    success: 'rgb(234 179 8)', // Yellow/gold
    error: '#dc2626',         // Red
    background: '#f8fafc',    // Light background
    card: '#ffffff',          // White for cards
    text: '#0f172a',          // Dark text
    lightText: '#64748b',     // Lighter text
    border: '#e2e8f0',        // Border color
    highlight: 'rgb(255 221 96)', // Highlight yellow
    danger: '#ef4444'         // Red for remove button
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
      <div className="bg-slate-50 p-8 pt-[90px]">
        <div className="w-full max-w-xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="w-full p-6 flex items-center" style={{ backgroundColor: colors.primary }}>
            <Wallet className="mr-3 text-white" size={28} />
            <h2 className="text-2xl font-bold text-white">Admin Management</h2>
          </div>
          <div className="p-8 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-cyan-600 mb-4" size={36} />
            <p className="text-lg text-cyan-600">
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
      <div className="bg-slate-50 p-8 pt-[90px]">
        <div className="w-full max-w-xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="w-full p-6 flex items-center" style={{ backgroundColor: colors.primary }}>
            <Wallet className="mr-3 text-white" size={28} />
            <h2 className="text-2xl font-bold text-white">Admin Management</h2>
          </div>
          <div className="p-8 text-center">
            <p className="text-lg text-amber-600">
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
      <div className="bg-slate-50 p-8 pt-[90px]">
        <div className="w-full max-w-xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="w-full p-6 flex items-center" style={{ backgroundColor: colors.primary }}>
            <Wallet className="mr-3 text-white" size={28} />
            <h2 className="text-2xl font-bold text-white">Admin Management</h2>
          </div>
          <div className="p-8 text-center">
            <p className="text-lg text-red-600">
              Only the contract owner can manage admins. 
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-50 p-8 pt-[90px]">
      <div className="w-full max-w-xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden">
        {/* Header Section */}
        <div className="w-full p-6 flex items-center" style={{ backgroundColor: colors.primary }}>
          <Wallet className="mr-3 text-white" size={28} />
          <h2 className="text-2xl font-bold text-white">Admin Management</h2>
        </div>
        
        {/* Loading indicator if context is still loading */}
        {contextLoading && (
          <div className="p-8 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-cyan-600 mb-4" size={36} />
            <p className="text-lg text-cyan-600">
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
                className="w-full px-4 py-4 text-lg bg-slate-50 text-slate-900 rounded-lg border-2 focus:outline-none focus:ring-2 transition-all"
                style={{
                  borderColor: isTouched 
                    ? isValid 
                      ? isAdminAlready ? colors.error : colors.success
                      : colors.error 
                    : colors.border,
                  boxShadow: isTouched && isValid && !isAdminAlready ? `0 0 0 2px ${colors.highlight}` : 'none'
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
              <p className="mt-3 text-amber-600 text-sm">
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
                className="py-4 px-6 rounded-lg text-lg font-medium transition-all flex items-center justify-center"
                style={{
                  backgroundColor: isValid && !isAdminAlready && !isLoading ? colors.secondary : '#e2e8f0',
                  color: isValid && !isAdminAlready && !isLoading ? 'white' : colors.lightText,
                  cursor: isValid && !isAdminAlready && !isLoading ? 'pointer' : 'not-allowed'
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
                className="py-4 px-6 rounded-lg text-lg font-medium transition-all flex items-center justify-center"
                style={{
                  backgroundColor: isValid && isAdminAlready && !isLoading ? colors.danger : '#e2e8f0',
                  color: isValid && isAdminAlready && !isLoading ? 'white' : colors.lightText,
                  cursor: isValid && isAdminAlready && !isLoading ? 'pointer' : 'not-allowed'
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
              <div className="mt-4 text-center text-cyan-600">
                Processing transaction... Please confirm in your wallet
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Popup message */}
      {showPopup && operationMessage.message && (
        <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowPopup(false)}></div>
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden w-full max-w-md z-10 transform transition-all">
            <div 
              className="p-4 w-full" 
              style={{ 
                backgroundColor: operationMessage.type === 'success' ? colors.success : colors.error 
              }}
            >
              <h3 className="text-xl font-bold text-white text-center">
                {operationMessage.type === 'success' ? 'Success' : 'Error'}
              </h3>
            </div>
            
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                {operationMessage.type === 'success' ? (
                  <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center">
                    <CheckCircle size={40} color={colors.success} />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                    <XCircle size={40} color={colors.error} />
                  </div>
                )}
              </div>
              
              <p className="text-center text-lg">
                {operationMessage.message}
              </p>
              
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => setShowPopup(false)}
                  className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
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