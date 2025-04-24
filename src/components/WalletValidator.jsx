"use client"
import { useState, useEffect, useRef } from "react"
import { useMultiGiveaway } from "@/context/MultiGiveawayContext"
import { useActiveGiveaway } from "@/context/ActiveGiveaway"

export default function EmailValidator() {
  const [input, setInput] = useState("")
  const [validationResults, setValidationResults] = useState([])
  const [isValid, setIsValid] = useState(false)
  const [highlightedText, setHighlightedText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionResult, setSubmissionResult] = useState(null)
  const textareaRef = useRef(null)
  
  // Get the active giveaway and functions from context
  const { batchAddParticipants, loading, error } = useMultiGiveaway()
  
  // Props for the active giveaway
  const { activeGiveaway } = useActiveGiveaway()

  // Maximum number of emails allowed
  const MAX_EMAILS = 10

  // Color scheme
  const colors = {
    primary: "#000", // Deeper indigo - more authoritative
    secondary: "#0891b2", // Cyan - complementary to indigo
    success: "rgb(234 179 8)", // Emerald - keep as is for success states
    error: "#dc2626", // Darker red - less harsh but still clear
    background: "#f8fafc", // Lighter background for better contrast
    card: "#ffffff", // White for cards
    text: "#0f172a", // Slate-900 - deeper text for better readability
    lightText: "#64748b", // Slate-500 - softer secondary text
    border: "#e2e8f0", // Subtle border color
    highlight: "rgb(255 221 96)", // Very light blue for highlights
  }

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

  // Synchronize scrolling between the textarea and the highlight overlay
  const handleTextareaScroll = () => {
    if (textareaRef.current) {
      const highlightDiv = textareaRef.current.previousSibling
      if (highlightDiv) {
        highlightDiv.scrollTop = textareaRef.current.scrollTop
        highlightDiv.scrollLeft = textareaRef.current.scrollLeft
      }
    }
  }

  // Format email for display (truncate middle if too long)
  const formatEmail = (email) => {
    if (!email || email.length < 25) return email
    const atIndex = email.indexOf("@")
    if (atIndex <= 0) return email

    const username = email.substring(0, atIndex)
    const domain = email.substring(atIndex)

    if (username.length > 10) {
      return `${username.substring(0, 8)}...${domain}`
    }

    return email
  }
  
  // Add users to giveaway
  const handleAddUsers = async () => {
    if (!isValid || !activeGiveaway) return
    
    setIsSubmitting(true)
    setSubmissionResult(null)
    
    try {
      // Extract valid emails
      const emails = validationResults
        .filter(result => result.isValid)
        .map(result => result.email)
      
      // Add participants to the active giveaway
      const success = await batchAddParticipants(
        Number(activeGiveaway.id), 
        emails
      )
      
      if (success) {
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
        setSubmissionResult({
          success: false,
          message: error || "Failed to add participants. Please try again."
        })
      }
    } catch (err) {
      setSubmissionResult({
        success: false,
        message: err.message || "An error occurred while adding participants."
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex items-center justify-center p-4" style={{ backgroundColor: colors.background }}>
      <div className="w-full max-w-6xl">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b" style={{ borderColor: colors.primary, backgroundColor: colors.primary }}>
            <h2 className="text-2xl font-bold text-center text-white">
              {activeGiveaway 
                ? `Add Participants to "${activeGiveaway.name}" Giveaway` 
                : "Select a Giveaway to Add Participants"}
            </h2>
          </div>

          <div className="p-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Left column - Text Area */}
              <div className="w-full lg:w-1/2">
                <div className="mb-4">
                  <label className="block mb-2 font-medium" style={{ color: colors.primary }} htmlFor="email-address">
                    Enter email address(es) - maximum {MAX_EMAILS} emails
                  </label>

                  <div className="relative h-64 border-2 rounded-lg" style={{ borderColor: colors.primary }}>
                    {/* Highlighted overlay */}
                    <div
                      className="absolute inset-0 overflow-auto whitespace-pre-wrap p-4 font-mono text-transparent pointer-events-none"
                      dangerouslySetInnerHTML={{ __html: highlightedText }}
                      style={{
                        caretColor: "transparent",
                        zIndex: 1,
                        overflowX: "hidden",
                      }}
                    />

                    {/* Actual textarea */}
                    <textarea
                      ref={textareaRef}
                      id="email-address"
                      className="absolute inset-0 w-full h-full p-4 font-mono resize-none bg-transparent"
                      style={{
                        caretColor: colors.text,
                        overflowX: "hidden",
                      }}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onScroll={handleTextareaScroll}
                      placeholder="Enter email addresses separated by commas:&#10;&#10;john.doe@example.com,&#10;jane.smith@company.org,&#10;..."
                      disabled={!activeGiveaway || isSubmitting}
                    />
                  </div>

                  <div className="mt-2 text-sm" style={{ color: colors.lightText }}>
                    <p>Separate multiple email addresses with commas. Maximum {MAX_EMAILS} emails allowed.</p>
                    {validationResults.length > MAX_EMAILS && (
                      <p className="text-red-500 font-medium mt-1">
                        Too many emails! Please limit to {MAX_EMAILS} emails per submission.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right column - Validation Table */}
              <div className="w-full lg:w-1/2">
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium" style={{ color: colors.primary }}>
                      Validation Results
                    </h3>
                    {validationResults.length > 0 && (
                      <div
                        className="px-3 py-1 rounded-full text-white text-xs font-medium"
                        style={{ 
                          backgroundColor: isValid ? colors.success : colors.secondary 
                        }}
                      >
                        {isValid ? "All Valid" : `${validationResults.filter((r) => !r.isValid).length} Invalid`}
                      </div>
                    )}
                  </div>

                  <div className="overflow-hidden rounded-lg border border-gray-200">
                    <div className="h-64 overflow-y-auto">
                      {validationResults.length > 0 ? (
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead>
                            <tr style={{ backgroundColor: colors.primary }}>
                              <th
                                scope="col"
                                className="px-3 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-8"
                              >
                                #
                              </th>
                              <th
                                scope="col"
                                className="px-3 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                              >
                                Email
                              </th>
                              <th
                                scope="col"
                                className="px-3 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-16"
                              >
                                Status
                              </th>
                              <th
                                scope="col"
                                className="px-3 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                              >
                                Issue
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {validationResults.slice(0, MAX_EMAILS).map((result, index) => (
                              <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {index + 1}
                                </td>
                                <td className="px-3 py-3 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div
                                      className="h-5 w-5 rounded-full flex items-center justify-center mr-2"
                                      style={{ backgroundColor: result.isValid ? colors.success : colors.error }}
                                    >
                                      <span className="text-white font-medium text-xs">
                                        {result.isValid ? "✓" : "✗"}
                                      </span>
                                    </div>
                                    <div className="font-mono text-xs" title={result.email}>
                                      {formatEmail(result.email)}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-3 py-3 whitespace-nowrap">
                                  <span
                                    className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                                    style={{
                                      backgroundColor: result.isValid
                                        ? "rgba(16, 185, 129, 0.1)"
                                        : "rgba(239, 68, 68, 0.1)",
                                      color: result.isValid ? colors.success : colors.error,
                                    }}
                                  >
                                    {result.isValid ? "Valid" : "Invalid"}
                                  </span>
                                </td>
                                <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-500">
                                  {!result.isValid && result.errorMessage}
                                </td>
                              </tr>
                            ))}
                            {validationResults.length > MAX_EMAILS && (
                              <tr className="bg-red-50">
                                <td colSpan="4" className="px-3 py-3 text-center text-xs text-red-500 font-medium">
                                  Only the first {MAX_EMAILS} emails will be processed. Please remove extra emails.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      ) : (
                        <div className="h-full flex items-center justify-center text-gray-400 p-6">
                          <p>{activeGiveaway ? "Enter email addresses to see validation results" : "Select a giveaway first"}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submission result message */}
            {submissionResult && (
              <div className={`my-4 p-4 rounded-lg ${submissionResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                {submissionResult.message}
              </div>
            )}

            {/* Add Users Button */}
            <div className="flex justify-center mt-8 mb-4">
              <button
                disabled={!isValid || !activeGiveaway || isSubmitting}
                className={`px-10 py-3 text-white font-medium text-lg rounded-lg shadow-md transition-all duration-300 ${
                  isValid && activeGiveaway && !isSubmitting ? "hover:shadow-lg hover:opacity-90 active:opacity-75 cursor-pointer" : "cursor-not-allowed"
                }`}
                style={{
                  backgroundColor: isValid && activeGiveaway && !isSubmitting ? "rgb(183 140 219)" : "#e2e8f0",
                  color: isValid && activeGiveaway && !isSubmitting ? "white" : colors.lightText,
                  opacity: isValid && activeGiveaway && !isSubmitting ? 1 : 0.5,
                  boxShadow: isValid && activeGiveaway && !isSubmitting ? "0 4px 10px rgba(183, 140, 219, 0.4)" : "none",
                }}
                onClick={handleAddUsers}
              >
                {isSubmitting ? "Adding..." : "Add Users to Giveaway"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}