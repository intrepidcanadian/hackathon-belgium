// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;


import {IVRFCoordinatorV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/interfaces/IVRFCoordinatorV2Plus.sol";
import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";


contract RandomGenerator is VRFConsumerBaseV2Plus {

    //VRF
    event RequestSent(uint256 requestId, uint32 numWords);
    event RequestFulfilled(uint256 requestId, uint256[] randomWords);

    struct RequestStatus {
        bool fulfilled; // whether the request has been successfully fulfilled
        bool exists; // whether a requestId exists
        uint256[] randomWords;
    }
    mapping(uint256 => RequestStatus) public s_requests; /* requestId --> requestStatus */   

    // https://docs.chain.link/vrf/v2/subscription/supported-networks
    // Fuji coordinator switched to sepolia
    // 0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625
    // 0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c
    // https://docs.chain.link/vrf/v2-5/supported-networks#avalanche-fuji-testnet
    IVRFCoordinatorV2Plus COORDINATOR;
    // sepolia 
    address vrfCoordinator = 0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625;
    bytes32 keyHash = 0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c;
    uint32 callbackGasLimit = 2500000;
    uint16 requestConfirmations = 3;
    uint32 numWords =  1;

    // past requests Ids.
    uint256[] public requestIds;
    uint256 public lastRequestId;
    uint256[] public lastRandomWords;

    // Your subscription ID.
    uint256 public s_subscriptionId;

    uint256[] public raffleResult;
    uint256 public maximum = 100;    // Raffle until this number

    constructor(uint256 subscriptionId) 
        VRFConsumerBaseV2Plus(vrfCoordinator) 
    {
        COORDINATOR = IVRFCoordinatorV2Plus(vrfCoordinator);
        s_subscriptionId = subscriptionId;
    }

    function listNumbers() public view returns (uint256[] memory) {
        return raffleResult;
    }

    // Example: I'd like to have 2 numbers (amount) in 10 (maximum)
    function run(uint32 _amount, uint _maximum) public returns (uint256 requestId) {
        // Will revert if subscription is not set and funded.
        numWords = _amount;
        maximum = _maximum;
        requestId = COORDINATOR.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: keyHash,
                subId: s_subscriptionId,
                requestConfirmations: requestConfirmations,
                callbackGasLimit: callbackGasLimit,
                numWords: numWords,
                extraArgs: VRFV2PlusClient._argsToBytes(VRFV2PlusClient.ExtraArgsV1({nativePayment: false}))
            })
        );
        s_requests[requestId] = RequestStatus({
            randomWords: new uint256[](0),
            exists: true,
            fulfilled: false
        });
        requestIds.push(requestId);
        lastRequestId = requestId;
        emit RequestSent(requestId, numWords);
        return requestId;      
    }
 
    function fulfillRandomWords(uint256 _requestId, uint256[] calldata _randomWords) internal override {
        require(s_requests[_requestId].exists, "request not found");
        s_requests[_requestId].fulfilled = true;
        s_requests[_requestId].randomWords = _randomWords;
        lastRandomWords = _randomWords;

        uint aux;
        for (uint i = 0; i < numWords; i++) {
            aux = _randomWords[i] % maximum + 1;
            raffleResult.push(aux);
        }
    }

}