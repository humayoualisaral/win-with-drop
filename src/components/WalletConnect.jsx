// components/WalletConnect/WalletConnect.jsx
"use client";
import { useMultiGiveaway } from "@/context/MultiGiveawayContext";
import { useState, useEffect } from "react";

export default function WalletConnect() {
  const { connectWallet, loading, isConnected, account, disconnect } =
    useMultiGiveaway();
  const [animateIn, setAnimateIn] = useState(false);
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(true);

  useEffect(() => {
    // Trigger animation after component mounts
    setAnimateIn(true);

    // Check if MetaMask is installed
    checkMetaMaskInstallation();
  }, []);

  const checkMetaMaskInstallation = () => {
    // Check if window is defined (for SSR)
    if (typeof window !== "undefined") {
      // Check if ethereum object exists and is MetaMask
      const isInstalled = window.ethereum && window.ethereum.isMetaMask;
      setIsMetaMaskInstalled(isInstalled);
    } else {
      setIsMetaMaskInstalled(false);
    }
  };

  const redirectToMetaMask = () => {
    // Open MetaMask installation page in a new tab
    window.open("https://metamask.io/download/", "_blank");
  };

  return (
    <div className="fixed inset-0 bg-[rgb(81,55,99)] bg-opacity-90 flex items-center justify-center backdrop-blur-sm transition-all duration-500">
      <div
        className={`bg-black border-2 border-[#FFDD60] rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 transform transition-all duration-700 ${
          animateIn ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        {/* Logo SVG */}
        <div className="flex justify-center mb-6">
          <svg
            className="w-52 h-20"
            viewBox="0 0 1239 454"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M156.462 63.9131C190.022 63.9131 219.349 70.7158 244.443 84.3212C269.84 97.9266 289.341 116.823 302.946 141.01C316.552 165.198 323.354 192.711 323.354 223.55C323.354 254.086 316.552 281.599 302.946 306.089C289.341 330.578 269.84 349.928 244.443 364.138C219.349 378.046 190.022 385 156.462 385H22.6756V63.9131H156.462ZM147.392 295.205C170.067 295.205 188.057 289.007 201.36 276.611C214.663 264.214 221.314 246.528 221.314 223.55C221.314 200.572 214.663 182.885 201.36 170.489C188.057 158.093 170.067 151.895 147.392 151.895H123.355V295.205H147.392ZM503.02 385L442.703 269.808H442.249V385H341.569V63.9131H491.228C517.23 63.9131 539.452 68.5994 557.895 77.972C576.338 87.0423 590.094 99.5894 599.164 115.614C608.537 131.335 613.223 149.173 613.223 169.128C613.223 190.594 607.177 209.642 595.083 226.271C583.292 242.899 566.209 254.842 543.836 262.098L613.677 385H503.02ZM442.249 202.688H482.158C491.833 202.688 499.089 200.572 503.927 196.339C508.764 191.804 511.183 184.85 511.183 175.477C511.183 167.012 508.613 160.36 503.473 155.523C498.636 150.685 491.531 148.266 482.158 148.266H442.249V202.688ZM783.709 388.175C753.474 388.175 725.659 381.07 700.262 366.859C675.168 352.649 655.213 332.997 640.399 307.903C625.584 282.809 618.177 254.54 618.177 223.096C618.177 191.652 625.584 163.384 640.399 138.289C655.213 113.195 675.168 93.6938 700.262 79.7861C725.659 65.576 753.474 58.471 783.709 58.471C813.943 58.471 841.607 65.576 866.701 79.7861C891.796 93.6938 911.599 113.195 926.112 138.289C940.926 163.384 948.334 191.652 948.334 223.096C948.334 254.54 940.926 282.809 926.112 307.903C911.599 332.997 891.645 352.649 866.248 366.859C841.154 381.07 813.64 388.175 783.709 388.175ZM783.709 294.297C803.663 294.297 819.083 287.948 829.967 275.25C840.851 262.249 846.293 244.865 846.293 223.096C846.293 201.025 840.851 183.64 829.967 170.942C819.083 157.941 803.663 151.441 783.709 151.441C763.452 151.441 747.881 157.941 736.997 170.942C726.113 183.64 720.67 201.025 720.67 223.096C720.67 244.865 726.113 262.249 736.997 275.25C747.881 287.948 763.452 294.297 783.709 294.297ZM1229.1 174.117C1229.1 194.374 1224.41 212.816 1215.04 229.445C1205.67 245.772 1191.76 258.772 1173.31 268.447C1155.17 278.122 1133.1 282.96 1107.1 282.96H1067.19V385H966.513V63.9131H1107.1C1146.41 63.9131 1176.49 73.8904 1197.35 93.845C1218.51 113.8 1229.1 140.557 1229.1 174.117ZM1095.76 203.595C1116.63 203.595 1127.06 193.769 1127.06 174.117C1127.06 154.464 1116.63 144.638 1095.76 144.638H1067.19V203.595H1095.76Z"
              fill="#FFDD60"
              className="animate-pulse"
            />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-center mb-6 text-white">
          Connect Your Wallet
        </h2>

        <div className="bg-[rgb(81,55,99)] rounded-lg p-4 mb-6">
          <p className="text-[#FFDD60] mb-2 text-center">
            {isMetaMaskInstalled
              ? "Please connect your wallet to access the application"
              : "MetaMask is required to use this application"}
          </p>
          <p className="text-white text-sm text-center opacity-80">
            {isMetaMaskInstalled
              ? "Connect securely to continue your experience"
              : "Install MetaMask to securely connect your wallet"}
          </p>
        </div>

        <div className="flex justify-center">
          {isMetaMaskInstalled ? (
            <button
              onClick={connectWallet}
              disabled={loading}
              className="bg-[#FFDD60] hover:bg-yellow-400 text-black font-bold py-3 px-6 rounded-lg transition-all duration-300 w-full max-w-xs flex items-center justify-center transform hover:scale-105 hover:shadow-glow relative overflow-hidden group"
            >
              <span className="absolute w-full h-full top-0 left-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-black"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Connecting...
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5 mr-2"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M19 7H5C3.89543 7 3 7.89543 3 9V18C3 19.1046 3.89543 20 5 20H19C20.1046 20 21 19.1046 21 18V9C21 7.89543 20.1046 7 19 7Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M16 11C16.5523 11 17 10.5523 17 10C17 9.44772 16.5523 9 16 9C15.4477 9 15 9.44772 15 10C15 10.5523 15.4477 11 16 11Z"
                      fill="currentColor"
                    />
                    <path
                      d="M8 7V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Connect Wallet
                </>
              )}
            </button>
          ) : (
            <button
              onClick={redirectToMetaMask}
              className="bg-[#FFDD60] hover:bg-yellow-400 text-black font-bold py-3 px-6 rounded-lg transition-all duration-300 w-full max-w-xs flex items-center justify-center transform hover:scale-105 hover:shadow-glow relative overflow-hidden group"
            >
              <span className="absolute w-full h-full top-0 left-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
              <svg
                className="w-10 h-10 mr-[10px]"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 142 137"
              >
                <path
                  fill="#FF5C16"
                  d="m132.24 131.751-30.481-9.076-22.986 13.741-16.038-.007-23-13.734-30.467 9.076L0 100.465l9.268-34.723L0 36.385 9.268 0l47.607 28.443h27.757L132.24 0l9.268 36.385-9.268 29.357 9.268 34.723-9.268 31.286Z"
                />
                <path
                  fill="#FF5C16"
                  d="m9.274 0 47.608 28.463-1.893 19.534L9.274 0Zm30.468 100.478 20.947 15.957-20.947 6.24v-22.197Zm19.273-26.381L54.989 48.01l-25.77 17.74-.014-.007v.013l.08 18.26 10.45-9.918h19.28ZM132.24 0 84.632 28.463l1.887 19.534L132.24 0Zm-30.467 100.478-20.948 15.957 20.948 6.24v-22.197Zm10.529-34.723h.007-.007v-.013l-.006.007-25.77-17.739L82.5 74.097h19.272l10.457 9.917.073-18.259Z"
                />
                <path
                  fill="#E34807"
                  d="m39.735 122.675-30.467 9.076L0 100.478h39.735v22.197ZM59.008 74.09l5.82 37.714-8.066-20.97-27.49-6.82 10.456-9.923h19.28Zm42.764 48.585 30.468 9.076 9.268-31.273h-39.736v22.197ZM82.5 74.09l-5.82 37.714 8.065-20.97 27.491-6.82-10.463-9.923H82.5Z"
                />
                <path
                  fill="#FF8D5D"
                  d="m0 100.465 9.268-34.723h19.93l.073 18.266 27.492 6.82 8.065 20.969-4.146 4.618-20.947-15.957H0v.007Zm141.508 0-9.268-34.723h-19.931l-.073 18.266-27.49 6.82-8.066 20.969 4.145 4.618 20.948-15.957h39.735v.007ZM84.632 28.443H56.875L54.99 47.977l9.839 63.8H76.68l9.845-63.8-1.893-19.534Z"
                />
                <path
                  fill="#661800"
                  d="M9.268 0 0 36.385l9.268 29.357h19.93l25.784-17.745L9.268 0Zm43.98 81.665h-9.029l-4.916 4.819 17.466 4.33-3.521-9.155v.006ZM132.24 0l9.268 36.385-9.268 29.357h-19.931L86.526 47.997 132.24 0ZM88.273 81.665h9.042l4.916 4.825-17.486 4.338 3.528-9.17v.007Zm-9.507 42.305 2.06-7.542-4.146-4.618H64.82l-4.145 4.618 2.059 7.542"
                />
                <path
                  fill="#C0C4CD"
                  d="M78.766 123.969v12.453H62.735v-12.453h16.03Z"
                />
                <path
                  fill="#E7EBF6"
                  d="m39.742 122.662 23.006 13.754v-12.453l-2.06-7.541-20.946 6.24Zm62.031 0-23.007 13.754v-12.453l2.06-7.541 20.947 6.24Z"
                />
              </svg>
              Install MetaMask
            </button>
          )}
        </div>

        {/* <div className="mt-6 text-xs text-center text-white opacity-70">
          By connecting, you agree to our <a href="#" className="text-[#FFDD60] hover:underline">Terms of Service</a>
        </div> */}
      </div>
    </div>
  );
}
