import { Component, Inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DOCUMENT } from '@angular/common';
import { Eth } from 'web3-eth';


import Web3 from 'web3';

// const web3 = new Web3('ws://localhost:8546');

const API_KEY = 'K6TNX3YNNBWAHCPXY2AWN75GYVYU2QSFVI';
const CONTRACT_URL = '';

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
    const contractAddress = `0x8c356d86ba1b80578626abe4d7cbbeeae031637e`;
    const contractApiUrl = `https://api.polygonscan.com/api?module=contract&action=getabi&address=${contractAddress}&apikey=${API_KEY}`;
    return this.http.get<any>(contractApiUrl).subscribe((res: any) => {
      if (res.result != undefined && res.result != '') {
        const contractABI = JSON.parse(res.result);
        const contract = new this.eth.Contract(contractABI, "0x8C356d86Ba1b80578626abE4D7CBBeeAE031637E");

        const balanceOf = contract.methods.balanceOf("0x52434Cd9e4e4F965a20c8576841CbAAC4b2bA30e")
          .call({ from: this.accounts[0] })
          .then((balance: string) => {
            console.log("got balance", balance)
          })
          .catch((err: any) => {
            console.error("error getting balance", err)
          })

        console.log(contract)
      }

    })
  }

}
