import { Component, inject, OnInit, signal } from '@angular/core';
import { BondeLivraisonService } from '../../../../core/services/bonde-livraison-service';
import { BonDeLivraison } from '../../../../core/models/bondelivraison';
import { DatePipe, NgClass } from '@angular/common';
import { PricePipe } from '../../../../price-pipe';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-deliveries',
  imports: [DatePipe, PricePipe, NgClass],
  templateUrl: './deliveries.html',
  styleUrl: './deliveries.css',
})
export class Deliveries implements OnInit {

  private bonDeLivraison: BondeLivraisonService = inject(BondeLivraisonService)

  // private livreurId = '69125c47534311c380dc6f58';
  private authService=inject(AuthService)

  selectedLivraison: BonDeLivraison | null = null;
  showModal = false;
  deliveries: BonDeLivraison[] = []
  livreurId: string | null = null;

  error = signal<string | null>(null);
  
  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();

    if (!currentUser || !currentUser.livreurId) {
      console.error('No user logged in');
      this.error.set('Vous devez être connecté pour voir vos commandes');
      return;
    }
    this.livreurId=currentUser.livreurId
    this.loadBonDesLivraisons();

  }


 loadBonDesLivraisons(): void {
  this.bonDeLivraison.getBondelisraisonsByLivreur(this.livreurId!).subscribe({
    next: res => {
      this.deliveries = Array.isArray(res?.bons) ? res.bons : [];
      if (this.deliveries.length === 0) {
        this.error.set("Aucune livraison trouvée pour ce livreur.");
      } else {
        this.error.set(null); // Clear error
      }
    },
    error: err => {
      console.error("Erreur lors du chargement des bons de livraison:", err);
      this.error.set("Impossible de charger les bons de livraison. Veuillez réessayer plus tard.");
      this.deliveries = [];
    }
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
