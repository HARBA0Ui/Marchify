import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LivreurService } from '../../../../core/services/livreur-service';
import { BonDeLivraison } from '../../../../core/models/bondelivraison';
import { BondeLivraisonService } from '../../../../core/services/bonde-livraison-service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-mission-list',
  imports: [CommonModule, RouterLink],
  templateUrl: './mission-list.html',
  styleUrl: './mission-list.css',
})
export class MissionList {
  private authService = inject(AuthService)
  private livreurService = inject(LivreurService)
  private bondelivraison = inject(BondeLivraisonService)
  missions: BonDeLivraison[] = []
  selectedStatus: string = 'PENDING_PICKUP';
  filteredMissions: BonDeLivraison[] = [];
  livreurId: string | null = null;
  error = signal<string | null>(null);
  loading = signal<boolean>(false);

  statusList = [
    { value: 'PENDING_PICKUP', label: 'Prêtes' },
    { value: 'IN_TRANSIT', label: 'En livraison' },
    { value: 'DELIVERED', label: 'Livrées' },
  ];

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();

    if (!currentUser || !currentUser.livreurId) {
      console.error('No user logged in');
      this.error.set('Vous devez être connecté pour voir vos commandes');
      return;
    }

    this.livreurId = currentUser.livreurId;

    this.loadMissionsDisponibles();
    this.loadBonDesLivraisons();
  }

  loadMissionsDisponibles(): void {
    this.livreurService.getMissionsDisponibles().subscribe({
      next: (res: any) => {
        const data = Array.isArray(res) ? res : res.missions ?? [];
        console.log("data ready:", data)
        this.missions = data.filter((cmd: any) => cmd.status === 'PENDING_PICKUP');
        this.error.set(null);
      },
      error: (err) => {
        console.error(err);
        this.error.set("Impossible de charger les missions disponibles.");
        this.missions = [];
      }
    });
  }

  loadBonDesLivraisons(): void {
    if (!this.livreurId) return;

    this.bondelivraison.getBondelisraisonsByLivreur(this.livreurId).subscribe({
      next: res => {
        this.missions = Array.isArray(res?.bons) ? res.bons : [];
        if (this.missions.length === 0) {
          this.error.set("Aucune livraison trouvée pour ce livreur.");
        } else {
          this.error.set(null);
        }
      },
      error: err => {
        console.error("Erreur lors du chargement des bons de livraison:", err);
        this.error.set("Impossible de charger les bons de livraison. Veuillez réessayer plus tard.");
        this.missions = [];
      }
    });
  }

  applyFilter(): void {
    if (!Array.isArray(this.missions)) this.missions = [];
    this.filteredMissions = this.missions.filter(
      (m) => !this.selectedStatus || m.status === this.selectedStatus
    );
  }

  filterByStatus(status: string) {
    this.selectedStatus = status;
    this.applyFilter();
  }

  getMissionCount(status: string) {
    return Array.isArray(this.missions)
      ? this.missions.filter((m) => m.status === status).length
      : 0;
  }


  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      PENDING_PICKUP: 'Prête',
      IN_TRANSIT: 'En livraison',
      DELIVERED: 'Livrée'
    };
    return labels[status] || status;
  }


  formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }


  acceptMission(missionId: string) {
    if (!this.livreurId) return;

    this.livreurService.accepterMission(this.livreurId, missionId).subscribe({
      next: (updatedMission) => {
        const i = this.missions.findIndex(m => m.id === missionId);
        if (i !== -1) {
          this.missions[i] = updatedMission;
        }
        this.applyFilter();
        alert("Livraison confirmée !");
      },

    error: err => console.error(err)
    });
  }

  completeDelivery(missionId: string) {
    if (!this.livreurId) return;

    this.bondelivraison.livrerCommande(missionId).subscribe({
      next: (updatedMission) => {
        const i = this.missions.findIndex(m => m.id === missionId);

        if (i !== -1) {
          this.missions[i]= updatedMission;
        }

        this.applyFilter();
        alert("Livraison confirmée !");
      },

    error: err => console.error(err)
    });
  }
}