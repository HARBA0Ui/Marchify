import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommandeListVendor } from './commande-list-vendor';

describe('CommandeListVendor', () => {
  let component: CommandeListVendor;
  let fixture: ComponentFixture<CommandeListVendor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommandeListVendor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommandeListVendor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
