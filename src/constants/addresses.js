// src/constants/contracts.js
export const CONTRACTS = {
  BOB_SEPOLIA: {
    STAKING: "0xAF85A0023fAc623fCE4F20f50BD475C01e6791B1",
  },
  ROOTSTOCK_TESTNET: {
    STAKING: "0x88250F772101179a4EcfAA4b92a983676a3cE445",
  },
};

export const NETWORK_CONFIGS = {
  BOB_SEPOLIA: {
    chainId: "0xC576D", // 808813 in hex
    decimalChainId: 808813,
    name: "BOB Sepolia",
    rpcUrl: "https://bob-sepolia.rpc.gobob.xyz",
    explorerUrl: "https://bob-sepolia.explorer.gobob.xyz",
    nativeCurrency: {
      name: "BOB",
      symbol: "BOB",
      decimals: 18,
    },
  },
  ROOTSTOCK_TESTNET: {
    chainId: "0x1f", // 31 in hex
    decimalChainId: 31,
    name: "RSK Testnet",
    rpcUrl: "https://public-node.testnet.rsk.co",
    explorerUrl: "https://explorer.testnet.rsk.co",
    nativeCurrency: {
      name: "tRBTC",
      symbol: "tRBTC",
      decimals: 18,
    },
  },
};
