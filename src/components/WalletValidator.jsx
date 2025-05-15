"use client"
import { useState, useEffect } from "react"
import { useMultiGiveaway } from "@/context/MultiGiveawayContext"
import { useActiveGiveaway } from "@/context/ActiveGiveaway"
import { useTransaction } from "@/context/TransactionContext"
import EmailInputSection from "./EmailInputSection"
import ValidationResultsSection from "./ValidationResultsSection"

// Maximum number of emails allowed
const MAX_EMAILS = 10

// Updated color scheme to match the purple grid background
const colors = {
  primary: "#513763", // Deep purple that matches the background theme
  secondary: "#8E4FC3", // Lighter purple for secondary elements
  success: "#EAAE08", // Gold color for success states
  error: "#dc2626", // Red for errors
  background: "rgba(183, 140, 219, 0.1)", // Very light purple bg
  card: "#ffffff", // White for cards
  text: "#2D1B36", // Deep purple text
  lightText: "#64748b", // Slate-500 - softer secondary text
  border: "#B78CDB", // Light purple border
  highlight: "rgba(234, 174, 8, 0.18)", // Light gold for highlights
  tableHeaderBg: "#513763", // Dark purple for table headers
  tableStripeBg: "rgba(183, 140, 219, 0.05)", // Very light purple for table striping
  buttonGradient: "linear-gradient(135deg, rgb(234 179 8) 0%, #8E4FC3 100%)", // Purple gradient for buttons
  cardBoxShadow: "0 8px 30px rgba(183, 140, 219, 0.2)" // Soft purple shadow
}

export default function EmailValidator() {
  const [input, setInput] = useState("")
  const [validationResults, setValidationResults] = useState([])
  const [isValid, setIsValid] = useState(false)
  const [highlightedText, setHighlightedText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionResult, setSubmissionResult] = useState(null)
  
  // Get transaction functions from context
  const { startTransaction, completeTransaction, failTransaction } = useTransaction()
  
  // Get the active giveaway and functions from context
  const { batchAddParticipants, loading, error } = useMultiGiveaway()
  
  // Props for the active giveaway
  const { activeGiveaway } = useActiveGiveaway()

  // Function to validate a single email address
  const isValidEmail = (email) => {
    if (!email || typeof email !== "string") {
      return false
    }

    // Basic email regex pattern
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return emailRegex.test(email)
  }

  // Create a highlighted version of the text with invalid emails marked
  const createHighlightedText = (text, results) => {
    if (!text || !results.length) return ""

    let highlightedHTML = ""
    let lastIndex = 0

    // Create a map of ranges for invalid emails
    const emailPositions = []
    let currentPosition = 0

    text.split(",").forEach((email, index) => {
      const trimmedEmail = email.trim()
      const startPos = currentPosition + (email.length - trimmedEmail.length)
      const endPos = startPos + trimmedEmail.length

      if (!results[index]?.isValid) {
        emailPositions.push({ start: startPos, end: endPos })
      }

      currentPosition += email.length + 1 // +1 for the comma
    })

    // Now build the highlighted text
    for (const { start, end } of emailPositions) {
      highlightedHTML += text.substring(lastIndex, start)
      highlightedHTML += `<span class="bg-red-200">${text.substring(start, end)}</span>`
      lastIndex = end
    }

    highlightedHTML += text.substring(lastIndex)
    return highlightedHTML
  }

  // Validate emails on every input change
  useEffect(() => {
    if (!input.trim()) {
      setValidationResults([])
      setIsValid(false)
      setHighlightedText("")
      return
    }

    const emails = input
      .split(",")
      .map((email) => email.trim())
      .filter((email) => email !== "")
    
    // Check if we exceed the maximum number of emails
    const tooManyEmails = emails.length > MAX_EMAILS
    
    const results = emails.map((email) => ({
      email: email,
      isValid: isValidEmail(email),
      errorMessage: !email
        ? "Empty email"
        : !email.includes("@")
          ? "Missing @ symbol"
          : !email.includes(".")
            ? "Missing domain"
            : "Invalid email format",
    }))

    setValidationResults(results)
    setIsValid(
      results.length > 0 && 
      results.every((result) => result.isValid) && 
      !tooManyEmails
    )

    // Create highlighted version of text
    const highlighted = createHighlightedText(input, results)
    setHighlightedText(highlighted)
  }, [input])
  
  // Check if the giveaway is active
  const isGiveawayActive = activeGiveaway && activeGiveaway.active === true
  
  // Add users to giveaway
  const handleAddUsers = async () => {
    if (!isValid || !activeGiveaway || !isGiveawayActive) return
    
    setIsSubmitting(true)
    setSubmissionResult(null)
    
    // Start transaction with function name
    startTransaction("batchAddParticipants")
    
    try {
      // Extract valid emails
      const emails = validationResults
        .filter(result => result.isValid)
        .map(result => result.email)
      
      const result = await batchAddParticipants(
        Number(activeGiveaway.id), 
        emails
      )
      
      // Fixed code - properly check the result type
      if (result && typeof result === 'string') {
        // Update transaction to success state with transaction id
        completeTransaction(result)
        
        // Also update the UI state
        setSubmissionResult({
          success: true,
          message: `Successfully added ${emails.length} participant${emails.length > 1 ? 's' : ''} to the giveaway!`
        })
        
        // Clear input after successful submission
        setInput("")
        setValidationResults([])
        setIsValid(false)
        setHighlightedText("")
      } else {
        // Handle transaction error
        failTransaction(error || "Failed to add participants. Please try again.")
        
        setSubmissionResult({
          success: false,
          message: error || "Failed to add participants. Please try again."
        })
      }
    } catch (err) {
      // Handle exception
      failTransaction(err.message || "An error occurred while adding participants.")
      
      setSubmissionResult({
        success: false,
        message: err.message || "An error occurred while adding participants."
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex items-center justify-center p-4 mt-6">
      <div className="w-full max-w-6xl">
        <div className="bg-white rounded-xl overflow-hidden backdrop-blur-sm bg-opacity-90" style={{ boxShadow: colors.cardBoxShadow }}>
          {/* Header with gradient background */}
          <div className="p-6 border-b relative overflow-hidden" style={{ 
            background: colors.buttonGradient,
            borderColor: colors.border 
          }}>
            {/* Decorative elements */}
            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white opacity-10"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-white opacity-5"></div>
            
            <h2 className="text-2xl font-bold text-center text-white relative z-10 capitalize">
              {activeGiveaway 
                ? `Add Participants to ${activeGiveaway.name}` 
                : "Select a Giveaway to Add Participants"}
            </h2>
          </div>

          <div className="p-6">      
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Left column - Text Area */}
              <EmailInputSection 
                input={input}
                setInput={setInput}
                highlightedText={highlightedText}
                activeGiveaway={activeGiveaway}
                isGiveawayActive={isGiveawayActive}
                isSubmitting={isSubmitting}
                validationResults={validationResults}
                colors={colors}
                MAX_EMAILS={MAX_EMAILS}
              />

              {/* Right column - Validation Table */}
              <ValidationResultsSection 
                validationResults={validationResults}
                activeGiveaway={activeGiveaway}
                isGiveawayActive={isGiveawayActive}
                colors={colors}
                MAX_EMAILS={MAX_EMAILS}
              />
            </div>

            {/* Submission result message */}
            {submissionResult && (
              <div 
                className={`my-4 p-4 rounded-lg flex items-center ${
                  submissionResult.success ? 'bg-green-50 text-green-800 border border-green-200' : 
                  'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                <div className={`rounded-full p-1 mr-3 ${
                  submissionResult.success ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {submissionResult.success ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                {submissionResult.message}
              </div>
            )}

            {/* Add Users Button */}
            <div className="flex justify-center mt-8 mb-4">
              <button
                disabled={!isValid || !activeGiveaway || !isGiveawayActive || isSubmitting}
                className={`px-10 py-3 text-white font-medium text-lg rounded-lg shadow-md transition-all duration-300 flex items-center ${
                  isValid && activeGiveaway && isGiveawayActive && !isSubmitting ? "hover:shadow-lg hover:opacity-90 active:opacity-75 cursor-pointer" : "cursor-not-allowed"
                }`}
                style={{
                  background: isValid && activeGiveaway && isGiveawayActive && !isSubmitting ? colors.buttonGradient : "#e2e8f0",
                  color: isValid && activeGiveaway && isGiveawayActive && !isSubmitting ? "white" : colors.lightText,
                  opacity: isValid && activeGiveaway && isGiveawayActive && !isSubmitting ? 1 : 0.5,
                  boxShadow: isValid && activeGiveaway && isGiveawayActive && !isSubmitting ? "0 4px 15px rgba(81, 55, 99, 0.4)" : "none",
                }}
                onClick={handleAddUsers}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                    </svg>
                    Add Users to Giveaway
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}