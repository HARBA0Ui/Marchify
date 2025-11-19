import { Component, inject, OnInit, signal } from '@angular/core';
import { Commande } from '../../../../core/models/commande';
import { CommandeService } from '../../../../core/services/commande-service';
import { DatePipe } from '@angular/common';
import { ShopService } from '../../../../core/services/shop-service';
import { Shop } from '../../../../core/models/shop';
import { Product } from '../../../../core/models/product';
import { ProductService } from '../../../../core/services/product-service';
import { PricePipe } from '../../../../price-pipe';
import { AuthService } from '../../../../core/services/auth.service';
import { catchError, finalize, of } from 'rxjs';

@Component({
  selector: 'app-my-orders',
  imports: [DatePipe, PricePipe],
  templateUrl: './my-orders.html',
  styleUrl: './my-orders.css',
})
export class MyOrders implements OnInit {
  // 🔹 Services
  private authService = inject(AuthService);
  private commandeService = inject(CommandeService);
  private shopService = inject(ShopService);
  private productService = inject(ProductService);

  // 🔹 Data
  commandes: Commande[] = [];
  produits: Product[] = [];
  shops: Shop[] = [];

  // 🔹 User ID from auth (not hardcoded)
  clientId: string | null = null;

  // 🔹 UI State
  expandedRowId: string | null = null;
  isLoading = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    // 🔹 Get the current user and extract the ID
    const currentUser = this.authService.getCurrentUser();

    if (!currentUser || !currentUser.id) {
      console.error('No user logged in');
      this.error.set('Vous devez être connecté pour voir vos commandes');
      return;
    }

    // 🔹 Assign the user ID
    this.clientId = currentUser.id;
    console.log('Client ID:', this.clientId);

    // 🔹 Load orders
    this.loadOrders();
  }

  loadOrders(): void {
    // 🔹 Check if clientId exists before making the call
    if (!this.clientId) {
      this.error.set('ID utilisateur non disponible');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    this.commandeService
      .getCommandesByAcheteur(this.clientId)
      .pipe(
        catchError((err) => {
          console.error('Error fetching orders:', err);
          this.error.set('Erreur lors du chargement des commandes');
          return of({ commandes: [] });
        }),
        finalize(() => {
          this.isLoading.set(false);
        })
      )
      .subscribe({
        next: (res) => {
          this.commandes = res.commandes;

          // Extract unique product IDs
          const productIds = Array.from(
            new Set(
              this.commandes.flatMap((cmd) =>
                cmd.produits.map((p) => p.produitId)
              )
            )
          );

          // Fetch products by IDs
          if (productIds.length > 0) {
            this.productService
              .getProductsByIds(productIds)
              .pipe(
                catchError((err) => {
                  console.error('Error fetching products:', err);
                  return of([]);
                })
              )
              .subscribe((products) => {
                this.produits = products;
              });
          }

          // Fetch shops
          this.shopService
            .getAllShops()
            .pipe(
              catchError((err) => {
                console.error('Error fetching shops:', err);
                return of([]);
              })
            )
            .subscribe((shops) => {
              this.shops = shops;
            });
        },
      });
  }

  getProductName(produitId: string): string {
    const produit = this.produits.find((p) => p.id === produitId);
    return produit ? produit.nom : 'Produit inconnu';
  }

  getProductPrice(produitId: string): number {
    const produit = this.produits.find((p) => p.id === produitId);
    return produit ? produit.prix : 0;
  }

  toggleProducts(cmdId: string): void {
    this.expandedRowId = this.expandedRowId === cmdId ? null : cmdId;
  }

  getBoutiqueName(boutiqueId: string): string {
    const shop = this.shops.find((s) => s.id === boutiqueId);
    return shop ? shop.nom : 'Boutique inconnue';
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'PROCESSING':
        return 'bg-orange-100 text-orange-800';
      case 'READY':
        return 'bg-blue-100 text-blue-800';
      case 'SHIPPED':
        return 'bg-indigo-100 text-indigo-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800 line-through';
      case 'RETURNED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'En attente';
      case 'PROCESSING':
        return 'En cours';
      case 'READY':
        return 'Prête';
      case 'SHIPPED':
        return 'Expédiée';
      case 'DELIVERED':
        return 'Livrée';
      case 'CANCELLED':
        return 'Annulée';
      case 'RETURNED':
        return 'Retournée';
      default:
        return status;
    }
  }
}
