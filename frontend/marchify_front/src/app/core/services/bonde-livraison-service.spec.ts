import { TestBed } from '@angular/core/testing';

import { BondeLivraisonService } from './bonde-livraison-service';

describe('BondeLivraisonService', () => {
  let service: BondeLivraisonService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BondeLivraisonService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
