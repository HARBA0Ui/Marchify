import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductByshopList } from './product-byshop-list';

describe('ProductByshopList', () => {
  let component: ProductByshopList;
  let fixture: ComponentFixture<ProductByshopList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductByshopList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductByshopList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
