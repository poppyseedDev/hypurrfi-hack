import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { parseUnits } from "ethers";

/**
 * Deploys mock contracts for local testing
 * - MockERC20 (USDC with 6 decimals)
 * - MockHypurrFiPool (mock lending pool with price oracle)
 *
 * Only deploys on localhost/hardhat networks
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployMocks: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  const chainId = await hre.getChainId();

  // Only deploy mocks on local networks
  if (chainId === "31337" || chainId === "1337") {
    console.log("\n📦 Deploying mock contracts...");

    // Deploy MockERC20 (USDC with 6 decimals)
    const mockUSDC = await deploy("MockERC20", {
      from: deployer,
      args: [
        "USD Coin", // name
        "USDC", // symbol
        6, // decimals
      ],
      log: true,
      autoMine: true,
    });

    console.log("✅ MockERC20 (USDC) deployed at:", mockUSDC.address);

    // Deploy MockHypurrFiPool
    const mockPool = await deploy("MockHypurrFiPool", {
      from: deployer,
      args: [],
      log: true,
      autoMine: true,
    });

    console.log("✅ MockHypurrFiPool deployed at:", mockPool.address);

    // Get contract instances for setup
    const usdc = await hre.ethers.getContractAt("MockERC20", mockUSDC.address);
    const pool = await hre.ethers.getContractAt("MockHypurrFiPool", mockPool.address);

    // Set up initial state
    console.log("\n⚙️  Setting up initial state...");

    // Initialize USDC reserve in the pool
    await pool.initReserve(
      mockUSDC.address, // asset
      "HypurrFi USDC", // aToken name
      "hyUSDC", // aToken symbol
      8000, // 80% LTV
      8500, // 85% liquidation threshold
      500, // 5% liquidation bonus
      parseUnits("1", 8), // $1.00 price (8 decimals)
    );
    console.log("✅ Initialized USDC reserve in pool");

    // Mint initial USDC to deployer for testing (1,000,000 USDC)
    const mintAmount = parseUnits("1000000", 6);
    await usdc.mint(deployer, mintAmount);
    console.log(`✅ Minted ${mintAmount.toString()} USDC to deployer`);

    console.log("\n✨ Mock contracts deployed and configured successfully!\n");
  } else {
    console.log("⏭️  Skipping mock deployment on non-local network");
  }
};

export default deployMocks;

deployMocks.tags = ["Mocks", "MockERC20", "MockHypurrFiPool"];
