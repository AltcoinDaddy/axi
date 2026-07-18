// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC20ToERC7984Wrapper} from "@iexec-nox/nox-confidential-contracts/contracts/token/extensions/ERC20ToERC7984Wrapper.sol";
import {ERC7984} from "@iexec-nox/nox-confidential-contracts/contracts/token/ERC7984.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title WrappedConfidentialETH - Confidential wrapper for WETH
/// @notice Wraps ERC-20 WETH into confidential ERC-7984 cWETH with hidden balances.
/// Users can wrap() to convert public WETH → private cWETH, and unwrap() + finalizeUnwrap()
/// to convert back. Balances are encrypted and only visible to the token holder.
contract WrappedConfidentialETH is ERC20ToERC7984Wrapper {
    constructor(
        IERC20 weth
    )
        ERC20ToERC7984Wrapper("Confidential Wrapped ETH", "cWETH", "", weth)
    {}
}
