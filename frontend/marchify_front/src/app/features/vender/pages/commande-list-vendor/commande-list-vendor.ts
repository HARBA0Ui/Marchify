import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { catchError, finalize, of } from 'rxjs';
import { CmdStatus, Commande } from '../../../../core/models/commande';
import { CommandeService } from '../../../../core/services/commande-service';
import { AuthService } from '../../../../core/services/auth.service';
import { ShopService } from '../../../../core/services/shop-service';

@Component({
  selector: 'app-commande-list-vendor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './commande-list-vendor.html',
  styleUrls: ['./commande-list-vendor.css'],
})
export class CommandeListVendor implements OnInit {
  private commandeService = inject(CommandeService);
  private authService = inject(AuthService);
  private shopService = inject(ShopService);
  private router = inject(Router);

  public CmdStatus = CmdStatus;

  commandes: Commande[] = [];
  filteredCommandes: Commande[] = [];
  selectedStatus: CmdStatus = CmdStatus.PENDING;

  isLoading = signal(false);
  error = signal<string | null>(null);

  vendeurId: string | null = null;
  userShops: any[] = [];
  selectedShopId: string | null = null;

  expandedProductDetails = new Set<number>();

  statusList = [
    {
      value: CmdStatus.PENDING,
      label: 'En attente',
      icon: 'fa-clock',
      color: 'bg-yellow-500',
    },
    {
      value: CmdStatus.PROCESSING,
      label: 'En traitement',
      icon: 'fa-spinner',
      color: 'bg-blue-500',
    },
    {
      value: CmdStatus.READY,
      label: 'Prête',
      icon: 'fa-check-circle',
      color: 'bg-green-500',
    },
    {
      value: CmdStatus.SHIPPED,
      label: 'Expédiée',
      icon: 'fa-truck',
      color: 'bg-purple-500',
    },
    {
      value: CmdStatus.DELIVERED,
      label: 'Livrée',
      icon: 'fa-box-check',
      color: 'bg-teal-500',
    },
    {
      value: CmdStatus.CANCELLED,
      label: 'Annulée',
      icon: 'fa-times-circle',
      color: 'bg-red-500',
    },
    {
      value: CmdStatus.RETURNED,
      label: 'Retournée',
      icon: 'fa-undo',
      color: 'bg-orange-500',
    },
  ];

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();

    if (!currentUser || currentUser.role !== 'VENDEUR') {
      this.error.set('Vous devez être connecté en tant que vendeur');
      this.router.navigate(['/login']);
      return;
    }

    this.vendeurId = this.authService.getVendeurId();

    if (!this.vendeurId) {
      this.error.set('ID vendeur non trouvé. Veuillez vous reconnecter.');
      return;
    }

    this.loadVendorShops();
  }

  loadVendorShops(): void {
    if (!this.vendeurId) return;

    this.isLoading.set(true);

    this.shopService
      .getShopsByVendeurId(this.vendeurId)
      .pipe(
        catchError((err) => {
          console.error('❌ Error loading shops:', err);
          this.error.set('Erreur lors du chargement des boutiques');
          return of([]);
        }),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (shops) => {
          this.userShops = shops;

          if (shops.length > 0) {
            this.selectedShopId = shops[0].id;
            this.loadCommandes();
          } else {
            this.error.set('Aucune boutique trouvée.');
          }
        },
      });
  }

  onShopChange(shopId: string): void {
    this.selectedShopId = shopId;
    this.loadCommandes();
  }

  loadCommandes(): void {
    if (!this.selectedShopId) return;

    this.isLoading.set(true);
    this.error.set(null);

    this.commandeService
      .getCommandesByBoutique(this.selectedShopId)
      .pipe(
        catchError((err) => {
          console.error('❌ Error loading commandes:', err);
          this.error.set('Erreur lors du chargement des commandes');
          return of({ commandes: [] });
        }),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (data: any) => {
          const commandesArray: Commande[] = Array.isArray(data)
            ? data
            : data.commandes ?? [];
          this.commandes = commandesArray;
          this.filterByStatus(this.selectedStatus);
        },
      });
  }

  filterByStatus(status: CmdStatus): void {
    this.selectedStatus = status;
    this.filteredCommandes = this.commandes.filter((c) => c.status === status);
  }

  updateStatus(commandeId: string): void {
    const nextStatus = this.getNextStatus(
      this.commandes.find((c) => c.id === commandeId)?.status
    );
    if (!nextStatus) return;

    this.commandeService
      .preparerCommande(commandeId)
      .pipe(catchError(() => of(null)))
      .subscribe({
        next: (updatedData: any) => {
          if (!updatedData) return;
          const updated: Commande = updatedData.commande ?? updatedData;
          const index = this.commandes.findIndex((c) => c.id === commandeId);
          if (index !== -1) {
            this.commandes[index] = updated;
            this.filterByStatus(this.selectedStatus);
          }
        },
      });
  }

  cancelCommande(commandeId: string): void {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) return;

    this.commandeService
      .updateCommandeStatus(commandeId, CmdStatus.CANCELLED)
      .subscribe({
        next: (updated) => {
          const index = this.commandes.findIndex((c) => c.id === commandeId);
          if (index !== -1) {
            this.commandes[index] = updated;
            this.filterByStatus(this.selectedStatus);
          }
        },
      });
  }

  toggleProductDetails(index: number): void {
    this.expandedProductDetails.has(index)
      ? this.expandedProductDetails.delete(index)
      : this.expandedProductDetails.add(index);
  }

  isProductDetailsExpanded(index: number): boolean {
    return this.expandedProductDetails.has(index);
  }

  // ✅ Helper methods for safe access
  getPrixUnitaire(cmdProduit: any): number {
    return (
      cmdProduit.produit?.prix ||
      cmdProduit.prixTotal / cmdProduit.quantite ||
      0
    );
  }

  getProductNom(cmdProduit: any): string {
    return cmdProduit.produit?.nom || cmdProduit.nom || 'Produit';
  }

  getProductImage(cmdProduit: any): string | null {
    return cmdProduit.produit?.image || null;
  }

  getProductCategorie(cmdProduit: any): string | null {
    return cmdProduit.produit?.categorie || null;
  }

  getProductUnite(cmdProduit: any): string {
    return cmdProduit.produit?.unite || '';
  }

  getNextStatus(status?: CmdStatus): CmdStatus | null {
    if (!status) return null;

    const flow: Partial<Record<CmdStatus, CmdStatus>> = {
      [CmdStatus.PENDING]: CmdStatus.PROCESSING,
      [CmdStatus.PROCESSING]: CmdStatus.READY,
      [CmdStatus.READY]: CmdStatus.SHIPPED,
    };

    return flow[status] ?? null;
  }

  canCancelCommande(status: CmdStatus): boolean {
    return status === CmdStatus.PENDING || status === CmdStatus.PROCESSING;
  }

  getStatusInfo(status: CmdStatus) {
    return (
      this.statusList.find((s) => s.value === status) ?? this.statusList[0]
    );
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getTotalProduits(c: Commande): number {
    return c.produits?.reduce((sum, p) => sum + (p.quantite ?? 0), 0) ?? 0;
  }

  getTotalProductTypes(c: Commande): number {
    return c.produits?.length ?? 0;
  }

  getCommandeCount(status: CmdStatus): number {
    return this.commandes.filter((c) => c.status === status).length;
  }

  getClientFullName(commande: Commande): string {
    return `${commande.client.nom} ${
      (commande.client as any).prenom || ''
    }`.trim();
  }

  getUnitLabel(unite: string): string {
    const labels: Record<string, string> = {
      KILOGRAMME: 'kg',
      GRAMME: 'g',
      LITRE: 'L',
      MILLILITRE: 'ml',
      PIECE: 'pièce(s)',
      BOITE: 'boîte(s)',
      SAC: 'sac(s)',
      CARTON: 'carton(s)',
      METRE: 'm',
      CENTIMETRE: 'cm',
      AUTRE: '',
    };
    return labels[unite] || unite;
  }
}
