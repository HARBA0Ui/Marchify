import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductPinnedCard } from './product-pinned-card';

describe('ProductPinnedCard', () => {
  let component: ProductPinnedCard;
  let fixture: ComponentFixture<ProductPinnedCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductPinnedCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductPinnedCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
