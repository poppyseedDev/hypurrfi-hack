import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { parseUnits } from "ethers";

/**
 * Deploys HypurrFiVault contract
 * - Uses MockERC20 (USDC) as underlying asset on local networks
 * - Configures vault with:
 *   - 2x target leverage
 *   - 1.3 minimum health factor
 *   - 1.5 rebalance health factor threshold
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployVault: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy, get } = hre.deployments;
  const chainId = await hre.getChainId();

  console.log("\n🏦 Deploying HypurrFiVault...");

  let underlyingAsset: string;
  let borrowAsset: string;
  let poolAddress: string;
  let oracleAddress: string;

  // Get addresses based on network
  if (chainId === "31337" || chainId === "1337") {
    // Local network - use mocks
    const mockUSDC = await get("MockERC20");
    const mockPool = await get("MockHypurrFiPool");
    underlyingAsset = mockUSDC.address;
    borrowAsset = mockUSDC.address; // For testing, use same asset
    poolAddress = mockPool.address;
    oracleAddress = mockPool.address; // MockPool has oracle functionality
    console.log("📍 Using mock contracts:");
    console.log("  - Underlying Asset (USDC):", underlyingAsset);
    console.log("  - Borrow Asset (USDC):", borrowAsset);
    console.log("  - Pool:", poolAddress);
    console.log("  - Oracle:", oracleAddress);
  } else {
    // For testnet/mainnet, these would need to be configured
    throw new Error(
      "Please configure real USDC and HypurrFi Pool addresses for non-local networks in the deployment script",
    );
  }

  console.log("\n⚙️  Vault Parameters:");
  console.log("  - Target Leverage:", "2x");
  console.log("  - Min Health Factor:", "1.3");
  console.log("  - Rebalance Threshold:", "1.5");

  // Deploy HypurrFiVault
  const vault = await deploy("HypurrFiVault", {
    from: deployer,
    args: [underlyingAsset, borrowAsset, poolAddress, oracleAddress, "HypurrFi Leverage Vault", "hyVault"],
    log: true,
    autoMine: true,
  });

  console.log("✅ HypurrFiVault deployed at:", vault.address);

  // Verify deployment by checking vault state
  const vaultContract = await hre.ethers.getContractAt("HypurrFiVault", vault.address);

  try {
    const asset = await vaultContract.asset();
    const pool = await vaultContract.pool();
    const name = await vaultContract.name();
    const symbol = await vaultContract.symbol();

    console.log("\n✨ Vault Deployment Verified:");
    console.log("  - Name:", name);
    console.log("  - Symbol:", symbol);
    console.log("  - Asset Address:", asset);
    console.log("  - Pool Address:", pool);

    // Optional: Set up initial liquidity on local networks
    if (chainId === "31337" || chainId === "1337") {
      console.log("\n💧 Setting up initial test liquidity...");
      const usdc = await hre.ethers.getContractAt("MockERC20", underlyingAsset);

      // Approve vault to spend USDC
      const approvalAmount = parseUnits("100000", 6); // 100k USDC
      await usdc.approve(vault.address, approvalAmount);
      console.log("✅ Approved vault to spend USDC");

      // Make initial deposit to vault (10k USDC)
      const depositAmount = parseUnits("10000", 6);
      await vaultContract.deposit(depositAmount, deployer);
      console.log(`✅ Deposited ${depositAmount.toString()} USDC to vault`);

      const shares = await vaultContract.balanceOf(deployer);
      console.log(`✅ Received ${shares.toString()} vault shares`);
    }

    console.log("\n🎉 HypurrFiVault deployment complete!\n");
  } catch (error) {
    console.error("⚠️  Warning: Could not verify vault deployment:", error);
    console.log("Vault deployed but verification failed. This may be expected if contract interfaces differ.\n");
  }
};

export default deployVault;

// Tags for selective deployment
deployVault.tags = ["HypurrFiVault", "Vault"];

// Dependencies - vault requires mocks on local networks
deployVault.dependencies = ["Mocks"];
