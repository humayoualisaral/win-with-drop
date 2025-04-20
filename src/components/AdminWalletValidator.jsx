import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Wallet } from 'lucide-react';

export default function AdminWalletAddressInput() {
  const [address, setAddress] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [isTouched, setIsTouched] = useState(false);

  // Color scheme
  const colors = {
    primary: '#000',          // Black
    secondary: '#0891b2',     // Cyan
    success: 'rgb(234 179 8)', // Yellow/gold
    error: '#dc2626',         // Red
    background: '#f8fafc',    // Light background
    card: '#ffffff',          // White for cards
    text: '#0f172a',          // Dark text
    lightText: '#64748b',     // Lighter text
    border: '#e2e8f0',        // Border color
    highlight: 'rgb(255 221 96)' // Highlight yellow
  };
  
  // Validate Ethereum wallet address (0x followed by 40 hex characters)
  const validateWalletAddress = (addr) => {
    const ethereumRegex = /^0x[a-fA-F0-9]{40}$/;
    return ethereumRegex.test(addr);
  };

  useEffect(() => {
    if (address) {
      setIsValid(validateWalletAddress(address));
    } else {
      setIsValid(false);
    }
  }, [address]);

  const handleInputChange = (e) => {
    setAddress(e.target.value);
    if (!isTouched) setIsTouched(true);
  };

  const handleAddWallet = () => {
    if (isValid) {
      // Here you would handle adding the wallet
      alert(`Wallet added: ${address}`);
      setAddress('');
      setIsTouched(false);
    }
  };

  return (
    <div className="bg-slate-50 p-8 pt-[90px]">
      <div className="w-full max-w-xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden">
        {/* Header Section */}
        <div className="w-full p-6 flex items-center" style={{ backgroundColor: colors.primary }}>
          <Wallet className="mr-3 text-white" size={28} />
          <h2 className="text-2xl font-bold text-white">Add Admin Address</h2>
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
                    ? colors.success
                    : colors.error 
                  : colors.border,
                boxShadow: isTouched && isValid ? `0 0 0 2px ${colors.highlight}` : 'none'
              }}
            />
            
            {isTouched && (
              <div className="absolute right-4 top-4">
                {isValid ? (
                  <CheckCircle color={colors.success} size={24} />
                ) : (
                  <XCircle color={colors.error} size={24} />
                )}
              </div>
            )}
          </div>
          
          {isTouched && !isValid && address && (
            <p className="mt-3 text-red-600 text-sm">
              Please enter a valid wallet address (0x followed by 40 hex characters)
            </p>
          )}
          
          <button
            onClick={handleAddWallet}
            disabled={!isValid}
            className="mt-6 w-full py-4 px-6 rounded-lg text-lg font-medium transition-all"
            style={{
              backgroundColor: isValid ? colors.secondary : '#e2e8f0',
              color: isValid ? 'white' : colors.lightText,
              cursor: isValid ? 'pointer' : 'not-allowed'
            }}
          >
            Add Admin
          </button>
        </div>
      </div>
    </div>
  );
}