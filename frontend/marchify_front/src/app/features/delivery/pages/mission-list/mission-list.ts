import { Component, inject } from '@angular/core';
import { CommandeService } from '../../../../core/services/commande-service';
import { CmdStatus, Commande } from '../../../../core/models/commande';
import { LivreurService } from '../../../../core/services/livreur-service';

@Component({
  selector: 'app-mission-list',
  imports: [],
  templateUrl: './mission-list.html',
  styleUrl: './mission-list.css',
})
export class MissionList {
  private livreurService = inject(LivreurService);

  missions: Commande[] = [];
  filteredMissions: Commande[] = [];
  selectedStatus: string = 'READY';
  loading = false;
  error = '';

  statusList = [
    { value: 'READY', label: 'Prête' },
    { value: 'SHIPPED', label: 'En cours de livraison' },
    { value: 'DELIVERED', label: 'Livrée' },
  ];

  ngOnInit(): void {
    this.loadMissions();
  }

  loadMissions(): void {
    this.loading = true;
    this.error = '';

    this.livreurService.getMissionsDisponibles().subscribe({
      next: (data: any) => {
        // 🔹 Si le backend renvoie { missions: [...] }
        this.missions = Array.isArray(data) ? data  : data.missions ?? [];
        this.applyFilter();
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Erreur lors du chargement des missions';
        this.loading = false;
      },
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

  getTotalProduits(mission: Commande) {
    return (
      mission.produits?.reduce((sum, p) => sum + (p.quantite ?? 0), 0) ?? 0
    );
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
    const livreurId = '68f743532df2f750af13a58d'; // 🔹 ID du livreur connecté
    this.livreurService.accepterMission(livreurId, missionId).subscribe({
      next: (updatedMission) => {
        const index = this.missions.findIndex((m) => m.id === missionId);
        if (index !== -1) this.missions[index] = updatedMission;
        this.applyFilter();
      },
      error: (err) => console.error('Erreur accepter mission:', err),
    });
  }

  completeDelivery(missionId: string) {
    this.livreurService.livrerCommande(missionId).subscribe({
      next: (updatedMission) => {
        const index = this.missions.findIndex((m) => m.id === missionId);
        if (index !== -1) this.missions[index] = updatedMission;
        this.applyFilter();
      },
      error: (err) => console.error('Erreur livrer mission:', err),
    });
  }
}



