// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "./AggregatorV3Interface.sol";

interface TokenInterface {
    function mint(address account, uint256 amount) external;
}

contract TokenShop {
    
	AggregatorV3Interface internal priceFeed;
	TokenInterface public minter;
	uint256 public tokenPrice = 200; //1 token = 2.00 usd, with 2 decimal places
	address public owner;
    
	constructor(address tokenAddress) {
    	minter = TokenInterface(tokenAddress);
        /**
        * Network: Sepolia
        * Aggregator: ETH/USD
        * Address: 0x694AA1769357215DE4FAC081bf1f309aDC325306
        */
        priceFeed = AggregatorV3Interface(0x694AA1769357215DE4FAC081bf1f309aDC325306);
        // owner = msg.sender;
        // set me as owner instead of the burner deployer wallet at 0xF51139cE0610b96e855b451B6c46FC561c07336c
        // the original deployer is a yarn generate account
        owner = address(0x8DabF51501196a7700c97616bD82791cF31Ac685);
	}

	/**
 	* Returns the latest answer
 	*/
	function getChainlinkDataFeedLatestAnswer() public view returns (int) {
    	(
        	/*uint80 roundID*/,
        	int price,
        	/*uint startedAt*/,
        	/*uint timeStamp*/,
        	/*uint80 answeredInRound*/
    	) = priceFeed.latestRoundData();
    	return price;
	}

	function tokenAmount(uint256 amountETH) public view returns (uint256) {
    	//Sent amountETH, how many usd I have
    	uint256 ethUsd = uint256(getChainlinkDataFeedLatestAnswer());		//with 8 decimal places
    	uint256 amountUSD = amountETH * ethUsd / 10**18; //ETH = 18 decimal places
    	uint256 amountToken = amountUSD / tokenPrice / 10**(8/2);  //8 decimal places from ETHUSD / 2 decimal places from token 
    	return amountToken;
	} 

    function purchaseTokens() external payable {
        uint256 amountToken = tokenAmount(msg.value);
        require(amountToken > 0, "Insufficient ETH to purchase tokens");
        minter.mint(msg.sender, amountToken);
    }

	receive() external payable {
    	uint256 amountToken = tokenAmount(msg.value);
    	minter.mint(msg.sender, amountToken);
	}

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    function withdraw() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }    
}
