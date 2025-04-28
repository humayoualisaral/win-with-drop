'use client';

import { useMultiGiveaway } from '@/context/MultiGiveawayContext';
import { useTransaction } from '@/context/TransactionContext';
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

// Define CreateGiveawayForm outside the main component
const CreateGiveawayForm = ({ 
  handleSubmit, 
  giveawayName, 
  setGiveawayName, 
  errorMessage, 
  submissionResult, 
  error,
  isSubmitting 
}) => (
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
          onChange={(e) => setGiveawayName(e.target.value)}
          placeholder="Enter giveaway name"
          className="w-full p-3 rounded-md"
          style={{
            backgroundColor: "#f1f5f9",
            border: `1px solid ${colors.border}`,
            color: colors.text,
          }}
          autoFocus
        />
        {errorMessage && (
          <p className="mt-2 text-sm" style={{ color: colors.error }}>
            {errorMessage}
          </p>
        )}
        {error && !submissionResult && (
          <p className="mt-2 text-sm" style={{ color: colors.error }}>
            {error}
          </p>
        )}
      </div>

      {/* Submission result message */}
      {submissionResult && (
        <div className={`mt-2 p-4 rounded-lg ${submissionResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {submissionResult.message}
        </div>
      )}

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

export default function ManageGiveaway() {
  const [activeSection, setActiveSection] = useState("createGiveaway");
  const [giveawayName, setGiveawayName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  
  // Get transaction functions from context
  const { startTransaction, completeTransaction, failTransaction } = useTransaction();
  
  const {
    createGiveaway,
    isConnected,
    isCorrectNetwork,
    connectWallet,
    loading,
    error,
    networkConfig
  } = useMultiGiveaway();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted"); // Debug log
    setSubmissionResult(null);
    setErrorMessage('');
    
    // Check if wallet is connected
    if (!isConnected) {
      console.log("Wallet not connected"); // Debug log
      setErrorMessage("Please connect your wallet first.");
      return;
    }
    
    // Check if on correct network
    if (!isCorrectNetwork) {
      console.log("Not on correct network"); // Debug log
      setErrorMessage(`Please switch to ${networkConfig.name} network.`);
      return;
    }
    
    if (giveawayName.trim() === "") {
      console.log("Empty giveaway name"); // Debug log
      setErrorMessage("Giveaway name cannot be empty.");
      return;
    } 
    
    try {
      setIsSubmitting(true);
      console.log("Attempting to create giveaway:", giveawayName); // Debug log
      
      // Start transaction with function name
      startTransaction("createGiveaway");
      
      const result = await createGiveaway(giveawayName);
      
      if (result && typeof result === 'string') {
        console.log("Giveaway created successfully"); // Debug log
        
        // Update transaction to success state with transaction id
        completeTransaction(result);
        
        // Update UI state
        setSubmissionResult({
          success: true,
          message: `Giveaway "${giveawayName}" created successfully!`
        });
        
        setGiveawayName("");
      } else {
        console.log("Failed to create giveaway"); // Debug log
        
        // Handle transaction error
        failTransaction(error || "Failed to create giveaway. Please try again.");
        
        setSubmissionResult({
          success: false,
          message: "Failed to create giveaway. Please try again."
        });
      }
    } catch (err) {
      console.error("Error creating giveaway:", err);
      
      // Handle exception
      failTransaction(err.message || "An error occurred while creating the giveaway");
      
      setSubmissionResult({
        success: false,
        message: err.message || "An error occurred while creating the giveaway"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ backgroundColor: colors.background, color: colors.text }}>
      {/* Tab Navigation */}
      <div className="flex space-x-2 mb-4 ml-2 mt-2 bg-gray-100 p-4">
        <button
          onClick={() => {
            setActiveSection("createGiveaway");
            setSubmissionResult(null);
          }}
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
          onClick={() => {
            setActiveSection("currentGiveaways");
            setSubmissionResult(null);
          }}
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
          {/* Content based on active section */}
          {activeSection === "createGiveaway" && (
            <CreateGiveawayForm
              handleSubmit={handleSubmit}
              giveawayName={giveawayName}
              setGiveawayName={setGiveawayName}
              errorMessage={errorMessage}
              submissionResult={submissionResult}
              error={error}
              isSubmitting={isSubmitting}
            />
          )}
          {activeSection === "currentGiveaways" && <StateSection />}
        </>
      )}
    </div>
  );
}