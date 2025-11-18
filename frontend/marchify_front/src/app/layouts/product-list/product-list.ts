import { Component, inject, OnInit } from '@angular/core';
import { ProductService } from '../../core/services/product-service';
import { Product } from '../../core/models/product';
import { ProductCard } from '../product-card/product-card';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PanierService } from '../../core/services/panier';
import { AuthService } from '../../core/services/auth.service';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-product-list',
  imports: [ProductCard, FormsModule, CommonModule, RouterLink],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
})
export class ProductList implements OnInit {
  private productService = inject(ProductService);
  private panierService = inject(PanierService);
  private authService = inject(AuthService);
  private router = inject(Router);

  products: Product[] = [];
  filteredProducts: Product[] = [];

  selectedCategory: string = '';
  deliveryFilter: string = 'all';
  sortBy: string = 'name';

  isLoading: boolean = true;
  categories: string[] = [];

  ngOnInit() {
    this.loadProducts();
    this.loadCartCount(); // Load initial cart count
  }

  loadProducts() {
    this.isLoading = true;

    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.filteredProducts = [...this.products];
        this.extractCategories();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des produits:', error);
        this.isLoading = false;
      },
    });
  }

  // 🔹 Load cart count from database on init
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
      }
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
    this.applySorting();
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
  }

  clearFilters() {
    this.selectedCategory = '';
    this.deliveryFilter = 'all';
    this.sortBy = 'name';
    this.filteredProducts = [...this.products];
    this.applySorting();
  }

  // ✅ Handle add to cart with dynamic clientId
  onAddToCart(product: Product) {
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser) {
      alert('Vous devez être connecté pour ajouter au panier');
      this.router.navigate(['/login']);
      return;
    }

    const clientId = currentUser.id;
    const quantite = 1;

    this.panierService.ajouterProduit(clientId, product.id, quantite).subscribe({
      next: (res) => {
        console.log('Produit ajouté au panier:', res);
        
        // 🔹 Reload cart count from database to ensure accuracy
        // The ProductCard already did optimistic update (+1)
        // But let's sync with actual DB count to be safe
        this.loadCartCount();
      },
      error: (err) => {
        console.error('Erreur ajout produit:', err);
        
        if (err.status === 400 && err.error?.message) {
          alert(err.error.message);
        } else {
          alert("Impossible d'ajouter le produit au panier.");
        }
        
        // 🔹 Reload cart from DB on error to fix any mismatch
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
