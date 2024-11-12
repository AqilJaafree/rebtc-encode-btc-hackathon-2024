// src/components/PositionView.jsx
import { useState, useEffect } from 'react';
import { useStaking } from '../hooks/useStaking';
import { ethers } from 'ethers';

export function PositionView() {
  const { getPosition, getNetworkSymbol } = useStaking();
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
        const pos = await getPosition(address);
        const sym = await getNetworkSymbol();
        setSymbol(sym);
        setPosition(pos);
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
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse flex flex-col space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!position) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-gray-500">No position data available</div>
      </div>
    );
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