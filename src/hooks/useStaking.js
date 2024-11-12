// src/hooks/useStaking.js
import { useState, useCallback } from "react";
import { ethers } from "ethers";

const STAKING_ADDRESS = "0x6696283e07CE0619F6d88626A77A41978517dd1F";

const STAKING_ABI = [
  {
    inputs: [],
    name: "stake",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "restake",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "gmToken",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "getPosition",
    outputs: [
      {
        internalType: "uint256",
        name: "stakedAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "restakedAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "estimatedRewards",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "lastUpdateTime",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "gmTokenBalance",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const GM_TOKEN_ABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
    ],
    name: "allowance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

export function useStaking() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [gmTokenAddress, setGmTokenAddress] = useState(null);

  const getContracts = useCallback(async () => {
    if (typeof window.ethereum === "undefined") {
      throw new Error("Please install MetaMask");
    }

    await window.ethereum.request({ method: "eth_requestAccounts" });
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    // Get staking contract
    const stakingContract = new ethers.Contract(
      STAKING_ADDRESS,
      STAKING_ABI,
      signer
    );

    // Get GM Token address if we don't have it
    if (!gmTokenAddress) {
      const gmAddress = await stakingContract.gmToken();
      console.log("GM Token address:", gmAddress);
      setGmTokenAddress(gmAddress);

      // Create GM Token contract instance
      const gmTokenContract = new ethers.Contract(
        gmAddress,
        GM_TOKEN_ABI,
        signer
      );

      return { stakingContract, gmTokenContract, signer };
    }

    // Use existing GM Token address
    const gmTokenContract = new ethers.Contract(
      gmTokenAddress,
      GM_TOKEN_ABI,
      signer
    );

    return { stakingContract, gmTokenContract, signer };
  }, [gmTokenAddress]);

  const stake = async (amount) => {
    try {
      setLoading(true);
      setError(null);

      const { stakingContract } = await getContracts();
      console.log("Staking amount:", amount);
      const amountInWei = ethers.utils.parseEther(amount.toString());
      console.log("Amount in Wei:", amountInWei.toString());

      const tx = await stakingContract.stake({
        value: amountInWei,
        gasLimit: 500000,
      });

      console.log("Transaction sent:", tx.hash);
      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);

      return receipt;
    } catch (err) {
      console.error("Staking error:", err);
      let errorMessage = err.message;
      if (err.error?.message) {
        errorMessage = err.error.message;
      }
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const restake = async (amount) => {
    try {
      setLoading(true);
      setError(null);

      const { stakingContract, gmTokenContract, signer } = await getContracts();
      const address = await signer.getAddress();

      const amountInWei = ethers.utils.parseEther(amount.toString());
      console.log("Amount to restake:", amount, "gmBOB");
      console.log("Amount in Wei:", amountInWei.toString());

      // Check allowance first
      const allowance = await gmTokenContract.allowance(
        address,
        STAKING_ADDRESS
      );
      console.log("Current allowance:", ethers.utils.formatEther(allowance));

      // If allowance is insufficient, approve first
      if (allowance.lt(amountInWei)) {
        console.log("Approving gmBOB...");
        const approveTx = await gmTokenContract.approve(
          STAKING_ADDRESS,
          amountInWei
        );
        console.log("Approval transaction sent:", approveTx.hash);
        const approveReceipt = await approveTx.wait();
        console.log("Approval confirmed:", approveReceipt);
      }

      // Now perform the restake
      console.log("Executing restake...");
      const tx = await stakingContract.restake(amountInWei, {
        gasLimit: 500000,
      });

      console.log("Restake transaction sent:", tx.hash);
      const receipt = await tx.wait();
      console.log("Restake transaction confirmed:", receipt);

      return receipt;
    } catch (err) {
      console.error("Restaking error:", err);
      let errorMessage = err.message;
      if (err.error?.message) {
        errorMessage = err.error.message;
      }
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getGmTokenBalance = async (address) => {
    try {
      const { gmTokenContract } = await getContracts();
      const balance = await gmTokenContract.balanceOf(address);
      return ethers.utils.formatEther(balance);
    } catch (err) {
      console.error("Error getting GM token balance:", err);
      return "0";
    }
  };

  const getPosition = async (address) => {
    try {
      const { stakingContract } = await getContracts();
      const position = await stakingContract.getPosition(address);

      return {
        stakedAmount: ethers.utils.formatEther(position.stakedAmount),
        restakedAmount: ethers.utils.formatEther(position.restakedAmount),
        estimatedRewards: ethers.utils.formatEther(position.estimatedRewards),
        lastUpdateTime: position.lastUpdateTime.toString(),
        gmTokenBalance: ethers.utils.formatEther(position.gmTokenBalance),
      };
    } catch (err) {
      console.error("Get position error:", err);
      throw err;
    }
  };

  const checkAllowance = async (owner, amount) => {
    try {
      const { gmTokenContract } = await getContracts();
      const allowance = await gmTokenContract.allowance(owner, STAKING_ADDRESS);
      const amountInWei = ethers.utils.parseEther(amount.toString());
      return allowance.gte(amountInWei);
    } catch (err) {
      console.error("Error checking allowance:", err);
      return false;
    }
  };

  return {
    stake,
    restake,
    getPosition,
    getGmTokenBalance,
    checkAllowance,
    loading,
    error,
    gmTokenAddress,
  };
}
