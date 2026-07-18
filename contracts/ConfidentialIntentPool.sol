// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Nox, euint256, externalEuint256} from "@iexec-nox/nox-protocol-contracts/contracts/sdk/Nox.sol";

/// @title ConfidentialIntentPool - Encrypted DeFi Intent Queue
/// @notice Stores user intents (swap, lend) as encrypted data. Intent amounts are
/// hidden using Nox encrypted types. The pool processes intents in batches,
/// grouping compatible operations to maximize privacy (individual amounts are
/// never revealed on-chain).
/// @dev Each intent has an encrypted amount and public metadata (token pair, type, deadline).
///      The public metadata enables intent matching without revealing trade sizes.
contract ConfidentialIntentPool {
    // ─── Types ───────────────────────────────────────────────────────

    enum IntentType {
        SWAP,
        LEND,
        WITHDRAW_LEND
    }

    enum IntentStatus {
        PENDING,
        BATCHED,
        EXECUTED,
        CANCELLED,
        EXPIRED
    }

    struct Intent {
        uint256 id;
        address user;
        IntentType intentType;
        address tokenIn;
        address tokenOut;
        euint256 encryptedAmount; // Hidden from public view
        uint256 deadline;
        IntentStatus status;
        uint256 batchId;
        uint256 createdAt;
    }

    struct Batch {
        uint256 id;
        uint256[] intentIds;
        address tokenIn;
        address tokenOut;
        IntentType intentType;
        uint256 executedAt;
        bool executed;
    }

    // ─── State ───────────────────────────────────────────────────────

    /// @notice All intents indexed by ID
    mapping(uint256 => Intent) public intents;
    uint256 public nextIntentId;

    /// @notice All batches indexed by ID
    mapping(uint256 => Batch) public batches;
    uint256 public nextBatchId;

    /// @notice Pending intent IDs grouped by (tokenIn, tokenOut, intentType) for batching
    /// @dev Key is keccak256(abi.encodePacked(tokenIn, tokenOut, intentType))
    mapping(bytes32 => uint256[]) private _pendingIntents;

    /// @notice User's intent IDs
    mapping(address => uint256[]) public userIntents;

    /// @notice Authorized router that can form and execute batches
    address public router;

    /// @notice Minimum intents needed to form a batch
    uint256 public minBatchSize;

    /// @notice Maximum intents per batch
    uint256 public maxBatchSize;

    // ─── Events ──────────────────────────────────────────────────────

    /// @notice Emitted when a new intent is submitted (amount is NOT included — it's encrypted)
    event IntentSubmitted(
        uint256 indexed intentId,
        address indexed user,
        IntentType intentType,
        address tokenIn,
        address tokenOut,
        uint256 deadline
    );

    event IntentCancelled(uint256 indexed intentId, address indexed user);
    event BatchFormed(
        uint256 indexed batchId,
        uint256 intentCount,
        address tokenIn,
        address tokenOut
    );
    event BatchExecuted(uint256 indexed batchId, uint256 timestamp);

    // ─── Errors ──────────────────────────────────────────────────────
    error Unauthorized();
    error InvalidDeadline();
    error IntentNotPending();
    error NotIntentOwner();
    error BatchAlreadyExecuted();

    modifier onlyRouter() {
        if (msg.sender != router) revert Unauthorized();
        _;
    }

    constructor(address _router, uint256 _minBatchSize, uint256 _maxBatchSize) {
        router = _router;
        minBatchSize = _minBatchSize;
        maxBatchSize = _maxBatchSize;
    }

    // ─── Intent Submission ───────────────────────────────────────────

    /// @notice Submit an encrypted DeFi intent
    /// @param intentType The type of operation (SWAP, LEND, WITHDRAW_LEND)
    /// @param tokenIn Input token address
    /// @param tokenOut Output token address
    /// @param encryptedAmount Encrypted amount handle from Nox JS SDK
    /// @param inputProof Proof that the encryption is valid
    /// @param deadline Block timestamp after which the intent expires
    /// @return intentId The unique ID of the submitted intent
    function submitIntent(
        IntentType intentType,
        address tokenIn,
        address tokenOut,
        externalEuint256 encryptedAmount,
        bytes calldata inputProof,
        uint256 deadline
    ) external returns (uint256 intentId) {
        if (deadline <= block.timestamp) revert InvalidDeadline();

        // Verify and convert the encrypted amount
        euint256 amount = Nox.fromExternal(encryptedAmount, inputProof);

        intentId = nextIntentId++;

        // Store the intent with encrypted amount
        intents[intentId] = Intent({
            id: intentId,
            user: msg.sender,
            intentType: intentType,
            tokenIn: tokenIn,
            tokenOut: tokenOut,
            encryptedAmount: amount,
            deadline: deadline,
            status: IntentStatus.PENDING,
            batchId: 0,
            createdAt: block.timestamp
        });

        // Grant permissions: contract can use the handle, user can decrypt
        Nox.allowThis(amount);
        Nox.allow(amount, msg.sender);
        // Allow router to access for batch processing
        Nox.allow(amount, router);

        // Add to pending queue for matching
        bytes32 poolKey = _getPoolKey(tokenIn, tokenOut, intentType);
        _pendingIntents[poolKey].push(intentId);

        // Track user's intents
        userIntents[msg.sender].push(intentId);

        emit IntentSubmitted(
            intentId,
            msg.sender,
            intentType,
            tokenIn,
            tokenOut,
            deadline
        );
    }

    /// @notice Cancel a pending intent
    function cancelIntent(uint256 intentId) external {
        Intent storage intent = intents[intentId];
        if (intent.user != msg.sender) revert NotIntentOwner();
        if (intent.status != IntentStatus.PENDING) revert IntentNotPending();

        intent.status = IntentStatus.CANCELLED;
        emit IntentCancelled(intentId, msg.sender);
    }

    // ─── Batch Formation (Router Only) ───────────────────────────────

    /// @notice Form a batch from pending intents of the same type/pair
    /// @param tokenIn Input token for this batch
    /// @param tokenOut Output token for this batch
    /// @param intentType Type of intents to batch
    /// @return batchId The formed batch ID
    function formBatch(
        address tokenIn,
        address tokenOut,
        IntentType intentType
    ) external onlyRouter returns (uint256 batchId) {
        bytes32 poolKey = _getPoolKey(tokenIn, tokenOut, intentType);
        uint256[] storage pending = _pendingIntents[poolKey];

        // Collect valid (non-expired, still pending) intents
        uint256[] memory validIntentIds = new uint256[](pending.length);
        uint256 validCount = 0;

        for (uint256 i = 0; i < pending.length && validCount < maxBatchSize; i++) {
            Intent storage intent = intents[pending[i]];
            if (
                intent.status == IntentStatus.PENDING &&
                intent.deadline > block.timestamp
            ) {
                validIntentIds[validCount] = pending[i];
                validCount++;
            }
        }

        require(validCount >= minBatchSize, "Insufficient intents for batch");

        batchId = nextBatchId++;

        // Create batch with valid intent IDs
        uint256[] memory batchIntentIds = new uint256[](validCount);
        for (uint256 i = 0; i < validCount; i++) {
            batchIntentIds[i] = validIntentIds[i];
            intents[validIntentIds[i]].status = IntentStatus.BATCHED;
            intents[validIntentIds[i]].batchId = batchId;
        }

        batches[batchId] = Batch({
            id: batchId,
            intentIds: batchIntentIds,
            tokenIn: tokenIn,
            tokenOut: tokenOut,
            intentType: intentType,
            executedAt: 0,
            executed: false
        });

        // Clear pending queue
        delete _pendingIntents[poolKey];

        emit BatchFormed(batchId, validCount, tokenIn, tokenOut);
    }

    /// @notice Mark a batch as executed by the router
    function markBatchExecuted(uint256 batchId) external onlyRouter {
        Batch storage batch = batches[batchId];
        if (batch.executed) revert BatchAlreadyExecuted();

        batch.executed = true;
        batch.executedAt = block.timestamp;

        // Mark all intents in the batch as executed
        for (uint256 i = 0; i < batch.intentIds.length; i++) {
            intents[batch.intentIds[i]].status = IntentStatus.EXECUTED;
        }

        emit BatchExecuted(batchId, block.timestamp);
    }

    // ─── View Functions ──────────────────────────────────────────────

    /// @notice Get the encrypted amount handle for an intent
    /// @dev Only the intent owner can decrypt this using the Nox JS SDK
    function getIntentAmount(
        uint256 intentId
    ) external view returns (euint256) {
        return intents[intentId].encryptedAmount;
    }

    /// @notice Get number of pending intents for a token pair + type
    function getPendingCount(
        address tokenIn,
        address tokenOut,
        IntentType intentType
    ) external view returns (uint256) {
        bytes32 poolKey = _getPoolKey(tokenIn, tokenOut, intentType);
        return _pendingIntents[poolKey].length;
    }

    /// @notice Get all intent IDs for a user
    function getUserIntentIds(
        address user
    ) external view returns (uint256[] memory) {
        return userIntents[user];
    }

    /// @notice Get intent IDs in a batch
    function getBatchIntentIds(
        uint256 batchId
    ) external view returns (uint256[] memory) {
        return batches[batchId].intentIds;
    }

    // ─── Internal ────────────────────────────────────────────────────

    function _getPoolKey(
        address tokenIn,
        address tokenOut,
        IntentType intentType
    ) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(tokenIn, tokenOut, intentType));
    }
}
