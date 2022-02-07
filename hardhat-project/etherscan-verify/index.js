const fs = require('fs');
const ethers = require('ethers');

// Import your hardhat compiled standard-json-input file
const build = require('../artifacts/build-info/c39ac34126b9ecf4e0669ae242507b2f.json');
const myConstructorArgs = ['https://myfirstnft.xyz/data/'];

const stdJsonInput = build.input;

// minify it to make it small enough to upload to etherscan (<3.5mb)
const minified = JSON.stringify(stdJsonInput, null, '');

// output the minified std json input file
fs.writeFileSync('./out.json', minified);

// re-encoded constructor args in case etherscan bugs out
const abiCoder = new ethers.utils.AbiCoder();

const abi = build
  ['output']
  ['contracts']
  ['contracts/MyFirstNft.sol']
  ['MyFirstNft']
  ['abi'];

// constructor object in the abi
const argTypes = abi[0].inputs.map((_) => { return _.type });

const encodedConstructorArgs = abiCoder.encode(
  argTypes,
  myConstructorArgs
);

console.log('Etherscan Verify & Publish');
console.log('Compiler: Solidity (Standard-JSON-Input)');
console.log('Standard-Input-Json (*.json) file: ./out.json');
console.log('Constructor Arguments ABI-Encoded:');

console.log(encodedConstructorArgs.slice(2, encodedConstructorArgs.length));

