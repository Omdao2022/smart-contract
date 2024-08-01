import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("KYC", (m) => {
  const kyc = m.contract("KYC");
  return { kyc }
});