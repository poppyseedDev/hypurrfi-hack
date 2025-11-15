"use client";

import React, { useState, useCallback, useMemo } from "react";
import { parseEther, formatEther } from "viem";
import { useAccount } from "wagmi";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

/**
 * Deposit form component
 * Handles token approval and deposit flow
 */
export const DepositForm: React.FC = () => {
  const { address: connectedAddress } = useAccount();
  const [depositAmount, setDepositAmount] = useState<string>("");
  const [isApproving, setIsApproving] = useState(false);
  const [isDepositing, setIsDepositing] = useState(false);

  // Placeholder vault contract address - replace with actual deployed address
  const VAULT_ADDRESS = "0x0000000000000000000000000000000000000000";

  // Fetch user's token balance (SE2Token as example)
  const { data: tokenBalance } = useScaffoldReadContract({
    contractName: "SE2Token",
    functionName: "balanceOf",
    args: connectedAddress ? [connectedAddress] : undefined,
    query: {
      enabled: !!connectedAddress,
    },
  });

  // Fetch current allowance
  const { data: allowance, refetch: refetchAllowance } = useScaffoldReadContract({
    contractName: "SE2Token",
    functionName: "allowance",
    args: connectedAddress ? [connectedAddress, VAULT_ADDRESS] : undefined,
    query: {
      enabled: !!connectedAddress,
    },
  });

  // Fetch estimated shares for deposit amount
  const { data: estimatedShares } = useScaffoldReadContract({
    contractName: "VaultContract",
    functionName: "convertToShares",
    args: depositAmount ? [parseEther(depositAmount)] : undefined,
    query: {
      enabled: !!depositAmount && parseFloat(depositAmount) > 0,
    },
  });

  // Write hooks for approval and deposit
  const { writeContractAsync: approveAsync } = useScaffoldWriteContract("SE2Token");
  const { writeContractAsync: depositAsync } = useScaffoldWriteContract("VaultContract");

  // Check if approval is needed
  const needsApproval = useMemo(() => {
    if (!depositAmount || !allowance) return true;
    try {
      const amount = parseEther(depositAmount);
      return allowance < amount;
    } catch {
      return true;
    }
  }, [depositAmount, allowance]);

  // Validate deposit amount
  const { isValid, errorMessage } = useMemo(() => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      return { isValid: false, errorMessage: "Enter an amount" };
    }
    try {
      const amount = parseEther(depositAmount);
      if (tokenBalance && amount > tokenBalance) {
        return { isValid: false, errorMessage: "Insufficient balance" };
      }
      return { isValid: true, errorMessage: "" };
    } catch {
      return { isValid: false, errorMessage: "Invalid amount" };
    }
  }, [depositAmount, tokenBalance]);

  // Handle approval
  const handleApprove = useCallback(async () => {
    if (!connectedAddress || !depositAmount) return;

    try {
      setIsApproving(true);
      const amount = parseEther(depositAmount);

      await approveAsync({
        functionName: "approve",
        args: [VAULT_ADDRESS, amount],
      });

      notification.success("Approval successful!");
      await refetchAllowance();
    } catch (error: any) {
      console.error("Approval error:", error);
      notification.error(error?.message || "Approval failed");
    } finally {
      setIsApproving(false);
    }
  }, [connectedAddress, depositAmount, approveAsync, refetchAllowance]);

  // Handle deposit
  const handleDeposit = useCallback(async () => {
    if (!connectedAddress || !depositAmount) return;

    try {
      setIsDepositing(true);
      const amount = parseEther(depositAmount);

      await depositAsync({
        functionName: "deposit",
        args: [amount],
      });

      notification.success("Deposit successful!");
      setDepositAmount("");
    } catch (error: any) {
      console.error("Deposit error:", error);
      notification.error(error?.message || "Deposit failed");
    } finally {
      setIsDepositing(false);
    }
  }, [connectedAddress, depositAmount, depositAsync]);

  // Handle max button
  const handleMaxClick = useCallback(() => {
    if (tokenBalance) {
      setDepositAmount(formatEther(tokenBalance));
    }
  }, [tokenBalance]);

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Deposit Assets</h2>

        {/* Amount Input */}
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Deposit Amount</span>
            <span className="label-text-alt">
              Balance: {tokenBalance ? formatEther(tokenBalance) : "0"} SE2
            </span>
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="0.0"
              value={depositAmount}
              onChange={e => setDepositAmount(e.target.value)}
              className={`input input-bordered w-full ${errorMessage ? "input-error" : ""}`}
              disabled={!connectedAddress || isApproving || isDepositing}
            />
            <button
              className="btn btn-secondary"
              onClick={handleMaxClick}
              disabled={!connectedAddress || !tokenBalance || isApproving || isDepositing}
            >
              MAX
            </button>
          </div>
          {errorMessage && (
            <label className="label">
              <span className="label-text-alt text-error">{errorMessage}</span>
            </label>
          )}
        </div>

        {/* Estimated Shares */}
        {estimatedShares && depositAmount && parseFloat(depositAmount) > 0 && (
          <div className="alert alert-info">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="stroke-current shrink-0 w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <span>You will receive approximately {formatEther(estimatedShares)} shares</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="card-actions justify-end mt-4">
          {!connectedAddress ? (
            <div className="alert alert-warning">
              <span>Please connect your wallet to deposit</span>
            </div>
          ) : needsApproval ? (
            <button
              className="btn btn-primary w-full"
              onClick={handleApprove}
              disabled={!isValid || isApproving}
            >
              {isApproving && <span className="loading loading-spinner"></span>}
              {isApproving ? "Approving..." : "Approve Token"}
            </button>
          ) : (
            <button
              className="btn btn-primary w-full"
              onClick={handleDeposit}
              disabled={!isValid || isDepositing}
            >
              {isDepositing && <span className="loading loading-spinner"></span>}
              {isDepositing ? "Depositing..." : "Deposit"}
            </button>
          )}
        </div>

        {/* Info */}
        <div className="divider"></div>
        <div className="text-xs text-base-content/50 space-y-1">
          <p>1. First approve the vault to spend your tokens</p>
          <p>2. Then deposit to receive vault shares</p>
          <p>3. Your position will start earning leveraged yields</p>
        </div>
      </div>
    </div>
  );
};
