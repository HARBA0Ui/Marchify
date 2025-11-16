import { Component, inject, OnInit } from '@angular/core';
import { BondeLivraisonService } from '../../../../core/services/bonde-livraison-service';
import { BonDeLivraison } from '../../../../core/models/bondelivraison';
import { DatePipe, NgClass } from '@angular/common';
import { PricePipe } from '../../../../price-pipe';

@Component({
  selector: 'app-deliveries',
  imports: [DatePipe,PricePipe,NgClass],
  templateUrl: './deliveries.html',
  styleUrl: './deliveries.css',
})
export class Deliveries implements OnInit {

  private bonDeLivraison:BondeLivraisonService=inject(BondeLivraisonService)
  private livreurId='69125c47534311c380dc6f58';
  selectedLivraison: BonDeLivraison | null = null;
showModal = false;

  deliveries:BonDeLivraison[]=[]
 ngOnInit(): void {
  this.bonDeLivraison
    .getBondelisraisonsByLivreur(this.livreurId)
    .subscribe(res => {
      console.log("Deliveries API response:", res);
      this.deliveries = res.bons; // <-- FIX
    });
}


openModal(livraison: BonDeLivraison) {
  this.selectedLivraison = livraison;
  this.showModal = true;
}

closeModal() {
  this.showModal = false;
  this.selectedLivraison = null;
}


}
