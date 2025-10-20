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

  // ONLY vendor-relevant statuses (PENDING → PROCESSING → READY)
  statusList = [
    {
      value: CmdStatus.PENDING,
      label: 'En attente',
      bgColor: 'bg-[#e0ab3a]',
      textColor: 'text-white',
    },
    {
      value: CmdStatus.PROCESSING,
      label: 'En traitement',
      bgColor: 'bg-[#fcb046]',
      textColor: 'text-white',
    },
    {
      value: CmdStatus.READY,
      label: 'Prête',
      bgColor: 'bg-[#29875c]',
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
        // Filter commandes for this vendor's boutiques AND only vendor statuses
        this.commandes = data.filter(
          (cmd) =>
            cmd.boutiqueId &&
            this.isVendeurBoutique(cmd.boutiqueId) &&
            this.isVendorStatus(cmd.status)
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

  // Check if status is vendor-manageable
  isVendorStatus(status: CmdStatus): boolean {
    return [CmdStatus.PENDING, CmdStatus.PROCESSING, CmdStatus.READY].includes(
      status
    );
  }

  // Check if boutique belongs to vendor
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

        // If status moved to READY, remove from vendor view after update
        if (newStatus === CmdStatus.READY) {
          // Keep it visible for a moment, then optionally remove or keep
          // For now, we keep it so vendor can see completed orders
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

  // Vendor workflow: PENDING → PROCESSING → READY (STOP)
  getNextStatus(currentStatus: CmdStatus): CmdStatus | null {
    const vendorStatusFlow: { [key in CmdStatus]?: CmdStatus } = {
      [CmdStatus.PENDING]: CmdStatus.PROCESSING,
      [CmdStatus.PROCESSING]: CmdStatus.READY,
      // READY is the final status for vendor - no next status
    };
    return vendorStatusFlow[currentStatus] || null;
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
