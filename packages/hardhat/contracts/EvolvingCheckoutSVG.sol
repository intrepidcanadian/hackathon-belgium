// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// Importing OpenZeppelin contracts
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

// Importing Chainlink contracts
import "./AggregatorV3Interface.sol";

// Importing the CartCostFunctions contract
import "./CartCostFunctions.sol";

contract EvolvingCheckoutSVG is ERC721, ERC721URIStorage {
    using Counters for Counters.Counter;
    using Strings for uint256;

    Counters.Counter private tokenIdCounter;

    // Create price feed
    AggregatorV3Interface internal priceFeed;

    // Reference to the CartCostFunctions contract
    CartCostFunctions public cartCostFunctions;

    // Set variables for NFT
    string private constant priceIndicatorUp = unicode"😀";
    string private constant priceIndicatorDown = unicode"😔";

    address private constant ethusdAddress = 0x694AA1769357215DE4FAC081bf1f309aDC325306;

    constructor(address cartCostFunctionsAddress) ERC721("Benchmark Checkout SVG", "CSVG") {
        priceFeed = AggregatorV3Interface(ethusdAddress);
        cartCostFunctions = CartCostFunctions(cartCostFunctionsAddress);
        
        // Mint an NFT
        safeMint();
    }

    function safeMint() public {
        uint256 tokenId = tokenIdCounter.current();
        tokenIdCounter.increment();
        _safeMint(msg.sender, tokenId);
        updateSVG(tokenId);
    }

    // Update the SVG
    function updateSVG(uint256 tokenId) public {
        // Create the SVG string
        string memory finalSVG = buildSVG();
        // Base64 encode the SVG
        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "Dynamic NFT",',
                        '"description": "Evolving NFT based on checkout sales beating latest benchmark ETH price",',
                        '"image": "data:image/svg+xml;base64,',
                        Base64.encode(bytes(finalSVG)),
                        '"}'
                    )
                )
            )
        );
        // Create token URI
        string memory finalTokenURI = string(
            abi.encodePacked("data:application/json;base64,", json)
        );
        // Set token URI
        _setTokenURI(tokenId, finalTokenURI);
    }

    // Build the SVG string
    function buildSVG() internal view returns (string memory) {
        string memory headSVG = "<svg xmlns='http://www.w3.org/2000/svg' version='1.1' xmlns:xlink='http://www.w3.org/1999/xlink' xmlns:svgjs='http://svgjs.com/svgjs' width='500' height='500' preserveAspectRatio='none' viewBox='0 0 500 500'> <rect width='100%' height='100%' fill='#000000' />";
        
        // Add a star if block timestamp is even
        string memory starsSVG = block.timestamp % 2 == 0 ? generateStar(250, 250) : "";

        string memory bodySVG = string(
            abi.encodePacked(
                "<text x='50%' y='50%' font-size='128' dominant-baseline='middle' text-anchor='middle' fill='white'>",
                compareCheckoutValueWithETHPrice(),
                "</text>"
            )
        );

        // Close SVG
        string memory tailSVG = "</svg>";

        // Concatenate SVG strings
        return string(
            abi.encodePacked(headSVG, starsSVG, bodySVG, tailSVG)
        );
    }

    function generateStar(uint256 x, uint256 y) internal pure returns (string memory) {
        return string(
            abi.encodePacked(
                "<circle cx='", x.toString(), "' cy='", y.toString(), "' r='2' fill='white' />"
            )
        );
    }

    // Compare checkout value with ETH price
    function compareCheckoutValueWithETHPrice() public view returns (string memory) {
        uint256 checkoutValue = getCumulativeCheckoutValue();
        uint256 ethPrice = getChainlinkDataFeedLatestAnswer();
        
        return checkoutValue > ethPrice ? priceIndicatorUp : priceIndicatorDown;
    }

    function getCumulativeCheckoutValue() public view returns (uint256) {
        CartCostFunctions.StatsStruct memory stats = cartCostFunctions.getStats();
        return parseStringToUint(stats.totalTransactionAmount);
    }

    function getChainlinkDataFeedLatestAnswer() public view returns (uint256) {
        (, int256 price, , , ) = priceFeed.latestRoundData();
        return uint256(price);
    }

    function parseStringToUint(string memory numString) internal pure returns (uint256) {
        bytes memory b = bytes(numString);
        uint256 result = 0;
        for (uint i = 0; i < b.length; i++) {
            if (b[i] >= "0" && b[i] <= "9") {
                result = result * 10 + (uint8(b[i]) - 48);
            }
        }
        return result;
    }

    // The following function is an override required by Solidity.
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
}
