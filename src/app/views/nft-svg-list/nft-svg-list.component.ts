import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { Contract } from 'web3-eth-contract'
import { Token } from '../../models/token';
import { PolygonContractService } from 'src/app/services/polygon-contract.service';

const defaultContractAddress = "0x8c356d86ba1b80578626abe4d7cbbeeae031637e";
const nicoUserToken = "0x52434Cd9e4e4F965a20c8576841CbAAC4b2bA30e";

@Component({
  selector: 'app-nft-svg-list',
  templateUrl: './nft-svg-list.component.html',
  styleUrls: ['./nft-svg-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NftSvgListComponent implements OnInit {

  private accounts: string[] = [];

  public ethError?: string = undefined;

  public error?: string = undefined;
  public tokens?: Token[] = undefined;

  public contractAddress = defaultContractAddress;
  public userAddress = ``;
  public isLoading = true;

  constructor(private polygonContractService: PolygonContractService, private cdr: ChangeDetectorRef) { }

  onContractEnter() {
    this.displaySVGsFromContract();
  }

  onUserEnter() {
    this.displaySVGsFromContract();
  }

  seeNicosTokens() {
    this.userAddress = nicoUserToken;
    this.displaySVGsFromContract();
  }

  displaySVGsFromContract() {
    this.isLoading = true;
    this.cdr.detectChanges();
    this.polygonContractService.getSVGToolboxContract(this.contractAddress)
      .then((contract: Contract) => {
        this.polygonContractService.getNumNFTsUserHas(contract, this.userAddress, this.userAddress)
          .then((numNFTs: number) => {
            const loadingTokens: Token[] = [];
            for (let i = 0; i < numNFTs; i++) {
              loadingTokens.push(new Token(true));
            }
            this.tokens = loadingTokens;
            this.isLoading = false;
            this.cdr.detectChanges();
            return this.polygonContractService.getAllTokenOwners(numNFTs, contract, this.userAddress, this.userAddress)
          })
          .then((tokenOwners: number[]) => tokenOwners.sort())
          .then((tokenOwners: number[]) => {
            this.polygonContractService.getAllTokenURIs(tokenOwners, contract, this.userAddress)
              .then((tokenURIs: any[]) => {
                this.tokens = tokenURIs.sort(this.compareTokens);
                this.cdr.detectChanges();
              })
          })
          .catch((err: any) => {
            this.isLoading = false;
            console.error(err);
            if (err.toString().includes('run Out of Gas?')) {
              console.log("hey")
              this.error = `Contract was not found. Please connect to the Polygon Network and try again.`;
            }
            else {
              this.error = err;
            }
            this.cdr.detectChanges();
          })
      })
      .catch((err: any) => {
        this.isLoading = false;
        this.error = err;
        console.error(err);
        this.cdr.detectChanges();
      })
  }

  ngOnInit(): void {
    this.initEthereum();
  }

  initEthereum() {
    this.isLoading = true;
    this.polygonContractService.initEthereum()
      .then((accounts: string[]) => {
        this.accounts = accounts;
        this.userAddress = this.accounts[0];
        this.cdr.detectChanges();
      })
      .then(() => this.displaySVGsFromContract())
      .catch((err: any) => {
        this.ethError = err;
        this.isLoading = false;
        this.cdr.detectChanges();
      });
  }

  compareTokens(a: Token, b: Token) {
    return b.index - a.index;
  }

  setAccounts(accounts: string[]) {
    this.accounts = accounts;
  }

}


