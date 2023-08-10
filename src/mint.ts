import { ctfAbi } from "./abi";

import { ethers } from "ethers";
import { resolve } from "path";
import { config as dotenvConfig } from "dotenv";

dotenvConfig({ path: resolve(__dirname, "../.env") });

const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
const pk = process.env.PK || "";
const w = new ethers.Wallet(pk);
const wallet = w.connect(provider);

async function main(){
    console.log(`starting...`);
    console.log(`Wallet: ${wallet.address}`);

    const conditionalTokenAddress = "0x4d97dcd97ec945f40cf65f87097ace5ea0476045";
    const usdcAddress = "0x2791bca1f2de4661ed88a30c99a7a9449aa84174";
    
    const erc20ApproveAbi = [{"constant": false,
    "inputs": [{"name": "_spender","type": "address"},{"name": "_value","type": "uint256"}],
    "name": "approve","outputs": [{"name": "","type": "bool"}],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"}];

    const usdc = new ethers.Contract(usdcAddress, erc20ApproveAbi, wallet);
    
    console.log(`Approve Polygon USDC on CTF address`);
    const approveTxn = await usdc.approve(conditionalTokenAddress, ethers.constants.MaxUint256);
    console.log(`Txn hash: ${approveTxn.hash}`);
    await approveTxn.wait();
    console.log(`Approve done!`);

    const ctf = new ethers.Contract(conditionalTokenAddress, ctfAbi, wallet);
    const conditionId = "0xbd31dc8a20211944f6b70f31557f1001557b59905b7738480ca09bd4532f84af"; // The ConditionID of the market in question
    
    console.log(`Minting YES and NO tokens for conditionId: ${conditionId}...`);
     
    const funding = ethers.utils.parseUnits("100", 6); // Amount to mint

    const txn = await ctf.splitPosition(
        usdcAddress, // The collateral token address
        ethers.constants.HashZero, // The parent collectionId, always bytes32(0) for Polymarket markets
        conditionId, // The conditionId of the market
        [1, 2], // The index set used by Polymarket for binary markets
        funding,
    );
    console.log(`Txn hash: ${txn.hash}`);
    await txn.wait();
 
    console.log(`Mint done!`)

    console.log(`Done!`);
}


main();