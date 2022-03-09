<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="4" class="text-center">
        <h1 class="my-5">My ERC 721 Token</h1>
        <v-card
          elevation="2"
        >
          <v-card-text>
            <v-col>
              <h1>{{currentSupply}}/{{maxSupply}}</h1>
              <a v-if="isCorrectChain" target="_blank" :href='(chainId == "0x4") ? `https://rinkeby.etherscan.io/address/${walletAddress}` : `https://polygonscan.io/address/${walletAddress}`'>{{walletAddress}}</a>
              <p>Chaind Id: {{currentChainId}}</p>
              <h3 v-if='currentChainId == "0x4"'>You are currently in Rinkeby Test network.</h3>
              <h3 v-if='currentChainId == "0x89"'>You are currently in Polygon mainnet.</h3>
              <h3 v-if="isCorrectChain">cost: {{newMintingCost}}</h3>
              <v-btn v-if="isCorrectChain" icon @click="mintAmount = (mintAmount == 1) ? mintAmount : mintAmount-1; newMintingCost = mintAmount * mintingCost;"><v-icon>mdi-minus-circle</v-icon></v-btn>
              <b v-if="isCorrectChain">{{mintAmount}}</b>
              <v-btn v-if="isCorrectChain" icon @click="mintAmount = (mintAmount == maxMintPerTx) ? mintAmount : mintAmount+1; newMintingCost = mintAmount * mintingCost;"><v-icon>mdi-plus-circle</v-icon></v-btn>
              <br>
              <v-btn v-if="isCorrectChain && (mintingCost != null) && (currentSupply != 0) && (maxSupply != 0) && (maxMintPerTx != 0)" class="my-3" @click="mint()">MINT</v-btn>
            </v-col>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import Moralis from 'moralis';
import { myContractAddress, ABI } from '../constants/contract';
// eslint-disable-next-line no-unused-vars
import { getEllipsisTxt, tokenValue } from '../helpers/formatters.js';
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");

const serverUrl = process.env.VUE_APP_MORALIS_SERVER_URL;
const appId =  process.env.VUE_APP_MORALIS_APPLICATION_ID;
Moralis.start({ serverUrl, appId });

export default {
  data: () => ({
    currentUser: null,
    mintingCost: null,
    newMintingCost: null,
    currentSupply: 0,
    maxSupply: 0,
    web3Js: null,
    contract: null,
    chainId: process.env.VUE_APP_CHAIN_ID,
    currentChainId: null,
    walletAddress: "",
    options: {
      contractAddress: myContractAddress,
      abi: ABI
    },
    mintAmount: 1,
    maxMintPerTx: 0,
    mintTransaction: null,
    // sampleCost:1000000000000000,
    sampleCost:1,
    sampleMintCount:2000000000000000000,
    // sampleMintCount:1,

  }),

  methods: {
    
    async init(){
      this.currentUser = Moralis.User.current();
      if(!this.currentUser){
        this.currentUser = await Moralis.authenticate();
      }

      await Moralis.enableWeb3();
      this.web3Js = new createAlchemyWeb3("https://eth-rinkeby.alchemyapi.io/v2/30isD4FyByPb3DrMCVs6_gbLcKr8RyWI");
      this.contract = new this.web3Js.eth.Contract(ABI, myContractAddress);

      this.walletAddress = getEllipsisTxt(window.ethereum.selectedAddress);
      this.currentChainId = await Moralis.chainId;

      // check if in correct network
      if(this.isCorrectChain){
        this.getContractDetails();
      }

      this.ethers = Moralis.web3Library;
      // this.provider = new this.ethers.providers.Web3Provider(window.ethereum);
      // this.signer = this.provider.getSigner();

      // event listeners
      // Subscribe to onChainChanged events
      Moralis.onChainChanged((chain) => {
        this.currentChainId = chain;
        this.onChainChanged();
      });

      window.ethereum.on('accountsChanged', function (accounts) {
        // Time to reload your interface with accounts[0]!
        // this.updateWalletText(accounts[0]);
        this.walletAddress = accounts[0];
      });

      // Subscribe to onWeb3Deactivated events
      Moralis.onWeb3Deactivated((result) => {
        console.log(result)
      });
      //
      //

    },

    async getContractDetails(){
      this.maxSupply = await Moralis.executeFunction({functionName: 'maxSupply', ...this.options});
      this.currentSupply = await Moralis.executeFunction({functionName: 'totalSupply', ...this.options});
      this.mintingCost = await Moralis.executeFunction({functionName: 'cost', ...this.options});
      this.newMintingCost = this.mintingCost;
      let resulttMaxMint = await Moralis.executeFunction({functionName: 'maxMintAmountPerTx', ...this.options});
      this.maxMintPerTx = resulttMaxMint.toNumber();
    },

    updateWalletText(walletText){
      this.walletAddress = getEllipsisTxt(walletText);
    },

    // do chain change event
    onChainChanged(){

      // check if in correct network
      if(this.isCorrectChain){
        this.getContractDetails();
      }
      else{

        this.maxSupply = 0;
        this.currentSupply = 0;
        this.mintingCost = 0;
        this.newMintingCost = this.mintingCost;
        this.maxMintPerTx = 0;
      }
      
    },

    async logIn(){

    },

    async logOut(){
      await Moralis.User.logOut();
      console.log("logged out");
    },

    async mint(){

        // console.log(tokenValue(0.09, -18).toString());

        this.contract.methods.mint(1).send({from: window.ethereum.selectedAddress, value: tokenValue(9, -16)}) // use variables instead of constant
        .on('receipt', function(){
            
        });

        // const transaction = await Moralis.executeFunction(sendOptions);
        // await transaction.wait();
        // const message = await Moralis.executeFunction(sendOptions);
        // console.log(message);
        // const receipt = await transaction.wait(3)
        // console.log(receipt);

    },
    async setCost() {
      let sendOptions = {
          contractAddress: myContractAddress,
          functionName: "setCost",
          abi: ABI,
          params: {
            _cost: this.sampleCost
          },
        };

         const transaction = await Moralis.executeFunction(sendOptions);
        await transaction.wait();
        const message = await Moralis.executeFunction(sendOptions);
        console.log(message);
    }

  },

  mounted(){

  },

  created(){
    this.init();
    console.log("wallet address",this.walletAddress);
    
  },

  computed: {

    isCorrectChain(){
      return this.chainId == this.currentChainId;
    }

  },

  asyncComputed: {

  }

}
</script>
