import { useMemo } from "react";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

/**
 * Custom hook to fetch and calculate user's vault position
 * @param userAddress - The address of the user
 * @returns User's position data including shares, value, and underlying assets
 */
export const useVaultPosition = (userAddress?: string) => {
  // Fetch user's share balance
  // Note: Replace "VaultContract" with your actual vault contract name once deployed
  const { data: shares, isLoading: sharesLoading } = useScaffoldReadContract({
    contractName: "VaultContract",
    functionName: "balanceOf",
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
    },
  });

  // Fetch total vault assets (TVL)
  const { data: totalAssets, isLoading: totalAssetsLoading } = useScaffoldReadContract({
    contractName: "VaultContract",
    functionName: "totalAssets",
    watch: true,
  });

  // Fetch total shares supply
  const { data: totalSupply, isLoading: totalSupplyLoading } = useScaffoldReadContract({
    contractName: "VaultContract",
    functionName: "totalSupply",
    watch: true,
  });

  // Fetch health factor for the user
  const { data: healthFactor, isLoading: healthFactorLoading } = useScaffoldReadContract({
    contractName: "VaultContract",
    functionName: "getHealthFactor",
    args: userAddress ? [userAddress] : undefined,
    watch: true,
    query: {
      enabled: !!userAddress,
    },
  });

  // Fetch leverage ratio
  const { data: leverageRatio, isLoading: leverageLoading } = useScaffoldReadContract({
    contractName: "VaultContract",
    functionName: "getCurrentLeverageRatio",
    watch: true,
  });

  // Calculate position value based on shares and total assets
  const positionValue = useMemo(() => {
    if (!shares || !totalAssets || !totalSupply || totalSupply === 0n) return 0n;
    return (shares * totalAssets) / totalSupply;
  }, [shares, totalAssets, totalSupply]);

  // Calculate underlying assets (same as position value for standard vaults)
  const underlyingAssets = useMemo(() => {
    return positionValue;
  }, [positionValue]);

  const isLoading =
    sharesLoading || totalAssetsLoading || totalSupplyLoading || healthFactorLoading || leverageLoading;

  return {
    shares: shares || 0n,
    positionValue,
    underlyingAssets,
    healthFactor: healthFactor || 0n,
    leverageRatio: leverageRatio || 0n,
    totalAssets: totalAssets || 0n,
    totalSupply: totalSupply || 0n,
    isLoading,
    hasPosition: shares ? shares > 0n : false,
  };
};
