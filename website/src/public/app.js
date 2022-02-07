window.addEventListener('load', (event) => {
  let userAddress = '';
  let currentCard = 1;

  $('.card-nav.back').click((e) => nav(e, 'back'));
  $('.card-nav.forward').click((e) => nav(e, 'forward'));

  const nav = (e, direction) => {
    $('#card-' + currentCard).removeClass('current-card');
    if (direction === 'back') currentCard--;
    else currentCard++;
    $('#card-' + currentCard).addClass('current-card');
  };

  const web3authSdk = window.Web3auth
  let web3AuthInstance = null;

  let isText = false;
  let isFile = false;

  function chooseText() {
    isText = true;
    isFile = false;
    $('#type-file').css("background-image", "url('/public/img/file-n-button.png')");
    $('#type-text').css("background-image", "url('/public/img/text-button.png')");
    $('#tip-text').addClass("hidden");
    $('#tip-file').addClass("hidden");
    $('#tip-file').addClass("hidden");
    $('#text-input').removeClass("hidden");
    $('#choose-file-container').addClass("hidden");
    $('#mint').removeClass("hidden");
  }

  function chooseFile() {
    isText = false;
    isFile = true;
    $('#type-text').css("background-image", "url('/public/img/text-n-button.png')");
    $('#type-file').css("background-image", "url('/public/img/file-button.png')");
    $('#tip-text').addClass("hidden");
    $('#tip-file').addClass("hidden");
    $('#text-input').addClass("hidden");
    $('#choose-file-container').removeClass("hidden");
    $('#mint').removeClass("hidden");
  }

  $('#type-text').click(chooseText);
  $('#type-file').click(chooseFile);

  Moralis.initialize('YhVt6OFDJ3yUcFdTus8E2dO6IWYgExOZyn0hzxqj');
  Moralis.serverURL = 'https://qwdkrlltq1xn.usemoralis.com:2053/server';

  $('#mint').click(async () => {
    if (isFile) {
      const mUser = await Moralis.Web3.authenticate();
      console.log('mUser',mUser);
      const fileUploader = document.getElementById('choose-file');
      const file = fileUploader.files[0];
      const moralisFile = new Moralis.File(`f-${userAddress}-${file.name}`, file);
      await moralisFile.saveIPFS();
      const url = moralisFile.ipfs();
      console.log('moralisFile', moralisFile.ipfs(), moralisFile.hash());

      const metadata = {
        "description": "My first nft description", 
        "image": url,
        "file": url,
        "name": "NFT",
        "attributes": [], 
      };

      const json = new Moralis.File('file.json', { base64: btoa(JSON.stringify(metadata)) });
      await json.saveIPFS();

      console.log('json', json.ipfs(), json.hash());

      const res = await fetch('/mint/', {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metadata,
          address: userAddress
        })
      });
      const returned = await res.json();
      console.log('returned', returned);
      let _hash = returned.hash;
      $('#mint-update').html(`Here is your NFT transaction on the blockchain: <a href="https://mumbai.polygonscan.com/tx/${_hash}">https://mumbai.polygonscan.com/tx/${_hash}</a>`)
    } else {
      const mytext = $('#text-input')[0].value;
      const metadata = {
        "description": "My first nft description", 
        "text": mytext,
        "name": "NFT",
        "attributes": [], 
      };

      const res = await fetch('/mint/', {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metadata,
          address: userAddress
        })
      });
      const returned = await res.json();
      console.log('returned', returned);
      let _hash = returned.hash;
      $('#link-container').html(`Here is your NFT transaction on the blockchain: <a href="https://mumbai.polygonscan.com/tx/${_hash}">https://mumbai.polygonscan.com/tx/${_hash}</a>`)

    }
    nav('forward')
  });

  (async function init() {
      $("#logout").hide();

      web3AuthInstance = new web3authSdk.Web3Auth({
          chainConfig: { chainNamespace: "eip155" },
          clientId: "BIu2zLf25r5ILXf0H0EekYf4hc7QmxHDFcWLNUN1NySn1x4It6n91q7cbV40BG5kz6zzM3yEo_Kzhdqa6HPvDqM"
      });

      subscribeAuthEvents(web3AuthInstance)

      await web3AuthInstance.initModal();
      console.log("web3AuthInstance", web3AuthInstance, web3AuthInstance.provider)
      if (web3AuthInstance.provider) {
          const user = await web3AuthInstance.getUserInfo();
          $("#text").text("Logged in as " + user.name + ".");
          $("#logout").show();
          await initWeb3();
      } else {
          $("#text").text("Didn't log in.");
          $("#login").show();
      }
  })();

  function subscribeAuthEvents(web3auth) {
      web3auth.on("connected", (data) => {
          console.log("Yeah!, you are successfully logged in", data);
          initWeb3();
          nav({},'forward');
      });

      web3auth.on("connecting", () => {
          console.log("connecting");
      });

      web3auth.on("disconnected", () => {
          console.log("disconnected");
      });

      web3auth.on("errored", (error) => {
          console.log("some error or user have cancelled login request", error);
      });

      web3auth.on("MODAL_VISIBILITY", (isVisible) => {
          console.log("modal visibility", isVisible)
      });
  }


  async function initWeb3() {
      console.log('initWeb3');
      const web3 = new Web3(web3AuthInstance.provider);
      const address = (await web3.eth.getAccounts())[0];
      const balance = await web3.eth.getBalance(address);
      console.log("address", address);
      console.log("balance", balance);
      userAddress = address;

      // $("#address").text("Address: " + address + ".");
      // $("#balance").text("Balance: " + balance + ".");
  }
  
  $("#login").click(async function (event) {
      try {
          const provider = await  web3AuthInstance.connect()
          console.log("provider after login", provider)
          await initWeb3();
          const user = await web3AuthInstance.getUserInfo();
          // $("#text").text("Logged in as " + user.name + ".");
          // $("#error").hide();
          // $("#logout").show();
          // $("#login").hide();
      } catch (error) {
          $("#error").text(error.message);
      }
  });

  $("#logout").click(async function (event) {
      try {
          await web3AuthInstance.logout()
          // $("#text").text("Logged out.");
          // $("#address").text("");
          // $("#balance").text("");
          // $("#login").show();
          // $("#logout").hide();
      } catch (error) {
          $("#error").text(error.message);
      }
          
  });
});
