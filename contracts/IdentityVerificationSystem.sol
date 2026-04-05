// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title SecureIdentityVerificationSystem
 * @dev Enhanced version with public on-chain verification
 */
contract SecureIdentityVerificationSystem is AccessControl, ReentrancyGuard {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    uint256 public constant SCORE_WEIGHT_USAGE = 25;
    uint256 public constant SCORE_WEIGHT_RELIABILITY = 30;
    uint256 public constant SCORE_WEIGHT_TRANSPARENCY = 15;
    uint256 public constant SCORE_RECENCY_PERIOD = 30 days;
    uint256 public constant SCORE_POINTS_RECENT = 30;
    uint256 public constant SCORE_POINTS_STALE = 10;

    struct Transaction {
        uint256 timestamp;
        string action;
    }

    struct UserInfo {
        bytes32 uniqueId;
        bytes32 emailHash;
        bool hasEmail;
        bool isAuthorized;
        Transaction[] transactions;
        bool isRestricted;
    }

    struct IdentityScore {
        uint256 usageFrequency;
        uint256 issuerReliability;
        uint256 lastVerification;
        uint256 transparencyScore;
        uint256 totalScore;
    }

    uint256 private userIdCounter;
    mapping(address => UserInfo) private users;
    mapping(bytes32 => address) public userAddressesByUniqueId;
    mapping(bytes32 => IdentityScore) public scores;
    mapping(bytes32 => bytes) private encryptedEmails;

    event UserAuthorized(address indexed userAddress, bytes32 uniqueId);
    event UserAuthorizationRevoked(address indexed userAddress, bytes32 uniqueId);
    event ProfileUpdated(address indexed userAddress, bytes32 uniqueId);
    event EmailVerified(bytes32 indexed uniqueId, bytes32 emailHash);
    event ScoreUpdated(bytes32 indexed uniqueId, uint256 newTotalScore);
    event TransactionAdded(address indexed userAddress, bytes32 indexed uniqueId, uint256 timestamp, string action);
    event VerificationActivityRecorded(bytes32 indexed uniqueId, uint256 timestamp);
    event TransactionDetails(
        bytes32 indexed uniqueId,
        uint256 amount,
        string transactionType,
        string merchantCategory,
        string deviceHash,
        string location,
        string paymentChannel,
        uint256 timestamp
    );

    event IdentityVerified(bytes32 indexed uniqueId, bool isAuthorized, uint256 lastVerification, uint256 totalScore);
    event AnomalyFlagged(bytes32 indexed uniqueId, string reason, uint256 timestamp);
    event AccountRestricted(bytes32 indexed uniqueId, string reason);
    event AccountUnrestricted(bytes32 indexed uniqueId);

    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, msg.sender), "IVS: Caller is not an admin");
        _;
    }

    modifier onlyAuthorizedUser() {
        require(users[msg.sender].isAuthorized, "IVS: User is not authorized");
        require(!users[msg.sender].isRestricted, "IVS: User account is restricted due to anomaly");
        _;
    }

    modifier onlyUserWithId(bytes32 _uniqueId) {
        require(userAddressesByUniqueId[_uniqueId] == msg.sender, "IVS: Caller does not own this unique ID");
        _;
    }

    constructor(address initialAdmin) {
        _grantRole(DEFAULT_ADMIN_ROLE, initialAdmin);
        _grantRole(ADMIN_ROLE, initialAdmin);
        userIdCounter = 1;
    }

    function authorizeUser(address _userAddress) external onlyAdmin {
        require(!users[_userAddress].isAuthorized, "IVS: User is already authorized");

        bytes32 uniqueId = _generateUniqueId(_userAddress);
        users[_userAddress].uniqueId = uniqueId;
        users[_userAddress].isAuthorized = true;
        userAddressesByUniqueId[uniqueId] = _userAddress;

        emit UserAuthorized(_userAddress, uniqueId);
    }

    function revokeAuthorization(address _userAddress) external onlyAdmin {
        require(users[_userAddress].isAuthorized, "IVS: User is not currently authorized");
        bytes32 uniqueId = users[_userAddress].uniqueId;
        users[_userAddress].isAuthorized = false;
        emit UserAuthorizationRevoked(_userAddress, uniqueId);
    }

    function setIssuerReliability(bytes32 _uniqueId, uint256 _reliability) external onlyAdmin {
        require(_reliability <= 10, "IVS: Reliability must be between 0 and 10");
        scores[_uniqueId].issuerReliability = _reliability;
        scores[_uniqueId].issuerReliability = _reliability;
    }

    function flagAnomaly(bytes32 _uniqueId, string memory _reason) external onlyAdmin {
        address userAddress = userAddressesByUniqueId[_uniqueId];
        require(userAddress != address(0), "IVS: Unique ID not found");
        
        users[userAddress].isRestricted = true;
        
        emit AnomalyFlagged(_uniqueId, _reason, block.timestamp);
        emit AccountRestricted(_uniqueId, _reason);
    }

    function liftRestriction(bytes32 _uniqueId) external onlyAdmin {
        address userAddress = userAddressesByUniqueId[_uniqueId];
        require(userAddress != address(0), "IVS: Unique ID not found");
        
        users[userAddress].isRestricted = false;
        emit AccountUnrestricted(_uniqueId);
    }

    function updateProfileHash(string memory _email) external onlyAuthorizedUser {
        UserInfo storage user = users[msg.sender];
        user.emailHash = keccak256(abi.encodePacked(_email));
        user.hasEmail = true;

        emit ProfileUpdated(msg.sender, user.uniqueId);
        emit EmailVerified(user.uniqueId, user.emailHash);
    }

    function updateProfileEncrypted(bytes memory _encryptedEmail) external onlyAuthorizedUser {
        bytes32 uniqueId = users[msg.sender].uniqueId;
        encryptedEmails[uniqueId] = _encryptedEmail;
        users[msg.sender].hasEmail = true;

        emit ProfileUpdated(msg.sender, uniqueId);
    }

    function verifyEmailOwnership(string memory _email) external view onlyAuthorizedUser returns (bool) {
        bytes32 providedHash = keccak256(abi.encodePacked(_email));
        return users[msg.sender].emailHash == providedHash;
    }

    function adminVerifyEmailHash(bytes32 _uniqueId, bytes32 _emailHash) external view onlyAdmin returns (bool) {
        address userAddress = userAddressesByUniqueId[_uniqueId];
        return users[userAddress].emailHash == _emailHash;
    }

        // In production, we might want to store minimal data on-chain and emit full data in events
        // to save gas. The event already emits the action.
        user.transactions.push(Transaction({timestamp: timestamp, action: _action}));
        scores[uniqueId].usageFrequency++;

        // Emit enhanced event for off-chain listener (ML model)
        // Note: Actual detailed features (device, location) should be passed as params if needed on-chain
        // But for this request, assuming we trust the caller (user app) to emit them via event if we change signature
        // or we just rely on the 'action' string containing a JSON or formatted string.
        // Let's overload transact to accept more data for the ML model.
    }
    
    function submitTransaction(
        uint256 _amount,
        string memory _modelAction, // Maps to transaction_type
        string memory _merchantCategory,
        string memory _deviceHash,
        string memory _location,
        string memory _paymentChannel
    ) external nonReentrant onlyAuthorizedUser {
        UserInfo storage user = users[msg.sender];
        bytes32 uniqueId = user.uniqueId;
        uint256 timestamp = block.timestamp;

        // Store a lightweight record on-chain
        user.transactions.push(Transaction({timestamp: timestamp, action: _modelAction}));
        scores[uniqueId].usageFrequency++;

        // Emit core event
        emit TransactionAdded(msg.sender, uniqueId, timestamp, _modelAction);

        // Emit detailed event for Off-Chain ML Listener
        emit TransactionDetails(
            uniqueId,
            _amount,
            _modelAction,
            _merchantCategory,
            _deviceHash,
            _location,
            _paymentChannel,
            timestamp
        );
    }

    function recordVerificationActivity() external nonReentrant onlyAuthorizedUser {
        bytes32 uniqueId = users[msg.sender].uniqueId;
        scores[uniqueId].lastVerification = block.timestamp;
        scores[uniqueId].transparencyScore++;
        emit VerificationActivityRecorded(uniqueId, block.timestamp);
    }

    function calculateScore() external onlyAuthorizedUser {
        bytes32 uniqueId = users[msg.sender].uniqueId;
        IdentityScore storage score = scores[uniqueId];

        uint256 weightedUsage = score.usageFrequency * SCORE_WEIGHT_USAGE;
        uint256 weightedReliability = score.issuerReliability * SCORE_WEIGHT_RELIABILITY;
        uint256 weightedTransparency = score.transparencyScore * SCORE_WEIGHT_TRANSPARENCY;

        uint256 weightedRecency = (block.timestamp - score.lastVerification < SCORE_RECENCY_PERIOD)
            ? SCORE_POINTS_RECENT
            : SCORE_POINTS_STALE;

        score.totalScore = weightedUsage + weightedReliability + weightedRecency + weightedTransparency;
        emit ScoreUpdated(uniqueId, score.totalScore);
    }

    function verifyIdentityOnChain(bytes32 _uniqueId)
        external
        returns (bool isAuthorized, uint256 lastVerification, uint256 totalScore)
    {
        IdentityScore memory score = scores[_uniqueId];
        address userAddress = userAddressesByUniqueId[_uniqueId];
        UserInfo memory user = users[userAddress];

        emit IdentityVerified(_uniqueId, user.isAuthorized, score.lastVerification, score.totalScore);
        return (user.isAuthorized, score.lastVerification, score.totalScore);
    }

    function viewScore(bytes32 _uniqueId) external view returns (IdentityScore memory) {
        return scores[_uniqueId];
    }

    function viewMyInfo() external view onlyAuthorizedUser returns (UserInfo memory) {
        return users[msg.sender];
    }

    function getMyEmailHash() external view onlyAuthorizedUser returns (bytes32) {
        return users[msg.sender].emailHash;
    }

    function getMyEncryptedEmail() external view onlyAuthorizedUser returns (bytes memory) {
        return encryptedEmails[users[msg.sender].uniqueId];
    }

    function viewMyTransactions() external view onlyAuthorizedUser returns (Transaction[] memory) {
        return users[msg.sender].transactions;
    }

    function getMyUniqueId() external view onlyAuthorizedUser returns (bytes32) {
        return users[msg.sender].uniqueId;
    }

    // --- Internal ---
    function _generateUniqueId(address _userAddress) internal returns (bytes32) {
        return keccak256(abi.encodePacked(_userAddress, userIdCounter++));
    }
}
