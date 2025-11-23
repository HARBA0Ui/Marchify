import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';
import { Shop } from '../../../../core/models/shop';
import { ShopService } from '../../../../core/services/shop-service';
import { AuthService } from '../../../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-shops-list-seller',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './shops-list-seller.component.html',
  styleUrl: './shops-list-seller.component.css',
})
export class ShopsListSellerComponent implements OnInit {
  // 🔹 Services
  private authService = inject(AuthService);
  private shopService = inject(ShopService);
  private router = inject(Router);

  // 🔹 Data
  shops: Shop[] = [];

  // 🔹 Vendeur ID from auth
  vendeurId: string | null = null;

  // 🔹 UI State
  isLoading = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();

    if (!currentUser || !currentUser.id) {
      console.error('❌ No user logged in');
      this.error.set('Vous devez être connecté pour voir vos boutiques');
      this.router.navigate(['/login']);
      return;
    }

    if (currentUser.role !== 'VENDEUR') {
      console.error('❌ User is not a vendor');
      this.error.set('Accès réservé aux vendeurs');
      this.router.navigate(['/login']);
      return;
    }

    // ✅ Get vendeurId from the user object (included in login response)
    this.vendeurId = this.authService.getVendeurId();

    if (!this.vendeurId) {
      console.error('❌ Vendeur ID not found in user object');
      this.error.set('ID vendeur non trouvé. Veuillez vous reconnecter.');
      return;
    }

    console.log('✅ Vendor ID:', this.vendeurId);
    this.loadShops();
  }

  loadShops(): void {
    if (!this.vendeurId) {
      this.error.set('ID vendeur non disponible');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    console.log('🔄 Loading shops for vendeur:', this.vendeurId);

    this.shopService
      .getShopsByVendeurId(this.vendeurId)
      .pipe(
        catchError((err) => {
          console.error('❌ Error fetching shops:', err);
          this.error.set('Erreur lors du chargement des boutiques');
          return of([]);
        }),
        finalize(() => {
          this.isLoading.set(false);
        })
      )
      .subscribe({
        next: (data) => {
          this.shops = data;
          console.log(
            `✅ Loaded ${this.shops.length} shops for vendor ${this.vendeurId}`
          );

          // Debug: Log each shop
          if (this.shops.length > 0) {
            this.shops.forEach((shop) => {
              console.log(`  🏪 Shop: ${shop.nom}, ID: ${shop.id}`);
            });
          } else {
            console.log('  ℹ️ No shops found for this vendor');
          }
        },
      });
  }

  createNewShop(): void {
    console.log('➕ Navigating to shop creation');
    this.router.navigate(['/seller/shop-creation']);
  }

  editShop(shopId: string): void {
    if (!shopId) {
      console.error('❌ Shop ID is undefined for edit');
      return;
    }
    this.router.navigate(['/seller/shop-edit', shopId]);
     console.log('✏️ Editing shop:', shopId);

  }

  deleteShop(shopId: string): void {
    if (!shopId) {
      console.error('❌ Shop ID is undefined for delete');
      return;
    }

    if (confirm('Voulez-vous vraiment supprimer cette boutique ?')) {
      console.log('🗑️ Deleting shop:', shopId);

      this.shopService
        .deleteShop(shopId)
        .pipe(
          catchError((err) => {
            console.error('❌ Error deleting shop:', err);

            // Check if error is about products
            if (err.error?.message?.includes('produits')) {
              this.error.set(
                'Impossible de supprimer une boutique qui contient des produits'
              );
            } else {
              this.error.set('Erreur lors de la suppression de la boutique');
            }

            return of(null);
          })
        )
        .subscribe({
          next: (result) => {
            if (result !== null) {
              console.log('✅ Shop deleted successfully');
              this.loadShops(); // Reload shops after deletion
            }
          },
        });
    }
  }

  trackById(index: number, item: Shop): string {
    return item.id;
  }
}
