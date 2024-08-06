import hre from "hardhat";

async function main() {
  const KYCFactory = await hre.ethers.getContractFactory("KYC");
  console.log("Deploying KYC...");

  const kyc = await hre.upgrades.deployProxy(
    KYCFactory,
    ["KYC", "1", "0xfBb57E43cD5bfbA71Ae67e2B7148F87d4ce23E6b"],
    {
      initializer: "initialize",
    }
  );

  console.log("KYC deployed to:", await kyc.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });