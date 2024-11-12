// src/components/RestakeForm.jsx
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useStaking } from '../hooks/useStaking';

export function RestakeForm() {
  const { restake, getPosition, loading, error } = useStaking();
  const [amount, setAmount] = useState('');
  const [gmBalance, setGmBalance] = useState('0');
  const [transactionHash, setTransactionHash] = useState(null);

  const updateBalance = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      const position = await getPosition(address);
      setGmBalance(position.gmTokenBalance);
      console.log("GM Balance:", position.gmTokenBalance);
    } catch (err) {
      console.error("Error fetching balance:", err);
    }
  };

  useEffect(() => {
    updateBalance();
  }, []);

  const handleRestake = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    try {
      setTransactionHash(null); // Reset transaction hash
      console.log("Attempting to restake:", amount, "gmBOB");
      
      const tx = await restake(amount);
      console.log("Restake transaction:", tx);
      
      setTransactionHash(tx.transactionHash);
      setAmount('');
      await updateBalance();
    } catch (err) {
      console.error("Restake failed:", err);
    }
  };

  const handleMaxClick = () => {
    setAmount(gmBalance);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">Restake gmBOB</h2>
      
      <div className="mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Available gmBOB:</span>
          <span>{parseFloat(gmBalance).toFixed(4)} gmBOB</span>
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
            disabled={loading}
          />
          <button
            type="button"
            onClick={handleMaxClick}
            className="absolute right-2 top-2.5 text-blue-500 hover:text-blue-700 text-sm font-medium"
          >
            MAX
          </button>
        </div>

        <button
          type="submit"
          disabled={loading || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > parseFloat(gmBalance)}
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
              Restaking...
            </div>
          ) : (
            'Restake gmBOB'
          )}
        </button>

        {error && (
          <div className="text-red-500 text-sm">
            {error}
          </div>
        )}

        {transactionHash && (
          <div className="mt-4 text-sm text-green-500">
            Transaction submitted! {' '}
            <a
              href={`https://bob-sepolia.explorer.gobob.xyz/tx/${transactionHash}`}
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