'use client';

import { useMultiGiveaway } from '@/context/MultiGiveawayContext';
import { useState } from 'react';

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

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen p-4"
      style={{ backgroundColor: colors.background, color: colors.text }}
    >
      <div
        className="w-full max-w-xl p-6 rounded-lg shadow-md"
        style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}` }}
      >
        <h2 className="text-2xl font-bold text-center mb-6">Manage Giveaway</h2>

        {!isConnected ? (
          <div className="text-center mb-4">
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
          <div className="text-center mb-4">
            <p className="mb-3" style={{ color: colors.error }}>
              Please switch to {networkConfig.name} network to continue
            </p>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
}