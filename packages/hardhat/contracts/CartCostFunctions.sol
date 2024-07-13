// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// import {FunctionsClient} from "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/FunctionsClient.sol";
// import {FunctionsRequest} from "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/libraries/FunctionsRequest.sol";
import {FunctionsClient} from "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/FunctionsClient.sol";
import {FunctionsRequest} from "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/libraries/FunctionsRequest.sol";

contract CartCostFunctions is FunctionsClient {
    using FunctionsRequest for FunctionsRequest.Request;

    // State variables to store the last request ID, response, and error
    bytes32 public s_lastRequestId;
    bytes public s_lastResponse;
    bytes public s_lastError;

    // Custom error type
    error UnexpectedRequestID(bytes32 requestId);

    // Event to log responses
    event Response(
        bytes32 indexed requestId,
        uint256 totalCartCost,
        bytes response,
        bytes err
    );

    // Hardcoded for Fuji but changed for Sepolia
    // Supported networks https://docs.chain.link/chainlink-functions/supported-networks
    address router = 0x65Dcc24F8ff9e51F10DCc7Ed1e4e2A61e6E14bd6;
    bytes32 donID =
        0x66756e2d657468657265756d2d6d61696e6e65742d3100000000000000000000;

    // Callback gas limit
    uint32 gasLimit = 300000;

    // Your subscription ID.
    uint64 public s_subscriptionId;

    string public source =
        "const events = JSON.parse(args[0]);"
        "let totalCartCost = 0;"
        "events.forEach(event => {"
        "  if (event.event_name === 'product_added_to_cart') {"
        "    totalCartCost += event.event_data.cartLineCost;"
        "  }"
        "});"
        "return Functions.encodeUint256(totalCartCost);";

    constructor(uint64 subscriptionId) FunctionsClient(router) {
        s_subscriptionId = subscriptionId;
    }

    function getCartCost(
        string memory jsonData
    ) external returns (bytes32 requestId) {

        string[] memory args = new string[](1);
        args[0] = jsonData;

        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(source);
        if (args.length > 0) req.setArgs(args); 

        s_lastRequestId = _sendRequest(
            req.encodeCBOR(),
            s_subscriptionId,
            gasLimit,
            donID
        );

        return s_lastRequestId;
    }

    /**
     * @notice Callback function for fulfilling a request
     * @param requestId The ID of the request to fulfill
     * @param response The HTTP response data
     * @param err Any errors from the Functions request
     */
    function fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) internal override {
        if (s_lastRequestId != requestId) {
            revert UnexpectedRequestID(requestId); // Check if request IDs match
        }
        s_lastError = err;

        // Update the contract's state variables with the response and any errors
        s_lastResponse = response;
        uint256 totalCartCost = abi.decode(response, (uint256));

        // Emit an event to log the response
        emit Response(requestId, totalCartCost, s_lastResponse, s_lastError);
    }
}
