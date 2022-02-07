const hre = require('hardhat');
const { TASK_NODE_CREATE_SERVER } = require('hardhat/builtin-tasks/task-names');
const ethers = hre.ethers;
const accts = require('../keys.json');

const nftContractName = 'MyFirstNft';
const { bytecode, abi } = require(`../artifacts/contracts/${nftContractName}.sol/${nftContractName}.json`);

const hostname = 'localhost';
const port = 8545;

// Contract constructor args
const tokenUri = 'http://localhost:3000/data/';

(async function () {
  const jsonRpcServer = await hre.run(TASK_NODE_CREATE_SERVER, {
    hostname,
    port,
    provider: hre.network.provider,
  });

  await jsonRpcServer.listen();

  const provider = new ethers.providers.JsonRpcProvider(`http://${hostname}:${port}`);

  // dev account
  const devAcct = accts.creatorAddr;
  const pk = accts.creatorPrivate;
  let signer1 = new ethers.Wallet(pk);
  signer1 = signer1.connect(provider);

  // Address will be seeded with ETH/MATIC from address[0] of dev mnemonic in hardhat.config.js
  await seedAddressWithEth(devAcct, '5.0');

  let factory = new ethers.ContractFactory(abi, bytecode, signer1);
  let contract = await factory.deploy(tokenUri);

  console.log(`\nLocal chain running at http://${hostname}:${port}`);
  console.log(`Contract deployed at ${contract.address}`);
  console.log(`\nTo exit, hold Ctrl+C.\n`);
})().catch(console.error);

async function seedAddressWithEth(address, eth) {
  const accounts = (await ethers.getSigners()).map(a => a.address);
  const tx = await ethers.provider.getSigner(accounts[0]).sendTransaction({
    to: address,
    value: ethers.utils.parseEther(eth.toString())
  });
  await tx.wait(1);
}
