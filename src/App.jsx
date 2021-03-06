import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import myEpicNft from './utils/MyEpicNFT.json';
import CircleLoader from "./utils/CircleLoader.jsx";

const TWITTER_HANDLE = 'adekunle';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = 'https://testnets.opensea.io/collection/squarenft-ehy7ksrq3p';
const TOTAL_MINT_COUNT = 50;

const CONTRACT_ADDRESS = "0xAFFb2CD43E40f02bcF79466B4482dCa1885e8daa";

//let tokenIdCount = 0;

const provider = new ethers.providers.Web3Provider(ethereum);
const signer = provider.getSigner();
const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);


const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  var [mintClicked, setMintClicked] = useState(false);
  const [tokenIdCount, setTokenIdCount] = useState([]);

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;



    if (!ethereum) {
      console.log("Make sure you have metamask!");
      return;
    } else {
      let chainId = await ethereum.request({ method: 'eth_chainId' });
      console.log("Connected to chain " + chainId);

      // String, hex code of the chainId of the Rinkebey test network
      const rinkebyChainId = "0x4";
      if (chainId !== rinkebyChainId) {
        alert("You are not connected to the Rinkeby Test Network!");

        console.log("We have the ethereum object", ethereum);
      }




      console.log("We have the ethereum object", ethereum);

      var tokenIdCount = await connectedContract.GetTotalNFTsMintedSoFar();
      setTokenIdCount(tokenIdCount.toNumber());

      console.log(tokenIdCount);
    }

    const accounts = await ethereum.request({ method: 'eth_accounts' });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account)
      // Setup listener! This is for the case where a user comes to our site
      // and ALREADY had their wallet connected + authorized.
      setupEventListener()
    } else {
      console.log("No authorized account found")
    }
  }



  /*
  * Implement your connectWallet method here
  */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      // const provider = new ethers.providers.Web3Provider(ethereum);
      //   const signer = provider.getSigner();
      //   const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);


      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      /*
      * Fancy method to request access to account.
      */
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      let chainId = await ethereum.request({ method: 'eth_chainId' });
      console.log("Connected to chain " + chainId);

      // String, hex code of the chainId of the Rinkebey test network
      const rinkebyChainId = "0x4";
      if (chainId !== rinkebyChainId) {
        alert("You are not connected to the Rinkeby Test Network!");
      }

      /*
      * Boom! This should print out public address once we authorize Metamask.
      */
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
      // Setup listener! This is for the case where a user comes to our site
      // and connected their wallet for the first time.
      setupEventListener()

      var tokenIdCount = await connectedContract.GetTotalNFTsMintedSoFar();
      setTokenIdCount(tokenIdCount.toNumber());

    } catch (error) {
      console.log(error)
    }


  }


  // Setup our listener.
  const setupEventListener = async () => {
    // Most of this looks the same as our function askContractToMintNft
    try {
      const { ethereum } = window;

      if (ethereum) {
        // Same stuff again
        // const provider = new ethers.providers.Web3Provider(ethereum);
        // const signer = provider.getSigner();
        // const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

        // THIS IS THE MAGIC SAUCE.
        // This will essentially "capture" our event when our contract throws it.
        // If you're familiar with webhooks, it's very similar to that!
        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber())
          alert(`Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)
        });

        connectedContract.on("CurrentTokenId", (tokenId) => {
          console.log(tokenId.toNumber())
          alert(`Hey there! We've minted ${tokenId.toNumber()} already`)
        });


        console.log("Setup event listener!")

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const askContractToMintNft = async () => {


    try {
      const { ethereum } = window;

      if (ethereum) {
        // const provider = new ethers.providers.Web3Provider(ethereum);
        // const signer = provider.getSigner();
        // const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

        console.log("Going to pop wallet now to pay gas...")
        let nftTxn = await connectedContract.makeAnEpicNFT();

        console.log("Mining...please wait.")
        mintClicked = true;
        setMintClicked(mintClicked);
        await nftTxn.wait();
        mintClicked = false;
        setMintClicked(mintClicked);

        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);

        var tokenIdCount = await connectedContract.GetTotalNFTsMintedSoFar();
        setTokenIdCount(tokenIdCount.toNumber())


      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }




  // Render Methods
  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  function Grid({ children }) {
    return (
      <div className="grid">
        <LoadingBox>{children}</LoadingBox>
      </div>
    );
  }

  function LoadingBox({ children }) {
    return React.Children.map(children, child => {
      return <div className="loading-box">{child}</div>;
    });
  }


  /*
  * Added a conditional render! We don't want to show Connect to Wallet if we're already conencted :).
  */
  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>

          <div className="temp-background">
            {mintClicked ? (

              <Grid> <p className="sub-text">Your NFT is being minted.</p>
                <CircleLoader />
              </Grid>

            ) : null}
          </div>

          <p className="sub-text">Number of NFTs minted: {tokenIdCount}/{TOTAL_MINT_COUNT}</p>

          {currentAccount === "" ? (
            renderNotConnectedContainer()
          ) : (
              <button onClick={askContractToMintNft} className="cta-button connect-wallet-button">
                Mint NFT
            </button>
            )}
        </div>

<a target="blank" href={OPENSEA_LINK}>The collection can be seen here</a>

        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};




export default App;