// contracts/GMToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract GMToken is ERC20 {
    address public stakingContract;

    constructor() ERC20("Gains Multiplied BOB", "gmBOB") {
        stakingContract = msg.sender;
    }

    function mint(address to, uint256 amount) external {
        require(msg.sender == stakingContract, "Only staking contract can mint");
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external {
        require(msg.sender == stakingContract, "Only staking contract can burn");
        _burn(from, amount);
    }
}