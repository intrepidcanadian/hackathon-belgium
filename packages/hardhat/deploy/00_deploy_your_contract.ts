import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";
import {ethers} from "hardhat";

/**
 * Deploys a contract named "YourContract" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployYourContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {

  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const TokenDeployed = await deploy("Token", {
    from: deployer,
    // Contract constructor arguments
    // args: [deployer],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });

  const TokenDeployedAddress = TokenDeployed.address;

  const TokenShopDeployed = await deploy("TokenShop", {
    from: deployer,
    args: [TokenDeployedAddress],
    log: true,
    autoMine: true,
  });

  const deployerSigner = await ethers.getSigner(deployer);

  const TokenShopDeployedAddress = TokenShopDeployed.address;

  const tokenContract= await ethers.getContractAt("Token", TokenDeployedAddress, deployerSigner);
  const MINTER_ROLE = await tokenContract.MINTER_ROLE();
  await tokenContract.grantRole(MINTER_ROLE, TokenShopDeployedAddress);

  console.log(`MINTER_ROLE granted to TokenShop at address: ${TokenShopDeployedAddress}`);

  // await deploy("GamePriceSVG", {
  //   from: deployer,
  //   args: [],
  //   log: true,
  //   autoMine: true,
  // });

};

export default deployYourContract;