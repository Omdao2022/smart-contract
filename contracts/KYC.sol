// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/ECDSAUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/EIP712Upgradeable.sol";
import "./IKYC.sol";

/// @title KYC Contract
/// @notice This contract manages KYC statuses using EIP-712 standard for typed data hashing.
contract KYC is Initializable, OwnableUpgradeable, EIP712Upgradeable, IKYC {
    using ECDSAUpgradeable for bytes32;

    // Typehash for the setKYC function as per EIP-712 standard
    bytes32 public constant SET_KYC_TYPEHASH = keccak256("SetKYC(address user)");

    // KYC operator address
    address public kycOperator;

    // Mapping to store KYC status of addresses
    mapping(address => bool) public kycPassed;

    /// @notice Initializes the contract with name, version and operator address.
    /// @param name The name of the domain.
    /// @param version The version of the domain.
    /// @param _kycOperator The address of the KYC operator.
    function initialize(
        string calldata name,
        string calldata version,
        address _kycOperator
    ) public initializer {
        if (_kycOperator == address(0)) {
            revert InvalidOperatorAddress();
        }
        __Ownable_init();
        kycOperator = _kycOperator;
        __EIP712_init(name, version);
    }

    /// @notice Modifier to restrict access to only the KYC operator.
    modifier onlyOperator {
        if (msg.sender != kycOperator) {
            revert Unauthorized();
        }
        _;
    }

    /// @notice Transfers the role of the KYC operator to a new address.
    /// @param newOperator The address of the new KYC operator.
    function transferKycOperator(address newOperator) public onlyOwner {
        if (newOperator == address(0)) {
            revert InvalidOperatorAddress();
        }
        kycOperator = newOperator;
        emit KYCOperatorChanged(newOperator);
    }

    /// @notice Sets the KYC status for a user after verifying the signature.
    /// @param user The address of the user whose KYC status is being set.
    /// @param signature The signed data from the KYC operator.
    function setKYC(
        address user,
        bytes calldata signature
    ) public {
        if (user == address(0)) {
            revert InvalidUserAddress();
        }

        // Construct the hash as per EIP-712 standard
        bytes32 structHash = keccak256(abi.encode(SET_KYC_TYPEHASH, user));
        bytes32 hash = _hashTypedDataV4(structHash);

        // Recover the signer's address and verify
        address signer = ECDSAUpgradeable.recover(hash, signature);
        if (signer != kycOperator) {
            revert SignatureVerificationFailed();
        }

        // Update KYC status
        kycPassed[user] = true;

        // Emit event
        emit KYCPassed(user);
    }
}
