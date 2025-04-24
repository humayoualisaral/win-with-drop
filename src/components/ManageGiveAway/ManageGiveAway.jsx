'use client';

import { useMultiGiveaway } from '@/context/MultiGiveawayContext';
import { useState } from 'react';
import StateSection from '@/components/StateSection';

const colors = {
  primary: "#000",
  secondary: "#0891b2",
  success: "rgb(234 179 8)",
  error: "#dc2626",
  background: "#f8fafc",
  card: "#ffffff",
  text: "#0f172a",
  lightText: "#64748b",
  border: "#e2e8f0",
  highlight: "rgb(255 221 96)",
};

export default function ManageGiveaway() {
  const [activeSection, setActiveSection] = useState("createGiveaway");
  const [giveawayName, setGiveawayName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const {
    createGiveaway,
    isConnected,
    isCorrectNetwork,
    connectWallet,
    loading,
    error,
    networkConfig
  } = useMultiGiveaway();

  const handleInputChange = (e) => {
    const input = e.target.value;
    const isValidString = /^[A-Za-z\s]*$/.test(input);

    if (isValidString || input === "") {
      setGiveawayName(input);
      setErrorMessage(""); // Clear error
    } else {
      setErrorMessage("Please use only letters and spaces to add a giveaway.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    
    // Check if wallet is connected
    if (!isConnected) {
      setErrorMessage("Please connect your wallet first.");
      return;
    }
    
    // Check if on correct network
    if (!isCorrectNetwork) {
      setErrorMessage(`Please switch to ${networkConfig.name} network.`);
      return;
    }
    
    if (giveawayName.trim() === "") {
      setErrorMessage("Giveaway name cannot be empty.");
      return;
    } 
    
    if (errorMessage === "") {
      try {
        setIsSubmitting(true);
        const success = await createGiveaway(giveawayName);
        
        if (success) {
          setSuccessMessage(`Giveaway "${giveawayName}" created successfully!`);
          setGiveawayName("");
        } else {
          setErrorMessage("Failed to create giveaway. Please try again.");
        }
      } catch (err) {
        console.error("Error creating giveaway:", err);
        setErrorMessage(err.message || "An error occurred while creating the giveaway");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Create giveaway form component
  const CreateGiveawayForm = () => (
    <div
      className="w-full max-w-xl p-6 rounded-lg shadow-md"
      style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}` }}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="giveawayName" className="block mb-1 text-sm" style={{ color: colors.lightText }}>
            Giveaway Name
          </label>
          <input
            type="text"
            id="giveawayName"
            value={giveawayName}
            onChange={handleInputChange}
            placeholder="Enter giveaway name"
            className="w-full p-3 rounded-md"
            style={{
              backgroundColor: "#f1f5f9",
              border: `1px solid ${colors.border}`,
              color: colors.text,
            }}
          />
          {errorMessage && (
            <p className="mt-2 text-sm" style={{ color: colors.error }}>
              {errorMessage}
            </p>
          )}
          {successMessage && (
            <p className="mt-2 text-sm" style={{ color: 'green' }}>
              {successMessage}
            </p>
          )}
          {error && (
            <p className="mt-2 text-sm" style={{ color: colors.error }}>
              {error}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="px-4 py-2 rounded text-white font-semibold"
          style={{ 
            backgroundColor: isSubmitting ? colors.lightText : colors.success,
            cursor: isSubmitting ? 'not-allowed' : 'pointer'
          }}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating...' : 'Submit Giveaway'}
        </button>
      </form>
    </div>
  );

  return (
    <div style={{ backgroundColor: colors.background, color: colors.text }}>
      {/* Tab Navigation - Exactly like in Action component */}
      <div className="flex space-x-2 mb-4 ml-2 mt-2 bg-gray-100 p-4">
        <button
          onClick={() => setActiveSection("createGiveaway")}
          className={`px-2 py-1 text-xs rounded transition-colors ${
            activeSection === "createGiveaway"
              ? "text-white"
              : "bg-blue-100 text-blue-800 hover:bg-blue-200"
          }`}
          style={activeSection === "createGiveaway" ? { backgroundColor: "rgb(234, 179, 8)", cursor: 'pointer' } : { cursor: 'pointer' }}
        >
          Create Giveaway
        </button>
        <button
          onClick={() => setActiveSection("currentGiveaways")}
          className={`px-2 py-1 text-xs rounded transition-colors ${
            activeSection === "currentGiveaways"
              ? "text-white"
              : "bg-green-100 text-green-800 hover:bg-green-200"
          }`}
          style={activeSection === "currentGiveaways" ? { backgroundColor: "rgb(234, 179, 8)", cursor: 'pointer' } : { cursor: 'pointer' }}
        >
          Current Giveaways
        </button>
      </div>

      {/* Connection state checks */}
      {!isConnected ? (
        <div className="text-center mb-4 p-6 bg-white rounded-lg shadow-md">
          <p className="mb-3">Connect your wallet to manage giveaways</p>
          <button
            onClick={connectWallet}
            disabled={loading}
            className="px-4 py-2 rounded text-white font-semibold"
            style={{ backgroundColor: colors.secondary }}
          >
            {loading ? 'Connecting...' : 'Connect Wallet'}
          </button>
        </div>
      ) : !isCorrectNetwork ? (
        <div className="text-center mb-4 p-6 bg-white rounded-lg shadow-md">
          <p className="mb-3" style={{ color: colors.error }}>
            Please switch to {networkConfig.name} network to continue
          </p>
        </div>
      ) : (
        <>
          {/* Content based on active section - Now exactly like Action component */}
          {activeSection === "createGiveaway" && <CreateGiveawayForm />}
          {activeSection === "currentGiveaways" && <StateSection />}
        </>
      )}
    </div>
  );
}