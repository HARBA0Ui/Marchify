import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadPredict } from './upload-predict';

describe('UploadPredict', () => {
  let component: UploadPredict;
  let fixture: ComponentFixture<UploadPredict>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadPredict]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UploadPredict);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
