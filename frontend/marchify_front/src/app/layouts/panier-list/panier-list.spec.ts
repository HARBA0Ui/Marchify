import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanierList } from './panier-list';

describe('PanierList', () => {
  let component: PanierList;
  let fixture: ComponentFixture<PanierList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PanierList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PanierList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
