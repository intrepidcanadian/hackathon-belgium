import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";
import {ethers} from "hardhat";

const deploysvg: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {

  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  const gasPrice = ethers.parseUnits('30', 'gwei'); 

  const GamePriceSVGDeployed = await deploy("GamePriceSVG", {
    from: deployer,
    args: [],
    gasPrice,
    log: true,
    autoMine: true,
  });

  const GamePriceSVGDeployedAddress = GamePriceSVGDeployed.address;

  console.log("GamePriceSVG deployed successfully at address:", GamePriceSVGDeployedAddress);

};

export default deploysvg;