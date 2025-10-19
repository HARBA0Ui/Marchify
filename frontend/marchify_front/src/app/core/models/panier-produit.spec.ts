import { TestBed } from '@angular/core/testing';

import { PanierProduit } from './panier-produit';

describe('PanierProduit', () => {
  let service: PanierProduit;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PanierProduit);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
