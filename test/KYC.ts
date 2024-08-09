import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";

describe("KYC Contract", function () {
  const NAME = "KYC";
  const VERSION = "1";
  async function deployKycFixture() {
    const [owner, otherAccount] = await hre.ethers.getSigners();
    const KYC = await hre.ethers.getContractFactory("KYC");
    // const kyc = await KYC.deploy();
    const kyc = await hre.upgrades.deployProxy(
      KYC,
      ["KYC", "1", owner.address],
      {
        // const kyc = await hre.upgrades.deployProxy(KYC, [owner.address], {
        initializer: "initialize",
      }
    );
    return { kyc, owner, otherAccount };
  }
  describe("setKYC", function () {
    it("Should initialize the keyOperator correctly", async function () {
      const { kyc, otherAccount, owner } = await loadFixture(deployKycFixture);

      expect(await kyc.kycOperator()).to.equal(owner.address);
    });

    it("Should verify KYC correctly", async function () {
      const { kyc, owner, otherAccount } = await loadFixture(deployKycFixture);
      const user = otherAccount.address;

      const domain = {
        name: "KYC",
        version: "1",
        chainId: await hre.network.config.chainId,
        verifyingContract: await kyc.getAddress(),
      };

      const types = {
        SetKYC: [{ name: "user", type: "address" }],
      };

      const value = {
        user: user,
      };

      const signature = await owner.signTypedData(domain, types, value);

      // Sign the digest
      // const signature = await owner.signMessage(hre.ethers.getBytes(digest));

      // Verify KYC
      await kyc.setKYC(user, signature);
      const kyc_info = await kyc.kycPassed(otherAccount.address);
      expect(kyc_info).to.be.true;
    });

    it("Should reject unknown signature", async function () {
      const { kyc, owner, otherAccount } = await loadFixture(deployKycFixture);
      const user = otherAccount.address;
      const SET_KYC_TYPEHASH = await kyc.SET_KYC_TYPEHASH();

      const domain = {
        name: "KYC",
        version: "1",
        chainId: await hre.network.config.chainId,
        verifyingContract: await kyc.getAddress(),
      };

      const types = {
        SetKYC: [{ name: "user", type: "address" }],
      };

      const value = {
        user: owner.address,
      };

      const signature = await otherAccount.signTypedData(domain, types, value);

      // Verify KYC
      await expect(
        kyc.setKYC(owner.address, signature)
      ).to.be.revertedWithCustomError(kyc, "SignatureVerificationFailed");
    });

    it("Should transfer the keyOperator correctly", async function () {
      const { kyc, otherAccount, owner } = await loadFixture(deployKycFixture);
      await kyc.transferKycOperator(otherAccount.address);
      expect(await kyc.kycOperator()).to.equal(otherAccount.address);
    });
  });
});
