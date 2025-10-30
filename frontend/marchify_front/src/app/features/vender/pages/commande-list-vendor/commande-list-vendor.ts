import { Component, inject, OnInit } from '@angular/core';
import { CmdStatus, Commande } from '../../../../core/models/commande';
import { CommandeService } from '../../../../core/services/commande-service';

@Component({
  selector: 'app-commande-list-vendor',
  templateUrl: './commande-list-vendor.html',
  styleUrls: ['./commande-list-vendor.css'],
})
export class CommandeListVendor implements OnInit {
  private commandeService = inject(CommandeService);

  public CmdStatus = CmdStatus;

  commandes: Commande[] = [];
  filteredCommandes: Commande[] = [];
  selectedStatus: CmdStatus = CmdStatus.PENDING;
  loading = false;
  error = '';

  boutique1 = '68f743532df2f750af13a590'; // TODO: remplacer par boutique du vendeur connecté

  statusList = [
    { value: CmdStatus.PENDING, label: 'En attente' },
    { value: CmdStatus.PROCESSING, label: 'En traitement' },
    { value: CmdStatus.READY, label: 'Prête' },
  ];

  ngOnInit(): void {
    this.loadCommandes();
  }

  loadCommandes(): void {
    this.loading = true;
    this.error = '';

    this.commandeService.getCommandesByBoutique(this.boutique1).subscribe({
      next: (data: { commandes: Commande[] } | Commande[]) => {
        const commandesArray: Commande[] = Array.isArray(data)
          ? data
          : data.commandes ?? [];

        this.commandes = commandesArray;
        this.filterByStatus(this.selectedStatus);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des commandes';
        console.error(err);
        this.loading = false;
      },
    });
  }

  filterByStatus(status: CmdStatus) {
    this.selectedStatus = status;
    this.filteredCommandes = this.commandes.filter((c) => c.status === status);
  }

  updateStatus(commandeId: string) {
    const commande = this.commandes.find((c) => c.id === commandeId);
    if (!commande) return;
  

    const nextStatus = this.getNextStatus(commande.status);
    if (!nextStatus) return;

    this.commandeService.preparerCommande(commandeId).subscribe({
      next: (updatedData: any) => {
        const updatedCommande: Commande = updatedData.commande ?? updatedData;
        const index = this.commandes.findIndex((c) => c.id === commandeId);
        if (index !== -1) this.commandes[index] = updatedCommande;
        this.filterByStatus(this.selectedStatus);
      },
      error: (err) => {
        console.error('Erreur lors de la mise à jour du statut:', err);
        alert('Erreur lors de la mise à jour du statut');
      },
    });
  }

  getNextStatus(status: CmdStatus): CmdStatus | null {
    const flow: { [key in CmdStatus]?: CmdStatus } = {
      [CmdStatus.PENDING]: CmdStatus.PROCESSING,
      [CmdStatus.PROCESSING]: CmdStatus.READY,
    };
    return flow[status] ?? null;
  }

  getStatusInfo(status: CmdStatus) {
    return (
      this.statusList.find((s) => s.value === status) ?? this.statusList[0]
    );
  }

  formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getTotalProduits(c: Commande) {
    return c.produits?.reduce((sum, p) => sum + (p.quantite ?? 0), 0) ?? 0;
  }

  getCommandeCount(status: CmdStatus) {
    return this.commandes.filter((c) => c.status === status).length;
  }
}
