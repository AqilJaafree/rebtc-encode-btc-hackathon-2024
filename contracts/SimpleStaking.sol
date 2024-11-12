// contracts/SimpleStaking.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./GMToken.sol";

contract SimpleStaking is ReentrancyGuard {
    GMToken public gmToken;   // Liquid staking token
    
    struct UserPosition {
        uint256 stakedAmount;    // First layer staking amount
        uint256 restakedAmount;  // Second layer staking amount
        uint256 lastUpdateTime;  // Last time rewards were calculated
    }
    
    mapping(address => UserPosition) public positions;
    uint256 public totalStaked;
    uint256 public totalRestaked;
    
    // Fixed APR for demonstration (10% for staking, 15% for restaking)
    uint256 public constant STAKING_RATE = 10;
    uint256 public constant RESTAKING_RATE = 15;
    
    event Staked(address indexed user, uint256 amount);
    event Restaked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount, bool isRestaked);
    
    constructor() {
        gmToken = new GMToken();
    }
    
    // First layer staking - uses native BOB
    function stake() external payable nonReentrant {
        require(msg.value > 0, "Cannot stake 0");
        
        // Mint gmTokens 1:1
        gmToken.mint(msg.sender, msg.value);
        
        // Update user position
        positions[msg.sender].stakedAmount += msg.value;
        positions[msg.sender].lastUpdateTime = block.timestamp;
        totalStaked += msg.value;
        
        emit Staked(msg.sender, msg.value);
    }
    
    // Second layer staking (restaking)
    function restake(uint256 amount) external nonReentrant {
        require(amount > 0, "Cannot restake 0");
        require(gmToken.balanceOf(msg.sender) >= amount, "Insufficient gmToken balance");
        
        // Transfer gmTokens to contract
        require(gmToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        // Update user position
        positions[msg.sender].restakedAmount += amount;
        positions[msg.sender].lastUpdateTime = block.timestamp;
        totalRestaked += amount;
        
        emit Restaked(msg.sender, amount);
    }
    
    // Withdraw from first layer
    function withdrawStaked(uint256 amount) external nonReentrant {
        require(amount > 0, "Cannot withdraw 0");
        require(positions[msg.sender].stakedAmount >= amount, "Insufficient staked amount");
        
        // Burn gmTokens
        gmToken.burn(msg.sender, amount);
        
        // Transfer native BOB back
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");
        
        // Update position
        positions[msg.sender].stakedAmount -= amount;
        totalStaked -= amount;
        
        emit Withdrawn(msg.sender, amount, false);
    }
    
    // Withdraw from second layer
    function withdrawRestaked(uint256 amount) external nonReentrant {
        require(amount > 0, "Cannot withdraw 0");
        require(positions[msg.sender].restakedAmount >= amount, "Insufficient restaked amount");
        
        // Transfer gmTokens back
        require(gmToken.transfer(msg.sender, amount), "Transfer failed");
        
        // Update position
        positions[msg.sender].restakedAmount -= amount;
        totalRestaked -= amount;
        
        emit Withdrawn(msg.sender, amount, true);
    }
    
    // View functions
    function getPosition(address user) external view returns (
        uint256 stakedAmount,
        uint256 restakedAmount,
        uint256 estimatedRewards,
        uint256 lastUpdateTime,
        uint256 gmTokenBalance
    ) {
        UserPosition memory pos = positions[user];
        
        // Calculate estimated rewards based on time elapsed and fixed rates
        uint256 timeElapsed = block.timestamp - pos.lastUpdateTime;
        uint256 stakingRewards = (pos.stakedAmount * STAKING_RATE * timeElapsed) / (365 days * 100);
        uint256 restakingRewards = (pos.restakedAmount * RESTAKING_RATE * timeElapsed) / (365 days * 100);
        
        return (
            pos.stakedAmount,
            pos.restakedAmount,
            stakingRewards + restakingRewards,
            pos.lastUpdateTime,
            gmToken.balanceOf(user)
        );
    }
    
    // View total stats
    function getTotalStats() external view returns (
        uint256 _totalStaked,
        uint256 _totalRestaked,
        uint256 contractBalance
    ) {
        return (totalStaked, totalRestaked, address(this).balance);
    }

    // Required to receive native BOB
    receive() external payable {}
}