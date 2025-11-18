import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BonDeLivraison, DeliveryStatus } from '../../../../core/models/bondelivraison';
import { BondeLivraisonService } from '../../../../core/services/bonde-livraison-service';

@Component({
  selector: 'app-confirmer-livraison',
  standalone: true,
  imports: [CommonModule,],
  templateUrl: './confirmer-livraison.html',
  styleUrls: ['./confirmer-livraison.css']
})
export class ConfirmerLivraison implements OnInit {
  livraisons: BonDeLivraison[] = []; 
  isLoading = false;                 
  error = '';

  private bonLivraisonService: BondeLivraisonService = inject(BondeLivraisonService);
  
  ngOnInit(): void {
    this.fetchBonDeLivraisons();
  }

  fetchBonDeLivraisons() {
    this.isLoading = true;
    this.bonLivraisonService.getBondelisraisonsByLivreur('69125c47534311c380dc6f58').subscribe({
      next: (response: any) => {
        this.livraisons = response.bons || response; 
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des livraisons';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  accepterMission(bonId: string) {
    // TODO: Implement accept mission API call
    console.log('Accepter mission:', bonId);
    alert('Mission acceptée! Prête pour la livraison.');
  }

  confirmerLivraison(bonId: string) {
    this.bonLivraisonService.livrerCommande(bonId).subscribe({
      next: (response) => {
        console.log('Livraison confirmée:', response);
        alert('Livraison confirmée avec succès! ✅');
        this.fetchBonDeLivraisons(); 
      },
      error: (err) => {
        console.error('Erreur livraison:', err);
        alert('Erreur lors de la confirmation de la livraison.');
      }
    });
  }

  getStatusClass(status: DeliveryStatus): string {
    const classes = {
      [DeliveryStatus.PENDING_PICKUP]: 'bg-yellow-100 text-yellow-800',
      [DeliveryStatus.IN_TRANSIT]: 'bg-blue-100 text-blue-800',
      [DeliveryStatus.DELIVERED]: 'bg-green-100 text-green-800',
      [DeliveryStatus.FAILED]: 'bg-red-100 text-red-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }

  getLabel(status: string): string {
    const labels: Record<string, string> = {
      PENDING_PICKUP: 'À récupérer',
      IN_TRANSIT: 'En livraison',
      DELIVERED: 'Livrée',
      FAILED: 'Échouée'
    };
    return labels[status] || status;
  }
}