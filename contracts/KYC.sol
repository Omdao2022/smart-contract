// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

// Uncomment this line to use console.log
import "hardhat/console.sol";

contract KYC {
  address public owner;

  modifier onlyOwner() {
    require(msg.sender == owner, "Not authorized");
    _;
  }

  mapping(address => bool) public kycPassed;

  event KYCApproved(address indexed wallet);
  event KYCRevoked(address indexed wallet);

  constructor() {
    owner = msg.sender;
  }

  // To be called by backend after KYC approval
  function approveKYC(address _wallet) public onlyOwner {
    kycPassed[_wallet] = true;
    emit KYCApproved(_wallet);
  }

  // To be called by backend after KYC revoke
  function revokeKYC(address _wallet) public onlyOwner {
    kycPassed[_wallet] = false;
    emit KYCRevoked(_wallet);
  }

  // Function to check if a wallet has passed KYC
  function isKYCPassed(address _wallet) public view returns (bool) {
    return kycPassed[_wallet];
  }

  function transferOwner(address _newOwner) public onlyOwner {
    require(_newOwner != address(0), "New owner can't be zero address");
    owner = _newOwner;
  }
}