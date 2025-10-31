import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShopCreationPage } from './shop-creation-page';

describe('ShopCreationPage', () => {
  let component: ShopCreationPage;
  let fixture: ComponentFixture<ShopCreationPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShopCreationPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShopCreationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
