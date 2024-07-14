import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";
import { ethers } from "hardhat";

const deploycrosschain: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  const gasPrice = ethers.parseUnits('50', 'gwei'); 

  // Destination contract address on Fuji
  const destinationContract = "0x83A3B854C6ae10dB71cf5F08319c0cEF03F1CF25";

  const deploycrosschainContract = await deploy("CCIPTokenSenderFujiSepolia", {
    from: deployer,
    args: [destinationContract], 
    gasPrice,
    log: true,
    autoMine: true,
  });

  const deploycrosschainContractAddress = deploycrosschainContract.address;
  console.log("CrossChain deployed successfully at address:", deploycrosschainContractAddress);

  // Setting up approvals after deployment
  const ccipTokenSender = await ethers.getContractAt("CCIPTokenSenderFujiSepolia", deploycrosschainContractAddress);
  await ccipTokenSender.setupApprovals();
  console.log("Approvals set up successfully.");
};

export default deploycrosschain;
