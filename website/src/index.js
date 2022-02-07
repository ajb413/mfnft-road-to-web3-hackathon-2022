const fs = require('fs');
const path = require('path');
const ethers = require('ethers');
const express = require('express');
// const helmet = require('helmet');
const app = express();
const port = process.argv[2] || 3000;
// const network = process.argv[3] || 'http://localhost:8545';
// const address = process.argv[4] || '0xD934F4CA6fdfB7DEecE18A59197e04463CCff01d';
// const baseUrl = process.argv[5] || 'http://localhost:3000';
const privateKey = process.env.PRIVATE_KEY_MUMBAI;

app.use(express.json({ limit: 100000 }));
// app.use(helmet({ contentSecurityPolicy: false }));

const metas = {};

app.all('*', function (req, res, next) {
  if (!req.originalUrl) {
    req.originalUrl = '';
  }
  if (
    !isASCII(req.originalUrl) ||
    req.originalUrl.length > 200
  ) {
    res.sendStatus(400);
  } else {
    next();
  }
});

app.get('/', function (req, res, next) {
  try {
    const filepath = path.join(__dirname, 'public/index.html');
    res.sendFile(filepath, {}, function (err) {
      if (err) {
        res.sendStatus(400);
      }
    });
  } catch (e) {
    res.sendStatus(400);
  }
})

app.post('/mint/', async function (req, res, next) {
  const metadata = req.body.metadata;
  const address = req.body.address;
  let jsonRpcUrl = `https://rpc-mumbai.matic.today`;
  const provider = new ethers.providers.JsonRpcProvider(jsonRpcUrl);
  let signer1 = new ethers.Wallet(privateKey);
  signer1 = signer1.connect(provider);
  const contract = new ethers.Contract(
    '0xf793Cbd4a894304D8C86fbc3221A4e8a831828C0',
    [ 
      'function mint(address) public payable',
      'function totalSupply() public view returns (uint)'
     ],
    signer1
  );
  const tx = await contract.mint(address);

  const id = (+(await contract.callStatic.totalSupply()).toString()) + 1;

  metas[id] = metadata;

  res.send({hash:tx.hash});
})

app.get('/data/:id/', function (req, res, next) {
  res.send(metas[req.params.id]);
});

app.get('/public/:name', function (req, res, next) {
  const options = {
    root: path.join(__dirname, 'public'),
    dotfiles: 'deny',
  }

  const fileName = req.params.name;

  try {
    if (
      !req.url ||
      req.url.length > 200
    ) {
      throw Error();
    }

    if (
      !fileName ||
      typeof fileName !== 'string' ||
      fileName.includes('..') ||
      fileName.length > 50
    ) {
      res.sendStatus(400);
    } else {
      res.sendFile(fileName, options, function (err) {
        if (err) {
          res.sendStatus(400);
        }
      })
    }
  } catch (e) {
    res.sendStatus(400);
  }
})

app.get('/public/img/:name', function (req, res, next) {
  const options = {
    root: path.join(__dirname, 'public', 'img'),
    dotfiles: 'deny',
  }

  const fileName = req.params.name;

  try {
    if (
      !req.url ||
      req.url.length > 200
    ) {
      throw Error();
    }

    if (
      !fileName ||
      typeof fileName !== 'string' ||
      fileName.includes('..') ||
      fileName.length > 50
    ) {
      res.sendStatus(400);
    } else {
      res.sendFile(fileName, options, function (err) {
        if (err) {
          res.sendStatus(400);
        }
      })
    }
  } catch (e) {
    res.sendStatus(400);
  }
})

app.use(function(req, res, next){
  res.sendStatus(400);
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`)
})

function isASCII(str) {
  try {
    return /^[\x00-\x7F]*$/.test(str);
  } catch(e) {
    return false;
  }
}
