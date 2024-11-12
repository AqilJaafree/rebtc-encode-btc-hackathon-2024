// src/hooks/useStaking.js
import { useState, useCallback } from "react";
import { ethers } from "ethers";

const CONTRACTS = {
  BOB_SEPOLIA: {
    STAKING: "0x6696283e07CE0619F6d88626A77A41978517dd1F",
    GM_TOKEN: "0x5600a56980492570B74C71B16A242544208e4E53",
  },
  ROOTSTOCK_TESTNET: {
    STAKING: "0xE49B7BBc8c9Dc60754Bf7e3A9ce96230aB348830",
    GM_TOKEN: "0xCbA6179FECC48b7c92BB9292AAee6296d338c99C",
  },
};

const NETWORK_CONFIGS = {
  BOB_SEPOLIA: {
    chainId: "0xC576D", // 808813 in hex
    decimalChainId: 808813,
    name: "BOB Sepolia",
    symbol: "BOB",
  },
  ROOTSTOCK_TESTNET: {
    chainId: "0x1F", // 31 in hex
    decimalChainId: 31,
    name: "RSK Testnet",
    symbol: "tRBTC",
  },
};

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

  const getCurrentNetwork = async () => {
    if (!window.ethereum) throw new Error("No ethereum provider found");

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const network = await provider.getNetwork();
    const chainId = network.chainId;

    if (chainId === NETWORK_CONFIGS.BOB_SEPOLIA.decimalChainId) {
      return "BOB_SEPOLIA";
    } else if (chainId === NETWORK_CONFIGS.ROOTSTOCK_TESTNET.decimalChainId) {
      return "ROOTSTOCK_TESTNET";
    }
    throw new Error("Unsupported network");
  };

  const getContracts = useCallback(async () => {
    if (!window.ethereum) {
      throw new Error("Please install MetaMask");
    }

    await window.ethereum.request({ method: "eth_requestAccounts" });
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const networkType = await getCurrentNetwork();
    console.log("Current network:", networkType);

    // Get network-specific contract addresses
    const stakingAddress = CONTRACTS[networkType].STAKING;
    const gmTokenAddress = CONTRACTS[networkType].GM_TOKEN;

    console.log("Using contracts:", {
      staking: stakingAddress,
      gmToken: gmTokenAddress,
    });

    const stakingContract = new ethers.Contract(
      stakingAddress,
      STAKING_ABI,
      signer
    );

    const gmTokenContract = new ethers.Contract(
      gmTokenAddress,
      GM_TOKEN_ABI,
      signer
    );

    return { stakingContract, gmTokenContract, signer, networkType };
  }, []);

  const getNativeBalance = async (address) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const balance = await provider.getBalance(address);
    return ethers.utils.formatEther(balance);
  };

  const stake = async (amount) => {
    try {
      setLoading(true);
      setError(null);

      const { stakingContract } = await getContracts();
      const amountInWei = ethers.utils.parseEther(amount.toString());

      console.log("Staking amount:", amount);
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
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const restake = async (amount) => {
    try {
      setLoading(true);
      setError(null);

      const { stakingContract, gmTokenContract, signer, networkType } =
        await getContracts();
      const address = await signer.getAddress();

      const amountInWei = ethers.utils.parseEther(amount.toString());
      console.log("Attempting to restake:", amount);
      console.log("Amount in Wei:", amountInWei.toString());

      // Check allowance
      const allowance = await gmTokenContract.allowance(
        address,
        CONTRACTS[networkType].STAKING
      );
      console.log("Current allowance:", ethers.utils.formatEther(allowance));

      if (allowance.lt(amountInWei)) {
        console.log("Approving tokens...");
        const approveTx = await gmTokenContract.approve(
          CONTRACTS[networkType].STAKING,
          amountInWei
        );
        console.log("Approval transaction sent:", approveTx.hash);
        await approveTx.wait();
        console.log("Approval confirmed");
      }

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
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getPosition = async (address) => {
    try {
      const { stakingContract, gmTokenContract } = await getContracts();
      const position = await stakingContract.getPosition(address);
      const gmBalance = await gmTokenContract.balanceOf(address);

      return {
        stakedAmount: ethers.utils.formatEther(position.stakedAmount),
        restakedAmount: ethers.utils.formatEther(position.restakedAmount),
        estimatedRewards: ethers.utils.formatEther(position.estimatedRewards),
        lastUpdateTime: position.lastUpdateTime.toString(),
        gmTokenBalance: ethers.utils.formatEther(gmBalance),
      };
    } catch (err) {
      console.error("Get position error:", err);
      throw err;
    }
  };

  const getNetworkSymbol = async () => {
    const networkType = await getCurrentNetwork();
    return NETWORK_CONFIGS[networkType].symbol;
  };

  return {
    stake,
    restake,
    getPosition,
    getNativeBalance,
    getNetworkSymbol,
    getCurrentNetwork,
    loading,
    error,
  };
}
