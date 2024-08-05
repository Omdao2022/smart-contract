import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";

// describe("KYC", function () {
//   async function deployKycFixture() {
//     const [owner, otherAccount] = await hre.ethers.getSigners();
//     const KYC = await hre.ethers.getContractFactory("KYC");
//     const kyc = await KYC.deploy();
//     return { kyc, owner, otherAccount };
//   }

//   describe("KYC approve", function () {
//     it("every wallet address shouldn't be kyc verified", async function () {
//       const { kyc, otherAccount, owner } = await loadFixture(deployKycFixture);
//       expect(await kyc.isKYCPassed(otherAccount.address)).to.equal(false);
//     });

//     it("verify a wallet address", async function () {
//       const { kyc, otherAccount, owner } = await loadFixture(deployKycFixture);
//       await kyc.approveKYC(otherAccount.address);
//       expect(await kyc.isKYCPassed(otherAccount.address)).to.equal(true);
//     });

//     it("only owner can approve KYC", async function () {
//       const { kyc, otherAccount, owner } = await loadFixture(deployKycFixture);
//       await expect(
//         kyc.connect(otherAccount).approveKYC(otherAccount.address)
//       ).to.be.revertedWith("Not authorized");
//     });
//   });

//   describe("KYC revoke", function () {
//     it("every wallet address shouldn't be kyc verified", async function () {
//       const { kyc, otherAccount, owner } = await loadFixture(deployKycFixture);
//       expect(await kyc.isKYCPassed(otherAccount.address)).to.equal(false);
//     });

//     it("verify a wallet address and revoke", async function () {
//       const { kyc, otherAccount, owner } = await loadFixture(deployKycFixture);
//       await kyc.approveKYC(otherAccount.address);
//       expect(await kyc.isKYCPassed(otherAccount.address)).to.equal(true);
//       await kyc.revokeKYC(otherAccount.address);
//       expect(await kyc.isKYCPassed(otherAccount.address)).to.equal(false);
//     });

//     it("only owner can revoke KYC", async function () {
//       const { kyc, otherAccount, owner } = await loadFixture(deployKycFixture);
//       await expect(
//         kyc.connect(otherAccount).revokeKYC(otherAccount.address)
//       ).to.be.revertedWith("Not authorized");
//     });
//   });

//   describe("Transfer Ownership", function () {
//     it("original owner should be equal with deployer address", async function () {
//       const { kyc, otherAccount, owner } = await loadFixture(deployKycFixture);
//       await expect(await kyc.owner()).to.be.equal(owner.address);
//     });

//     it("Should be transfer ownership to other account", async function () {
//       const { kyc, otherAccount, owner } = await loadFixture(deployKycFixture);
//       await kyc.transferOwner(otherAccount.address);
//       expect(await kyc.owner()).to.be.equal(otherAccount.address);
//     });

//     it("Only owner can transfer ownership", async function () {
//       const { kyc, otherAccount, owner } = await loadFixture(deployKycFixture);
//       await expect(
//         kyc.connect(otherAccount).transferOwner(otherAccount)
//       ).to.be.revertedWith("Not authorized");
//     });
//   });
// });

describe("KYC Contract", function () {
  const NAME = "KYC";
  const VERSION = "1";
  async function deployKycFixture() {
    const [owner, otherAccount] = await hre.ethers.getSigners();
    const KYC = await hre.ethers.getContractFactory("KYC");
    // const kyc = await KYC.deploy();
    const kyc = await hre.upgrades.deployProxy(KYC, ["KYC", "1"], {
      initializer: "initialize",
    });
    return { kyc, owner, otherAccount };
  }
  describe("setKYC", function () {
    it("Should initialize the DOMAIN_SEPARATOR correctly", async function () {
      const { kyc, otherAccount, owner } = await loadFixture(deployKycFixture);
      const abiCoder = new hre.ethers.AbiCoder();
      console.log(
        "abiCoder=======>",
        await kyc.getAddress(),
        hre.network.config.chainId
      );
      const expectedDomainSeparator = hre.ethers.keccak256(
        abiCoder.encode(
          ["bytes32", "bytes32", "bytes32", "uint256", "address"],
          [
            hre.ethers.keccak256(
              hre.ethers.toUtf8Bytes(
                "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
              )
            ),
            hre.ethers.keccak256(hre.ethers.toUtf8Bytes(NAME)),
            hre.ethers.keccak256(hre.ethers.toUtf8Bytes(VERSION)),
            await hre.network.config.chainId,
            await kyc.getAddress(),
          ]
        )
      );

      console.log("SetKYC:", expectedDomainSeparator);

      expect(await kyc.DOMAIN_SEPARATOR()).to.equal(expectedDomainSeparator);
    });

    it("Should verify KYC correctly", async function () {
      const { kyc, owner, otherAccount } = await loadFixture(deployKycFixture);
      const user = otherAccount.address;
      const DOMAIN_SEPARATOR = await kyc.DOMAIN_SEPARATOR();
      const SET_KYC_TYPEHASH = await kyc.SET_KYC_TYPEHASH();

      // Create the digest

      // Create the digest
      const abiCoder = await new hre.ethers.AbiCoder();
      const digest = hre.ethers.keccak256(
        hre.ethers.solidityPacked(
          ["bytes1", "bytes1", "bytes32", "bytes32"],
          [
            "0x19",
            "0x01",
            DOMAIN_SEPARATOR,
            hre.ethers.keccak256(
              abiCoder.encode(
                ["bytes32", "address"],
                [SET_KYC_TYPEHASH, user]
              )
            ),
          ]
        )
      );

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
        user: otherAccount.address,
      };

      const signature = await otherAccount.signTypedData(domain, types, value);

      // Sign the digest
      // const signature = await owner.signMessage(hre.ethers.getBytes(digest));

      // Verify KYC
      await kyc.connect(otherAccount).setKYC(user, signature);
      const kyc_info = await kyc.kyc_passed(otherAccount.address);
      console.log(kyc_info);
      expect(kyc_info).to.be.true;
    });
  });
});
