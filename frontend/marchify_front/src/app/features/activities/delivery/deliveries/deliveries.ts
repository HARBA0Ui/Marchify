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
  private bonDeLivraison = inject(BondeLivraisonService);
  private authService = inject(AuthService);

  selectedLivraison: BonDeLivraison | null = null;
  showModal = false;
  deliveries: BonDeLivraison[] = []; // ✅ REGULAR ARRAY
  livreurId: string | null = null;
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();

    if (!currentUser || !currentUser.livreurId) {
      console.error('No user logged in');
      this.error.set('Vous devez être connecté pour voir vos commandes');
      return;
    }
    this.livreurId = currentUser.livreurId;
    this.loadBonDesLivraisons();
  }

  loadBonDesLivraisons(): void {
    if (!this.livreurId) return;

    this.loading.set(true);
    this.error.set(null);

    this.bonDeLivraison.getBonsByLivreur(this.livreurId).subscribe({
      next: (res) => {
        this.deliveries = Array.isArray(res?.bons) ? res.bons : [];

        if (this.deliveries.length === 0) {
          this.error.set('Aucune livraison trouvée pour ce livreur.');
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des bons de livraison:', err);
        this.error.set(
          'Impossible de charger les bons de livraison. Veuillez réessayer plus tard.'
        );
        this.deliveries = [];
        this.loading.set(false);
      },
    });
  }

  openModal(livraison: BonDeLivraison): void {
    this.selectedLivraison = livraison;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedLivraison = null;
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      PENDING_PICKUP: 'En attente',
      IN_TRANSIT: 'En cours',
      DELIVERED: 'Livré',
      FAILED: 'Échoué',
    };
    return labels[status] || status;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PENDING_PICKUP':
        return 'bg-orange-100 text-orange-800';
      case 'IN_TRANSIT':
        return 'bg-blue-100 text-blue-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
}
