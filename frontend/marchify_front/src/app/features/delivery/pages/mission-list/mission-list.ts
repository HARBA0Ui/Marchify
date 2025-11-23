import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { LivreurService } from '../../../../core/services/livreur-service';
import { BonDeLivraison } from '../../../../core/models/bondelivraison';
import { BondeLivraisonService } from '../../../../core/services/bonde-livraison-service';
import { AuthService } from '../../../../core/services/auth.service';

interface MissionsResponse { missions: BonDeLivraison[] }

@Component({
  selector: 'app-mission-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './mission-list.html',
  styleUrl: './mission-list.css',
})
export class MissionList implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private livreurService = inject(LivreurService);
  private bondelivraison = inject(BondeLivraisonService);
  
  missions: BonDeLivraison[] = [];
  selectedStatus = signal<string>('PENDING_PICKUP');
  filteredMissions: BonDeLivraison[] = [];
  livreurId: string | null = null;
  error = signal<string | null>(null);
  loading = signal<boolean>(false);
  refreshing = signal<boolean>(false); // ✅ Manual refresh indicator
  
  private refreshSubscription?: Subscription; // ✅ Auto-refresh

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
    this.startAutoRefresh(); // ✅ Start polling
  }

  ngOnDestroy(): void {
    this.stopAutoRefresh(); // ✅ Clean up
  }

  // ✅ AUTO-REFRESH every 30 seconds
  startAutoRefresh(): void {
    this.refreshSubscription = interval(30000).subscribe(() => {
      console.log('🔄 Auto-refreshing missions...');
      this.loadAllMissions(true); // Silent refresh
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

  // ✅ ENHANCED loadAllMissions with silent mode
  loadAllMissions(silent = false, callback?: () => void): void {
    if (!this.livreurId) return;
    
    if (!silent) this.loading.set(true);
    this.error.set(null);

    this.livreurService.getMissionsDisponibles().subscribe({
      next: (res: any) => {
        const available = Array.isArray(res) ? res : res.missions ?? [];
        console.log('✅ Available:', available.length);

        this.bondelivraison.getBondelisraisonsByLivreur(this.livreurId!).subscribe({
          next: (assignedRes: any) => {
            const assigned = Array.isArray(assignedRes?.bons) ? assignedRes.bons : [];
            console.log('✅ Assigned:', assigned.length);
            
            const previousCount = this.missions.length;
            this.missions = [...available, ...assigned];
            console.log('✅ TOTAL:', this.missions.length);
            
            // ✅ Notify if new missions
            if (this.missions.length > previousCount && silent) {
              console.log('🔔 New missions available!');
            }
            
            this.filterByStatus(this.selectedStatus());
            this.error.set(this.missions.length === 0 ? "Aucune mission" : null);
            if (!silent) this.loading.set(false);
            callback?.();
          },
          error: (err) => {
            console.error('Assigned error:', err);
            this.missions = available;
            this.filterByStatus(this.selectedStatus());
            if (!silent) this.loading.set(false);
            callback?.();
          }
        });
      },
      error: (err) => {
        console.error('Available error:', err);
        this.error.set('Erreur chargement');
        if (!silent) this.loading.set(false);
        callback?.();
      }
    });
  }

  filterByStatus(status: string) {
    this.selectedStatus.set(status);
    this.filteredMissions = this.missions.filter(m => m.status === status);
  }

  getMissionCount(status: string): number {
    return this.missions.filter(m => m.status === status).length;
  }

  getStatusLabel(status: string): string {
    const labels = { PENDING_PICKUP: 'Prête', IN_TRANSIT: 'En livraison', DELIVERED: 'Livrée' };
    return labels[status as keyof typeof labels] || status;
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }

  acceptMission(missionId: string) {
    if (!this.livreurId || !confirm('Accepter cette mission ?')) return;
    
    this.livreurService.accepterMission(this.livreurId, missionId).subscribe({
      next: (res: any) => {
        const mission = res.bonDeLivraison || res;
        const i = this.missions.findIndex(m => m.id === missionId);
        if (i > -1) this.missions[i] = mission;
        this.filterByStatus(this.selectedStatus());
        alert('✅ Mission acceptée!');
        this.loadAllMissions(true); // ✅ Refresh after action
      },
      error: () => alert('❌ Erreur acceptation')
    });
  }

  completeDelivery(missionId: string) {
    if (!confirm('Confirmer livraison ?')) return;
    
    this.bondelivraison.livrerCommande(missionId).subscribe({
      next: (mission: BonDeLivraison) => {
        const i = this.missions.findIndex(m => m.id === missionId);
        if (i > -1) this.missions[i] = mission;
        this.filterByStatus(this.selectedStatus());
        alert('✅ Livraison confirmée!');
        this.loadAllMissions(true); // ✅ Refresh after action
      },
      error: () => alert('❌ Erreur livraison')
    });
  }

  getTotalProduits(mission: BonDeLivraison): number {
    return mission.commande?.produits?.reduce((sum, p) => sum + p.quantite, 0) || 0;
  }
}
