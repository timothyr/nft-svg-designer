import { Component, Inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DOCUMENT } from '@angular/common';
import { Eth } from 'web3-eth';
import { Contract } from 'web3-eth-contract'
import Web3 from 'web3';
import { Token } from '../../models/token';

const API_KEY = 'K6TNX3YNNBWAHCPXY2AWN75GYVYU2QSFVI';
const nicoUserToken = "0x52434Cd9e4e4F965a20c8576841CbAAC4b2bA30e";
const contractAddress = `0x8c356d86ba1b80578626abe4d7cbbeeae031637e`;
const contractApiUrl = `https://api.polygonscan.com/api?module=contract&action=getabi&address=${contractAddress}&apikey=${API_KEY}`;

@Component({
  selector: 'app-nft-svg-list',
  templateUrl: './nft-svg-list.component.html',
  styleUrls: ['./nft-svg-list.component.scss']
})
export class NftSvgListComponent implements OnInit {

  private window: any;
  private ethereum!: any;
  private eth!: Eth;
  private accounts: string[] = [];
  private error?: string = undefined;

  public testSvg: string = '';
  public tokens?: Token[] = undefined;

  constructor(@Inject(DOCUMENT) private document: Document, private http: HttpClient) {
    this.window = this.document.defaultView;
  }

  ngOnInit(): void {
    if (this.window.ethereum) {
      this.window.web3 = new Web3(this.window.ethereum);
      this.eth = this.window.web3.eth;
      this.ethereum = this.window.ethereum;
      this.initEthereum();
    }
  }

  async initEthereum() {
    // this.window.ethereum.enable();
    // https://eips.ethereum.org/EIPS/eip-1102

    try {
      const accounts = await this.ethereum.request({ method: 'eth_requestAccounts' });
      this.setAccounts(accounts);
      this.getContract();
    } catch (error: any) {
      if (error.code === 4001) {
        // User rejected request
      }

      this.setError(error);
    }


    console.log("eth enamble")
  }

  setAccounts(accounts: string[]) {
    this.accounts = accounts;
  }

  setError(error: string) {
    this.error = error;
    console.log(this.error);

  }

  getContract(): any {

    return this.http.get<any>(contractApiUrl).subscribe((res: any) => {
      if (res.result != undefined && res.result != '') {
        const contractABI = JSON.parse(res.result);
        const contract = new this.eth.Contract(contractABI, "0x8C356d86Ba1b80578626abE4D7CBBeeAE031637E");

        this.getNumNFTsUserHas(contract, nicoUserToken, this.accounts[0])
          .then((numNFTs: number) => {
            console.log("balance", numNFTs)

            if (numNFTs > 0) {
              this.tokens = [];
            }

            for (let i = 0; i < numNFTs; i++) {

              this.getTokenOfOwnerByIndex(contract, nicoUserToken, i, this.accounts[0])
                .then((tokenIndex: number) => {
                  console.log("got tokenIndex 0", tokenIndex);

                  this.getTokenUri(contract, tokenIndex, this.accounts[0])
                    .then((tokenUri: any) => {
                      console.log("got tokenURI", tokenIndex, tokenUri);

                      const tokenObject = this.decodeTokenURI(tokenUri, tokenIndex);

                      this.tokens?.push(tokenObject);

                    })
                    .catch((err: any) => {
                      console.error("error getting tokenURI", err);
                    })

                })
                .catch((err: any) => {
                  console.error("error getting tokenIndex", err);
                })

            }

            // TODO for loop

          })
          .catch((err: any) => {
            console.error("error getting num nfts", err);
          })

        console.log(contract)
      }

    })
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

  getNumNFTsUserHas(contract: Contract, userToken: string, account: string): Promise<number> {
    return contract.methods.balanceOf(userToken).call({ from: account })
  }

  getTokenOfOwnerByIndex(contract: Contract, userToken: string, index: number, account: string): Promise<number> {
    return contract.methods.tokenOfOwnerByIndex(userToken, index).call({ from: account })
  }

  getTokenUri(contract: Contract, tokenIndex: number, account: string): Promise<any> {
    return contract.methods.tokenURI(tokenIndex).call({ from: account })
  }
}


