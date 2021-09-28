import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Token } from '../models/token';
import { Eth } from 'web3-eth';
import { Contract } from 'web3-eth-contract'
import Web3 from 'web3';
import { defer, from } from "rxjs";
import { mergeAll, toArray } from "rxjs/operators";

const MAX_CONCURRENT_RPC_CONNECTIONS = 5;

const API_KEY = 'K6TNX3YNNBWAHCPXY2AWN75GYVYU2QSFVI';
const getContractApiUrl = (contractAddress: string) => `https://api.polygonscan.com/api?module=contract&action=getabi&address=${contractAddress}&apikey=${API_KEY}`;

@Injectable({
  providedIn: 'root'
})
export class PolygonContractService {


  
  private window: any;
  private ethereum!: any;
  private eth!: Eth;

  private accounts: string[] = [];

  public tokens?: Token[] = undefined;


  constructor(@Inject(DOCUMENT) private document: Document, private http: HttpClient) {
    this.window = this.document.defaultView;
  }

  async initEthereum(): Promise<string[]> {
    return new Promise(async (resolve, reject) => {

      if (this.window.ethereum) {
        this.window.web3 = new Web3(this.window.ethereum);
        this.eth = this.window.web3.eth;
        this.ethereum = this.window.ethereum;

        try {
          const accounts = await this.ethereum.request({ method: 'eth_requestAccounts' });
          
          resolve(accounts);

        } catch (error: any) {
          if (error.code === 4001) {
            // User rejected request
          }

          reject(error);
        }

      }
      else {
        reject(`Metamask not found. Please enable the Metamask extension and try again.`)
      }
    })
  }

  setAccounts(accounts: string[]) {
    this.accounts = accounts;
  }


  // getContract(): any {

  //   return this.http.get<any>(contractApiUrl).subscribe((res: any) => {
  //     if (res.result != undefined && res.result != '') {
  //       const contractABI = JSON.parse(res.result);
  //       const contract = new this.eth.Contract(contractABI, "0x8C356d86Ba1b80578626abE4D7CBBeeAE031637E");

  //       this.getNumNFTsUserHas(contract, nicoUserToken, this.accounts[0])
  //         .then((numNFTs: number) => {
  //           console.log("balance", numNFTs)

  //           if (numNFTs > 0) {
  //             this.tokens = [];
  //           }

  //           for (let i = 0; i < numNFTs; i++) {

  //             this.getTokenOfOwnerByIndex(contract, nicoUserToken, i, this.accounts[0])
  //               .then((tokenIndex: number) => {
  //                 console.log("got tokenIndex 0", tokenIndex);

  //                 this.getTokenUri(contract, tokenIndex, this.accounts[0])
  //                   .then((tokenUri: any) => {
  //                     console.log("got tokenURI", tokenIndex, tokenUri);

  //                     const tokenObject = this.decodeTokenURI(tokenUri, tokenIndex);

  //                     this.tokens?.push(tokenObject);

  //                   })
  //                   .catch((err: any) => {
  //                     console.error("error getting tokenURI", err);
  //                   })

  //               })
  //               .catch((err: any) => {
  //                 console.error("error getting tokenIndex", err);
  //               })

  //           }

  //           // TODO for loop

  //         })
  //         .catch((err: any) => {
  //           console.error("error getting num nfts", err);
  //         })

  //       console.log(contract)
  //     }

  //   })
  // }

  getSVGToolboxContract(contractAddress: string): Promise<Contract> {
    return new Promise(async (resolve, reject) => {
      this.http.get<any>(getContractApiUrl(contractAddress)).subscribe((res: any) => {
        if (res.result != undefined && res.result != '') {
          const contractABI = JSON.parse(res.result);
          const contract = new this.eth.Contract(contractABI, contractAddress);
          resolve(contract);
        }

        reject(`No contract returned from API`);
      });
    })
  }

  getAllTokenOwners(numNFTs: number, contract: Contract, userToken: string, account: string): Promise<number[]> {
    return new Promise(async (resolve, reject) => {
      // Create index list. e.g. 0 - 20
      const indexList = [];
      for (let i = 0; i < numNFTs; i++) {
        indexList.push(i);
      }

      // Rate limit RPC connections by requesting in batches
      const tokenOwnerRequests = indexList.map(i => defer(() => this.getTokenOfOwnerByIndex(contract, userToken, i, account)));
      from (tokenOwnerRequests).pipe(
        mergeAll(MAX_CONCURRENT_RPC_CONNECTIONS),
        toArray()
      ).subscribe((tokenOwners: number[]) => {
        resolve(tokenOwners);
      });
    });
  }

  getAllTokenURIs(indexList: number[], contract: Contract, account: string): Promise<any[]> {
    return new Promise(async (resolve, reject) => {

      // Rate limit RPC connections by requesting in batches
      const tokenURIRequests = indexList.map(i => defer(() => this.getTokenUri({ contract, tokenIndex: i, account })));
      from (tokenURIRequests).pipe(
        mergeAll(MAX_CONCURRENT_RPC_CONNECTIONS),
        toArray()
      ).subscribe((tokenURIs: any[]) => {
        resolve(tokenURIs);
      });
    });
  }

  getNumNFTsUserHas(contract: Contract, userToken: string, account: string): Promise<number> {
    return contract.methods.balanceOf(userToken).call({ from: account })
  }

  getTokenOfOwnerByIndex(contract: Contract, userToken: string, index: number, account: string): Promise<number> {
    return contract.methods.tokenOfOwnerByIndex(userToken, index).call({ from: account })
  }

  getTokenUri({ contract, tokenIndex, account }: { contract: Contract; tokenIndex: number; account: string; }): Promise<any> {
    return contract.methods.tokenURI(tokenIndex).call({ from: account }).then((tokenUri: any) => this.decodeTokenURI(tokenUri, tokenIndex));
  }

  decodeTokenURI(tokenURI: string, tokenIndex: number): any {
    const tokenJSONBase64 = tokenURI.slice(tokenURI.indexOf(',') + 1);
    const tokenObject = JSON.parse(atob(tokenJSONBase64));
    const imageBase64 = tokenObject.image.slice(tokenObject.image.indexOf(',') + 1);
    const imageSvg = atob(imageBase64);
    tokenObject.image = imageSvg;
    tokenObject.index = tokenIndex;
    return tokenObject;
  }

}
