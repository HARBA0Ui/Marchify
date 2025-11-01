import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShopsList } from './shops-list';

describe('ShopsList', () => {
  let component: ShopsList;
  let fixture: ComponentFixture<ShopsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShopsList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShopsList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
