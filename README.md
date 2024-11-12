# ReBTC Staking Platform

## Project Overview

ReBTC is a decentralized staking platform built on the Rootstock (RSK) Blockchain and Sepolia Bob (BOB) testnet. It allows users to stake their native tokens (tRBTC on RSK, BOB on Sepolia) and earn rewards through a two-layer staking mechanism.

## GM TOKEN BOB SEPOLIA
https://bob-sepolia.explorer.gobob.xyz/address/0x5600a56980492570B74C71B16A242544208e4E53

## STAKING & RESTAKING CONTRACT KING BOB
https://bob-sepolia.explorer.gobob.xyz/address/0x6696283e07CE0619F6d88626A77A41978517dd1F

## Key Features

- **First Layer Staking**: Users can stake their native tRBTC or BOB tokens and earn rewards based on a fixed APR.
- **Second Layer Staking (Restaking)**: Users can restake their earned gm (Gains Multiplied) tokens to earn additional rewards.
- **Liquid Staking**: The platform issues a 1:1 gm token (gmRTSK or gmBOB) for every tRBTC or BOB staked, allowing users to hold a liquid representation of their staked assets.
- **Responsive UI**: A user-friendly and responsive interface to monitor staking positions and perform various actions.
- **Multi-Chain Support**: Currently deployed on the Rootstock Testnet and Sepolia Bob testnet, with easy adaptability for other EVM-compatible chains.

## Architecture

The project consists of the following main components:

1. **Smart Contracts**:  
   Core functionality is implemented in Solidity smart contracts, covering staking logic, gm token management, and reward calculations.

2. **React UI**:  
   The frontend of the application is built using React, providing a modern and user-friendly interface for interacting with the platform.

3. **Wallet Integration**:  
   The platform supports MetaMask and other web3 wallets, allowing users to connect their wallets for seamless interaction.

4. **Blockchain Interaction**:  
   Using `ethers.js`, the app interacts with the Rootstock Blockchain and Sepolia Bob testnet, enabling users to stake, restake, and withdraw their assets.

## Project Setup

### Prerequisites

- Node.js and npm installed
- MetaMask or another web3-compatible wallet
- Access to the Rootstock and Sepolia Bob testnets

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd rebct-staking-platform
