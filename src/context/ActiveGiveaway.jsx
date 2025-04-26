'use client'
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useMultiGiveaway } from '@/context/MultiGiveawayContext';

// Create the context
const ActiveGiveawayContext = createContext();

export function ActiveGiveawayProvider({ children }) {
  const { giveaways, loadGiveaways, isConnected, getGiveawayDetails } = useMultiGiveaway();
  const [activeGiveaway, setActiveGiveaway] = useState(null);
  const [activeGiveawayId, setActiveGiveawayId] = useState(null);
  const [activeGiveawayDetails, setActiveGiveawayDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [allGiveaways, setAllGiveaways] = useState([]); // New state for all giveaways

  // Get active giveaways from the list of all giveaways
  const activeGiveaways = giveaways.filter(giveaway => giveaway.active && !giveaway.completed);

  // Load giveaways when connected
  useEffect(() => {
    if (isConnected) {
      loadGiveaways();
    }
  }, [isConnected, loadGiveaways]);

  // Set all giveaways when giveaways changes
  useEffect(() => {
    setAllGiveaways(giveaways);
  }, [giveaways]);

  // Set first active giveaway as default when activeGiveaways changes and no active giveaway is selected
  useEffect(() => {
    if (activeGiveaways.length > 0 && !activeGiveaway) {
      setActiveGiveaway(activeGiveaways[0]);
      setActiveGiveawayId(activeGiveaways[0].id);
    }
  }, [activeGiveaways, activeGiveaway]);

  // Change active giveaway
  const changeActiveGiveaway = (giveaway) => {
    setActiveGiveaway(giveaway);
    setActiveGiveawayId(giveaway.id);
    setActiveGiveawayDetails(null); // Reset details when changing giveaway
  };

  // Load active giveaway details
  const loadActiveGiveawayDetails = async () => {
    if (!activeGiveawayId) return;

    try {
      setLoading(true);
      const details = await getGiveawayDetails(activeGiveawayId);
      setActiveGiveawayDetails(details);
    } catch (error) {
      console.error("Error loading active giveaway details:", error);
    } finally {
      setLoading(false);
    }
  };

  // Clear active giveaway selection
  const clearActiveGiveaway = () => {
    setActiveGiveaway(null);
    setActiveGiveawayId(null);
    setActiveGiveawayDetails(null);
  };

  // Context value
  const contextValue = {
    activeGiveaways,
    allGiveaways, // Add all giveaways to the context value
    activeGiveaway,
    activeGiveawayId,
    activeGiveawayDetails,
    loading,
    changeActiveGiveaway,
    loadActiveGiveawayDetails,
    clearActiveGiveaway
  };

  return (
    <ActiveGiveawayContext.Provider value={contextValue}>
      {children}
    </ActiveGiveawayContext.Provider>
  );
}

// Hook to use the context
export function useActiveGiveaway() {
  const context = useContext(ActiveGiveawayContext);
  if (context === undefined) {
    throw new Error('useActiveGiveaway must be used within an ActiveGiveawayProvider');
  }
  return context;
}