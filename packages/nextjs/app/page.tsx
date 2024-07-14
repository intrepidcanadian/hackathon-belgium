"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import type { NextPage } from "next";
import { parseEther } from "viem";
import { useAccount } from "wagmi";
import { Address, EtherInput } from "~~/components/scaffold-eth";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [ethAmount, setEthAmount] = useState("");
  const [selectedStat, setSelectedStat] = useState("cartLineCostSum");
  const [statResult, setStatResult] = useState<null | {
    cartLineCostSum: string;
    productViewedCount: string;
    checkoutCompletedCount: string;
    totalTransactionAmount: string;
    timestamp: bigint;
  }>(null);

  const { data: tokenBalance } = useScaffoldReadContract({
    contractName: "Token",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  const { data: tokenPrice } = useScaffoldReadContract({
    contractName: "TokenShop",
    functionName: "tokenPrice",
  });

  const { writeContractAsync: writeYourContractAsync } = useScaffoldWriteContract("TokenShop");

  const { writeContractAsync: requestStatAsync } = useScaffoldWriteContract("CartCostFunctions");

  const { data: statsData, refetch: refetchStats } = useScaffoldReadContract({
    contractName: "CartCostFunctions",
    functionName: "getStats",
  });

  const handleRequestStat: React.MouseEventHandler<HTMLButtonElement> = async () => {
    try {
      const tx = await requestStatAsync({ functionName: "requestStat", args: [selectedStat] });
      refetchStats();
    } catch (error) {
      console.error("Error requesting stat:", error);
    }
  };

  const renderEmojis = (count: string, emoji: string) => {
    const numCount = parseInt(count, 10);
    return (
      <div className="flex flex-wrap bg-gray-100 p-2 rounded">
        {Array.from({ length: numCount }, (_, index) => (
          <span key={index} className="m-1">{emoji}</span>
        ))}
      </div>
    );
  };

  const renderCartEmojis = (value: string) => {
    const numValue = parseFloat(value) / 100; // Divide by 100
    const numCarts = Math.floor(numValue);
    return renderEmojis(numCarts.toString(), "🛒");
  };

  const renderMoneyEmojis = (value: string) => {
    const numValue = parseFloat(value) / 100; // Divide by 100
    const numMoneyBags = Math.floor(numValue);
    return renderEmojis(numMoneyBags.toString(), "💰");
  };

  useEffect(() => {
    if (statsData) {
      setStatResult(statsData);
    }
  }, [statsData]);

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <h1 className="font-bold text-center text-4xl">
          <span className="block text-2xl mb-2">Online Marketing Attribution</span>
          <span className="block text-4xl font-bold">E-Commerce Cost of Acquisition Alignment with Performance Metrics</span>
        </h1>
        <div className="flex justify-center items-center space-x-2 flex-col sm:flex-row">
          <label className="my-2 font-medium">Select Stat to Request:</label>
          <select
            value={selectedStat}
            onChange={(e) => setSelectedStat(e.target.value)}
            className="select select-bordered w-full max-w-xs"
          >
            <option value="cartLineCostSum">Cumulative Value of Products Added to Cart</option>
            <option value="productViewedCount">Cumulative Count of Product Viewed</option>
            <option value="checkoutCompletedCount">Cumulative Number of Checkouts Completed</option>
            <option value="totalTransactionAmount">Cumulative Checkout Value Completed</option>
          </select>
          <button className="btn btn-primary my-2" onClick={handleRequestStat}>
            Request Stat
          </button>
        </div>
        {statResult && (
          <div className="mr-12 ml-12 mt-6 max-w-full overflow-x-auto">
            <h3 className="font-bold text-xl align-center">Campaign Result:</h3>
            <div className="my-4">
              <p className="font-semibold">Cumulative Value of Products Added to Cart: {statResult.cartLineCostSum}</p>
              <div>{renderCartEmojis(statResult.cartLineCostSum)}</div>
            </div>
            <hr className="my-2"/>
            <div className="my-4">
              <p className="font-semibold">Cumulative Count of Products Viewed: {statResult.productViewedCount}</p>
              <div>{renderEmojis(statResult.productViewedCount, "👀")}</div>
            </div>
            <hr className="my-2"/>
            <div className="my-4">
              <p className="font-semibold">Cumulative Number of Checkouts Completed: {statResult.checkoutCompletedCount}</p>
              <div>{renderEmojis(statResult.checkoutCompletedCount, "✅")}</div>
            </div>
            <hr className="my-2"/>
            <div className="my-4">
              <p className="font-semibold">Cumulative Value of Checkouts Completed: {statResult.totalTransactionAmount}</p>
              <div>{renderMoneyEmojis(statResult.totalTransactionAmount)}</div>
            </div>
          </div>
        )}
        <div className="px-5">
          <div className="flex justify-center items-center space-x-2 flex-col sm:flex-row">
            <p className="my-2 font-medium">Connected Address:</p>
            <Address address={connectedAddress} />
          </div>
          <div className="flex justify-center items-center space-x-2 flex-col sm:flex-row">
            <p className="my-2 font-medium">
              Amount of Tokens Owned:{" "}
              {tokenBalance ? ethers.utils.formatUnits(tokenBalance, 2) : 0}
            </p>
          </div>
          <div className="flex justify-center items-center space-x-2 flex-col sm:flex-row">
            <p className="my-2 font-light">
              Price to Mint Tokens in USD: {tokenPrice ? ethers.utils.formatUnits(tokenPrice, 2) : 0}
            </p>
          </div>
          <div className="flex justify-center items-center space-x-2 flex-col sm:flex-row">
            <p className="my-2 font-medium">Pay in ETH:</p>
            <EtherInput value={ethAmount} onChange={amount => setEthAmount(amount)} />
            <button
              className="btn btn-primary my-2"
              onClick={async () => {
                try {
                  await writeYourContractAsync({
                    functionName: "purchaseTokens",
                    value: parseEther(ethAmount),
                  });
                } catch (e) {
                  console.error("Error", e);
                }
              }}
            >
              Buy Tokens
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
