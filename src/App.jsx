// src/App.jsx
import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { StakeForm } from './components/StakeForm';
import { RestakeForm } from './components/RestakeForm';
import { PositionView } from './components/PositionView';
import { NETWORK_CONFIGS } from './constants/addresses';

function App() {
  const [account, setAccount] = useState(null);
  const [network, setNetwork] = useState(null);

  useEffect(() => {
    checkConnection();
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', checkConnection);
      window.ethereum.on('chainChanged', () => window.location.reload());
    }
  }, []);

  const checkConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        setAccount(accounts[0] || null);
        setNetwork(parseInt(chainId, 16));
      } catch (err) {
        console.error("Connection check failed:", err);
      }
    }
  };

  const isSupportedNetwork = (chainId) => {
    return Object.values(NETWORK_CONFIGS).some(
      config => config.decimalChainId === chainId
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {!account ? (
          <div className="text-center py-4">
            Please connect your wallet to continue
          </div>
        ) : !isSupportedNetwork(network) ? (
          <div className="text-center py-4 bg-yellow-100 rounded-lg">
            Please switch to a supported network (BOB Sepolia or Rootstock Testnet)
          </div>
        ) : (
          <main className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <StakeForm />
              <RestakeForm />
            </div>
            <PositionView />
          </main>
        )}
      </div>
    </div>
  );
}

export default App;