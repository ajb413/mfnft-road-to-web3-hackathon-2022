const ethers = require('ethers');
const accts = require('../keys.json');

const nftContractName = 'MyFirstNft';
const { bytecode, abi } = require(`../artifacts/contracts/${nftContractName}.sol/${nftContractName}.json`);

const net = process.argv[2];

// you need to set the account below too!!
// node ./scripts/deploy.js mumbai
// node ./scripts/deploy.js local
if (!net || (net !== 'mumbai' && net !== 'local')) {
  console.log('Invalid network parameter. Exiting...');
  process.exit(1);
}

let jsonRpcUrl = net === 'local' ? 'http://localhost:8545' : `https://rpc-mumbai.matic.today`;
const provider = new ethers.providers.JsonRpcProvider(jsonRpcUrl);

// contract constructor params
// const tokenUri = 'http://localhost:3000/data/';

const tokenUri = 'https://myfirstnft.xyz/data/';

// creator account
const devAcct = accts.creatorAddr;
const pk = accts.creatorPrivate;
let signer1 = new ethers.Wallet(pk);
signer1 = signer1.connect(provider);

(async function () {
  let factory = new ethers.ContractFactory(abi, bytecode, signer1);
  let _contract = await factory.deploy(tokenUri);

  let contract = new ethers.Contract(
    _contract.address,
    abi,
    signer1
  );

  console.log('contract address', _contract.address);

  // check total minted
  try {
    const totalMint = (await contract.callStatic.totalMint()).toString();
    console.log('totalMint', totalMint);
  } catch (e) {
    console.error(e);
    console.log(JSON.stringify(e));
  }

})().catch(console.error);
