// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";

/**
 * @title MultiGiveaway Contract
 * @notice Manages multiple giveaways with random winner selection using Chainlink VRF
 * @dev Uses Chainlink VRF dashboard for subscription management
 */
contract MultiGiveaway is VRFConsumerBaseV2Plus {

    // ====== Structs ======
    struct Participant {
        string email;
        bool hasWon;
    }

    struct GiveawayData {
        string name;
        bool active;
        bool completed;
        uint256 totalParticipants;
        string winnerEmail;
        uint256 winnerIndex;
        uint256 requestId;
        // No nested mapping here - participants will be stored separately
    }

    // ====== State Variables ======
    mapping(uint256 => GiveawayData) public giveaways;
    mapping(uint256 => mapping(uint256 => Participant)) public giveawayParticipants;
    uint256 public giveawayCount;
    
    // Track which requestId belongs to which giveaway
    mapping(uint256 => uint256) public requestToGiveaway;

    // Admin management
    address private i_owner;
    mapping(address => bool) public admins;

    // ====== Chainlink VRF Configuration ======
    // VRF parameters (managed via dashboard)
    uint256 public s_subscriptionId;
    bytes32 public s_keyHash;
    uint32 public s_callbackGasLimit = 100000;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;

    // ====== Events ======
    event GiveawayCreated(uint256 indexed giveawayId, string name);
    event GiveawayCompleted(uint256 indexed giveawayId);
    event ParticipantAdded(uint256 indexed giveawayId, string email, uint256 indexed index);
    event WinnerRequested(uint256 indexed giveawayId, uint256 requestId);
    event WinnerSelected(uint256 indexed giveawayId, string winnerEmail, uint256 indexed index);
    event RandomWordReceived(uint256 indexed giveawayId, uint256 randomWord);
    event AdminAdded(address indexed admin);
    event AdminRemoved(address indexed admin);
    event KeyHashUpdated(bytes32 oldKeyHash, bytes32 newKeyHash);
    event CallbackGasLimitUpdated(uint32 oldLimit, uint32 newLimit);
    event SubscriptionIdUpdated(uint256 oldId, uint256 newId);
    event contractOwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    // ====== Modifiers ======
    // Use custom modifier name to avoid conflict with inherited onlyOwner
    modifier onlyContractOwner() {
        require(msg.sender == i_owner, "Only owner can call this function");
        _;
    }

    modifier onlyAdminOrOwner() {
        require(i_owner == msg.sender || admins[msg.sender], "Not authorized");
        _;
    }

    modifier onlyAdmin() {
        require(admins[msg.sender], "Not an admin");
        _;
    }

    modifier giveawayExists(uint256 _giveawayId) {
        require(_giveawayId < giveawayCount, "Giveaway does not exist");
        _;
    }

    modifier giveawayActive(uint256 _giveawayId) {
        require(giveaways[_giveawayId].active, "Giveaway is not active");
        _;
    }

    modifier giveawayNotCompleted(uint256 _giveawayId) {
        require(!giveaways[_giveawayId].completed, "Giveaway already completed");
        _;
    }

    modifier subscriptionActive() {
        require(s_subscriptionId != 0, "VRF subscription not active");
        _;
    }

    // ====== Constructor ======
    constructor(
        address vrfCoordinator,
        bytes32 keyHash,
        uint256 subscriptionId
    ) 
        VRFConsumerBaseV2Plus(vrfCoordinator)
    {
        i_owner = msg.sender;
        s_keyHash = keyHash;
        s_subscriptionId = subscriptionId;
    }

    // ====== VRF Configuration ======
    function setKeyHash(bytes32 _keyHash) external onlyAdminOrOwner {
        require(_keyHash != bytes32(0), "Invalid key hash");
        bytes32 oldKeyHash = s_keyHash;
        s_keyHash = _keyHash;
        emit KeyHashUpdated(oldKeyHash, _keyHash);
    }
    
    function setCallbackGasLimit(uint32 _callbackGasLimit) external onlyAdminOrOwner {
        require(_callbackGasLimit > 0, "Gas limit must be greater than 0");
        uint32 oldLimit = s_callbackGasLimit;
        s_callbackGasLimit = _callbackGasLimit;
        emit CallbackGasLimitUpdated(oldLimit, _callbackGasLimit);
    }
    
    function setSubscriptionId(uint256 _subscriptionId) external onlyAdminOrOwner {
        require(_subscriptionId != 0, "Invalid subscription ID");
        uint256 oldId = s_subscriptionId;
        s_subscriptionId = _subscriptionId;
        emit SubscriptionIdUpdated(oldId, _subscriptionId);
    }

    // ====== Giveaway Management ======
    function createGiveaway(string calldata _name) external onlyAdminOrOwner returns (uint256) {
        uint256 giveawayId = giveawayCount;
        
        GiveawayData storage newGiveaway = giveaways[giveawayId];
        newGiveaway.name = _name;
        newGiveaway.active = true;
        newGiveaway.completed = false;
        newGiveaway.totalParticipants = 0;
        
        emit GiveawayCreated(giveawayId, _name);
        giveawayCount++;
        
        return giveawayId;
    }

    function setGiveawayActive(uint256 _giveawayId, bool _active) 
        external 
        onlyAdminOrOwner 
        giveawayExists(_giveawayId)
        giveawayNotCompleted(_giveawayId)
    {
        giveaways[_giveawayId].active = _active;
    }

    // ====== Participant Management ======
    function addParticipant(uint256 _giveawayId, string calldata _email) 
        external 
        onlyAdmin 
        giveawayExists(_giveawayId)
        giveawayActive(_giveawayId)
        giveawayNotCompleted(_giveawayId)
    {
        require(bytes(_email).length > 0, "Invalid email");
        
        GiveawayData storage giveaway = giveaways[_giveawayId];
        uint256 participantIndex = giveaway.totalParticipants;
        
        giveawayParticipants[_giveawayId][participantIndex] = Participant(_email, false);
        emit ParticipantAdded(_giveawayId, _email, participantIndex);
        
        giveaway.totalParticipants++;
    }
    
    function batchAddParticipants(uint256 _giveawayId, string[] calldata _emails)
        external
        onlyAdmin
        giveawayExists(_giveawayId)
        giveawayActive(_giveawayId)
        giveawayNotCompleted(_giveawayId)
    {
        GiveawayData storage giveaway = giveaways[_giveawayId];
        uint256 startIndex = giveaway.totalParticipants;
        
        for (uint256 i = 0; i < _emails.length; i++) {
            require(bytes(_emails[i]).length > 0, "Invalid email in batch");
            
            uint256 participantIndex = startIndex + i;
            giveawayParticipants[_giveawayId][participantIndex] = Participant(_emails[i], false);
            emit ParticipantAdded(_giveawayId, _emails[i], participantIndex);
        }
        
        giveaway.totalParticipants += _emails.length;
    }

    // ====== Trigger Winner Selection (Chainlink VRF) ======
    function drawWinner(uint256 _giveawayId) 
        external 
        onlyAdmin 
        giveawayExists(_giveawayId)
        giveawayActive(_giveawayId)
        giveawayNotCompleted(_giveawayId)
        subscriptionActive
    {
        GiveawayData storage giveaway = giveaways[_giveawayId];
        require(giveaway.totalParticipants > 0, "No participants yet");
        
        uint256 requestId = s_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: s_keyHash,
                subId: s_subscriptionId,
                requestConfirmations: REQUEST_CONFIRMATIONS,
                callbackGasLimit: s_callbackGasLimit,
                numWords: NUM_WORDS,
                extraArgs: VRFV2PlusClient._argsToBytes(
                    // Use native payment since we're managing subscription via dashboard
                    VRFV2PlusClient.ExtraArgsV1({nativePayment: true})
                )
            })
        );
        
        requestToGiveaway[requestId] = _giveawayId;
        giveaway.requestId = requestId;
        
        emit WinnerRequested(_giveawayId, requestId);
    }

    // ====== Callback Function (Chainlink VRF) ======
    function fulfillRandomWords(
        uint256 _requestId,
        uint256[] calldata randomWords
    ) internal override {
        uint256 giveawayId = requestToGiveaway[_requestId];
        GiveawayData storage giveaway = giveaways[giveawayId];
        
        require(giveaway.totalParticipants > 0, "No participants available");
        
        // Emit the raw random value for debugging
        emit RandomWordReceived(giveawayId, randomWords[0]);
        
        uint256 winnerIndex = randomWords[0] % giveaway.totalParticipants;
        string memory winnerEmail = giveawayParticipants[giveawayId][winnerIndex].email;
        
        giveaway.winnerIndex = winnerIndex;
        giveaway.winnerEmail = winnerEmail;
        giveawayParticipants[giveawayId][winnerIndex].hasWon = true;
        giveaway.completed = true;
        // Auto-close giveaway when winner is drawn
        giveaway.active = false;
        
        emit WinnerSelected(giveawayId, winnerEmail, winnerIndex);
        emit GiveawayCompleted(giveawayId);
    }

    // ====== NEW: Get All Giveaways At Once ======
    function getAllGiveaways() external view returns (
        uint256[] memory ids,
        string[] memory names,
        bool[] memory actives,
        bool[] memory completeds,
        uint256[] memory participantCounts,
        string[] memory winners
    ) {
        uint256 count = giveawayCount;
        
        ids = new uint256[](count);
        names = new string[](count);
        actives = new bool[](count);
        completeds = new bool[](count);
        participantCounts = new uint256[](count);
        winners = new string[](count);
        
        for (uint256 i = 0; i < count; i++) {
            GiveawayData storage giveaway = giveaways[i];
            
            ids[i] = i;
            names[i] = giveaway.name;
            actives[i] = giveaway.active;
            completeds[i] = giveaway.completed;
            participantCounts[i] = giveaway.totalParticipants;
            winners[i] = giveaway.winnerEmail;
        }
        
        return (ids, names, actives, completeds, participantCounts, winners);
    }
    
    // ====== NEW: Get All Participants For A Giveaway ======
    function getAllParticipants(uint256 _giveawayId) 
        external 
        view 
        giveawayExists(_giveawayId)
        returns (string[] memory emails, bool[] memory hasWon) 
    {
        uint256 count = giveaways[_giveawayId].totalParticipants;
        
        emails = new string[](count);
        hasWon = new bool[](count);
        
        for (uint256 i = 0; i < count; i++) {
            Participant storage participant = giveawayParticipants[_giveawayId][i];
            emails[i] = participant.email;
            hasWon[i] = participant.hasWon;
        }
        
        return (emails, hasWon);
    }

    // ====== Utility Functions ======
    function getGiveawayParticipant(uint256 _giveawayId, uint256 _index) 
        external 
        view 
        giveawayExists(_giveawayId)
        returns (string memory, bool) 
    {
        require(_index < giveaways[_giveawayId].totalParticipants, "Participant index out of bounds");
        Participant memory p = giveawayParticipants[_giveawayId][_index];
        return (p.email, p.hasWon);
    }

    function getGiveawayParticipantsCount(uint256 _giveawayId) 
        external 
        view 
        giveawayExists(_giveawayId)
        returns (uint256) 
    {
        return giveaways[_giveawayId].totalParticipants;
    }

    function getGiveawayWinner(uint256 _giveawayId) 
        external 
        view 
        giveawayExists(_giveawayId)
        returns (string memory, uint256) 
    {
        GiveawayData storage giveaway = giveaways[_giveawayId];
        return (giveaway.winnerEmail, giveaway.winnerIndex);
    }

    function getGiveawayDetails(uint256 _giveawayId)
        external
        view
        giveawayExists(_giveawayId)
        returns (
            string memory name,
            bool active,
            bool completed,
            uint256 totalParticipants,
            string memory winner
        )
    {
        GiveawayData storage giveaway = giveaways[_giveawayId];
        return (
            giveaway.name,
            giveaway.active,
            giveaway.completed,
            giveaway.totalParticipants,
            giveaway.winnerEmail
        );
    }

    // ====== Admin Management ======
    function addAdmin(address _admin) external onlyContractOwner {
        require(_admin != address(0), "Invalid address");
        require(!admins[_admin], "Already an admin");
        admins[_admin] = true;
        emit AdminAdded(_admin);
    }

    function removeAdmin(address _admin) external onlyContractOwner {
        require(admins[_admin], "Not an admin");
        admins[_admin] = false;
        emit AdminRemoved(_admin);
    }

    // ====== View Role Info ======
    function isAdmin(address _addr) external view returns (bool) {
        return admins[_addr];
    }
    
    function getContractOwner() external view returns (address) {
        return i_owner;
    }
    
    // ====== View Chainlink Config ======
    function getChainlinkConfig() external view returns (
        address coordinator,
        uint256 subId,
        bytes32 hash,
        uint32 gasLimit,
        uint16 confirmations
    ) {
        return (
            address(s_vrfCoordinator),
            s_subscriptionId,
            s_keyHash,
            s_callbackGasLimit,
            REQUEST_CONFIRMATIONS
        );
    }
	function transferContractOwnership(address _newOwner) external onlyContractOwner {
    require(_newOwner != address(0), "New owner cannot be zero address");
    address oldOwner = i_owner;
    i_owner = _newOwner;
    emit contractOwnershipTransferred(oldOwner, _newOwner);
}
}