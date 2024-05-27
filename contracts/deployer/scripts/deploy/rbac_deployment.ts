// Deploy child contracts
import * as dotenv from "dotenv";
dotenv.config();
import { ethers } from "ethers";
import { requireEnv, waitForReceipt, verifyChildContract, waitForConfirmation, deployChildContract, saveChildContracts } from "../helpers/helpers";
import { LedgerSigner } from "../helpers/ledger_signer";

export async function run() {
    // Check environment variables
    let childRPCURL = requireEnv("CHILD_RPC_URL");
    let childChainID = requireEnv("CHILD_CHAIN_ID");
    let nonceReservedDeployerSecret = requireEnv("CHILD_NONCE_RESERVED_DEPLOYER_SECRET");
    let nonceReserved = Number(requireEnv("CHILD_NONCE_RESERVED"));
    let rbacAdmin = requireEnv("CHILD_RBAC_DEPLOYER_ADMIN");
    let rbacPauser = requireEnv("CHILD_RBAC_DEPLOYER_PAUSER");
    let rbacUnpauser = requireEnv("CHILD_RBAC_DEPLOYER_UNPAUSER");

    const childProvider = new ethers.providers.JsonRpcProvider(childRPCURL, Number(childChainID));

    // Get deployer address
    let reservedDeployerWallet;
    if (nonceReservedDeployerSecret == "ledger") {
        let index = requireEnv("NONCE_RESERVED_DEPLOYER_INDEX");
        const derivationPath = `m/44'/60'/${parseInt(index)}'/0/0`;
        reservedDeployerWallet = new LedgerSigner(childProvider, derivationPath);
    } else {
        reservedDeployerWallet = new ethers.Wallet(nonceReservedDeployerSecret, childProvider);
    }
    let reservedDeployerAddr = await reservedDeployerWallet.getAddress();
    console.log("Reserved deployer address is: ", reservedDeployerAddr);

    // Check the current nonce matches the reserved nonce
    let currentNonce = await childProvider.getTransactionCount(reservedDeployerAddr);
    if (nonceReserved != currentNonce) {
        throw("Nonce mismatch, expected " + nonceReserved + " actual " + currentNonce);
    }

    await waitForConfirmation();

    console.log("Deploy RBAC deployer...");
    let rbacDeployer = await deployChildContract("AccessControlledDeployer", reservedDeployerWallet, nonceReserved, rbacAdmin, rbacPauser, rbacUnpauser);
    console.log("Transaction submitted: ", JSON.stringify(rbacDeployer.deployTransaction, null, 2));
    await waitForReceipt(rbacDeployer.deployTransaction.hash, childProvider);
    console.log("Deployed to CHILD_RBAC_DEPLOYER: ", rbacDeployer.address);
    await verifyChildContract("AccessControlledDeployer", rbacDeployer.address);
}
run();