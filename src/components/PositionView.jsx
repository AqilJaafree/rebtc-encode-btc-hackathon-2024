// src/components/PositionView.jsx
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useStaking } from '../hooks/useStaking';

export function PositionView() {
  const { getPosition, gmTokenAddress } = useStaking();
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(true);

  const updatePosition = async () => {
    try {
      setLoading(true);
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        const pos = await getPosition(address);
        console.log("Updated position:", pos);
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
    const interval = setInterval(updatePosition, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [gmTokenAddress]); // Refresh when gmTokenAddress changes

  if (loading) {
    return <div>Loading position...</div>;
  }

  if (!position) {
    return <div>No position data available</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">Your Position</h2>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600">Staked BOB:</span>
          <span>{parseFloat(position.stakedAmount).toFixed(4)} BOB</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">GM Token Balance:</span>
          <span>{parseFloat(position.gmTokenBalance).toFixed(4)} gmBOB</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Restaked Amount:</span>
          <span>{parseFloat(position.restakedAmount).toFixed(4)} gmBOB</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Estimated Rewards:</span>
          <span>{parseFloat(position.estimatedRewards).toFixed(8)} BOB</span>
        </div>
      </div>
      <button
        onClick={updatePosition}
        className="mt-4 w-full py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
      >
        Refresh Position
      </button>
    </div>
  );
}