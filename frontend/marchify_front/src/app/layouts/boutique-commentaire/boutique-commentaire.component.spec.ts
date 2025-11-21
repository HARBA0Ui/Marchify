import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoutiqueCommentaireComponent } from './boutique-commentaire.component';

describe('BoutiqueCommentaireComponent', () => {
  let component: BoutiqueCommentaireComponent;
  let fixture: ComponentFixture<BoutiqueCommentaireComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoutiqueCommentaireComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoutiqueCommentaireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
