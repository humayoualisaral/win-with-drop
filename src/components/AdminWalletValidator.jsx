"use client"
import { useState, useEffect, useRef } from "react"
import { CheckCircle, XCircle, Wallet, Plus, Trash2 } from 'lucide-react'
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

  // Get transaction functions from context
  const { startTransaction, completeTransaction, failTransaction } = useTransaction()

  // Get context functions and state
  const { 
    addAdmin, 
    removeAdmin, 
    isOwner, 
    contract, 
    loading: contextLoading,
    error: contextError
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

  // Check if an address is already an admin
  const checkIfAddressIsAdmin = async (addr) => {
    if (!contract || !addr || !validateWalletAddress(addr)) return false
    
    try {
      const isAdmin = await contract.isAdmin(addr)
      return isAdmin
    } catch (error) {
      console.error("Error checking admin status:", error)
      return false
    }
  }

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
      
      if (valid) {
        const isAdmin = await checkIfAddressIsAdmin(address)
        setIsAdminAlready(isAdmin)
      }
    }
    
    validateAndCheck()
  }, [address, contract])

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

  // Check if user has permission to manage admins
  if (!isOwner) {
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
        
        {/* Content Section */}
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
              disabled={isLoading || contextLoading}
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
              disabled={!isValid || isAdminAlready || isLoading || contextLoading}
              className="py-4 px-6 rounded-lg text-lg font-medium transition-all flex items-center justify-center"
              style={{
                backgroundColor: isValid && !isAdminAlready && !isLoading && !contextLoading ? colors.secondary : '#e2e8f0',
                color: isValid && !isAdminAlready && !isLoading && !contextLoading ? 'white' : colors.lightText,
                cursor: isValid && !isAdminAlready && !isLoading && !contextLoading ? 'pointer' : 'not-allowed'
              }}
            >
              <Plus size={20} className="mr-2" />
              Add Admin
            </button>
            
            <button
              onClick={handleRemoveAdmin}
              disabled={!isValid || !isAdminAlready || isLoading || contextLoading}
              className="py-4 px-6 rounded-lg text-lg font-medium transition-all flex items-center justify-center"
              style={{
                backgroundColor: isValid && isAdminAlready && !isLoading && !contextLoading ? colors.danger : '#e2e8f0',
                color: isValid && isAdminAlready && !isLoading && !contextLoading ? 'white' : colors.lightText,
                cursor: isValid && isAdminAlready && !isLoading && !contextLoading ? 'pointer' : 'not-allowed'
              }}
            >
              <Trash2 size={20} className="mr-2" />
              Remove Admin
            </button>
          </div>
          
          {/* Loading indicator */}
          {(isLoading || contextLoading) && (
            <div className="mt-4 text-center text-cyan-600">
              Processing... Please wait
            </div>
          )}
        </div>
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