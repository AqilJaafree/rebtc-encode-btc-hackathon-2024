// src/components/Navbar.jsx
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { NetworkSwitch } from './NetworkSwitch';
import { NETWORK_CONFIGS } from '../constants/addresses';

export function Navbar() {
  const [account, setAccount] = useState(null);
  const [network, setNetwork] = useState(null);
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    checkConnection();
    if (window.ethereum) {
      window.ethereum.on('chainChanged', () => window.location.reload());
      window.ethereum.on('accountsChanged', checkConnection);
    }
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('chainChanged', () => window.location.reload());
        window.ethereum.removeListener('accountsChanged', checkConnection);
      }
    };
  }, []);

  const checkConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          const address = accounts[0];
          setAccount(address);
          const balance = await provider.getBalance(address);
          setBalance(ethers.utils.formatEther(balance));
          const network = await provider.getNetwork();
          setNetwork(network);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        checkConnection();
      } else {
        alert('Please install MetaMask!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getCurrencySymbol = () => {
    const chainId = network?.chainId;
    for (const config of Object.values(NETWORK_CONFIGS)) {
      if (config.decimalChainId === chainId) {
        return config.nativeCurrency.symbol;
      }
    }
    return 'ETH';
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-xl font-bold text-blue-600">L2 Staking</span>
          </div>
          
          <div className="flex items-center space-x-4">
            {account && (
              <NetworkSwitch 
                currentNetwork={network?.chainId} 
                onSwitch={checkConnection}
              />
            )}
            
            {account ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {balance && `${parseFloat(balance).toFixed(4)} ${getCurrencySymbol()}`}
                </span>
                <span className="px-4 py-2 bg-gray-100 rounded-full text-sm">
                  {`${account.slice(0, 6)}...${account.slice(-4)}`}
                </span>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}