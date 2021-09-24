import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingPageComponent } from './views/landing-page/landing-page.component';
import { NftSvgListComponent } from './views/nft-svg-list/nft-svg-list.component';

const routes: Routes = [
  { path: '', component: LandingPageComponent,  pathMatch: 'full' },
  { path: 'collection', component: NftSvgListComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
