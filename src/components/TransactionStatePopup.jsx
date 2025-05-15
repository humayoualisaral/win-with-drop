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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#513763]">
      <div 
        className={`bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden transform transition-all ${getAnimationClass()}`}
      >
        {/* Header with gradient background */}
        <div 
          className="p-4 flex justify-between items-center"
          style={{
            background: "linear-gradient(135deg, rgb(234, 179, 8) 0%, rgb(142, 79, 195) 100%)"
          }}
        >
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
        <div className="px-6 pb-6">
          {status === "pending" && (
            <div className="flex flex-col items-center justify-center py-8">
              {/* Enhanced loading animation with DROP logo and animation */}
              <div className="flex flex-col items-center justify-center">
                {/* Logo animation - increased size */}
                <div className="relative mb-6">
                  <svg
                    className="w-64 h-24" // Increased size from w-52 h-20
                    viewBox="0 0 1239 454"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M156.462 63.9131C190.022 63.9131 219.349 70.7158 244.443 84.3212C269.84 97.9266 289.341 116.823 302.946 141.01C316.552 165.198 323.354 192.711 323.354 223.55C323.354 254.086 316.552 281.599 302.946 306.089C289.341 330.578 269.84 349.928 244.443 364.138C219.349 378.046 190.022 385 156.462 385H22.6756V63.9131H156.462ZM147.392 295.205C170.067 295.205 188.057 289.007 201.36 276.611C214.663 264.214 221.314 246.528 221.314 223.55C221.314 200.572 214.663 182.885 201.36 170.489C188.057 158.093 170.067 151.895 147.392 151.895H123.355V295.205H147.392ZM503.02 385L442.703 269.808H442.249V385H341.569V63.9131H491.228C517.23 63.9131 539.452 68.5994 557.895 77.972C576.338 87.0423 590.094 99.5894 599.164 115.614C608.537 131.335 613.223 149.173 613.223 169.128C613.223 190.594 607.177 209.642 595.083 226.271C583.292 242.899 566.209 254.842 543.836 262.098L613.677 385H503.02ZM442.249 202.688H482.158C491.833 202.688 499.089 200.572 503.927 196.339C508.764 191.804 511.183 184.85 511.183 175.477C511.183 167.012 508.613 160.36 503.473 155.523C498.636 150.685 491.531 148.266 482.158 148.266H442.249V202.688ZM783.709 388.175C753.474 388.175 725.659 381.07 700.262 366.859C675.168 352.649 655.213 332.997 640.399 307.903C625.584 282.809 618.177 254.54 618.177 223.096C618.177 191.652 625.584 163.384 640.399 138.289C655.213 113.195 675.168 93.6938 700.262 79.7861C725.659 65.576 753.474 58.471 783.709 58.471C813.943 58.471 841.607 65.576 866.701 79.7861C891.796 93.6938 911.599 113.195 926.112 138.289C940.926 163.384 948.334 191.652 948.334 223.096C948.334 254.54 940.926 282.809 926.112 307.903C911.599 332.997 891.645 352.649 866.248 366.859C841.154 381.07 813.64 388.175 783.709 388.175ZM783.709 294.297C803.663 294.297 819.083 287.948 829.967 275.25C840.851 262.249 846.293 244.865 846.293 223.096C846.293 201.025 840.851 183.64 829.967 170.942C819.083 157.941 803.663 151.441 783.709 151.441C763.452 151.441 747.881 157.941 736.997 170.942C726.113 183.64 720.67 201.025 720.67 223.096C720.67 244.865 726.113 262.249 736.997 275.25C747.881 287.948 763.452 294.297 783.709 294.297ZM1229.1 174.117C1229.1 194.374 1224.41 212.816 1215.04 229.445C1205.67 245.772 1191.76 258.772 1173.31 268.447C1155.17 278.122 1133.1 282.96 1107.1 282.96H1067.19V385H966.513V63.9131H1107.1C1146.41 63.9131 1176.49 73.8904 1197.35 93.845C1218.51 113.8 1229.1 140.557 1229.1 174.117ZM1095.76 203.595C1116.63 203.595 1127.06 193.769 1127.06 174.117C1127.06 154.464 1116.63 144.638 1095.76 144.638H1067.19V203.595H1095.76Z"
                      fill="#FFDD60"
                      className="animate-pulse"
                    />
                  </svg>
                  {/* Animated gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-slide"></div>
                </div>
                
                {/* Drippy cartoon animation - increased size */}
                <div className="relative w-40 h-40 mb-4"> {/* Increased from w-32 h-32 */}
                  <img 
                    src="https://winwithdrop.com/images/drippy_cartoon.gif" 
                    alt="DROP Animation" 
                    className="w-full h-full object-contain"
                  />
                  
                  {/* Animated droplets */}
                  <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "0s" }}></div>
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-lg font-medium text-gray-700">Processing Transaction</p>
                  <p className="text-sm text-gray-500 mt-2">Please wait while your transaction is being processed. Do not close this window.</p>
                </div>
                
                {/* Animated progress bar */}
                <div className="w-full h-2 bg-gray-200 rounded-full mt-6 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-yellow-400 via-cyan-500 to-yellow-400 animate-progressBar"></div>
                </div>
              </div>
            </div>
          )}

          {status === "success" && (
            <div>
              <div className="flex justify-center">
                {/* Using the specified GIF for success instead of SVG icon */}
                <div className="rounded-full p-1 flex justify-center items-center">
                  <img 
                    src="https://winwithdrop.com/images/gif/DropCoin_Idle.gif" 
                    alt="Success Animation" 
                    className="w-50 h-50 object-contain" 
                  />
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

      {/* Add these animation styles to your global CSS or add them inline here */}
      <style jsx global>{`
        @keyframes slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes progressBar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .animate-slide {
          animation: slide 1.5s ease-in-out infinite;
        }
        
        .animate-progressBar {
          animation: progressBar 2s ease-in-out infinite;
        }
      `}</style>
    </div>,
    portalElement
  )
}