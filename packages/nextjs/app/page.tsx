"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ethers } from "ethers";
import type { NextPage } from "next";
import { parseEther } from "viem";
import { useAccount, useReadContract } from "wagmi";
import { useWalletClient } from "wagmi";
import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Header } from "~~/components/Header";
import { Address, AddressInput, Balance, EtherInput } from "~~/components/scaffold-eth";
import { useScaffoldContract, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [address, setAddress] = useState("");
  const [ethAmount, setEthAmount] = useState("");
  const [tokenURI, setTokenURI] = useState<string>("");

  console.log(ethAmount);

  const { data: totalSupply } = useScaffoldReadContract({
    contractName: "Token",
    functionName: "totalSupply",
  });

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

  const { data: tokenURIData } = useScaffoldReadContract({
    contractName: "GamePriceSVG",
    functionName: "tokenURI",
    args: [BigInt(0)],
  });
  

  useEffect(() => {
    if (tokenURIData) {
      const tokenURIString = tokenURIData.toString();
      setTokenURI(tokenURIString);
      console.log("Token URI:", tokenURIString);
    }
  }, [tokenURIData]);


  const decodeBase64 = (base64String) => {
    if (typeof window === "undefined") {
      // For Node.js
      return Buffer.from(base64String, 'base64').toString('utf-8');
    } else {
      // For browser environment
      const binaryString = window.atob(base64String);
      const bytes = Uint8Array.from(binaryString, char => char.charCodeAt(0));
      const decoder = new TextDecoder('utf-8');
      return decoder.decode(bytes);
    }
  };

  const decodeSVG = (tokenURI: string) => {
    try {
      const base64Json = tokenURI.split(",")[1];
      const jsonString = decodeBase64(base64Json);
      const json = JSON.parse(jsonString);
      const base64Svg = json.image.split(",")[1];
      return decodeBase64(base64Svg);
    } catch (error) {
      console.error("Error decoding SVG:", error);
      return null;
    }
  };

  const svgContent = decodeSVG(tokenURI);
  

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <h1 className="font-bold text-center text-4xl">
          <span className="block text-2xl mb-2">Welcome to</span>
          <span className="block text-4xl font-bold">Mr. Beast E-Commerce Contest</span>
        </h1>
        <div className="px-5">
          <div className="flex justify-center items-center space-x-2 flex-col sm:flex-row">
            <p className="my-2 font-medium">Connected Address:</p>
            <Address address={connectedAddress} />
          </div>
          <div className="flex justify-center items-center space-x-2 flex-col sm:flex-row">
            <p className="my-2 font-medium">
              Amount of Mr. Beast Tokens Personally Owned:{" "}
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
                  console.error("Error setting greeting:", e);
                }
              }}
            >
              Purchase Tokens
            </button>
          </div>
        </div>
        <div className="flex flex-wrap justify-center items-center space-x-2 flex-col sm:flex-row">
        {tokenURI && (
            <div className="m-4 p-4 border border-gray-200 rounded">
              {svgContent && (
                <div dangerouslySetInnerHTML={{ __html: svgContent }} />
              )}
            </div>
          )}
        </div>

        {/* <h3 className="font-bold text-2xl">We use Chainlink Oracle to recieve ETH/USD price to fix price at USD</h3> */}
        {/* <p className="m-0 flex justify-center items-center">Total Supply of Beast Tokens: {totalSupply ? ethers.utils.formatUnits(totalSupply, 2) : 0}</p> */}
      </div>
    </>
  );
};

export default Home;
