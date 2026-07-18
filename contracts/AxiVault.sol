// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Nox, euint256, externalEuint256} from "@iexec-nox/nox-protocol-contracts/contracts/sdk/Nox.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @title AxiVault - Confidential DeFi Vault
/// @notice Holds user deposits with encrypted balances. Users deposit ERC-20 tokens
/// and their balance is stored as an encrypted euint256 via Nox. Only the depositor
/// can view their balance. The Router contract is authorized to spend funds for
/// executing DeFi operations.
/// @dev Uses Nox encrypted types for balance storage and arithmetic.
contract AxiVault {
    using SafeERC20 for IERC20;

    /// @notice Owner/admin of the vault
    address public owner;

    /// @notice Authorized router contract that can execute operations
    address public router;

    /// @notice Encrypted balances: user => token => encrypted balance
    mapping(address => mapping(address => euint256)) private _balances;

    /// @notice Total deposited per token (public, for transparency on TVL)
    mapping(address => uint256) public totalDeposited;

    /// @notice Supported tokens
    mapping(address => bool) public supportedTokens;
    address[] public tokenList;

    // ─── Events ──────────────────────────────────────────────────────
    event Deposited(address indexed user, address indexed token, uint256 amount);
    event WithdrawRequested(address indexed user, address indexed token);
    event RouterUpdated(address indexed oldRouter, address indexed newRouter);
    event TokenAdded(address indexed token);

    // ─── Errors ──────────────────────────────────────────────────────
    error Unauthorized();
    error UnsupportedToken();
    error ZeroAmount();
    error ZeroAddress();

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    modifier onlyRouter() {
        if (msg.sender != router) revert Unauthorized();
        _;
    }

    constructor(address _router) {
        owner = msg.sender;
        router = _router;
    }

    // ─── Admin ───────────────────────────────────────────────────────

    /// @notice Add a supported token
    function addSupportedToken(address token) external onlyOwner {
        if (token == address(0)) revert ZeroAddress();
        if (!supportedTokens[token]) {
            supportedTokens[token] = true;
            tokenList.push(token);
            emit TokenAdded(token);
        }
    }

    /// @notice Update the authorized router address
    function setRouter(address _router) external onlyOwner {
        if (_router == address(0)) revert ZeroAddress();
        address old = router;
        router = _router;
        emit RouterUpdated(old, _router);
    }

    // ─── Deposits ────────────────────────────────────────────────────

    /// @notice Deposit ERC-20 tokens into the vault
    /// @param token The ERC-20 token to deposit
    /// @param amount The plaintext amount to deposit
    /// @dev The amount is public during deposit (ERC-20 transfer is inherently public).
    ///      Once deposited, the balance is encrypted and hidden from public view.
    function deposit(address token, uint256 amount) external {
        if (!supportedTokens[token]) revert UnsupportedToken();
        if (amount == 0) revert ZeroAmount();

        // Transfer ERC-20 from user to vault
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);

        // Convert to encrypted amount and add to balance
        euint256 encryptedAmount = Nox.toEuint256(amount);
        euint256 currentBalance = _balances[msg.sender][token];

        // If first deposit, initialize; otherwise add
        if (euint256.unwrap(currentBalance) == 0) {
            _balances[msg.sender][token] = encryptedAmount;
        } else {
            _balances[msg.sender][token] = Nox.add(
                currentBalance,
                encryptedAmount
            );
        }

        // Grant permissions for the encrypted balance
        Nox.allowThis(_balances[msg.sender][token]);
        Nox.allow(_balances[msg.sender][token], msg.sender);
        // Allow router to access balance for DeFi operations
        if (router != address(0)) {
            Nox.allow(_balances[msg.sender][token], router);
        }

        totalDeposited[token] += amount;

        emit Deposited(msg.sender, token, amount);
    }

    /// @notice Withdraw tokens using an encrypted amount
    /// @param token The ERC-20 token to withdraw
    /// @param encryptedAmount The encrypted withdrawal amount (from user's Nox SDK)
    /// @param inputProof Proof that the encrypted amount is valid
    function withdraw(
        address token,
        externalEuint256 encryptedAmount,
        bytes calldata inputProof
    ) external {
        if (!supportedTokens[token]) revert UnsupportedToken();

        euint256 amount = Nox.fromExternal(encryptedAmount, inputProof);

        // Subtract from encrypted balance
        _balances[msg.sender][token] = Nox.sub(
            _balances[msg.sender][token],
            amount
        );

        // Re-grant permissions after the subtraction creates a new handle
        Nox.allowThis(_balances[msg.sender][token]);
        Nox.allow(_balances[msg.sender][token], msg.sender);
        if (router != address(0)) {
            Nox.allow(_balances[msg.sender][token], router);
        }

        emit WithdrawRequested(msg.sender, token);
    }

    // ─── Router Operations ───────────────────────────────────────────

    /// @notice Router spends from user's vault for DeFi execution
    /// @param token The token to spend
    /// @param amount Plaintext amount (known by router after TEE processing)
    function routerSpend(
        address /* user */,
        address token,
        uint256 amount
    ) external onlyRouter {
        IERC20(token).safeTransfer(router, amount);
    }

    /// @notice Router credits user's vault after DeFi execution
    /// @param user The user to credit
    /// @param token The token received
    /// @param amount The plaintext amount received
    function routerCredit(
        address user,
        address token,
        uint256 amount
    ) external onlyRouter {
        euint256 encryptedAmount = Nox.toEuint256(amount);

        if (euint256.unwrap(_balances[user][token]) == 0) {
            _balances[user][token] = encryptedAmount;
        } else {
            _balances[user][token] = Nox.add(
                _balances[user][token],
                encryptedAmount
            );
        }

        Nox.allowThis(_balances[user][token]);
        Nox.allow(_balances[user][token], user);
        Nox.allow(_balances[user][token], router);
    }

    // ─── View Functions ──────────────────────────────────────────────

    /// @notice Get the encrypted balance handle for a user + token
    /// @dev Only the user (or authorized viewer) can decrypt this off-chain
    function getBalance(
        address user,
        address token
    ) external view returns (euint256) {
        return _balances[user][token];
    }

    /// @notice Get the number of supported tokens
    function getTokenCount() external view returns (uint256) {
        return tokenList.length;
    }
}
