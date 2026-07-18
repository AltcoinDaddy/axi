// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC20ToERC7984Wrapper} from "@iexec-nox/nox-confidential-contracts/contracts/token/extensions/ERC20ToERC7984Wrapper.sol";
import {ERC7984} from "@iexec-nox/nox-confidential-contracts/contracts/token/ERC7984.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title WrappedConfidentialUSDC - Confidential wrapper for USDC
/// @notice Wraps ERC-20 USDC into confidential ERC-7984 cUSDC with hidden balances.
/// Enables private stablecoin transactions while maintaining 1:1 peg with USDC.
contract WrappedConfidentialUSDC is ERC20ToERC7984Wrapper {
    constructor(
        IERC20 usdc
    )
        ERC20ToERC7984Wrapper("Confidential USDC", "cUSDC", "", usdc)
    {}
}
