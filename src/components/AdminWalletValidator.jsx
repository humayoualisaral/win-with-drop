import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Wallet, Plus, Trash2 } from 'lucide-react';
import { useMultiGiveaway } from '@/context/MultiGiveawayContext';

export default function AdminWalletAddressInput() {
  const [address, setAddress] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const [isAdminAlready, setIsAdminAlready] = useState(false);
  const [adminList, setAdminList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [operationMessage, setOperationMessage] = useState({ type: '', message: '' });

  // Get context functions and state
  const { 
    addAdmin, 
    removeAdmin, 
    isOwner, 
    contract, 
    loading: contextLoading,
    error: contextError
  } = useMultiGiveaway();

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
  };
  
  // Validate Ethereum wallet address (0x followed by 40 hex characters)
  const validateWalletAddress = (addr) => {
    const ethereumRegex = /^0x[a-fA-F0-9]{40}$/;
    return ethereumRegex.test(addr);
  };

  // Check if an address is already an admin
  const checkIfAddressIsAdmin = async (addr) => {
    if (!contract || !addr || !validateWalletAddress(addr)) return false;
    
    try {
      const isAdmin = await contract.isAdmin(addr);
      return isAdmin;
    } catch (error) {
      console.error("Error checking admin status:", error);
      return false;
    }
  };

  // Load all admins
  // const loadAdmins = async () => {
  //   if (!contract) return;
    
  //   try {
  //     // We need to get the admin list from the contract
  //     // Assuming there's a getAdmins function, if not, this would need to be modified
  //     const admins = await contract.getAdmins();
  //     setAdminList(admins);
  //   } catch (error) {
  //     console.error("Error loading admin list:", error);
  //   }
  // };

  // Initial setup
  // useEffect(() => {
  //   if (contract) {
  //     loadAdmins();
  //   }
  // }, [contract]);

  // Validate address and check if it's already an admin when address changes
  useEffect(() => {
    const validateAndCheck = async () => {
      if (!address) {
        setIsValid(false);
        setIsAdminAlready(false);
        return;
      }
      
      const valid = validateWalletAddress(address);
      setIsValid(valid);
      
      if (valid) {
        const isAdmin = await checkIfAddressIsAdmin(address);
        setIsAdminAlready(isAdmin);
      }
    };
    
    validateAndCheck();
  }, [address, contract]);

  const handleInputChange = (e) => {
    setAddress(e.target.value);
    if (!isTouched) setIsTouched(true);
    // Reset operation message when input changes
    setOperationMessage({ type: '', message: '' });
  };

  const handleAddAdmin = async () => {
    if (!isValid || isAdminAlready) return;
    
    setIsLoading(true);
    setOperationMessage({ type: '', message: '' });
    
    try {
      const success = await addAdmin(address);
      
      if (success) {
        setOperationMessage({ 
          type: 'success', 
          message: `Successfully added ${address} as admin` 
        });
        setAddress('');
        setIsTouched(false);
        // loadAdmins(); // Refresh admin list
      } else {
        setOperationMessage({ 
          type: 'error', 
          message: 'Failed to add admin. Please try again.' 
        });
      }
    } catch (error) {
      console.error("Error adding admin:", error);
      setOperationMessage({ 
        type: 'error', 
        message: `Error: ${error.message || 'Unknown error occurred'}` 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveAdmin = async () => {
    if (!isValid || !isAdminAlready) return;
    
    setIsLoading(true);
    setOperationMessage({ type: '', message: '' });
    
    try {
      const success = await removeAdmin(address);
      
      if (success) {
        setOperationMessage({ 
          type: 'success', 
          message: `Successfully removed ${address} from admins` 
        });
        setAddress('');
        setIsTouched(false);
        // loadAdmins(); // Refresh admin list
      } else {
        setOperationMessage({ 
          type: 'error', 
          message: 'Failed to remove admin. Please try again.' 
        });
      }
    } catch (error) {
      console.error("Error removing admin:", error);
      setOperationMessage({ 
        type: 'error', 
        message: `Error: ${error.message || 'Unknown error occurred'}` 
      });
    } finally {
      setIsLoading(false);
    }
  };

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
    );
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
          
          {/* Operation result message */}
          {operationMessage.message && (
            <div 
              className={`mt-4 p-3 rounded-lg ${
                operationMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}
            >
              {operationMessage.message}
            </div>
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
          
          {/* Admin list section */}
          {/* {adminList.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Current Admins</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto bg-slate-50 p-4 rounded-lg">
                {adminList.map((admin, index) => (
                  <div key={index} className="p-2 bg-white rounded border border-slate-200 flex justify-between items-center">
                    <span className="text-sm font-mono overflow-hidden text-ellipsis">
                      {admin}
                    </span>
                    <button 
                      onClick={() => setAddress(admin)}
                      className="text-xs bg-slate-200 hover:bg-slate-300 px-2 py-1 rounded ml-2"
                    >
                      Select
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
}