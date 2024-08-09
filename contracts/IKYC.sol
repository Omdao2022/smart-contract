// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IKYC {
    // event

    /// @dev Emitted when the KYC status of a user is updated.
    event KYCPassed(address indexed user);

    /// @dev Emitted when the KYC operator address is changed.
    event KYCOperatorChanged(address indexed newOperator);

    // custom errors

    /// @dev Error thrown when an invalid operator address is provided.
    error InvalidOperatorAddress();

    /// @dev Error thrown when a non-operator attempts to call protected functions.
    error Unauthorized();

    /// @dev Error thrown when an invalid user address is provided.
    error InvalidUserAddress();

    /// @dev Error thrown when signature verification fails.
    error SignatureVerificationFailed();


    // Function declarations
    function initialize(string calldata name, string calldata version, address _kycOperator) external;
    // function initialize(address _kycOperator) external;
    function setKYC(address user, bytes calldata signature) external;
}
