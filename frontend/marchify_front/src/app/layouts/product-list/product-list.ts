import { Component, OnInit, inject } from '@angular/core';
import { Product } from '../../core/models/product';
import { ProductCard } from '../product-card/product-card';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../core/services/product-service';

@Component({
  selector: 'app-products-list',
  imports: [ProductCard, FormsModule, CommonModule],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css'
})
export class ProductsList implements OnInit {
  private productService = inject(ProductService);
  
  products: Product[] = [];
  filteredProducts: Product[] = [];
  
  // Filtres
  selectedCategory: string = '';
  deliveryFilter: string = 'all';
  sortBy: string = 'name';
  
  // États
  isLoading: boolean = true;
  categories: string[] = [];

  ngOnInit() {
    this.loadProducts();
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
        // Gestion d'erreur - vous pouvez afficher un message à l'utilisateur
      }
    });
  }

  extractCategories() {
    this.categories = [...new Set(this.products.map(p => p.categorie))];
  }

  applyFilters() {
    let filtered = [...this.products];

    if (this.selectedCategory) {
      filtered = filtered.filter(product => 
        product.categorie === this.selectedCategory
      );
    }

    if (this.deliveryFilter === 'livrable') {
      filtered = filtered.filter(product => product.livrable);
    } else if (this.deliveryFilter === 'non-livrable') {
      filtered = filtered.filter(product => !product.livrable);
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
        break;
    }
  }

  clearFilters() {
    this.selectedCategory = '';
    this.deliveryFilter = 'all';
    this.sortBy = 'name';
    this.filteredProducts = [...this.products];
    this.applySorting();
  }

  onAddToCart(product: Product) {
    console.log('Produit ajouté au panier:', product);
    alert(`${product.nom} ajouté au panier !`);
  }

  onViewDetails(product: Product) {
    console.log('Voir détails du produit:', product);
  }
}