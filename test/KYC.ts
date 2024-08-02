import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";

describe("KYC", function () {
  async function deployKycFixture() {
    const [owner, otherAccount] = await hre.ethers.getSigners();
    const KYC = await hre.ethers.getContractFactory("KYC");
    const kyc = await KYC.deploy();
    return { kyc, owner, otherAccount };
  }

  describe("KYC approve", function () {
    it("every wallet address shouldn't be kyc verified", async function () {
      const { kyc, otherAccount, owner } = await loadFixture(deployKycFixture);
      expect(await kyc.isKYCPassed(otherAccount.address)).to.equal(false);
    });

    it("verify a wallet address", async function () {
      const { kyc, otherAccount, owner } = await loadFixture(deployKycFixture);
      await kyc.approveKYC(otherAccount.address);
      expect(await kyc.isKYCPassed(otherAccount.address)).to.equal(true);
    });

    it("only owner can approve KYC", async function () {
      const { kyc, otherAccount, owner } = await loadFixture(deployKycFixture);
      await expect(kyc.connect(otherAccount).approveKYC(otherAccount.address)).to.be.revertedWith(
        "Not authorized"
      );
    });
  });

  describe("Transfer Ownership", function () {
    it("original owner should be equal with deployer address", async function () {
      const { kyc, otherAccount, owner } = await loadFixture(deployKycFixture);
      await expect(await kyc.owner()).to.be.equal(owner.address);
    });

    it("Should be transfer ownership to other account", async function () {
      const { kyc, otherAccount, owner } = await loadFixture(deployKycFixture);
      await kyc.transferOwner(otherAccount.address);
      expect(await kyc.owner()).to.be.equal(otherAccount.address);
    });

    it("Only owner can transfer ownership", async function () {
      const { kyc, otherAccount, owner } = await loadFixture(deployKycFixture);
      await expect(kyc.connect(otherAccount).transferOwner(otherAccount)).to.be.revertedWith("Not authorized");
    });
  })


});