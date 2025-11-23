import { Component, inject, OnInit } from '@angular/core';
import { ProductService } from '../../core/services/product-service';
import { Product } from '../../core/models/product';
import { ProductCard } from '../product-card/product-card';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PanierService } from '../../core/services/panier';
import { AuthService } from '../../core/services/auth.service';
import { RouterLink, Router } from '@angular/router';
import { ProductMostrateCard } from "../product-mostrate-card/product-mostrate-card";
import { ShopService } from '../../core/services/shop-service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    ProductCard,
    FormsModule,
    CommonModule,
    RouterLink,
    ProductMostrateCard,
  ],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
})
export class ProductList implements OnInit {
  private productService = inject(ProductService);
  private panierService = inject(PanierService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private boutiqueService = inject(ShopService);

  products: Product[] = [];
  filteredProducts: Product[] = [];
  topPinnedProducts: Product[] = [];
  shopNames: Map<string, string> = new Map(); // ✅ ADD THIS

  // ✅ PAGINATION - ADD THESE
  currentPage: number = 1;
  itemsPerPage: number = 9;
  totalPages: number = 0;
  paginatedProducts: Product[] = [];
  isJumping: boolean = false;

  selectedCategory: string = '';
  deliveryFilter: string = 'all';
  sortBy: string = 'name';
  isLoading: boolean = true;
  categories: string[] = [];

  ngOnInit() {
    this.loadProducts();
    this.loadCartCount();
    this.fetchPinnedTopRated();
  }

  fetchPinnedTopRated() {
    this.productService.getPinnedTopRatedProduits().subscribe({
      next: (products) => {
        this.topPinnedProducts = (products || []).slice(0, 3);
      },
      error: (err) => {
        console.error('Erreur chargement des produits épinglés/top:', err);
        this.topPinnedProducts = [];
      },
    });
  }
  loadShopNames() {
    const uniqueShopIds = [...new Set(this.products.map((p) => p.boutiqueId))];

    uniqueShopIds.forEach((shopId) => {
      if (shopId) {
        this.boutiqueService.getShopById(shopId).subscribe({
          next: (shop) => {
            if (shop) {
              this.shopNames.set(shopId, shop.nom);
            }
          },
          error: (err) => {
            console.error(`Erreur chargement boutique ${shopId}:`, err);
            this.shopNames.set(shopId, 'Boutique');
          },
        });
      }
    });
  }

  loadProducts() {
    this.isLoading = true;
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.filteredProducts = [...this.products];
        this.extractCategories();
        this.updatePagination(); // ✅ ADD PAGINATION
        this.isLoading = false;
        this.loadShopNames(); // ✅ ADD THIS
      },
      error: (error) => {
        console.error('Erreur lors du chargement des produits:', error);
        this.isLoading = false;
      },
    });
  }

  loadCartCount() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    this.panierService.getPanierByClientId(currentUser.id).subscribe({
      next: (panier: any) => {
        if (panier && panier.produits) {
          const count = panier.produits.reduce(
            (sum: number, p: any) => sum + p.quantite,
            0
          );
          this.panierService.setCartCount(count);
        } else {
          this.panierService.setCartCount(0);
        }
      },
      error: () => {
        this.panierService.setCartCount(0);
      },
    });
  }

  extractCategories() {
    this.categories = [...new Set(this.products.map((p) => p.categorie))];
  }

  applyFilters() {
    let filtered = [...this.products];

    if (this.selectedCategory) {
      filtered = filtered.filter((p) => p.categorie === this.selectedCategory);
    }

    if (this.deliveryFilter === 'livrable') {
      filtered = filtered.filter((p) => p.livrable);
    } else if (this.deliveryFilter === 'non-livrable') {
      filtered = filtered.filter((p) => !p.livrable);
    }

    this.filteredProducts = filtered;
    this.currentPage = 1; // Reset to page 1
    this.updatePagination(); // ✅ UPDATE PAGINATION
  }

  applySorting() {
    switch (this.sortBy) {
      case 'price-asc':
        this.filteredProducts.sort((a, b) => a.prix - b.prix);
        break;
      case 'price-desc':
        this.filteredProducts.sort((a, b) => b.prix - a.prix);
        break;
      case 'name':
      default:
        this.filteredProducts.sort((a, b) => a.nom.localeCompare(b.nom));
    }
    this.updatePagination(); // ✅ UPDATE PAGINATION
  }
  getShopName(boutiqueId: string): string {
    return this.shopNames.get(boutiqueId) || 'Boutique';
  }

  // ✅ NEW PAGINATION METHODS
  updatePagination() {
    this.totalPages = Math.ceil(
      this.filteredProducts.length / this.itemsPerPage
    );
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    }
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedProducts = this.filteredProducts.slice(startIndex, endIndex);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.triggerJumpAnimation();
      this.currentPage = page;
      this.updatePagination();
    }
  }

  triggerJumpAnimation() {
    this.isJumping = true;
    setTimeout(() => (this.isJumping = false), 600);
  }

  get pageNumbers(): number[] {
    const maxPages = 7;
    const pages: number[] = [];
    if (this.totalPages <= maxPages) {
      return Array.from({ length: this.totalPages }, (_, i) => i + 1);
    }
    pages.push(1);
    if (this.currentPage > 3) pages.push(-1);
    const start = Math.max(2, this.currentPage - 1);
    const end = Math.min(this.totalPages - 1, this.currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (this.currentPage < this.totalPages - 2) pages.push(-1);
    if (this.totalPages > 1) pages.push(this.totalPages);
    return pages;
  }

  getSliderPosition(): number {
    if (this.totalPages === 0) return 8;
    const buttonWidth = 40;
    const gap = 8;
    const padding = 8;
    const allPages = this.pageNumbers;
    let visualIndex = 0;
    for (let i = 0; i < allPages.length; i++) {
      if (allPages[i] === this.currentPage) {
        visualIndex = i;
        break;
      }
    }
    return padding + (visualIndex + 1) * (buttonWidth + gap);
  }

  clearFilters() {
    this.selectedCategory = '';
    this.deliveryFilter = 'all';
    this.sortBy = 'name';
    this.filteredProducts = [...this.products];
    this.currentPage = 1;
    this.applySorting();
  }

  // ✅ YOUR WORKING CART METHODS (KEEP THESE)
  onAddToCart(product: Product) {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      alert('Vous devez être connecté pour ajouter au panier');
      this.router.navigate(['/login']);
      return;
    }
    const clientId = currentUser.id;
    const quantite = 1;
    this.panierService
      .ajouterProduit(clientId, product.id, quantite)
      .subscribe({
        next: (res) => {
          console.log('Produit ajouté au panier:', res);
          this.loadCartCount();
        },
        error: (err) => {
          console.error('Erreur ajout produit:', err);
          if (err.status === 400 && err.error?.message) {
            alert(err.error.message);
          } else {
            alert("Impossible d'ajouter le produit au panier.");
          }
          this.loadCartCount();
        },
      });
  }

  onViewDetails(product: Product) {
    console.log('View product details:', product);
  }

  trackById(index: number, product: Product) {
    return product.id;
  }
}
