// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IKYC {
    // Custom errors
    error InvalidUserAddress();
    error SignatureVerificationFailed();
    error UnknownWalletAddress();

    // Events

    /// @dev This emits when the wallet passed KYC verification.
    event KYC_PASSED(address indexed _wallet);

    // Function declarations
    function initialize(string memory name, string memory version) external;
    function setKYC(address user, bytes memory signature) external;
}
