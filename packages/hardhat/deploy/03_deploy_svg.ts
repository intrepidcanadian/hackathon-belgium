import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";
import {ethers} from "hardhat";

const deploysvg: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {

  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  const gasPrice = ethers.parseUnits('50', 'gwei'); 

  const cartCostFunctionsAddress = "0x80a60bd70Bd544c8F4D42be55BF1aDC0Fe9494a6"; 

  const CheckoutSVG = await deploy("EvolvingCheckoutSVG", {
    from: deployer,
    args: [cartCostFunctionsAddress],
    gasPrice,
    log: true,
    autoMine: true,
  });

  const CheckoutSVGAddress = CheckoutSVG.address;

  console.log("EvolvingSVG deployed successfully at address:", CheckoutSVGAddress);

};

export default deploysvg;