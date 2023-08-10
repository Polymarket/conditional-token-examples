import { ctfAbi } from "./abi";

import { ethers } from "ethers";
import { resolve } from "path";
import { config as dotenvConfig } from "dotenv";

dotenvConfig({ path: resolve(__dirname, "../.env") });

const provider = new ethers.providers.JsonRpcProvider(`${process.env.RPC_URL}`);
const pk = process.env.PK || "";
const w = new ethers.Wallet(pk);
const wallet = w.connect(provider);

async function main(){
    console.log(`Starting...`);
    console.log(`Wallet: ${wallet.address}`);

    const ctf = new ethers.Contract("0x4D97DCd97eC945f40cF65F87097ACe5EA0476045", ctfAbi, wallet);

    const collateral = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"; // USDC address
    const parentCollectionId = ethers.constants.HashZero; // parentCollectionID used for non branching markets. Can be found onchain
    const conditionId = "0x..."; // ConditionID for the market in question. Found from the /markets endpoint
    const indexSets = ["1", "2"]; // The index set used by Polymarket for binary markets

    console.log(`Redeem started...`);
    const txn = await ctf.redeemPositions(collateral, parentCollectionId, conditionId, indexSets);
    console.log(`Txn hash: ${txn.hash}`);
    await txn.wait();

    console.log(`done!`);
}

main();
