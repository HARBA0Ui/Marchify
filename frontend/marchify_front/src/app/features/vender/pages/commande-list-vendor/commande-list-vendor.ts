import { Component, inject } from '@angular/core';
import { CmdStatus, Commande } from '../../../../core/models/commande';
import { CommandeService } from '../../../../core/services/commande-service';

@Component({
  selector: 'app-commande-list-vendor',
  imports: [],
  templateUrl: './commande-list-vendor.html',
  styleUrl: './commande-list-vendor.css',
})
export class CommandeListVendor {
  private commandeService = inject(CommandeService);

  commandes: Commande[] = [];
  filteredCommandes: Commande[] = [];
  selectedStatus: CmdStatus = CmdStatus.PENDING;
  loading: boolean = false;
  error: string = '';

  // Get vendeurId from localStorage or auth service
  vendeurId: string = 'vd1'; // TODO: Replace with actual auth service
  vendeurBoutiques: string[] = ['b1', 'b2']; // TODO: Fetch from vendeur data

  statusList = [
    {
      value: CmdStatus.PENDING,
      label: 'En attente',
      bgColor: 'bg-[#e0ab3a]',
      textColor: 'text-white',
    },
    {
      value: CmdStatus.CONFIRMED,
      label: 'Confirmée',
      bgColor: 'bg-[#38cddd]',
      textColor: 'text-white',
    },
    {
      value: CmdStatus.PREPARING,
      label: 'En préparation',
      bgColor: 'bg-[#fcb046]',
      textColor: 'text-white',
    },
    {
      value: CmdStatus.SHIPPED,
      label: 'Expédiée',
      bgColor: 'bg-[#47a275]',
      textColor: 'text-white',
    },
    {
      value: CmdStatus.DELIVERED,
      label: 'Livrée',
      bgColor: 'bg-[#29875c]',
      textColor: 'text-white',
    },
    {
      value: CmdStatus.CANCELLED,
      label: 'Annulée',
      bgColor: 'bg-[#a52b4d]',
      textColor: 'text-white',
    },
  ];

  ngOnInit(): void {
    this.loadCommandes();
  }

  loadCommandes(): void {
    this.loading = true;
    this.error = '';

    this.commandeService.getAllCommandes().subscribe({
      next: (data) => {
        // Filter commandes for this vendor's boutiques
        this.commandes = data.filter(
          (cmd) => cmd.boutiqueId && this.isVendeurBoutique(cmd.boutiqueId)
        );
        this.filterByStatus(this.selectedStatus);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des commandes';
        console.error('Error loading commandes:', err);
        this.loading = false;
      },
    });
  }

  // Check if boutique belongs to vendor (you'll need to implement this based on your data)
  isVendeurBoutique(boutiqueId: string): boolean {
    // TODO: Implement proper check from vendeur boutiques list
    return true; // For now, return true for all
  }

  filterByStatus(status: CmdStatus): void {
    this.selectedStatus = status;
    this.filteredCommandes = this.commandes.filter(
      (cmd) => cmd.status === status
    );
  }

  updateStatus(commandeId: string, newStatus: CmdStatus): void {
    this.commandeService.updateCommandeStatus(commandeId, newStatus).subscribe({
      next: (updatedCommande) => {
        // Update local data
        const index = this.commandes.findIndex((c) => c.id === commandeId);
        if (index !== -1) {
          this.commandes[index] = updatedCommande;
        }
        this.filterByStatus(this.selectedStatus);
        console.log('✅ Statut mis à jour avec succès');
      },
      error: (err) => {
        console.error('❌ Erreur lors de la mise à jour:', err);
        alert('Erreur lors de la mise à jour du statut');
      },
    });
  }

  getNextStatus(currentStatus: CmdStatus): CmdStatus | null {
    const statusFlow: { [key in CmdStatus]?: CmdStatus } = {
      [CmdStatus.PENDING]: CmdStatus.CONFIRMED,
      [CmdStatus.CONFIRMED]: CmdStatus.PREPARING,
      [CmdStatus.PREPARING]: CmdStatus.SHIPPED,
      [CmdStatus.SHIPPED]: CmdStatus.DELIVERED,
    };
    return statusFlow[currentStatus] || null;
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

  getCommandeCount(status: CmdStatus): number {
    return this.commandes.filter((c) => c.status === status).length;
  }
}
  