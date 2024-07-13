import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract, ethers } from "ethers"; // Import the ethers library

const deployrandom: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {

  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  const gasPrice = ethers.parseUnits('30', 'gwei'); 

  const subscriptionId = ethers.toBigInt("41504703584227333385498388787649132955408048185101517223144338074195101474463");
  ;

  const randomGeneratorContract = await deploy("RandomGenerator", {
    from: deployer,
    args: [subscriptionId],
    gasPrice,
    log: true,
    autoMine: true,
  });

  const randomGeneratorContractAddress = randomGeneratorContract.address;

  console.log("RandomGeneratorContract deployed successfully at address:", randomGeneratorContractAddress);

};

export default deployrandom;