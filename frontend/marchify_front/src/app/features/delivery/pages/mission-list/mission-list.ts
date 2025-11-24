import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { interval, Subscription, forkJoin } from 'rxjs';
import { BonDeLivraison } from '../../../../core/models/bondelivraison';
import { BondeLivraisonService } from '../../../../core/services/bonde-livraison-service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-mission-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './mission-list.html',
  styleUrl: './mission-list.css',
})
export class MissionList implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private bonService = inject(BondeLivraisonService);

  missions = signal<BonDeLivraison[]>([]);
  selectedStatus = signal<string>('PENDING_PICKUP');
  filteredMissions = signal<BonDeLivraison[]>([]);
  livreurId: string | null = null;
  error = signal<string | null>(null);
  loading = signal<boolean>(false);
  refreshing = signal<boolean>(false);

  private refreshSubscription?: Subscription;

  statusList = [
    { value: 'PENDING_PICKUP', label: 'Prêtes' },
    { value: 'IN_TRANSIT', label: 'En livraison' },
    { value: 'DELIVERED', label: 'Livrées' },
  ];

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.livreurId) {
      this.error.set('Connectez-vous en tant que livreur');
      return;
    }
    this.livreurId = currentUser.livreurId;
    this.loadAllMissions();
    this.startAutoRefresh();
  }

  ngOnDestroy(): void {
    this.stopAutoRefresh();
  }

  // ✅ AUTO-REFRESH every 30 seconds
  startAutoRefresh(): void {
    this.refreshSubscription = interval(30000).subscribe(() => {
      console.log('🔄 Auto-refreshing missions...');
      this.loadAllMissions(true);
    });
  }

  stopAutoRefresh(): void {
    this.refreshSubscription?.unsubscribe();
  }

  // ✅ MANUAL REFRESH
  manualRefresh(): void {
    console.log('🔄 Manual refresh triggered');
    this.refreshing.set(true);
    this.loadAllMissions(false, () => this.refreshing.set(false));
  }

  // ✅ LOAD ALL MISSIONS using forkJoin
  loadAllMissions(silent = false, callback?: () => void): void {
    if (!this.livreurId) return;

    if (!silent) this.loading.set(true);
    this.error.set(null);

    forkJoin({
      unassigned: this.bonService.getUnassignedBons(),
      assigned: this.bonService.getBonsByLivreur(this.livreurId),
    }).subscribe({
      next: (result) => {
        const unassignedBons = result.unassigned?.bons || [];
        const assignedBons = result.assigned?.bons || [];

        const previousCount = this.missions().length;
        const allMissions = [...unassignedBons, ...assignedBons];

        console.log('✅ Unassigned:', unassignedBons.length);
        console.log('✅ Assigned:', assignedBons.length);
        console.log('✅ TOTAL:', allMissions.length);

        // ✅ Update signal with new array reference
        this.missions.set(allMissions);

        // ✅ Notify if new missions (only during silent refresh)
        if (allMissions.length > previousCount && silent) {
          console.log('🔔 New missions available!');
          this.showNotification(
            `${allMissions.length - previousCount} nouvelle(s) mission(s)`
          );
        }

        this.filterByStatus(this.selectedStatus());

        if (allMissions.length === 0) {
          this.error.set('Aucune mission disponible');
        }

        if (!silent) this.loading.set(false);
        callback?.();
      },
      error: (err) => {
        console.error('❌ Load missions error:', err);
        this.error.set('Erreur lors du chargement des missions');
        if (!silent) this.loading.set(false);
        callback?.();
      },
    });
  }

  // ✅ FILTER BY STATUS
  filterByStatus(status: string): void {
    this.selectedStatus.set(status);
    const filtered = this.missions().filter((m) => m.status === status);
    this.filteredMissions.set(filtered);
  }

  // ✅ GET MISSION COUNT
  getMissionCount(status: string): number {
    return this.missions().filter((m) => m.status === status).length;
  }

  // ✅ ACCEPT MISSION (Assign livreur to unassigned bon)
  acceptMission(missionId: string): void {
    if (!this.livreurId || !confirm('Accepter cette mission ?')) return;

    this.bonService.assignLivreur(missionId, this.livreurId).subscribe({
      next: (response) => {
        console.log('✅ Mission accepted:', response);

        // ✅ Update the specific mission in the array
        this.missions.update((missions) =>
          missions.map((m) =>
            m.id === missionId ? response.bonDeLivraison : m
          )
        );

        this.filterByStatus(this.selectedStatus());
        alert('✅ Mission acceptée! Vous pouvez maintenant la récupérer.');

        // ✅ Optionally auto-pickup after accept
        this.pickupMission(missionId);
      },
      error: (err) => {
        console.error('❌ Accept error:', err);
        alert(err.error?.message || "❌ Erreur lors de l'acceptation");
      },
    });
  }

  // ✅ PICKUP MISSION (PENDING_PICKUP → IN_TRANSIT)
  pickupMission(missionId: string): void {
    if (!confirm('Confirmer la récupération de la commande ?')) return;

    this.bonService.pickupCommande(missionId).subscribe({
      next: (response) => {
        console.log('✅ Pickup confirmed:', response);

        // ✅ Update signal immutably
        this.missions.update((missions) =>
          missions.map((m) =>
            m.id === missionId ? response.bonDeLivraison : m
          )
        );

        this.filterByStatus(this.selectedStatus());
        alert('✅ Commande récupérée! En route pour la livraison.');
      },
      error: (err) => {
        console.error('❌ Pickup error:', err);
        alert(err.error?.message || '❌ Erreur lors de la récupération');
      },
    });
  }

  // ✅ COMPLETE DELIVERY (IN_TRANSIT → DELIVERED)
  completeDelivery(missionId: string): void {
    if (!confirm('Confirmer la livraison de cette commande ?')) return;

    this.bonService.livrerCommande(missionId).subscribe({
      next: (response) => {
        console.log('✅ Delivery completed:', response);

        // ✅ Update signal immutably
        this.missions.update((missions) =>
          missions.map((m) =>
            m.id === missionId ? response.bonDeLivraison : m
          )
        );

        this.filterByStatus(this.selectedStatus());
        alert('✅ Livraison confirmée avec succès!');
      },
      error: (err) => {
        console.error('❌ Delivery error:', err);
        alert(err.error?.message || '❌ Erreur lors de la livraison');
      },
    });
  }

  // ✅ FAIL DELIVERY
  failDelivery(missionId: string): void {
    const reason = prompt("Raison de l'échec de livraison:");
    if (!reason) return;

    this.bonService.failDelivery(missionId, reason).subscribe({
      next: (response) => {
        console.log('⚠️ Delivery failed:', response);

        this.missions.update((missions) =>
          missions.map((m) =>
            m.id === missionId ? response.bonDeLivraison : m
          )
        );

        this.filterByStatus(this.selectedStatus());
        alert('⚠️ Échec de livraison enregistré.');
      },
      error: (err) => {
        console.error('❌ Fail delivery error:', err);
        alert(err.error?.message || '❌ Erreur');
      },
    });
  }

  // ✅ HELPER: Show browser notification
  showNotification(message: string): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Marchify - Nouvelles missions', {
        body: message,
        icon: '/assets/logo.png',
      });
    }
  }

  // ✅ HELPER: Get total products
  getTotalProduits(mission: BonDeLivraison): number {
    return (
      mission.commande?.produits?.reduce((sum, p) => sum + p.quantite, 0) || 0
    );
  }

  // ✅ HELPER: Format date
  formatDate(dateStr: string | Date): string {
    return new Date(dateStr).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // ✅ HELPER: Get status label
  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      PENDING_PICKUP: 'Prête à récupérer',
      IN_TRANSIT: 'En livraison',
      DELIVERED: 'Livrée',
      FAILED: 'Échec',
    };
    return labels[status] || status;
  }

  // ✅ HELPER: Get client address
  getClientAddress(mission: BonDeLivraison): string {
    const adresse = mission.commande?.adresseLivraison;
    if (typeof adresse === 'string') return adresse;
    if (typeof adresse === 'object') {
      return `${adresse.rue || ''}, ${adresse.ville || ''} ${
        adresse.codePostal || ''
      }`.trim();
    }
    return 'Adresse non disponible';
  }
}
