"use client"
import { useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"

export default function EmailInputSection({ 
  input, 
  setInput, 
  highlightedText,
  activeGiveaway,
  isGiveawayActive, 
  isSubmitting,
  validationResults,
  colors,
  MAX_EMAILS
}) {
  const textareaRef = useRef(null)

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

  const inputBoxVariants = {
    hidden: { opacity: 0, scale: 0.98 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 25,
        delay: 0.3 
      }
    },
    hover: { 
      boxShadow: "0 0 20px rgba(183, 140, 219, 0.25)",
      borderColor: colors.secondary,
      transition: { duration: 0.2 }
    },
    disabled: {
      opacity: 0.7,
      scale: 0.98,
      transition: { duration: 0.3 }
    }
  }

  const iconVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 500, 
        damping: 20,
        delay: 0.2
      }
    }
  }

  const errorMsgVariants = {
    hidden: { opacity: 0, y: -10, height: 0 },
    visible: { 
      opacity: 1, 
      y: 0,
      height: "auto",
      transition: { 
        type: "spring", 
        stiffness: 500, 
        damping: 30 
      }
    }
  }

  return (
    <motion.div 
      className="w-full lg:w-1/2"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div 
        className="mb-4"
        variants={itemVariants}
      >
        <motion.label 
          className="block mb-2 font-medium" 
          style={{ color: colors.primary }} 
          htmlFor="email-address"
          variants={itemVariants}
        >
          <div className="flex items-center">
            <motion.svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 mr-2" 
              viewBox="0 0 20 20" 
              fill="currentColor"
              variants={iconVariants}
              initial="initial"
              animate="animate"
            >
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </motion.svg>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Enter email address(es) - maximum {MAX_EMAILS} emails
            </motion.span>
          </div>
        </motion.label>

        <motion.div 
          className="relative h-64 border-2 rounded-lg" 
          style={{ 
            borderColor: colors.primary,
            boxShadow: "0 0 15px rgba(183, 140, 219, 0.1)",
            background: "rgba(255, 255, 255, 0.7)"
          }}
          variants={inputBoxVariants}
          whileHover={!isSubmitting && activeGiveaway && isGiveawayActive ? "hover" : ""}
          animate={!activeGiveaway || !isGiveawayActive || isSubmitting ? "disabled" : "visible"}
        >
          {/* Input status indicator */}
          <motion.div
            className="absolute top-2 right-2 h-3 w-3 rounded-full"
            style={{ 
              backgroundColor: isSubmitting 
                ? colors.secondary
                : !activeGiveaway || !isGiveawayActive 
                  ? colors.error 
                  : input.length > 0 
                    ? colors.success 
                    : colors.primary 
            }}
            initial={{ scale: 0 }}
            animate={{ 
              scale: [0.8, 1.2, 1],
              backgroundColor: isSubmitting 
                ? colors.secondary
                : !activeGiveaway || !isGiveawayActive 
                  ? colors.error 
                  : input.length > 0 
                    ? colors.success 
                    : colors.primary
            }}
            transition={{ 
              scale: { duration: 0.5, ease: "easeOut" },
              backgroundColor: { duration: 0.3 }
            }}
          />

          {/* Highlighted overlay */}
          <motion.div
            className="absolute inset-0 text-[#000] overflow-auto whitespace-pre-wrap p-4 font-mono text-transparent pointer-events-none"
            dangerouslySetInnerHTML={{ __html: highlightedText }}
            style={{
              caretColor: "transparent",
              color:"#000",
              zIndex: 1,
              overflowX: "hidden",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
          />

          {/* Actual textarea */}
          <motion.textarea
            ref={textareaRef}
            id="email-address"
            className="absolute inset-0 w-full text-[#000] h-full p-4 font-mono resize-none bg-transparent"
            style={{
              caretColor: colors.text,
              overflowX: "hidden",
            }}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onScroll={handleTextareaScroll}
            placeholder="Enter email addresses separated by commas:&#10;&#10;john.doe@example.com,&#10;jane.smith@company.org,&#10;..."
            disabled={!activeGiveaway || !isGiveawayActive || isSubmitting}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
          />

          {/* Loading/submitting animation overlay */}
          <AnimatePresence>
            {isSubmitting && (
              <motion.div
                className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="w-12 h-12 border-4 rounded-full"
                  style={{ 
                    borderColor: `${colors.secondary} transparent ${colors.primary} transparent` 
                  }}
                  animate={{ 
                    rotate: 360 
                  }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity, 
                    ease: "linear" 
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Disabled overlay */}
          <AnimatePresence>
            {(!activeGiveaway || !isGiveawayActive) && !isSubmitting && (
              <motion.div
                className="absolute inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="bg-[#ff000052] rounded-lg px-4 py-2 shadow-md text-center max-w-xs"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  <motion.p
                    className="text-lg font-medium flex items-center"
                    style={{ color:"#000" }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                    {!activeGiveaway ? "Select a giveaway first" : "Giveaway is not active"}
                  </motion.p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div 
          className="mt-2 text-sm" 
          style={{ color: colors.lightText }}
          variants={itemVariants}
        >
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            Separate multiple email addresses with commas. Maximum {MAX_EMAILS} emails allowed.
          </motion.p>
          
          <AnimatePresence>
            {validationResults.length > MAX_EMAILS && (
              <motion.p 
                className="text-red-500 font-medium mt-1"
                variants={errorMsgVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                <motion.span
                  animate={{ 
                    scale: [1, 1.05, 1],
                  }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                  className="inline-block"
                >
                  Too many emails! Please limit to {MAX_EMAILS} emails per submission.
                </motion.span>
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}