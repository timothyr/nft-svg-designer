import { TestBed } from '@angular/core/testing';

import { PolygonContractService } from './polygon-contract.service';

describe('PolygonContractService', () => {
  let service: PolygonContractService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PolygonContractService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
