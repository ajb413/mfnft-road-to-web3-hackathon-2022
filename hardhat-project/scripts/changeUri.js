const ethers = require('ethers');
const accts = require('../keys.json');

const nftContractName = 'MyFirstNft';
const { bytecode, abi } = require(`../artifacts/contracts/${nftContractName}.sol/${nftContractName}.json`);

const net = process.argv[2];
const contractAddress = process.argv[3];

// node ./scripts/changeUri.js mumbai 0xf793Cbd4a894304D8C86fbc3221A4e8a831828C0
if (!net || (net !== 'mumbai' && net !== 'local')) {
  console.log('Invalid network parameter. Exiting...');
  process.exit(1);
}

if (!contractAddress) {
  console.log('Missing contract address. Exiting...');
  process.exit(1);
}

let jsonRpcUrl = net === 'local' ? `http://localhost:8545` : `https://rpc-mumbai.matic.today`;
const provider = new ethers.providers.JsonRpcProvider(jsonRpcUrl);

// dev account
const devAcct = accts.creatorAddr;
const pk = accts.creatorPrivate;
let signer1 = new ethers.Wallet(pk);
signer1 = signer1.connect(provider);

(async function () {
  let contract = new ethers.Contract(
    contractAddress,
    abi,
    signer1
  );

  // setbaseURI
  try {
    const setbaseURI = await contract.setBaseURI('http://localhost:3000/data/');
    await setbaseURI.wait(1);
    console.log('setBaseURI success');
    const baseTokenURI = await contract.callStatic.baseTokenURI();
    console.log('new baseTokenURI:', baseTokenURI);
  } catch (e) {
    logError('setbaseURI', e);
  }

})().catch(console.error);

function logError(name, e) {
  try {
    const tx_error = Object.keys(e.error.error.data)[0];
    console.error('Error', name, e.error.error.data[tx_error].reason);
  } catch (p) {
    console.error(e);
  }
}