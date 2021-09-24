import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NftSvgListComponent } from './nft-svg-list.component';

describe('NftSvgListComponent', () => {
  let component: NftSvgListComponent;
  let fixture: ComponentFixture<NftSvgListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NftSvgListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NftSvgListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
