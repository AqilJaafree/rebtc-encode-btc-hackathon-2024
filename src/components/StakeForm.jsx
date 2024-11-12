// src/components/StakeForm.jsx
import { useState, useEffect } from 'react';
import { useStaking } from '../hooks/useStaking';
import { ethers } from 'ethers';

export function StakeForm() {
  const { stake, getNativeBalance, getNetworkSymbol, loading, error } = useStaking();
  const [amount, setAmount] = useState('');
  const [balance, setBalance] = useState('0');
  const [symbol, setSymbol] = useState('');
  const [txHash, setTxHash] = useState('');

  const updateBalance = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        const bal = await getNativeBalance(address);
        setBalance(bal);
        const sym = await getNetworkSymbol();
        setSymbol(sym);
      } catch (err) {
        console.error("Error updating balance:", err);
      }
    }
  };

  useEffect(() => {
    updateBalance();
    // Update balance every 15 seconds
    const interval = setInterval(updateBalance, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleStake = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    try {
      setTxHash('');
      const tx = await stake(amount);
      console.log("Stake successful:", tx);
      setTxHash(tx.transactionHash);
      setAmount('');
      await updateBalance();
    } catch (err) {
      console.error("Stake failed:", err);
    }
  };

  const handleMaxClick = () => {
    // Leave some for gas
    const maxAmount = parseFloat(balance) - 0.01;
    if (maxAmount > 0) {
      setAmount(maxAmount.toString());
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">Stake {symbol}</h2>
      
      <div className="mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Available Balance:</span>
          <span>{parseFloat(balance).toFixed(4)} {symbol}</span>
        </div>
      </div>

      <form onSubmit={handleStake} className="space-y-4">
        <div className="relative">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={`Amount to stake`}
            className="w-full p-3 border rounded-lg pr-16"
            step="0.000000000000000001"
            min="0"
            max={balance}
            disabled={loading}
          />
          <button
            type="button"
            onClick={handleMaxClick}
            className="absolute right-2 top-2.5 text-sm text-blue-500 hover:text-blue-700"
          >
            MAX
          </button>
        </div>

        <button
          type="submit"
          disabled={loading || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > parseFloat(balance)}
          className={`w-full py-3 rounded-lg text-white font-medium ${
            loading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Staking...
            </div>
          ) : (
            `Stake ${symbol}`
          )}
        </button>

        {error && (
          <div className="text-red-500 text-sm mt-2">
            {error}
          </div>
        )}

        {txHash && (
          <div className="mt-4 text-sm text-green-500">
            Transaction successful!{' '}
            <a
              href={`${window.location.hostname.includes('rsk') ? 
                'https://explorer.testnet.rsk.co/tx/' : 
                'https://bob-sepolia.explorer.gobob.xyz/tx/'}${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              View on Explorer
            </a>
          </div>
        )}
      </form>
    </div>
  );
}