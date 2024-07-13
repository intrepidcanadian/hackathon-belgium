// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract Token is ERC20, AccessControl {
	bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

	constructor() ERC20("Brussels Hackathon", "BRU") {
		
		// address newAdmin = 0x8DabF51501196a7700c97616bD82791cF31Ac685;
		_grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
		_grantRole(MINTER_ROLE, msg.sender);

		// initialize the minter role to deployer
		// keep the admin role to deployer but assign the tokenshop contrac the minter roles to mint tokens
	
	}

	function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
		_mint(to, amount);
	}

	function decimals() public pure override returns (uint8) {
		return 2;
	}

}
