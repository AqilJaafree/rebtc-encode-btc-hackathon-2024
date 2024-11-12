// src/components/NetworkSwitch.jsx
import { useState } from 'react';
import { NETWORK_CONFIGS } from '../constants/addresses';

export function NetworkSwitch({ currentNetwork, onSwitch }) {
  const [isOpen, setIsOpen] = useState(false);

  const switchNetwork = async (networkKey) => {
    const config = NETWORK_CONFIGS[networkKey];
    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: config.chainId,
          chainName: config.name,
          nativeCurrency: config.nativeCurrency,
          rpcUrls: [config.rpcUrl],
          blockExplorerUrls: [config.explorerUrl]
        }]
      });
      setIsOpen(false);
      if (onSwitch) onSwitch(networkKey);
    } catch (err) {
      console.error("Failed to switch network:", err);
    }
  };

  const getNetworkName = (chainId) => {
    for (const [key, value] of Object.entries(NETWORK_CONFIGS)) {
      if (value.decimalChainId === chainId) {
        return value.name;
      }
    }
    return "Unknown Network";
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center space-x-2"
      >
        <span>{getNetworkName(currentNetwork)}</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-12 right-0 w-48 bg-white rounded-lg shadow-lg py-2">
          <button
            onClick={() => switchNetwork('BOB_SEPOLIA')}
            className="w-full px-4 py-2 text-left hover:bg-gray-100"
          >
            BOB Sepolia
          </button>
          <button
            onClick={() => switchNetwork('ROOTSTOCK_TESTNET')}
            className="w-full px-4 py-2 text-left hover:bg-gray-100"
          >
            Rootstock Testnet
          </button>
        </div>
      )}
    </div>
  );
}