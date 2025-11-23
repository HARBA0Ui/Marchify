import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductMostrateCard } from './product-mostrate-card';

describe('ProductMostrateCard', () => {
  let component: ProductMostrateCard;
  let fixture: ComponentFixture<ProductMostrateCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductMostrateCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductMostrateCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
