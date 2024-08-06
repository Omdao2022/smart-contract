// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IKYC {
    // Custom errors
    error InvalidUserAddress();
    error SignatureVerificationFailed();
    error InvalidOperatorAddress();
    error Unauthorized();



    // Events

    /// @dev This emits when the wallet passed KYC verification.
    event KYC_PASSED(address indexed _wallet);

    // Function declarations
    function initialize(string calldata name, string calldata version, address _kycOperator) external;
    function setKYC(address user, bytes calldata signature) external;
}
