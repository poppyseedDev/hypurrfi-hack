import { useMemo } from "react";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

/**
 * Custom hook to fetch vault-wide statistics
 * @returns Vault statistics including TVL, APY, leverage, and utilization
 */
export const useVaultStats = () => {
  // Fetch total vault assets (TVL)
  const { data: tvl, isLoading: tvlLoading } = useScaffoldReadContract({
    contractName: "VaultContract",
    functionName: "totalAssets",
    watch: true,
  });

  // Fetch current APY
  const { data: apy, isLoading: apyLoading } = useScaffoldReadContract({
    contractName: "VaultContract",
    functionName: "getCurrentAPY",
    watch: true,
  });

  // Fetch current leverage ratio
  const { data: leverage, isLoading: leverageLoading } = useScaffoldReadContract({
    contractName: "VaultContract",
    functionName: "getCurrentLeverageRatio",
    watch: true,
  });

  // Fetch utilization rate
  const { data: utilizationRate, isLoading: utilizationLoading } = useScaffoldReadContract({
    contractName: "VaultContract",
    functionName: "getUtilizationRate",
    watch: true,
  });

  // Fetch total supply of shares
  const { data: totalShares, isLoading: sharesLoading } = useScaffoldReadContract({
    contractName: "VaultContract",
    functionName: "totalSupply",
    watch: true,
  });

  // Fetch rebalance status
  const { data: isRebalanceNeeded, isLoading: rebalanceLoading } = useScaffoldReadContract({
    contractName: "VaultContract",
    functionName: "isRebalanceNeeded",
    watch: true,
  });

  // Calculate APY as a percentage (assuming contract returns basis points)
  const apyPercentage = useMemo(() => {
    if (!apy) return 0;
    return Number(apy) / 100; // Convert from basis points to percentage
  }, [apy]);

  // Calculate leverage as a decimal (assuming contract returns with 18 decimals)
  const leverageMultiplier = useMemo(() => {
    if (!leverage) return 0;
    return Number(leverage) / 1e18;
  }, [leverage]);

  // Calculate utilization as a percentage
  const utilizationPercentage = useMemo(() => {
    if (!utilizationRate) return 0;
    return Number(utilizationRate) / 100; // Convert from basis points to percentage
  }, [utilizationRate]);

  const isLoading =
    tvlLoading || apyLoading || leverageLoading || utilizationLoading || sharesLoading || rebalanceLoading;

  return {
    tvl: tvl || 0n,
    apy: apy || 0n,
    apyPercentage,
    leverage: leverage || 0n,
    leverageMultiplier,
    utilizationRate: utilizationRate || 0n,
    utilizationPercentage,
    totalShares: totalShares || 0n,
    isRebalanceNeeded: isRebalanceNeeded || false,
    isLoading,
  };
};
