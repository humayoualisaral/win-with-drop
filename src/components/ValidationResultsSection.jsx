"use client"
import { motion, AnimatePresence } from "framer-motion"

export default function ValidationResultsSection({
  validationResults,
  activeGiveaway,
  isGiveawayActive,
  colors,
  MAX_EMAILS
}) {
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

  // Check if all emails are valid
  const isValid = validationResults.length > 0 && 
    validationResults.every((r) => r.isValid) && 
    validationResults.length <= MAX_EMAILS

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  }

  const tableHeaderVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.3 }
    }
  }

  const emptyStateVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        type: "spring", 
        stiffness: 500, 
        damping: 30, 
        delay: 0.2 
      }
    }
  }

  // Badge animation
  const badgeVariants = {
    initial: { scale: 0 },
    animate: { 
      scale: 1, 
      transition: { 
        type: "spring", 
        stiffness: 500, 
        damping: 25 
      }
    }
  }

  return (
    <motion.div 
      className="w-full lg:w-1/2"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      transition={{ delay: 0.2 }}
    >
      <div className="mb-4">
        <div className="flex justify-between items-center mb-3">
          <motion.h3 
            className="font-medium flex items-center" 
            style={{ color: colors.primary }}
            variants={itemVariants}
          >
            <motion.svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 mr-2" 
              viewBox="0 0 20 20" 
              fill="currentColor"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 1, delay: 0.5, ease: "easeInOut" }}
            >
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </motion.svg>
            Validation Results
          </motion.h3>
          <AnimatePresence>
            {validationResults.length > 0 && (
              <motion.div
                className="px-3 py-1 rounded-full text-white text-xs font-medium"
                style={{ 
                  backgroundColor: isValid ? colors.success : colors.secondary 
                }}
                variants={badgeVariants}
                initial="initial"
                animate="animate"
              >
                {isValid ? "All Valid" : `${validationResults.filter((r) => !r.isValid).length} Invalid`}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.div 
          className="overflow-hidden rounded-lg border" 
          style={{ 
            borderColor: colors.border,
            boxShadow: "0 0 15px rgba(183, 140, 219, 0.1)"
          }}
          variants={itemVariants}
          whileHover={{ boxShadow: "0 0 20px rgba(183, 140, 219, 0.2)" }}
        >
          <div className="h-64 overflow-y-auto" style={{ background: "rgba(255, 255, 255, 0.7)" }}>
            <AnimatePresence mode="wait">
              {validationResults.length > 0 ? (
                <motion.table 
                  className="min-w-full divide-y" 
                  style={{ borderColor: colors.border }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <thead>
                    <tr style={{ background: colors.tableHeaderBg }}>
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
                  <motion.tbody className="divide-y" style={{ borderColor: colors.border }}>
                    <AnimatePresence>
                      {validationResults.slice(0, MAX_EMAILS).map((result, index) => (
                        <motion.tr 
                          key={index} 
                          style={{ 
                            backgroundColor: index % 2 === 0 ? "#ffffff" : colors.tableStripeBg
                          }}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ 
                            duration: 0.3, 
                            delay: index * 0.05,
                          }}
                          whileHover={{ 
                            backgroundColor: result.isValid 
                              ? "rgba(234, 174, 8, 0.05)" 
                              : "rgba(239, 68, 68, 0.05)",
                            transition: { duration: 0.2 }
                          }}
                        >
                          <td className="px-3 py-3 whitespace-nowrap text-sm font-medium" style={{ color: colors.text }}>
                            {index + 1}
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap">
                            <div className="flex items-center">
                              <motion.div
                                className="h-5 w-5 rounded-full flex items-center justify-center mr-2"
                                style={{ backgroundColor: result.isValid ? colors.success : colors.error }}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ 
                                  type: "spring", 
                                  stiffness: 700, 
                                  damping: 20,
                                  delay: 0.3 + (index * 0.05)
                                }}
                              >
                                <span className="text-white font-medium text-xs">
                                  {result.isValid ? "✓" : "✗"}
                                </span>
                              </motion.div>
                              <div className="font-mono text-xs" title={result.email} style={{ color: colors.text }}>
                                {formatEmail(result.email)}
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap">
                            <motion.span
                              className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                              style={{
                                backgroundColor: result.isValid
                                  ? "rgba(234, 174, 8, 0.1)"
                                  : "rgba(239, 68, 68, 0.1)",
                                color: result.isValid ? colors.success : colors.error,
                              }}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.4 + (index * 0.05) }}
                            >
                              {result.isValid ? "Valid" : "Invalid"}
                            </motion.span>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-500">
                            {!result.isValid && (
                              <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 + (index * 0.05) }}
                              >
                                {result.errorMessage}
                              </motion.span>
                            )}
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                    <AnimatePresence>
                      {validationResults.length > MAX_EMAILS && (
                        <motion.tr 
                          className="bg-red-50"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3, delay: 0.2 }}
                        >
                          <td colSpan="4" className="px-3 py-3 text-center text-xs text-red-500 font-medium">
                            <motion.div
                              animate={{ 
                                scale: [1, 1.05, 1],
                              }}
                              transition={{ 
                                duration: 1.5, 
                                repeat: Infinity,
                                repeatType: "reverse"
                              }}
                            >
                              Only the first {MAX_EMAILS} emails will be processed. Please remove extra emails.
                            </motion.div>
                          </td>
                        </motion.tr>
                      )}
                    </AnimatePresence>
                  </motion.tbody>
                </motion.table>
              ) : (
                <motion.div 
                  className="h-full flex flex-col items-center justify-center text-gray-400 p-6"
                  variants={emptyStateVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-12 w-12 mb-2 opacity-50" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ 
                      y: 0, 
                      opacity: 0.5,
                      transition: { delay: 0.3, duration: 0.5 }
                    }}
                  >
                    <motion.path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={1} 
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ delay: 0.5, duration: 1.5, ease: "easeInOut" }}
                    />
                  </motion.svg>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                  >
                    {!activeGiveaway 
                      ? "Select a giveaway first" 
                      : !isGiveawayActive
                        ? "Giveaway is not active" 
                        : "Enter email addresses to see validation results"}
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}