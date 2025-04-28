"use client"
import { createContext, useContext, useState } from "react"

// Create the context
const TransactionContext = createContext()

// Transaction provider component
export function TransactionProvider({ children }) {
  // Transaction state management
  const [isOpen, setIsOpen] = useState(false)
  const [transactionId, setTransactionId] = useState("")
  const [functionName, setFunctionName] = useState("")
  const [status, setStatus] = useState("pending") // "pending", "success", "error"
  const [error, setError] = useState("")
  const [networkName, setNetworkName] = useState(process.env.NEXT_PUBLIC_DEFAULT_NETWORK || "SEPOLIA")

  // Open transaction popup with pending status
  const startTransaction = (funcName) => {
    setFunctionName(funcName)
    setStatus("pending")
    setTransactionId("")
    setError("")
    setIsOpen(true)
    return true
  }

  // Update transaction to success status
  const completeTransaction = (txId) => {
    setTransactionId(txId)
    setStatus("success")
    return true
  }

  // Update transaction to error status
  const failTransaction = (errorMessage) => {
    setStatus("error")
    setError(errorMessage)
    return false
  }

  // Close the transaction popup
  const closeTransaction = () => {
    setIsOpen(false)
  }

  // Change network for explorer links
  const setNetwork = (network) => {
    setNetworkName(network)
  }

  const contextValue = {
    isOpen,
    transactionId,
    functionName,
    status,
    error,
    networkName,
    startTransaction,
    completeTransaction,
    failTransaction,
    closeTransaction,
    setNetwork
  }

  return (
    <TransactionContext.Provider value={contextValue}>
      {children}
    </TransactionContext.Provider>
  )
}

// Custom hook to use the transaction context
export function useTransaction() {
  const context = useContext(TransactionContext)
  if (!context) {
    throw new Error("useTransaction must be used within a TransactionProvider")
  }
  return context
}