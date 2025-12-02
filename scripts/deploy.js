const hre = require("hardhat");

async function main() {
  const DIDRegistry = await hre.ethers.deployContract("DIDRegistry");
  await DIDRegistry.waitForDeployment();

  console.log(`DIDRegistry deployed to: ${DIDRegistry.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
