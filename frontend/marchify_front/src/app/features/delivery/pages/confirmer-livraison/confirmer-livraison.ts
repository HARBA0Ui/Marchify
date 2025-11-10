import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BonDeLivraison, DeliveryStatus } from '../../../../core/models/bondelivraison';
import { BondeLivraisonService } from '../../../../core/services/bonde-livraison-service';

@Component({
  selector: 'app-confirmer-livraison',
  standalone: true,
  imports: [CommonModule], // DatePipe is in CommonModule
  templateUrl: './confirmer-livraison.html',
  styleUrls: ['./confirmer-livraison.css']
})
export class ConfirmerLivraison implements OnInit {
  livraisons: BonDeLivraison[] = []; 
  isLoading = false;                 
  error = '';

private bonLivraisonService : BondeLivraisonService =inject(BondeLivraisonService) 
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
        this.error = 'Erreur lors du chargement';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  accepterMission(bonId: string) {
    alert('Accepter mission: ' + bonId);
  }

  confirmerLivraison(bonId: string) {
    
    this.bonLivraisonService.livrerCommande(bonId).subscribe({
      next: (response) => {
        console.log('Livraison confirmée:', response);
        this.fetchBonDeLivraisons(); 
      },

      error: (err) => {
        console.error(' Erreur livraison:', err);
      }
    });
  }

  getStatusClass(status: DeliveryStatus): string {
    return {
      [DeliveryStatus.PENDING_PICKUP]: 'badge bg-warning text-dark',
      [DeliveryStatus.IN_TRANSIT]: 'badge bg-info text-dark',
      [DeliveryStatus.DELIVERED]: 'badge bg-success',
      [DeliveryStatus.FAILED]: 'badge bg-danger'
    }[status] || 'badge bg-secondary';
  }
  getLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING_PICKUP: 'À récupérer',
    IN_TRANSIT: 'En livraison',
    DELIVERED: 'Livré',
    FAILED: 'Échoué'
  };
  return labels[status] || status;
}
}