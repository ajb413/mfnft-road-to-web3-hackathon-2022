require('@nomiclabs/hardhat-ethers');
const keys = require('./keys.json');

module.exports = {
  solidity: {
    version: '0.8.6',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      chainId: 1337, // localhost
      accounts: {
        accounts: [ keys.creatorPrivate ]
      },
      gasPrice: 0,
      initialBaseFeePerGas: 0,
    },
  },
  mocha: {
    timeout: 60000
  }
};
