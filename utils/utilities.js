const { network, ethers } = require("hardhat");

const fundToken = async (contract, sender, recipient, amount) => {
  console.log("amt", amount);
  const fundAmt = ethers.parseUnits(amount, 18);

  const whale = await ethers.getSigner(sender);
  const contractSigner = contract.connect(whale);
  await contractSigner.transfer(recipient, fundAmt);
};

const fundContract = async (contract, sender, recipient, amount) => {
  // temporary take control of the account
  await network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [sender],
  });

  await fundToken(contract, sender, recipient, amount);

  await network.provider.request({
    method: "hardhat_stopImpersonatingAccount",
    params: [sender],
  });
};

module.exports = {
  fundContract,
  fundToken,
};
