import { Component, inject, Input, OnInit, OnChanges } from '@angular/core';
import { ProductService } from '../../core/services/product-service';
import { Product } from '../../core/models/product';
import { ProductCard } from '../product-card/product-card';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PanierService } from '../../core/services/panier';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-product-byshop-list',
  imports: [ProductCard, FormsModule, CommonModule,RouterLink], // ✅ Remove duplicate ProductCard
  templateUrl: './product-byshop-list.html',
  styleUrl: './product-byshop-list.css',
})
export class ProductByshopList implements OnInit, OnChanges {
  private productService = inject(ProductService);
  private panierService = inject(PanierService);

  @Input({ required: true }) boutiqueId!: string;

  products: Product[] = [];
  filteredProducts: Product[] = [];

  // Filters
  deliveryFilter: string = 'all';
  sortBy: string = 'name';
  searchQuery: string = '';

  isLoading: boolean = true;

  ngOnInit() {
    this.loadProducts();
  }

  ngOnChanges() {
    this.loadProducts();
  }

  loadProducts() {
    if (!this.boutiqueId) return;

    this.isLoading = true;
    this.productService.getProducts().subscribe({
      next: (products) => {
        // ✅ Filter by boutiqueId on frontend
        this.products = products.filter(
          (p) => p.boutiqueId === this.boutiqueId
        );
        this.filteredProducts = [...this.products];
        this.isLoading = false;
        this.applyFilters();
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.isLoading = false;
        this.products = [];
        this.filteredProducts = [];
      },
    });
  }

  applyFilters() {
    let filtered = [...this.products];

    // Search filter
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.nom.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }

    // Delivery filter
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
      case 'stock':
        this.filteredProducts.sort(
          (a, b) => (b.quantite || 0) - (a.quantite || 0)
        );
        break;
      case 'name':
      default:
        this.filteredProducts.sort((a, b) => a.nom.localeCompare(b.nom));
    }
  }

  clearFilters() {
    this.searchQuery = '';
    this.deliveryFilter = 'all';
    this.sortBy = 'name';
    this.filteredProducts = [...this.products];
    this.applySorting();
  }

  onAddToCart(product: Product) {
    const clientid = '68f743532df2f750af13a584'; // replace with actual panier ID or get from user session
    const quantite = 1; // default quantity for now

    this.panierService
      .ajouterProduit(clientid, product.id, quantite)
      .subscribe({
        next: (res) => {
          console.log('Produit ajouté au panier:', res);
        },
        error: (err) => {
          console.error('Erreur ajout produit:', err);
          alert('Impossible d’ajouter le produit au panier.');
        },
      });
  }

  onViewDetails(product: Product) {
    console.log('View product details:', product);
  }
}
