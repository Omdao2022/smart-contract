// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/ECDSAUpgradeable.sol";
import "./IKYC.sol";

contract KYC is Initializable, IKYC {
    using ECDSAUpgradeable for bytes32;

    // EIP-712 Domain separator
    bytes32 public DOMAIN_SEPARATOR;

    // EIP-712 typehash for the setKYC function
    bytes32 public constant SET_KYC_TYPEHASH =
        keccak256("SetKYC(address user)");

    // KYC operator address
    address public kycOperator;

    mapping(address => bool) public kycPassed;

    function initialize(
        string calldata name,
        string calldata version,
        address _kycOperator
    ) public initializer {
        if (_kycOperator == address(0)) {
            revert InvalidOperatorAddress();
        }
        kycOperator = _kycOperator;

        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256(
                    "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
                ),
                keccak256(bytes(name)),
                keccak256(bytes(version)),
                block.chainid,
                address(this)
            )
        );
    }

    function setKYC(
        address user,
        bytes calldata signature
    ) public {
        if (user == address(0)) {
            revert InvalidUserAddress();
        }

        // Construct the digest
        bytes32 digest = keccak256(
            abi.encodePacked(
                "\x19\x01",
                DOMAIN_SEPARATOR,
                keccak256(abi.encode(SET_KYC_TYPEHASH, user))
            )
        );

        // Recover address from signature and verify
        address recoveredAddress = digest.recover(signature);

        if (recoveredAddress != kycOperator) {
            revert SignatureVerificationFailed();
        }

        // Update KYC status
        kycPassed[user] = true;

        // Emit event
        emit KYC_PASSED(user);
    }
}
