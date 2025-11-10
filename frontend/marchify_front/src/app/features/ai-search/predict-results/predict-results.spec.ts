import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PredictResults } from './predict-results';

describe('PredictResults', () => {
  let component: PredictResults;
  let fixture: ComponentFixture<PredictResults>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PredictResults]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PredictResults);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
