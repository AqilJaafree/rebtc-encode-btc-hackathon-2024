// src/components/RestakeForm.jsx
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useStaking } from '../hooks/useStaking';

export function RestakeForm() {
  const { restake, getPosition, getNetworkSymbol, loading: stakingLoading, error: stakingError } = useStaking();
  const [amount, setAmount] = useState('');
  const [gmBalance, setGmBalance] = useState('0');
  const [symbol, setSymbol] = useState('');
  const [txHash, setTxHash] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateBalance = async () => {
    if (!window.ethereum) {
      setError("Please install MetaMask");
      return;
    }

    try {
      setLoading(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const address = await signer.getAddress();

      const [position, sym] = await Promise.all([
        getPosition(address),
        getNetworkSymbol()
      ]);

      setGmBalance(position.gmTokenBalance);
      setSymbol(sym);
      
      console.log('GM Balance:', position.gmTokenBalance);
    } catch (err) {
      console.error("Error fetching position:", err);
      setError(err.message || "Error fetching position");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    updateBalance();
    const interval = setInterval(updateBalance, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleRestake = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    try {
      setLoading(true);
      setTxHash('');
      setError(null);

      const tx = await restake(amount);
      console.log("Restake successful:", tx);
      setTxHash(tx.transactionHash);
      setAmount('');
      await updateBalance();
    } catch (err) {
      console.error("Restake failed:", err);
      setError(err.message || "Restake failed");
    } finally {
      setLoading(false);
    }
  };

  const handleMaxClick = () => {
    setAmount(gmBalance);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">Restake gm{symbol}</h2>
      
      <div className="mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Available gm{symbol}:</span>
          <span>{parseFloat(gmBalance).toFixed(4)} gm{symbol}</span>
        </div>
      </div>

      <form onSubmit={handleRestake} className="space-y-4">
        <div className="relative">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount to restake"
            className="w-full p-3 border rounded-lg pr-16"
            step="0.000000000000000001"
            min="0"
            max={gmBalance}
            disabled={loading || stakingLoading}
          />
          <button
            type="button"
            onClick={handleMaxClick}
            className="absolute right-2 top-2.5 text-sm text-blue-500 hover:text-blue-700"
            disabled={loading || stakingLoading}
          >
            MAX
          </button>
        </div>

        <button
          type="submit"
          disabled={loading || stakingLoading || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > parseFloat(gmBalance)}
          className={`w-full py-3 rounded-lg text-white font-medium ${
            loading || stakingLoading ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600'
          }`}
        >
          {loading || stakingLoading ? 'Processing...' : `Restake gm${symbol}`}
        </button>

        {(error || stakingError) && (
          <div className="text-red-500 text-sm mt-2">
            {error || stakingError}
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