import { useState, useEffect, useRef } from 'react';

export default function WalletValidator() {
  const [input, setInput] = useState('');
  const [validationResults, setValidationResults] = useState([]);
  const [isValid, setIsValid] = useState(false);
  const [highlightedText, setHighlightedText] = useState('');
  const textareaRef = useRef(null);

  // Function to validate a single Ethereum address
  const isValidEthAddress = (address) => {
    // Check if it's a non-empty string and starts with '0x'
    if (!address || typeof address !== 'string' || !address.startsWith('0x')) {
      return false;
    }
    
    // Check if it has the correct length (42 characters = '0x' + 40 hex chars)
    if (address.length !== 42) {
      return false;
    }
    
    // Check if it contains only hex characters after '0x'
    const hexRegex = /^0x[0-9a-fA-F]{40}$/;
    return hexRegex.test(address);
  };

  // Create a highlighted version of the text with invalid addresses marked
  const createHighlightedText = (text, results) => {
    if (!text || !results.length) return '';
    
    let highlightedHTML = '';
    let lastIndex = 0;
    
    // Create a map of ranges for invalid addresses
    const addressPositions = [];
    let currentPosition = 0;
    
    text.split(',').forEach((addr, index) => {
      const trimmedAddr = addr.trim();
      const startPos = currentPosition + (addr.length - trimmedAddr.length);
      const endPos = startPos + trimmedAddr.length;
      
      if (!results[index]?.isValid) {
        addressPositions.push({ start: startPos, end: endPos });
      }
      
      currentPosition += addr.length + 1; // +1 for the comma
    });
    
    // Now build the highlighted text
    for (const { start, end } of addressPositions) {
      highlightedHTML += text.substring(lastIndex, start);
      highlightedHTML += `<span class="bg-red-200">${text.substring(start, end)}</span>`;
      lastIndex = end;
    }
    
    highlightedHTML += text.substring(lastIndex);
    return highlightedHTML;
  };

  // Validate addresses on every input change
  useEffect(() => {
    if (!input.trim()) {
      setValidationResults([]);
      setIsValid(false);
      setHighlightedText('');
      return;
    }

    const addresses = input.split(',').map(addr => addr.trim()).filter(addr => addr !== '');
    const results = addresses.map(addr => ({
      address: addr,
      isValid: isValidEthAddress(addr),
      errorMessage: !addr ? 'Empty address' : 
                    !addr.startsWith('0x') ? 'Must start with 0x' :
                    addr.length !== 42 ? 'Must be 42 characters' :
                    'Invalid characters'
    }));
    
    setValidationResults(results);
    setIsValid(results.length > 0 && results.every(result => result.isValid));
    
    // Create highlighted version of text
    const highlighted = createHighlightedText(input, results);
    setHighlightedText(highlighted);
  }, [input]);

  // Synchronize scrolling between the textarea and the highlight overlay
  const handleTextareaScroll = () => {
    if (textareaRef.current) {
      const highlightDiv = textareaRef.current.previousSibling;
      if (highlightDiv) {
        highlightDiv.scrollTop = textareaRef.current.scrollTop;
        highlightDiv.scrollLeft = textareaRef.current.scrollLeft;
      }
    }
  };

  // Format address for display (truncate middle)
  const formatAddress = (address) => {
    if (!address || address.length < 10) return address;
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: 'rgb(183, 140, 219)' }}>
          Ethereum Wallet Validator
        </h2>
        
        <div className="flex flex-col lg:flex-row gap-6 mb-6">
          {/* Left column - Text Area */}
          <div className="w-full lg:w-1/2">
            <div className="bg-white rounded-lg shadow-md p-4 h-full">
              <label className="block mb-3 font-medium" style={{ color: 'rgb(183, 140, 219)' }} htmlFor="wallet-address">
                Enter Ethereum wallet address(es)
              </label>
              
              <div className="relative h-64">
                {/* Highlighted overlay */}
                <div
                  className="absolute inset-0 overflow-auto whitespace-pre-wrap p-4 font-mono text-transparent pointer-events-none rounded-md"
                  dangerouslySetInnerHTML={{ __html: highlightedText }}
                  style={{
                    caretColor: 'transparent',
                    zIndex: 1
                  }}
                />
                
                {/* Actual textarea */}
                <textarea
                  ref={textareaRef}
                  id="wallet-address"
                  className="absolute inset-0 w-full h-full p-4 border-2 rounded-md font-mono resize-none"
                  style={{ 
                    backgroundColor: 'transparent',
                    caretColor: 'black',
                    borderColor: 'rgb(183, 140, 219)',
                    boxShadow: '0 0 10px rgba(183, 140, 219, 0.2)'
                  }}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onScroll={handleTextareaScroll}
                  placeholder="Enter wallet addresses separated by commas:&#10;&#10;0x71C7656EC7ab88b098defB751B7401B5f6d8976F,&#10;0x..."
                />
              </div>
              
              <div className="mt-2 text-sm text-gray-500">
                <p>Separate multiple addresses with commas</p>
              </div>
            </div>
          </div>
          
          {/* Right column - Validation Table */}
          <div className="w-full lg:w-1/2">
            <div className="bg-white rounded-lg shadow-md p-4 h-full">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium" style={{ color: 'rgb(183, 140, 219)' }}>
                  Validation Results
                </h3>
                {validationResults.length > 0 && (
                  <div className="px-3 py-1 rounded-full text-white text-xs font-medium" 
                      style={{ backgroundColor: isValid ? 'rgb(183, 140, 219)' : 'rgb(255, 221, 96)' }}>
                    {isValid ? 'All Valid' : `${validationResults.filter(r => !r.isValid).length} Invalid`}
                  </div>
                )}
              </div>
              
              <div className="overflow-hidden rounded-lg border" style={{ borderColor: 'rgb(183, 140, 219)' }}>
                <div className="h-64 overflow-y-auto">
                  {validationResults.length > 0 ? (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead style={{ backgroundColor: 'rgb(183, 140, 219)' }}>
                        <tr>
                          <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider w-8">
                            #
                          </th>
                          <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                            Address
                          </th>
                          <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider w-16">
                            Status
                          </th>
                          <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                            Issue
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {validationResults.map((result, index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                              {index + 1}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-5 w-5 rounded-full flex items-center justify-center mr-2" 
                                    style={{ backgroundColor: result.isValid ? 'rgb(183, 140, 219)' : 'rgb(255, 221, 96)' }}>
                                  <span className="text-white font-medium text-xs">
                                    {result.isValid ? '✓' : '✗'}
                                  </span>
                                </div>
                                <div className="font-mono text-xs" title={result.address}>
                                  {formatAddress(result.address)}
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full" 
                                    style={{ 
                                      backgroundColor: result.isValid ? 'rgba(183, 140, 219, 0.1)' : 'rgba(255, 221, 96, 0.1)',
                                      color: result.isValid ? 'rgb(183, 140, 219)' : 'rgb(255, 221, 96)'
                                    }}>
                                {result.isValid ? 'Valid' : 'Invalid'}
                              </span>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                              {!result.isValid && result.errorMessage}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400">
                      <p>Enter Ethereum wallet addresses to see validation results</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Transaction Button */}
        <div className="flex justify-center mt-8">
          <button
            disabled={!isValid}
            className={`px-10 py-3 text-white font-medium text-lg rounded-md shadow-md transition-all duration-300 ${
              isValid ? 'hover:shadow-lg' : 'opacity-50 cursor-not-allowed'
            }`}
            style={{ 
              backgroundColor: 'rgb(183, 140, 219)',
              boxShadow: isValid ? '0 4px 10px rgba(183, 140, 219, 0.4)' : 'none'
            }}
          >
            Do Transaction
          </button>
        </div>
      </div>
    </div>
  );
}