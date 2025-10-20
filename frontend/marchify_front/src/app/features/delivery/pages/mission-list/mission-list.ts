import { Component, inject } from '@angular/core';
import { CommandeService } from '../../../../core/services/commande-service';
import { CmdStatus, Commande } from '../../../../core/models/commande';

@Component({
  selector: 'app-mission-list',
  imports: [],
  templateUrl: './mission-list.html',
  styleUrl: './mission-list.css',
})
export class MissionList {
  private commandeService = inject(CommandeService);

  missions: Commande[] = [];
  filteredMissions: Commande[] = [];
  selectedStatus: CmdStatus = CmdStatus.READY;
  loading: boolean = false;
  error: string = '';

  // Delivery person can only see: READY, SHIPPED, DELIVERED
  statusList = [
    {
      value: CmdStatus.READY,
      label: 'Prête',
      bgColor: 'bg-[#47a275]',
      textColor: 'text-white',
      icon: '📦',
    },
    {
      value: CmdStatus.SHIPPED,
      label: 'En livraison',
      bgColor: 'bg-[#38cddd]',
      textColor: 'text-white',
      icon: '🚚',
    },
    {
      value: CmdStatus.DELIVERED,
      label: 'Livrée',
      bgColor: 'bg-[#29875c]',
      textColor: 'text-white',
      icon: '✅',
    },
  ];

  ngOnInit(): void {
    this.loadMissions();
  }

  loadMissions(): void {
    this.loading = true;
    this.error = '';

    // Get all commandes and filter for delivery statuses only
    this.commandeService.getAllCommandes().subscribe({
      next: (data) => {
        // Filter only READY, SHIPPED, and DELIVERED commandes
        this.missions = data.filter((cmd) => this.isDeliveryStatus(cmd.status));
        console.log('✅ Missions disponibles:', this.missions);
        this.filterByStatus(this.selectedStatus);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des missions';
        console.error('Error loading missions:', err);
        this.loading = false;
      },
    });
  }

  // Check if status is visible to delivery person
  isDeliveryStatus(status: CmdStatus): boolean {
    return [CmdStatus.READY, CmdStatus.SHIPPED, CmdStatus.DELIVERED].includes(
      status
    );
  }

  filterByStatus(status: CmdStatus): void {
    this.selectedStatus = status;
    this.filteredMissions = this.missions.filter(
      (cmd) => cmd.status === status
    );
  }

  // Accept mission (READY → SHIPPED)
  acceptMission(missionId: string): void {
    this.commandeService
      .updateCommandeStatus(missionId, CmdStatus.SHIPPED)
      .subscribe({
        next: (updatedCommande) => {
          // Update local data
          const index = this.missions.findIndex((m) => m.id === missionId);
          if (index !== -1) {
            this.missions[index] = updatedCommande;
          }
          this.filterByStatus(this.selectedStatus);
          console.log('✅ Mission acceptée et en livraison');
        },
        error: (err) => {
          console.error("❌ Erreur lors de l'acceptation:", err);
          alert("Erreur lors de l'acceptation de la mission");
        },
      });
  }

  // Complete delivery (SHIPPED → DELIVERED)
  completeDelivery(missionId: string): void {
    this.commandeService
      .updateCommandeStatus(missionId, CmdStatus.DELIVERED)
      .subscribe({
        next: (updatedCommande) => {
          // Update local data
          const index = this.missions.findIndex((m) => m.id === missionId);
          if (index !== -1) {
            this.missions[index] = updatedCommande;
          }
          this.filterByStatus(this.selectedStatus);
          console.log('✅ Livraison terminée');
        },
        error: (err) => {
          console.error('❌ Erreur lors de la livraison:', err);
          alert('Erreur lors de la confirmation de livraison');
        },
      });
  }

  getStatusInfo(status: CmdStatus) {
    return (
      this.statusList.find((s) => s.value === status) || this.statusList[0]
    );
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getTotalProduits(commande: Commande): number {
    return commande.produits.reduce((sum, p) => sum + p.quantite, 0);
  }

 

  getMissionCount(status: CmdStatus): number {
    return this.missions.filter((m) => m.status === status).length;
  }
}
