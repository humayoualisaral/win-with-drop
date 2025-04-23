import { useState, useEffect } from 'react';

export function useContractEvents(contract) {
  const [events, setEvents] = useState({
    giveawayCreated: [],
    giveawayCompleted: [],
    participantAdded: [],
    winnerRequested: [],
    winnerSelected: []
  });

  useEffect(() => {
    if (!contract) return;

    // Set up event listeners
    const giveawayCreatedFilter = contract.filters.GiveawayCreated();
    const giveawayCompletedFilter = contract.filters.GiveawayCompleted();
    const participantAddedFilter = contract.filters.ParticipantAdded();
    const winnerRequestedFilter = contract.filters.WinnerRequested();
    const winnerSelectedFilter = contract.filters.WinnerSelected();

    // Handlers for each event type
    const handleGiveawayCreated = (giveawayId, name, event) => {
      setEvents(prev => ({
        ...prev,
        giveawayCreated: [...prev.giveawayCreated, { giveawayId, name, event }]
      }));
    };

    const handleGiveawayCompleted = (giveawayId, event) => {
      setEvents(prev => ({
        ...prev,
        giveawayCompleted: [...prev.giveawayCompleted, { giveawayId, event }]
      }));
    };

    const handleParticipantAdded = (giveawayId, email, index, event) => {
      setEvents(prev => ({
        ...prev,
        participantAdded: [...prev.participantAdded, { giveawayId, email, index, event }]
      }));
    };

    const handleWinnerRequested = (giveawayId, requestId, event) => {
      setEvents(prev => ({
        ...prev,
        winnerRequested: [...prev.winnerRequested, { giveawayId, requestId, event }]
      }));
    };

    const handleWinnerSelected = (giveawayId, winnerEmail, index, event) => {
      setEvents(prev => ({
        ...prev,
        winnerSelected: [...prev.winnerSelected, { giveawayId, winnerEmail, index, event }]
      }));
    };

    // Register event listeners
    contract.on(giveawayCreatedFilter, handleGiveawayCreated);
    contract.on(giveawayCompletedFilter, handleGiveawayCompleted);
    contract.on(participantAddedFilter, handleParticipantAdded);
    contract.on(winnerRequestedFilter, handleWinnerRequested);
    contract.on(winnerSelectedFilter, handleWinnerSelected);

    // Cleanup function to remove event listeners
    return () => {
      contract.off(giveawayCreatedFilter, handleGiveawayCreated);
      contract.off(giveawayCompletedFilter, handleGiveawayCompleted);
      contract.off(participantAddedFilter, handleParticipantAdded);
      contract.off(winnerRequestedFilter, handleWinnerRequested);
      contract.off(winnerSelectedFilter, handleWinnerSelected);
    };
  }, [contract]);

  return events;
}