// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {FunctionsClient} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/FunctionsClient.sol";
import {FunctionsRequest} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/libraries/FunctionsRequest.sol";

contract CartCostFunctions is FunctionsClient {
    using FunctionsRequest for FunctionsRequest.Request;

    bytes32 public lastRequestId;
    bytes public lastResponse;
    bytes public lastError;

    struct RequestStatus {
        bool fulfilled;
        bool exists;
        bytes response;
        bytes err;
        string functionToCall;
    }
    mapping(bytes32 => RequestStatus) public requests;
    bytes32[] public requestIds;

    event Response(
        bytes32 indexed requestId,
        string data,
        bytes response,
        bytes err
    );

    address router = 0xb83E47C2bC239B3bf370bc41e1459A34b41238D0;
    bytes32 donID = 0x66756e2d657468657265756d2d7365706f6c69612d3100000000000000000000;
    uint32 gasLimit = 300000;
    uint64 public subscriptionId;

    string public source =
        "const apiResponse = await Functions.makeHttpRequest({"
        "url: `https://9172-213-214-42-42.ngrok-free.app/stats`,"
        "responseType: 'json'"
        "});"
        "if (apiResponse.error) {"
        "throw Error('Request failed');"
        "}"
        "const { cartLineCostSum, productViewedCount, checkoutCompletedCount, totalTransactionAmount } = apiResponse.data;"
        "const functionToCall = args[0];"
        "switch(functionToCall) {"
        "  case 'cartLineCostSum':"
        "    return Functions.encodeString(cartLineCostSum.toString());"
        "  case 'productViewedCount':"
        "    return Functions.encodeString(productViewedCount.toString());"
        "  case 'checkoutCompletedCount':"
        "    return Functions.encodeString(checkoutCompletedCount.toString());"
        "  case 'totalTransactionAmount':"
        "    return Functions.encodeString(totalTransactionAmount.toString());"
        "  default:"
        "    throw Error('Invalid function call');"
        "}";

    struct StatsStruct {
        string cartLineCostSum;
        string productViewedCount;
        string checkoutCompletedCount;
        string totalTransactionAmount;
        uint timestamp;
    }
    StatsStruct public stats;

    constructor(uint64 functionsSubscriptionId) FunctionsClient(router) {
        subscriptionId = functionsSubscriptionId;
    }

    function requestStat(string memory functionToCall) external returns (bytes32 requestId) {
        string[] memory args = new string[](1);
        args[0] = functionToCall;

        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(source);
        req.setArgs(args);

        lastRequestId = _sendRequest(
            req.encodeCBOR(),
            subscriptionId,
            gasLimit,
            donID
        );

        requests[lastRequestId] = RequestStatus({
            exists: true,
            fulfilled: false,
            response: "",
            err: "",
            functionToCall: functionToCall
        });
        requestIds.push(lastRequestId);

        return lastRequestId;
    }

    function fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) internal override {
        require(requests[requestId].exists, "request not found");

        lastError = err;
        lastResponse = response;

        requests[requestId].fulfilled = true;
        requests[requestId].response = response;
        requests[requestId].err = err;

        string memory data = string(response);
        string memory functionToCall = requests[requestId].functionToCall;

        if (compareStrings(functionToCall, "cartLineCostSum")) {
            stats.cartLineCostSum = data;
        } else if (compareStrings(functionToCall, "productViewedCount")) {
            stats.productViewedCount = data;
        } else if (compareStrings(functionToCall, "checkoutCompletedCount")) {
            stats.checkoutCompletedCount = data;
        } else if (compareStrings(functionToCall, "totalTransactionAmount")) {
            stats.totalTransactionAmount = data;
        }

        stats.timestamp = block.timestamp;

        emit Response(requestId, data, lastResponse, lastError);
    }

    function compareStrings(string memory a, string memory b) internal pure returns (bool) {
        return keccak256(bytes(a)) == keccak256(bytes(b));
    }

    function getStats() external view returns (StatsStruct memory) {
        return stats;
    }
}
