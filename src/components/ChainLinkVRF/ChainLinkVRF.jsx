'use client';

import React, { useState, useEffect } from 'react';
import StatCards from '../StatCards';
import { useMultiGiveaway } from '@/context/MultiGiveawayContext';
import { Copy, CheckCircle, ArrowRight } from 'lucide-react';

const ChainLinkVRF = () => {
    const { getChainlinkConfig, loading } = useMultiGiveaway();
    const [config, setConfig] = useState(null);
    const [copied, setCopied] = useState({
        coordinator: false,
        hash: false,
        subId: false
    });

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const chainlinkConfig = await getChainlinkConfig();
                if (chainlinkConfig) {
                    setConfig(chainlinkConfig);
                }
            } catch (error) {
                console.error("Error fetching Chainlink config:", error);
            }
        };

        fetchConfig();
    }, [getChainlinkConfig]);

    const copyToClipboard = async (text, field) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied({ ...copied, [field]: true });
            setTimeout(() => {
                setCopied({ ...copied, [field]: false });
            }, 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    // Function to truncate address or long string
    const truncateString = (str) => {
        if (!str) return '';
        return `${str.substring(0, 6)}...${str.substring(str.length - 4)}`;
    };

    // Create copyable value display component
    const CopyableValue = ({ value, field }) => (
        <div className="flex items-center">
            <span className="font-mono">{truncateString(value)}</span>
            <button 
                className="p-1 ml-2 hover:bg-gray-100 rounded"
                onClick={() => copyToClipboard(value, field)}
                title={`Copy full ${field}`}
            >
                {copied[field] ? 
                    <CheckCircle size={16} className="text-green-500" /> : 
                    <Copy size={16} />
                }
            </button>
        </div>
    );

    // Prepare stats based on config data
    const stats = config ? [
        { 
            title: "VRF Coordinator", 
            value: <CopyableValue value={config.coordinator} field="coordinator" />,
            description: "Contract address"
        },
        { 
            title: "Subscription ID", 
            value: <CopyableValue value={config.subId} field="subId" />,
            description: "VRF subscription ID"
        },
        { 
            title: "Key Hash", 
            value: <CopyableValue value={config.hash} field="hash" />,
            description: "Randomness key hash"
        },
        { 
            title: "Gas Limit", 
            value: config.gasLimit,
            description: "Callback gas limit"
        },
        { 
            title: "Confirmations", 
            value: config.confirmations,
            description: "Block confirmations"
        }
    ] : [];

    return (
        <div className="w-full pt-[30px]">
            <h2 className="text-2xl font-semibold mb-4">Chainlink VRF Configuration</h2>
            {loading ? (
                <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : config ? (
                <div className="flex flex-col space-y-4">
                    <StatCards stats={stats} />
                    <div className="button flex justify-center pt-[30px]">
                        <a href="https://vrf.chain.link/" target='_blank'>
                        <button className='flex gap-[10px] bg-[#0891b2] p-[20px] rounded text-[#fff] text-bold'>Go To Chanlink Dashboard <ArrowRight/> </button>
                        </a>
                    </div>
                </div>
            ) : (
                <div className="bg-yellow-50 p-4 rounded-md">
                    <p className="text-yellow-700">
                        Unable to load Chainlink VRF configuration. Please make sure your wallet is connected and you're on the correct network.
                    </p>
                </div>
            )}
        </div>
    );
};

export default ChainLinkVRF;