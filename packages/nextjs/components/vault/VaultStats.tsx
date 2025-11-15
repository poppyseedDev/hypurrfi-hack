"use client";

import React from "react";
import { formatEther } from "viem";
import { useVaultStats } from "~~/hooks/vault";

/**
 * Display vault-wide statistics
 * Shows TVL, APY, leverage, and utilization rate
 */
export const VaultStats: React.FC = () => {
  const { tvl, apyPercentage, leverageMultiplier, utilizationPercentage, isRebalanceNeeded, isLoading } =
    useVaultStats();

  if (isLoading) {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Vault Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="stat bg-base-200 rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-base-300 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-base-300 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-base-300 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title flex items-center justify-between">
          <span>Vault Statistics</span>
          {isRebalanceNeeded && (
            <span className="badge badge-warning badge-sm">Rebalance Needed</span>
          )}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {/* TVL */}
          <div className="stat bg-base-200 rounded-lg p-4">
            <div className="stat-title text-sm">Total Value Locked</div>
            <div className="stat-value text-2xl text-primary">{formatEther(tvl)} ETH</div>
            <div className="stat-desc">Vault size</div>
          </div>

          {/* APY */}
          <div className="stat bg-base-200 rounded-lg p-4">
            <div className="stat-title text-sm">Current APY</div>
            <div className="stat-value text-2xl text-success">{apyPercentage.toFixed(2)}%</div>
            <div className="stat-desc">Annual yield</div>
          </div>

          {/* Leverage */}
          <div className="stat bg-base-200 rounded-lg p-4">
            <div className="stat-title text-sm">Leverage Multiplier</div>
            <div className="stat-value text-2xl text-accent">{leverageMultiplier.toFixed(2)}x</div>
            <div className="stat-desc">Current leverage</div>
          </div>

          {/* Utilization */}
          <div className="stat bg-base-200 rounded-lg p-4">
            <div className="stat-title text-sm">Utilization Rate</div>
            <div className="stat-value text-2xl text-info">{utilizationPercentage.toFixed(2)}%</div>
            <div className="stat-desc">Vault utilization</div>
          </div>
        </div>

        {/* Additional info */}
        <div className="divider"></div>
        <div className="text-xs text-base-content/50 space-y-1">
          <p>Statistics update every block</p>
          <p>APY is calculated based on current rates and may vary</p>
        </div>
      </div>
    </div>
  );
};
