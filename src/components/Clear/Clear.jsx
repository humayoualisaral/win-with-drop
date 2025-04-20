// components/ClearDataPopup.jsx
import { useState, useEffect } from 'react';

export default function ClearDataPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [animation, setAnimation] = useState('');

  // Reset animation state when popup closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setShowSuccess(false);
      }, 300);
    }
  }, [isOpen]);

  const openPopup = () => {
    setAnimation('animate-in');
    setIsOpen(true);
  };

  const closePopup = () => {
    setAnimation('animate-out');
    setTimeout(() => {
      setIsOpen(false);
    }, 300);
  };

  const handleClearData = () => {
    try {
      setIsClearing(true);
      
      // Clear localStorage
      localStorage.clear();
      
      // Clear cache using Cache API (if supported)
      if ('caches' in window) {
        caches.keys().then(cacheNames => {
          cacheNames.forEach(cacheName => {
            caches.delete(cacheName);
          });
        });
      }
      
      // Show success state briefly before reload
      setIsClearing(false);
      setShowSuccess(true);
      
      // Delay reload to show success message
      setTimeout(() => {
        window.location.reload(true);
      }, 1500);
    } catch (error) {
      console.error('Error clearing data:', error);
      setIsClearing(false);
    }
  };

  return (
    <>
      <button
        onClick={openPopup}
        className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Clear Browser Data
      </button>

      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* Backdrop */}
          <div 
            className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 ${animation === 'animate-in' ? 'opacity-100' : 'opacity-0'}`}
            onClick={closePopup}
          />

          {/* Popup */}
          <div 
            className={`bg-white rounded-lg shadow-xl max-w-md w-full mx-4 z-10 overflow-hidden transform transition-all duration-300 ${
              animation === 'animate-in' ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-medium text-white">Clear Browser Data</h3>
                <button
                  onClick={closePopup}
                  className="text-white hover:text-gray-200 focus:outline-none"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-4">
              {showSuccess ? (
                <div className="text-center py-8">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                    <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="mt-3 text-lg font-medium text-gray-900">Data cleared successfully!</h3>
                  <p className="mt-2 text-sm text-gray-500">Reloading page...</p>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <div className="flex items-center mb-3">
                      <div className="bg-blue-100 rounded-full p-2 mr-3">
                        <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="font-medium text-gray-900">You're about to clear your browser data</p>
                    </div>
                    <p className="text-gray-500 text-sm ml-10">This will clear all local storage and browser cache for this website, then reload the page.</p>
                  </div>
                  
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                          You may need to log in again after this action.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            {!showSuccess && (
              <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
                <button
                  onClick={closePopup}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearData}
                  disabled={isClearing}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 flex items-center"
                >
                  {isClearing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    'Clear & Reload'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}