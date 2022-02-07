const ethers = require('ethers');
const accts = require('../keys.json');

const nftContractName = 'MyFirstNft';
const { bytecode, abi } = require(`../artifacts/contracts/${nftContractName}.sol/${nftContractName}.json`);

// node ./scripts/mint.js local 0xf793Cbd4a894304D8C86fbc3221A4e8a831828C0

const net = process.argv[2];
const contractAddress = process.argv[3];

if (!net || (net !== 'mumbai' && net !== 'local')) {
  console.log('Invalid network parameter. Exiting...');
  process.exit(1);
}

let jsonRpcUrl = net === 'local' ? 'http://localhost:8545' : `https://rpc-mumbai.matic.today`;

const provider = new ethers.providers.JsonRpcProvider(jsonRpcUrl);

// creator account
const devAcct = accts.creatorAddr;
const pk = accts.creatorPrivate;
let signer1 = new ethers.Wallet(pk);
signer1 = signer1.connect(provider);

(async function () {
  const contract = new ethers.Contract(
    contractAddress,
    abi,
    signer1
  );

  const to = '0x1111111111111111111111111111111111111111';
  const tx = await contract.mint(to);

  // console.log('tx', tx);

  console.log('mint tx hash', tx.hash);

  const res = await tx.wait(1);
  // console.log('res', res, JSON.stringify(res));

  const bal = await contract.callStatic.balanceOf(to);
  console.log('bal of address', bal.toString());

})().catch(console.error);
