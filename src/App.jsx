import { useState, useEffect } from 'react';
import { StakeForm } from './components/StakeForm';
import { RestakeForm } from './components/RestakeForm';
import { PositionView } from './components/PositionView';

function App() {
  const [account, setAccount] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    checkConnection();
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', () => window.location.reload());
    }
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      // User disconnected their wallet
      disconnect();
    } else {
      setAccount(accounts[0]);
    }
  };

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
        setIsConnecting(true);
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
      } catch (err) {
        console.error("Error connecting wallet:", err);
        if (err.code === 4001) {
          // User rejected the connection request
          alert("Please connect your wallet to continue");
        }
      } finally {
        setIsConnecting(false);
      }
    } else {
      alert("Please install MetaMask or another Web3 wallet!");
    }
  };

  const disconnect = () => {
    setAccount(null);
  };

  const handleWalletClick = () => {
    if (account) {
      disconnect();
    } else {
      connectWallet();
    }
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white"> ReBTC </h1>
          <button 
            onClick={handleWalletClick}
            disabled={isConnecting}
            className={`
              px-6 py-2 rounded-lg transition-colors duration-200 font-medium
              ${account 
                ? 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
              }
              ${isConnecting ? 'opacity-75 cursor-not-allowed' : ''}
            `}
          >
            {isConnecting 
              ? 'Connecting...' 
              : account 
                ? formatAddress(account)
                : 'Connect Wallet'
            }
          </button>
        </header>

        {!account ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Welcome to ReBTC
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Please connect your wallet to access the platform
            </p>
            <button
              onClick={connectWallet}
              disabled={isConnecting}
              className={`
                px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                transition-colors duration-200 font-medium
                ${isConnecting ? 'opacity-75 cursor-not-allowed' : ''}
              `}
            >
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <StakeForm />
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <RestakeForm />
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <PositionView />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;