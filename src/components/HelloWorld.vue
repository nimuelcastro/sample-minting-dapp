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
              <a v-if="mintTransaction" :href='(chainId == "0x4") ? `https://rinkeby.etherscan.io/tx/${mintTransaction.hash}` : `https://polygonscan.io/tx/${mintTransaction.hash}`'>{{mintTransaction.hash}}</a>
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
import { getEllipsisTxt, tokenValue } from '../helpers/formatters.js';
// import Web3 from "web3";

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
    ethers: null,
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
  }),

  methods: {
    
    async init(){
      this.currentUser = Moralis.User.current();
      if(!this.currentUser){
        this.currentUser = await Moralis.authenticate();
      }

      await Moralis.enableWeb3();

      window.ethereum.on('accountsChanged', (accounts) => {
        console.log(accounts[0])
      });

      window.ethereum.on('disconnect', (error) => {
        console.log(error)
      });

      const ethers = Moralis.web3Library;
      const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
      console.log(provider.getSigner());

      this.walletAddress = getEllipsisTxt(this.currentUser.get("ethAddress"));
      this.currentChainId = await Moralis.chainId;

      // check if in correct network
      if(this.isCorrectChain){
        this.getContractDetails();
      }

      // event listeners
      // Subscribe to onChainChanged events
      Moralis.onChainChanged((chain) => {
        this.currentChainId = chain;
        this.onChainChanged();
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
      this.mintingCost = Moralis.Units.FromWei(await Moralis.executeFunction({functionName: 'cost', ...this.options}));
      this.newMintingCost = this.mintingCost;
      this.maxMintPerTx = tokenValue(Moralis.Units.FromWei(await Moralis.executeFunction({functionName: 'maxMintAmountPerTx', ...this.options})), -18);
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

        let sendOptions = {
          contractAddress: myContractAddress,
          functionName: "mint",
          abi: ABI,
          params: {
            _mintAmount: this.mintAmount
          },
        };
        this.mintTransaction = await Moralis.executeFunction(sendOptions);
        console.log(this.mintTransaction.hash);
        let result = await this.mintTransaction.wait();
        console.log(result);

    },

  },

  mounted(){

  },

  created(){
    this.init();
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
