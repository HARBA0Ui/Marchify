import { Component, inject, OnInit } from '@angular/core';
import { ProductService } from '../../core/services/product-service';
import { Product } from '../../core/models/product';
import { ProductCard } from '../product-card/product-card';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PanierService } from '../../core/services/panier';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-product-list',
  imports: [ProductCard, FormsModule, CommonModule, RouterLink],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
})
export class ProductList implements OnInit {
  private productService = inject(ProductService);
  private panierService = inject(PanierService);

  products: Product[] = [];
  filteredProducts: Product[] = [];

  selectedCategory: string = '';
  deliveryFilter: string = 'all';
  sortBy: string = 'name';

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

  // ✅ Handle events emitted from ProductCard
  onAddToCart(product: Product) {
    const clientid = '68f743532df2f750af13a584'; // replace with actual panier ID or get from user session
    const quantite = 1; // default quantity for now

    this.panierService
      .ajouterProduit(clientid, product.id, quantite)
      .subscribe({
        next: (res) => {
          console.log('Produit ajouté au panier:', res);
          alert(`${product.nom} ajouté au panier !`);
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

 
  trackById(index: number, product: Product) {
    return product.id;
  }
}
