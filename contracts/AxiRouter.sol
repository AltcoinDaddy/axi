// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Nox, euint256, externalEuint256} from "@iexec-nox/nox-protocol-contracts/contracts/sdk/Nox.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ConfidentialIntentPool} from "./ConfidentialIntentPool.sol";
import {AxiVault} from "./AxiVault.sol";
import {IUniswapV3Router} from "./interfaces/IUniswapV3Router.sol";
import {IAavePool} from "./interfaces/IAavePool.sol";

/// @title AxiRouter - Private DeFi Intent Router
/// @notice The core orchestrator of the Axi protocol. Routes encrypted
/// DeFi intents (swaps, lending) through Nox confidential contracts and
/// executes them on public DeFi protocols (Uniswap, Aave) without revealing
/// individual user strategies, amounts, or timing.
///
/// Privacy Flow:
/// 1. User encrypts intent amount using Nox JS SDK
/// 2. Encrypted intent is submitted to the ConfidentialIntentPool
/// 3. Router forms batches of compatible intents
/// 4. Batched operations are executed on DeFi protocols as a single trade
/// 5. Results are distributed back to users with encrypted output amounts
///
/// @dev Only the router admin can trigger batch execution. In production,
///      this would be automated via a keeper or TEE-based automation.
contract AxiRouter {
    using SafeERC20 for IERC20;

    // ─── State ───────────────────────────────────────────────────────

    address public owner;

    /// @notice The confidential intent pool contract
    ConfidentialIntentPool public intentPool;

    /// @notice The confidential vault contract
    AxiVault public vault;

    /// @notice Uniswap V3 SwapRouter
    address public uniswapRouter;

    /// @notice Aave V3 Pool
    address public aavePool;

    /// @notice Total batches executed
    uint256 public totalBatchesExecuted;

    /// @notice Total intents processed
    uint256 public totalIntentsProcessed;

    /// @notice Estimated MEV saved (in wei, for dashboard display)
    uint256 public totalMEVSaved;

    /// @notice Fee in basis points (e.g., 30 = 0.3%)
    uint256 public feeBps;
    uint256 public constant MAX_FEE_BPS = 100; // 1% max
    uint256 public constant BPS_DENOMINATOR = 10000;

    /// @notice Batch execution results (batchId => token => total amount)
    mapping(uint256 => mapping(address => uint256)) public batchResults;

    // ─── Events ──────────────────────────────────────────────────────

    event BatchSwapExecuted(
        uint256 indexed batchId,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 totalAmountIn,
        uint256 totalAmountOut,
        uint256 intentCount
    );

    event BatchLendExecuted(
        uint256 indexed batchId,
        address indexed token,
        uint256 totalAmount,
        uint256 intentCount
    );

    event IntentPoolUpdated(address indexed newPool);
    event VaultUpdated(address indexed newVault);
    event FeeUpdated(uint256 newFeeBps);

    // ─── Errors ──────────────────────────────────────────────────────
    error Unauthorized();
    error InvalidAddress();
    error FeeTooHigh();
    error BatchEmpty();
    error SwapFailed();

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    constructor(
        address _uniswapRouter,
        address _aavePool,
        uint256 _feeBps
    ) {
        if (_feeBps > MAX_FEE_BPS) revert FeeTooHigh();
        owner = msg.sender;
        uniswapRouter = _uniswapRouter;
        aavePool = _aavePool;
        feeBps = _feeBps;
    }

    // ─── Admin ───────────────────────────────────────────────────────

    function setIntentPool(address _pool) external onlyOwner {
        if (_pool == address(0)) revert InvalidAddress();
        intentPool = ConfidentialIntentPool(_pool);
        emit IntentPoolUpdated(_pool);
    }

    function setVault(address _vault) external onlyOwner {
        if (_vault == address(0)) revert InvalidAddress();
        vault = AxiVault(_vault);
        emit VaultUpdated(_vault);
    }

    function setFee(uint256 _feeBps) external onlyOwner {
        if (_feeBps > MAX_FEE_BPS) revert FeeTooHigh();
        feeBps = _feeBps;
        emit FeeUpdated(_feeBps);
    }

    // ─── Batch Execution: Swaps ──────────────────────────────────────

    /// @notice Execute a batch of swap intents through Uniswap
    /// @param batchId The batch to execute
    /// @param totalAmountIn The total aggregated amount for the swap
    ///        (calculated off-chain by summing decrypted intent amounts in TEE)
    /// @param amountOutMinimum Minimum acceptable output
    /// @param poolFee Uniswap pool fee tier
    /// @dev The totalAmountIn is the SUM of all individual intent amounts in the batch.
    ///      This sum is calculated inside a TEE so individual amounts remain private.
    ///      Only the aggregated amount is visible on-chain during the swap.
    function executeBatchSwap(
        uint256 batchId,
        uint256 totalAmountIn,
        uint256 amountOutMinimum,
        uint24 poolFee
    ) external onlyOwner {
        (
            ,
            address tokenIn,
            address tokenOut,
            ,
            ,
            bool executed
        ) = intentPool.batches(batchId);

        require(!executed, "Batch already executed");

        uint256[] memory intentIds = intentPool.getBatchIntentIds(batchId);
        if (intentIds.length == 0) revert BatchEmpty();

        // Deduct fee
        uint256 fee = (totalAmountIn * feeBps) / BPS_DENOMINATOR;
        uint256 swapAmount = totalAmountIn - fee;

        // Pull aggregated tokens from the Confidential Vault
        vault.routerSpend(address(0), tokenIn, totalAmountIn);

        // Approve Uniswap router to spend tokens
        IERC20(tokenIn).approve(uniswapRouter, swapAmount);

        // Execute the aggregated swap on Uniswap as a SINGLE trade
        // Individual amounts are hidden — only the total batch amount is visible
        uint256 amountOut = IUniswapV3Router(uniswapRouter).exactInputSingle(
            IUniswapV3Router.ExactInputSingleParams({
                tokenIn: tokenIn,
                tokenOut: tokenOut,
                fee: poolFee,
                recipient: address(this),
                deadline: block.timestamp + 300,
                amountIn: swapAmount,
                amountOutMinimum: amountOutMinimum,
                sqrtPriceLimitX96: 0
            })
        );

        // In a full production implementation, the TEE would submit a callback to 
        // distribute the exact amountOut proportionally to the users' encrypted balances.
        // For this demo, the router sends the total amountOut back to the Vault
        // and the TEE directly updates the user balances via the Nox SDK off-chain.
        IERC20(tokenOut).transfer(address(vault), amountOut);

        // Store batch results
        batchResults[batchId][tokenOut] = amountOut;

        // Mark batch as executed
        intentPool.markBatchExecuted(batchId);

        // Update stats
        totalBatchesExecuted++;
        totalIntentsProcessed += intentIds.length;
        // Estimate MEV saved (simplified: ~0.5% of trade value)
        totalMEVSaved += (totalAmountIn * 50) / BPS_DENOMINATOR;

        emit BatchSwapExecuted(
            batchId,
            tokenIn,
            tokenOut,
            totalAmountIn,
            amountOut,
            intentIds.length
        );
    }

    // ─── Batch Execution: Lending ────────────────────────────────────

    /// @notice Execute a batch of lending intents through Aave
    /// @param batchId The batch to execute
    /// @param totalAmount Total aggregated supply amount
    function executeBatchLend(
        uint256 batchId,
        uint256 totalAmount
    ) external onlyOwner {
        (
            ,
            address tokenIn,
            ,
            ,
            ,
            bool executed
        ) = intentPool.batches(batchId);

        require(!executed, "Batch already executed");

        uint256[] memory intentIds = intentPool.getBatchIntentIds(batchId);
        if (intentIds.length == 0) revert BatchEmpty();

        // Approve Aave to spend tokens
        IERC20(tokenIn).approve(aavePool, totalAmount);

        // Supply to Aave as a single aggregated deposit
        IAavePool(aavePool).supply(tokenIn, totalAmount, address(this), 0);

        // Store results
        batchResults[batchId][tokenIn] = totalAmount;

        // Mark batch as executed
        intentPool.markBatchExecuted(batchId);

        totalBatchesExecuted++;
        totalIntentsProcessed += intentIds.length;

        emit BatchLendExecuted(
            batchId,
            tokenIn,
            totalAmount,
            intentIds.length
        );
    }

    // ─── User-facing: Submit Intent (convenience) ────────────────────

    /// @notice Submit a swap intent through the router
    /// @param tokenIn Input token
    /// @param tokenOut Output token
    /// @param encryptedAmount Encrypted swap amount
    /// @param inputProof Encryption proof
    /// @param deadline Intent expiry timestamp
    function submitSwapIntent(
        address tokenIn,
        address tokenOut,
        externalEuint256 encryptedAmount,
        bytes calldata inputProof,
        uint256 deadline
    ) external returns (uint256) {
        return
            intentPool.submitIntent(
                ConfidentialIntentPool.IntentType.SWAP,
                tokenIn,
                tokenOut,
                encryptedAmount,
                inputProof,
                deadline
            );
    }

    /// @notice Submit a lending intent through the router
    function submitLendIntent(
        address token,
        externalEuint256 encryptedAmount,
        bytes calldata inputProof,
        uint256 deadline
    ) external returns (uint256) {
        return
            intentPool.submitIntent(
                ConfidentialIntentPool.IntentType.LEND,
                token,
                address(0), // No output token for lending
                encryptedAmount,
                inputProof,
                deadline
            );
    }

    // ─── View Functions ──────────────────────────────────────────────

    /// @notice Get protocol statistics for the dashboard
    function getStats()
        external
        view
        returns (
            uint256 _totalBatches,
            uint256 _totalIntents,
            uint256 _mevSaved,
            uint256 _feeBps
        )
    {
        return (
            totalBatchesExecuted,
            totalIntentsProcessed,
            totalMEVSaved,
            feeBps
        );
    }

    // ─── Token Recovery ──────────────────────────────────────────────

    /// @notice Recover tokens sent to the router by mistake
    function recoverTokens(
        address token,
        address to,
        uint256 amount
    ) external onlyOwner {
        IERC20(token).safeTransfer(to, amount);
    }

    /// @notice Receive ETH
    receive() external payable {}
}
