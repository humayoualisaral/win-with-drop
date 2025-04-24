'use client'
import { useState, useEffect } from 'react';
import { useMultiGiveaway } from '@/context/MultiGiveawayContext';

export default function AuthCheck({ children }) {
  const { isConnected, isAdmin, isOwner, account, disconnect } = useMultiGiveaway();
  const [animateIn, setAnimateIn] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  
  useEffect(() => {
    // Check authorization when connection status or role changes
    if (isConnected) {
      setAuthorized(isAdmin || isOwner);
    }
    
    // Trigger animation after component mounts
    setAnimateIn(true);
  }, [isConnected, isAdmin, isOwner]);

  // If not connected, let the parent component handle this case
  if (!isConnected) {
    return children;
  }

  // If connected but not authorized, show error message
  if (!authorized) {
    return (
      <div className="fixed inset-0 bg-[rgb(81,55,99)] bg-opacity-90 flex items-center justify-center backdrop-blur-sm transition-all duration-500">
        <div className={`bg-black border-2 border-[#FFDD60] rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 transform transition-all duration-700 ${animateIn ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
          {/* Logo SVG */}
          <div className="flex justify-center mb-6">
            <svg className="w-52 h-20" viewBox="0 0 1239 454" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M156.462 63.9131C190.022 63.9131 219.349 70.7158 244.443 84.3212C269.84 97.9266 289.341 116.823 302.946 141.01C316.552 165.198 323.354 192.711 323.354 223.55C323.354 254.086 316.552 281.599 302.946 306.089C289.341 330.578 269.84 349.928 244.443 364.138C219.349 378.046 190.022 385 156.462 385H22.6756V63.9131H156.462ZM147.392 295.205C170.067 295.205 188.057 289.007 201.36 276.611C214.663 264.214 221.314 246.528 221.314 223.55C221.314 200.572 214.663 182.885 201.36 170.489C188.057 158.093 170.067 151.895 147.392 151.895H123.355V295.205H147.392ZM503.02 385L442.703 269.808H442.249V385H341.569V63.9131H491.228C517.23 63.9131 539.452 68.5994 557.895 77.972C576.338 87.0423 590.094 99.5894 599.164 115.614C608.537 131.335 613.223 149.173 613.223 169.128C613.223 190.594 607.177 209.642 595.083 226.271C583.292 242.899 566.209 254.842 543.836 262.098L613.677 385H503.02ZM442.249 202.688H482.158C491.833 202.688 499.089 200.572 503.927 196.339C508.764 191.804 511.183 184.85 511.183 175.477C511.183 167.012 508.613 160.36 503.473 155.523C498.636 150.685 491.531 148.266 482.158 148.266H442.249V202.688ZM783.709 388.175C753.474 388.175 725.659 381.07 700.262 366.859C675.168 352.649 655.213 332.997 640.399 307.903C625.584 282.809 618.177 254.54 618.177 223.096C618.177 191.652 625.584 163.384 640.399 138.289C655.213 113.195 675.168 93.6938 700.262 79.7861C725.659 65.576 753.474 58.471 783.709 58.471C813.943 58.471 841.607 65.576 866.701 79.7861C891.796 93.6938 911.599 113.195 926.112 138.289C940.926 163.384 948.334 191.652 948.334 223.096C948.334 254.54 940.926 282.809 926.112 307.903C911.599 332.997 891.645 352.649 866.248 366.859C841.154 381.07 813.64 388.175 783.709 388.175ZM783.709 294.297C803.663 294.297 819.083 287.948 829.967 275.25C840.851 262.249 846.293 244.865 846.293 223.096C846.293 201.025 840.851 183.64 829.967 170.942C819.083 157.941 803.663 151.441 783.709 151.441C763.452 151.441 747.881 157.941 736.997 170.942C726.113 183.64 720.67 201.025 720.67 223.096C720.67 244.865 726.113 262.249 736.997 275.25C747.881 287.948 763.452 294.297 783.709 294.297ZM1229.1 174.117C1229.1 194.374 1224.41 212.816 1215.04 229.445C1205.67 245.772 1191.76 258.772 1173.31 268.447C1155.17 278.122 1133.1 282.96 1107.1 282.96H1067.19V385H966.513V63.9131H1107.1C1146.41 63.9131 1176.49 73.8904 1197.35 93.845C1218.51 113.8 1229.1 140.557 1229.1 174.117ZM1095.76 203.595C1116.63 203.595 1127.06 193.769 1127.06 174.117C1127.06 154.464 1116.63 144.638 1095.76 144.638H1067.19V203.595H1095.76Z" 
              fill="#FFDD60" className="animate-pulse"/>
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-center mb-6 text-white">Access Denied</h2>
          
          <div className="bg-[rgb(81,55,99)] rounded-lg p-4 mb-6">
            <p className="text-[#FFDD60] mb-2 text-center">
              You don't have permission to access this application
            </p>
            <p className="text-white text-sm text-center opacity-80">
              Your wallet address: <span className="font-mono text-xs">{account}</span>
            </p>
            <p className="text-white text-sm text-center opacity-80 mt-2">
              Only admin or owner wallets are authorized
            </p>
          </div>
          
          <div className="flex justify-center">
            <button
              onClick={disconnect}
              className="bg-[#FFDD60] hover:bg-yellow-400 text-black font-bold py-3 px-6 rounded-lg transition-all duration-300 w-full max-w-xs flex items-center justify-center transform hover:scale-105 hover:shadow-glow relative overflow-hidden group"
            >
              <span className="absolute w-full h-full top-0 left-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Disconnect Wallet
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If authorized, render children
  return children;
}