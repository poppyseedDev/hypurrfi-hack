"use client";

import React from "react";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { DepositForm, PositionCard, VaultStats, WithdrawForm } from "~~/components/vault";

/**
 * HypurrFi Vault Page
 * Main vault dashboard with deposit/withdraw forms, position display, and vault statistics
 */
const VaultPage: NextPage = () => {
  const { isConnected } = useAccount();

  return (
    <div className="flex items-center flex-col grow pt-10">
      {/* Header Section */}
      <div className="px-5 w-full max-w-7xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">HypurrFi Leverage Loop Vault</h1>
          <p className="text-lg text-base-content/70">
            Earn leveraged yields with automated position management
          </p>
        </div>

        {/* Risk Warning Banner */}
        {isConnected && (
          <div className="alert alert-warning shadow-lg mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <h3 className="font-bold">Important Notice</h3>
              <div className="text-sm">
                Leveraged strategies involve risk. Monitor your health factor to avoid liquidation. Always understand
                the risks before depositing.
              </div>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Left Column - Forms */}
          <div className="space-y-6">
            {/* Deposit Form */}
            <DepositForm />

            {/* Withdraw Form */}
            <WithdrawForm />
          </div>

          {/* Right Column - Position & Stats */}
          <div className="space-y-6">
            {/* User Position Card */}
            <PositionCard />

            {/* Vault Statistics */}
            <VaultStats />
          </div>
        </div>

        {/* Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="card bg-base-200 shadow-md">
            <div className="card-body">
              <h3 className="card-title text-lg">How It Works</h3>
              <p className="text-sm text-base-content/70">
                Deposit assets to receive vault shares. The vault automatically manages leveraged positions using
                protocols like Aave and Uniswap to maximize yields.
              </p>
            </div>
          </div>

          <div className="card bg-base-200 shadow-md">
            <div className="card-body">
              <h3 className="card-title text-lg">Leverage Strategy</h3>
              <p className="text-sm text-base-content/70">
                The vault maintains a target leverage ratio by borrowing against collateral. Positions are automatically
                rebalanced to optimize returns while managing risk.
              </p>
            </div>
          </div>

          <div className="card bg-base-200 shadow-md">
            <div className="card-body">
              <h3 className="card-title text-lg">Risk Management</h3>
              <p className="text-sm text-base-content/70">
                Monitor your health factor to ensure your position stays safe. A health factor below 1.0 may result in
                liquidation. Rebalancing helps maintain healthy positions.
              </p>
            </div>
          </div>
        </div>

        {/* Contract Notice */}
        <div className="alert shadow-lg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="stroke-info shrink-0 w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <div>
            <h3 className="font-bold">Development Notice</h3>
            <div className="text-sm">
              This UI is ready to connect to a deployed vault contract. Update the contract name in the hooks and
              components to match your deployed vault contract. See the{" "}
              <code className="bg-base-300 px-1 rounded">deployedContracts.ts</code> file for available contracts.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VaultPage;
