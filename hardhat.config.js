require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-ethers");
// require("@nomiclabs/hardhat-etherscan");
require("hardhat-abi-exporter");
require("dotenv").config();

const defaultKey =
  "0000000000000000000000000000000000000000000000000000000000000000";

const ACCOUNT_PRIVATE_KEY = process.env.ACCOUNT_PRIVATE_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const MUMBAI_URL = process.env.GOERLI_URL;
const OPTIMIZER_RUNS = process.env.OPTIMIZER_RUNS;
const OPTIMIZER_FLAG = process.env.OPTIMIZER_FLAG;

module.exports = {
  solidity: {
    compilers: [
      { version: "0.8.19" },
      { version: "0.5.5" },
      { version: "0.6.6" },
    ],
  },
  settings: {
    optimizer: {
      enabled: OPTIMIZER_FLAG || true,
      runs: parseInt(OPTIMIZER_RUNS) || 200,
    },
    evmVersion: "istanbul",
  },
  etherscan: {
    apiKey: {
      mumbai: ETHERSCAN_API_KEY,
    },
  },
  networks: {
    mumbai: {
      url:
        MUMBAI_URL ||
        "https://polygon-mumbai.g.alchemy.com/v2/ystrrbBKtsvf4x416CItuRU6mn7QlEB9",
      accounts: [ACCOUNT_PRIVATE_KEY || defaultKey],
    },
    hardhat: {
      forking: {
        url: "https://bsc-dataseed1.binance.org/",
      },
      chainID: 31337,
    },
  },
  abiExporter: [
    {
      path: "./abi/json",
      runOnCompile: true,
      clear: true,
      flat: true,
      spacing: 2,
      format: "json",
    },
    {
      path: "./abi/minimal",
      runOnCompile: true,
      clear: true,
      flat: true,
      spacing: 2,
      format: "minimal",
    },
  ],
};
