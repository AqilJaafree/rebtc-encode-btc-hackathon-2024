// src/constants/contracts.js
export const CONTRACT_ADDRESSES = {
  BOB_SEPOLIA: "0xAF85A0023fAc623fCE4F20f50BD475C01e6791B1",
  // Add other networks later
};

export const NETWORK_CONFIGS = {
  BOB_SEPOLIA: {
    chainId: "0xC576D", // 808813 in hex
    decimalChainId: 808813,
    name: "BOB Sepolia",
    rpcUrl: "https://bob-sepolia.rpc.gobob.xyz",
    explorerUrl: "https://bob-sepolia.explorer.gobob.xyz",
    nativeCurrency: {
      name: "BOB Sepolia",
      symbol: "ETH",
      decimals: 18,
    },
  },
};
