import { TestBed } from '@angular/core/testing';

import { LocationAdrs } from './location-adrs';

describe('LocationAdrs', () => {
  let service: LocationAdrs;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocationAdrs);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
