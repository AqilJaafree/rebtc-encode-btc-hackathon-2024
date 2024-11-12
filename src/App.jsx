// src/App.jsx
import { useState, useEffect } from 'react';
import { StakeForm } from './components/StakeForm';
import { RestakeForm } from './components/RestakeForm';
import { PositionView } from './components/PositionView';

function App() {
  const [account, setAccount] = useState(null);

  useEffect(() => {
    checkConnection();
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', checkConnection);
      window.ethereum.on('chainChanged', () => window.location.reload());
    }
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', checkConnection);
      }
    };
  }, []);

  const checkConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        }
      } catch (err) {
        console.error("Error checking connection:", err);
      }
    }
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
      } catch (err) {
        console.error("Error connecting wallet:", err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">BOB Staking dApp</h1>
          {/* ... wallet connection button ... */}
        </header>

        {account ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <StakeForm />
              <RestakeForm />
            </div>
            <PositionView />
          </div>
        ) : (
          <div className="text-center">Please connect your wallet</div>
        )}
      </div>
    </div>
  );
}

export default App;