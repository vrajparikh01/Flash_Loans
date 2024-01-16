// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./interfaces/IERC20.sol";
import "./interfaces/IUniswapV2Factory.sol";
import "./interfaces/IUniswapV2Pair.sol";
import "./interfaces/IUniswapV2Router01.sol";
import "./interfaces/IUniswapV2Router02.sol";
import "./libraries/SafeERC20.sol";
// import "./libraries/UniswapV2Library.sol";

contract FlashLoan {
    using SafeERC20 for IERC20;

    address private constant PANCAKE_FACTORY = 0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73;
    address private constant PANCAKE_ROUTER = 0x10ED43C718714eb63d5aA57B78B54704E256024E;

    // token address
    address private constant BUSD = 0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56;
    address private constant WBNB = 0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c;
    address private constant CROX = 0x2c094F5A7D1146BB93850f629501eB749f6Ed491;
    address private constant CAKE = 0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82;

    uint private deadline = block.timestamp + 1 days;
    uint private constant MAX_INT = 115792089237316195423570985008687907853269984665640564039457584007913129639935;

    function getTokenBalance(address _addr) public view returns(uint){
        return IERC20(_addr).balanceOf(address(this));
    }

    function checkResult(uint _repayAmt, uint _tradedCoin) private pure returns(bool){
        return _repayAmt> _tradedCoin;
    }

    function placeTrade(address _fromToken, address _toToken, uint _amountIn) private returns(uint){
        address pair = IUniswapV2Factory(PANCAKE_FACTORY).getPair(_fromToken, _toToken);
        require(pair!=address(0), "Pool does not exist");

        address[] memory path = new address[](2);
        path[0] = _fromToken;
        path[1] = _toToken;

        uint amtRequired = IUniswapV2Router02(PANCAKE_FACTORY).getAmountsOut(_amountIn, path)[1];

        uint amtReceived = IUniswapV2Router02(PANCAKE_FACTORY).swapExactTokensForTokens(_amountIn, amtRequired, path, address(this),    deadline)[1];

        require(amtReceived>0,"Didn't get enough tokens out");
        return amtReceived;
    }

    function initiateArbitrage(address _busd, uint _amount) public{
        IERC20(BUSD).safeApprove(address(PANCAKE_ROUTER), MAX_INT);
        IERC20(CAKE).safeApprove(address(PANCAKE_ROUTER), MAX_INT);
        IERC20(CROX).safeApprove(address(PANCAKE_ROUTER), MAX_INT);

        address pair = IUniswapV2Factory(PANCAKE_FACTORY).getPair(_busd, WBNB);
        require(pair!=address(0), "Liquidity pool doesn't exist");

        //can be WBNB or BUSD so we are using amount0Out and amount1Out
        address token0 = IUniswapV2Pair(pair).token0(); 
        address token1 = IUniswapV2Pair(pair).token1();

        uint amount0Out = _busd==token0?_amount:0;
        uint amount1Out = _busd==token1?_amount:0;

        // transfer borrowed busd to the contract with amount
        bytes memory data = abi.encode(_busd, _amount, msg.sender);
        IUniswapV2Pair(pair).swap(amount0Out, amount1Out, address(this), data);
    }

    // swap call in initialteArbitrage function will call pancakeCall internally so we have kept the exact name
    function pancakeCall(address _sender, uint _amount0, uint _amount1, bytes calldata _data) external{
        address token0 = IUniswapV2Pair(msg.sender).token0();
        address token1 = IUniswapV2Pair(msg.sender).token1();

        address pair = IUniswapV2Factory(PANCAKE_FACTORY).getPair(token0, token1);
        require(msg.sender == pair, "Pair not matched");
        require(_sender == address(this), "Sender is not the contract");

        (address _busd, uint amount, address myAccount) = abi.decode(_data, (address, uint, address));

        // fee calculation (we have to pay for the loan)
        uint fee = ((amount*3)/997)+1;

        uint repayAmt = amount + fee;

        uint loanAmt = _amount0>1?_amount0:_amount1;

        // Triangular arbitrage
        uint trade1Coin = placeTrade(BUSD, CROX, loanAmt);
        uint trade2Coin = placeTrade(CROX, CAKE, trade1Coin);
        uint trade3Coin = placeTrade(CAKE, BUSD, trade2Coin);

        bool result = checkResult(repayAmt, trade3Coin);
        require(result, "Arbitrage not profitable");

        IERC20(BUSD).transfer(myAccount, trade3Coin-repayAmt);
        IERC20(_busd).transfer(pair, repayAmt);
    }
}
