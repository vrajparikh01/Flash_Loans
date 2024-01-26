# FlashLoan Contract

## Overview

This project is about the flash loan-based triangular arbitrage on the Polygon blockchain. It's designed to leverage price differences between assets on PancakeSwap, aiming to generate profits through successive trades within a single transaction block.

## Contract Functionality

### `initateArbitrage`

- **Description:** Initiates the arbitrage by swapping borrowed BUSD for WBNB in the liquidity pool.
- **Parameters:**
  - `_busdBorrow`: Address of the borrowed BUSD token.
  - `_amount`: Amount of BUSD to borrow for the arbitrage.
- **Actions:**
  - Approves BUSD, CROX, and CAKE token spending on the PancakeSwap Router.
  - Identifies the liquidity pool between BUSD and WBNB.
  - Swaps BUSD for WBNB in the liquidity pool, initiating the arbitrage process.

### `pancakeCall`

- **Description:** Executes the arbitrage steps and handles repayment to the flash loan pool.
- **Parameters:**
  - `_sender`: Address initiating the call.
  - `_amount0`: Amount of the first token in the pair.
  - `_amount1`: Amount of the second token in the pair.
  - `_data`: Encoded data containing details for the arbitrage.
- **Actions:**
  - Checks and validates the sender and contract alignment.
  - Decodes the data to retrieve loan details (borrowed token, amount, borrower's address).
  - Executes the series of trades for triangular arbitrage (BUSD → CROX → CAKE → BUSD).
  - Verifies the profitability of the arbitrage.
  - Transfers profits to the initiator and repays the flash loan.

### Other Functions

- `getTokenBalance`: Retrieves the contract's balance of a specific token.
- `placeTrade`: Executes token swaps through PancakeSwap based on specified tokens and amounts.
- `checkResult`: Helper function to check if the arbitrage yields profits.

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/vrajparikh01/Flash_Loans.git
   ```

2. Navigate to the project directory:
   ```
   cd Flash_Loans
   ```

3. Install dependencies:
   ```
   npm install
   ```

### Deployment and Testing
1. Deploy the Flash loan contract on Polygon testnet using the following command:
   ```
   npx hardhat run scripts/deploy.js --network mumbai
   ```
2. Test the flash loan flow:
   ```
   npx hardhat test test/test.js
   ```

## Usage

1. Deploy the contract on the Polygon blockchain.
2. Call `initateArbitrage` with the desired parameters to start the arbitrage process.
3. The contract will autonomously execute trades and handle repayments.
4. Ensure sufficient liquidity and price differences to yield profitable arbitrage.
5. If you get an error "Not profitable Arbitrage" then find crypto pairs and replace them in the contract which can provide you with profitable arbitrage.
