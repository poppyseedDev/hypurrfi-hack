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

    // Mint initial USDC to deployer for testing (1,000,000 USDC)
    const mintAmount = parseUnits("1000000", 6);
    await usdc.mint(deployer, mintAmount);
    console.log(`✅ Minted ${mintAmount.toString()} USDC to deployer`);

    // Set initial ETH price in pool (e.g., $2000 per ETH)
    // Assuming price is stored with 8 decimals (like Chainlink)
    const ethPrice = parseUnits("2000", 8);
    await pool.setAssetPrice(
      "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", // ETH address
      ethPrice,
    );
    console.log(`✅ Set ETH price to $${ethPrice.toString()} in pool`);

    // Set USDC price to $1 (with 8 decimals)
    const usdcPrice = parseUnits("1", 8);
    await pool.setAssetPrice(mockUSDC.address, usdcPrice);
    console.log(`✅ Set USDC price to $${usdcPrice.toString()} in pool`);

    console.log("\n✨ Mock contracts deployed and configured successfully!\n");
  } else {
    console.log("⏭️  Skipping mock deployment on non-local network");
  }
};

export default deployMocks;

deployMocks.tags = ["Mocks", "MockERC20", "MockHypurrFiPool"];
