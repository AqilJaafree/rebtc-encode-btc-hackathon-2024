// src/components/StakeForm.jsx
import { useState, useEffect } from 'react';
import { useStaking } from '../hooks/useStaking';
import { ethers } from 'ethers';

export function StakeForm() {
  const { stake, loading, error } = useStaking();
  const [amount, setAmount] = useState('');
  const [balance, setBalance] = useState('0');

  useEffect(() => {
    checkBalance();
  }, []);

  const checkBalance = async () => {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const balance = await provider.getBalance(await signer.getAddress());
      setBalance(ethers.utils.formatEther(balance));
    }
  };

  const handleStake = async (e) => {
    e.preventDefault();
    try {
      const tx = await stake(amount);
      console.log("Stake successful:", tx);
      setAmount('');
      checkBalance();
    } catch (err) {
      console.error("Stake failed:", err);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Stake BOB</h2>
      <div className="mb-4 text-sm">
        Balance: {parseFloat(balance).toFixed(4)} BOB
      </div>
      <form onSubmit={handleStake}>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount to stake"
          className="w-full p-2 border rounded mb-4"
          step="0.000000000000000001"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !amount || parseFloat(amount) <= 0}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? 'Staking...' : 'Stake'}
        </button>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </form>
    </div>
  );
}
