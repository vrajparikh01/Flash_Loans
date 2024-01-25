const { expect, assert } = require("chai");
const { ethers } = require("hardhat");
const { fundContract } = require("../utils/utilities");

const abi = require("../abi/json/IERC20.json");

// const provider = new ethers.provider();
const provider = new ethers.JsonRpcProvider(
  "https://bsc-dataseed1.binance.org/"
);

describe("Flash Loan", () => {
  let flashloan;
  let borrowAmt, fundAmt, initialFunding, txArbitrage;

  const DECIMALS = 18;

  const BUSD = "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56";
  const WBNB = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
  const CROX = "0x2c094F5A7D1146BB93850f629501eB749f6Ed491";
  const CAKE = "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82";

  const BUSD_WHALE = "0x28c6c06298d514db089934071355e5743bf21d60";

  const busdInstance = new ethers.Contract(BUSD, abi, provider);

  beforeEach(async () => {
    const whale_balance = await provider.getBalance(BUSD_WHALE);
    console.log("Whale balance: ", whale_balance.toString());
    expect(whale_balance).not.eq("0");

    const FlashLoan = await ethers.getContractFactory("FlashLoan");
    flashloan = await FlashLoan.deploy();

    const borrowAmtEth = "1";
    borrowAmt = ethers.parseUnits(borrowAmtEth, DECIMALS);

    const fundAmtEth = "100";
    fundAmt = ethers.parseUnits(fundAmtEth, DECIMALS);
    // console.log("Fund Amt: ",fundAmt.toString());

    await fundContract(busdInstance, BUSD_WHALE, flashloan.target, fundAmtEth);
  });
  describe("Arbitrage Execution", () => {
    it("ensure that contract is funded", async () => {
      const contractBal = await flashloan.getTokenBalance(BUSD);
      const swapBal = ethers.formatUnits(contractBal, DECIMALS);
      expect(Number(swapBal)).to.eq(Number(fundAmt));
    });
    it("execute arbitrage", async () => {
      txArbitrage = flashloan.initiateArbitrage(BUSD, borrowAmt);
      assert(txArbitrage);

      const contractBalBUSD = await flashloan.getTokenBalance(BUSD);
      const formattedBalBUSD = Number(
        ethers.utils.formatUnits(contractBalBUSD, DECIMALS)
      );
      console.log("BUSD balance: " + formattedBalBUSD);

      const contractBalCROX = await flashloan.getTokenBalance(CROX);
      const formattedBalCROX = Number(
        ethers.utils.formatUnits(contractBalCROX, DECIMALS)
      );
      console.log("CROX balance: " + formattedBalCROX);

      const contractBalCAKE = await flashloan.getTokenBalance(CAKE);
      const formattedBalCAKE = Number(
        ethers.utils.formatUnits(contractBalCAKE, DECIMALS)
      );
      console.log("CAKE balance: " + formattedBalCAKE);
    });
  });
});
