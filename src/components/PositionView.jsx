// src/components/PositionView.jsx
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useStaking } from '../hooks/useStaking';

export function PositionView() {
  const { getPosition, getCurrentNetwork, getNetworkSymbol } = useStaking();
  const [position, setPosition] = useState(null);
  const [symbol, setSymbol] = useState('');
  const [loading, setLoading] = useState(true);

  const updatePosition = async () => {
    try {
      setLoading(true);
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const address = await signer.getAddress();

        // Get all data concurrently
        const [pos, sym] = await Promise.all([
          getPosition(address),
          getNetworkSymbol()
        ]);

        console.log('Raw position data:', pos);
        setPosition(pos);
        setSymbol(sym);
      }
    } catch (err) {
      console.error("Error updating position:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    updatePosition();
    const interval = setInterval(updatePosition, 15000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div>Loading position...</div>;
  }

  if (!position) {
    return <div>No position data available</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">Your Position</h2>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Staked {symbol}:</span>
          <span className="font-medium">{parseFloat(position.stakedAmount).toFixed(4)} {symbol}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">gm{symbol} Balance:</span>
          <span className="font-medium">{parseFloat(position.gmTokenBalance).toFixed(4)} gm{symbol}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Restaked Amount:</span>
          <span className="font-medium">{parseFloat(position.restakedAmount).toFixed(4)} gm{symbol}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Estimated Rewards:</span>
          <span className="font-medium">{parseFloat(position.estimatedRewards).toFixed(8)} {symbol}</span>
        </div>

        <button
          onClick={updatePosition}
          className="w-full mt-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          Refresh Position
        </button>
      </div>
    </div>
  );
}