// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/ECDSAUpgradeable.sol";

import "hardhat/console.sol";

contract KYC is Initializable {
    using ECDSAUpgradeable for bytes32;

    // EIP-712 Domain separator
    bytes32 public DOMAIN_SEPARATOR;

    // EIP-712 typehash for the setKYC function
    bytes32 public constant SET_KYC_TYPEHASH =
        keccak256("SetKYC(address user)");

    function initialize(
        string memory name,
        string memory version
    ) public initializer {
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
        bytes memory signature
    ) public view returns (bool) {
        // Construct the digest
        bytes32 digest = keccak256(
            abi.encodePacked(
                "\x19\x01",
                DOMAIN_SEPARATOR,
                keccak256(abi.encode(SET_KYC_TYPEHASH, user))
            )
        );

        // Recover address from signature and verify
        // return recoverSigner(digest, signature) == msg.sender;
        address recover = recoverSigner(digest, signature);
        console.log("recover==========>%s, msg.sender===========>%s", recover, msg.sender);
        return recover == msg.sender;
    }

    function recoverSigner(
        bytes32 digest,
        bytes memory signature
    ) internal pure returns (address) {
        return digest.recover(signature);
    }
}
