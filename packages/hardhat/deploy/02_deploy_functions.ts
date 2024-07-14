import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract, ethers } from "ethers"; // Import the ethers library

const deployfunctions: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy, log } = hre.deployments;
  const gasPrice = ethers.parseUnits('50', 'gwei'); 

  const subscriptionId = "3219";

  // Deploy the contract
  const CartCostFunctionsContract = await deploy("CartCostFunctions", {
    from: deployer,
    args: [subscriptionId],
    gasPrice,
  });

  const CartCostFunctionsContractAddress = CartCostFunctionsContract.address;

  console.log("CartCostFunctionsContract deployed successfully at address:", CartCostFunctionsContractAddress);

};

export default deployfunctions;
