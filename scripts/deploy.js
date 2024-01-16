const { ethers } = require("hardhat");

async function main() {
  const FlashLoan = await ethers.getContractFactory("FlashLoan");
  let flashLoan = await FlashLoan.deploy();
  console.log("Flash Loan contract deployed to: ", flashLoan.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
