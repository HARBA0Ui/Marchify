import { Component, inject, Input, OnInit, OnChanges } from '@angular/core';
import { ProductService } from '../../core/services/product-service';
import { Product } from '../../core/models/product';
import { ProductCard } from '../product-card/product-card';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-byshop-list',
  imports: [ProductCard, FormsModule, CommonModule], // ✅ Remove duplicate ProductCard
  templateUrl: './product-byshop-list.html',
  styleUrl: './product-byshop-list.css',
})
export class ProductByshopList implements OnInit, OnChanges {
  // ✅ Implement lifecycle hooks
  private productService = inject(ProductService);

  @Input({ required: true }) boutiqueId!: string; // ✅ Use this Input

  products: Product[] = [];
  filteredProducts: Product[] = [];

  // Filters
  deliveryFilter: string = 'all';
  sortBy: string = 'name';
  searchQuery: string = '';

  // States
  isLoading: boolean = true;

  ngOnInit() {
    if (this.boutiqueId) {
      this.loadProductsByShop();
    }
  }

  ngOnChanges() {
    // ✅ Reload when boutiqueId changes
    if (this.boutiqueId) {
      this.loadProductsByShop();
    }
  }

  loadProductsByShop() {
    this.isLoading = true;
    this.productService.getProductsByBoutiqueId(this.boutiqueId).subscribe({
      // ✅ Use boutiqueId from @Input
      next: (products) => {
        this.products = products;
        this.filteredProducts = [...this.products];
        this.isLoading = false;
        this.applyFilters();
      },
      error: (error) => {
        console.error('Error loading products:', error);
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
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.nom.toLowerCase().includes(query) ||
          product.description?.toLowerCase().includes(query)
      );
    }

    // Delivery filter
    if (this.deliveryFilter === 'livrable') {
      filtered = filtered.filter((product) => product.livrable);
    } else if (this.deliveryFilter === 'non-livrable') {
      filtered = filtered.filter((product) => !product.livrable);
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
        break;
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
    console.log('Product added to cart:', product);
    alert(`${product.nom} ajouté au panier !`);
  }

  onViewDetails(product: Product) {
    console.log('View product details:', product);
  }
}
