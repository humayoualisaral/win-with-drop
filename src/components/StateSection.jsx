'use client';

import { useState, useEffect } from 'react';
import { useMultiGiveaway } from '@/context/MultiGiveawayContext';
import { useActiveGiveaway } from '@/context/ActiveGiveaway';
import { useTransaction } from '@/context/TransactionContext';

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
  disabled: "#cbd5e1", // Light gray for disabled state
};

export default function StatsSection() {
  const { drawWinner, loading: contractLoading, error: contractError } = useMultiGiveaway();
  const { activeGiveaways, loading: giveawaysLoading } = useActiveGiveaway();
  // Get transaction functions from context
  const { startTransaction, completeTransaction, failTransaction } = useTransaction();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [isDrawingWinner, setIsDrawingWinner] = useState(false);
  const [drawingId, setDrawingId] = useState(null);
  const [submissionResult, setSubmissionResult] = useState(null);
  const itemsPerPage = 5;
  
  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentGiveaways = activeGiveaways.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(activeGiveaways.length / itemsPerPage);
  
  // Reset to first page when activeGiveaways changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeGiveaways.length]);

  const handleDrawWinner = async (giveawayId) => {
    setIsDrawingWinner(true);
    setDrawingId(giveawayId);
    setSubmissionResult(null);
    
    // Start transaction with function name
    startTransaction("drawWinner");
    
    try {
      const result = await drawWinner(giveawayId);
      
      // Check the result
      if (result && typeof result === 'string') {
        // Update transaction to success state with transaction id
        completeTransaction(result);
        
        // Update UI state
        setSubmissionResult({
          success: true,
          message: `Successfully drew a winner for giveaway #${giveawayId}!`
        });
      } else {
        // Handle transaction error
        failTransaction(contractError || "Failed to draw winner. Please try again.");
        
        setSubmissionResult({
          success: false,
          message: contractError || "Failed to draw winner. Please try again."
        });
      }
    } catch (err) {
      // Handle exception
      failTransaction(err.message || "An error occurred while drawing a winner.");
      
      setSubmissionResult({
        success: false,
        message: err.message || "An error occurred while drawing a winner."
      });
    } finally {
      setIsDrawingWinner(false);
      setDrawingId(null);
    }
  };

  // Pagination controls
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Check if drawing is possible (needs more than 1 participant)
  const canDrawWinner = (giveaway) => {
    return giveaway.totalParticipants > 1;
  };

  // Loading state
  const isLoading = giveawaysLoading || contractLoading;

  return (
    <section
      className="w-full px-6 py-10"
      style={{ color: colors.text }}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <h2 className="text-3xl font-bold text-center mb-6">Active Giveaways</h2>

        {isLoading && <p className="text-center py-4">Loading giveaways...</p>}
        
        {contractError && !submissionResult && (
          <div className="p-4 rounded-lg bg-red-100 text-red-700 border border-red-300">
            {contractError}
          </div>
        )}

        {/* Submission result message */}
        {submissionResult && (
          <div className={`my-4 p-4 rounded-lg ${submissionResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {submissionResult.message}
          </div>
        )}

        {!isLoading && activeGiveaways.length === 0 && (
          <p className="text-center py-8">No active giveaways found.</p>
        )}

        {!isLoading && activeGiveaways.length > 0 && (
          <>
            {currentGiveaways.map((giveaway) => (
              <div
                key={giveaway.id.toString()}
                className="flex items-center justify-between p-4 rounded-lg shadow-md"
                style={{
                  backgroundColor: colors.card,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <div>
                  <h3 className="font-semibold text-lg">{giveaway.name}</h3>
                  <p className="text-sm mt-1" style={{ color: colors.secondary, fontWeight: 'bold' }}>
                    {giveaway.totalParticipants} participant{giveaway.totalParticipants !== 1 ? 's' : ''}
                  </p>
                </div>

                <button
                  onClick={() => handleDrawWinner(giveaway.id)}
                  disabled={isDrawingWinner || !canDrawWinner(giveaway)}
                  className="px-4 py-2 text-white rounded-md font-semibold transition-colors"
                  style={{ 
                    backgroundColor: 
                      isDrawingWinner && drawingId === giveaway.id ? colors.lightText :
                      !canDrawWinner(giveaway) ? colors.disabled : 
                      colors.success,
                    cursor: isDrawingWinner || !canDrawWinner(giveaway) ? 'not-allowed' : 'pointer'
                  }}
                  title={!canDrawWinner(giveaway) ? "Need at least 2 participants to draw a winner" : ""}
                >
                  {isDrawingWinner && drawingId === giveaway.id ? 'Drawing...' : 'Draw Winner'}
                </button>
              </div>
            ))}

            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-4 mt-6">
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded"
                  style={{
                    backgroundColor: currentPage === 1 ? colors.border : colors.secondary,
                    color: currentPage === 1 ? colors.lightText : 'white',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                  }}
                >
                  Previous
                </button>
                
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded"
                  style={{
                    backgroundColor: currentPage === totalPages ? colors.border : colors.secondary,
                    color: currentPage === totalPages ? colors.lightText : 'white',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}