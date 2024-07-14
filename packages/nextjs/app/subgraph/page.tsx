import React from "react";
import Link from "next/link";
import SVGTable from "./_components/SVGTable";
import type { NextPage } from "next";
import { MagnifyingGlassIcon, PlusIcon, PowerIcon, RocketLaunchIcon } from "@heroicons/react/24/outline";

const Subgraph: NextPage = () => {
  return (
    <>
      <div>
        <div className="flex items-center flex-col flex-grow pt-10">
          <h1 className="text-center mb-8">
            <span className="block text-2xl mb-2">Welcome to your</span>
            <span className="block text-4xl font-bold">Subgraph for Evolving NFTs</span>
          </h1>
        </div>
        <SVGTable />
      </div>
    </>
  );
};

export default Subgraph;
