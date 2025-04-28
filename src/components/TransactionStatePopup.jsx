"use client"
import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { useTransaction } from "@/context/TransactionContext"

export default function TransactionStatePopup() {
  const [portalElement, setPortalElement] = useState(null)
  
  // Get transaction state from context
  const {
    isOpen,
    closeTransaction,
    transactionId,
    functionName,
    status,
    error,
    networkName
  } = useTransaction()
  
  // Initialize portal element for mounting the modal
  useEffect(() => {
    setPortalElement(document.getElementById("modal-root") || document.body)
  }, [])

  // Get explorer URL based on network
  const getExplorerUrl = () => {
    switch (networkName.toUpperCase()) {
      case "SEPOLIA":
        return `https://sepolia.etherscan.io/tx/${transactionId}`
      case "AMOY":
        return `https://www.oklink.com/amoy/tx/${transactionId}`
      case "POLYGON":
        return `https://polygonscan.com/tx/${transactionId}`
      default:
        return `https://sepolia.etherscan.io/tx/${transactionId}`
    }
  }

  // Animation classes based on status
  const getAnimationClass = () => {
    if (status === "pending") return "animate-pulse"
    if (status === "success") return "animate-fadeIn"
    if (status === "error") return "animate-shake"
    return ""
  }

  if (!isOpen || !portalElement) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div 
        className={`bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden transform transition-all ${getAnimationClass()}`}
      >
        {/* Header */}
        <div className="bg-[rgb(81,55,99)] p-4 flex justify-between items-center">
          <h3 className="text-lg font-bold text-white">
            Transaction {status === "success" ? "Receipt" : "Status"}
          </h3>
          <button 
            onClick={closeTransaction}
            className="text-white hover:text-gray-300 focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {status === "pending" && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-16 h-16 border-4 border-t-4 border-gray-200 border-t-cyan-600 rounded-full animate-spin mb-4"></div>
              <p className="text-lg font-medium text-gray-700">Processing Transaction</p>
              <p className="text-sm text-gray-500 mt-2 text-center">Please wait while your transaction is being processed. Do not close this window.</p>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="bg-yellow-100 rounded-full p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              
              <div className="text-center mb-4">
                <h4 className="text-xl font-bold text-gray-800">Transaction Successful!</h4>
                <p className="text-gray-600">Your transaction has been confirmed on the blockchain.</p>
              </div>

              <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <p className="text-sm text-gray-500">Function Called</p>
                  <p className="font-mono text-gray-800 font-medium">{functionName || "Unknown Function"}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Transaction ID</p>
                  <p className="font-mono text-gray-800 font-medium truncate" title={transactionId}>
                    {transactionId || "N/A"}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Network</p>
                  <p className="font-medium text-gray-800">{networkName}</p>
                </div>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="bg-red-100 rounded-full p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
              
              <div className="text-center mb-4">
                <h4 className="text-xl font-bold text-gray-800">Transaction Failed</h4>
                <p className="text-gray-600">There was an error processing your transaction.</p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 flex justify-end gap-3 border-t">
          {status === "pending" && (
            <button
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              onClick={closeTransaction}
            >
              Cancel
            </button>
          )}

          {status === "success" && (
            <>
              <button
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                onClick={closeTransaction}
              >
                Close
              </button>
              
              <a
                href={getExplorerUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-cyan-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-cyan-700 transition-colors flex items-center gap-2"
              >
                <span>View on Explorer</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </>
          )}

          {status === "error" && (
            <button
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              onClick={closeTransaction}
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>,
    portalElement
  )
}