import { Component, inject, Input, OnInit, OnChanges } from '@angular/core';
import { ProductService } from '../../core/services/product-service';
import { Product } from '../../core/models/product';
import { ProductCard } from '../product-card/product-card';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PanierService } from '../../core/services/panier';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ProductPinnedCard } from '../product-pinned-card/product-pinned-card';

@Component({
  selector: 'app-product-byshop-list',
  imports: [ProductCard, FormsModule, CommonModule, RouterLink, ProductPinnedCard],
  templateUrl: './product-byshop-list.html',
  styleUrl: './product-byshop-list.css',
})
export class ProductByshopList implements OnInit, OnChanges {
  private productService = inject(ProductService);
  private panierService = inject(PanierService);
  private authService = inject(AuthService);
  private router = inject(Router);

  @Input({ required: true }) boutiqueId!: string;

  products: Product[] = [];
  filteredProducts: Product[] = [];

  // Pagination properties
  currentPage: number = 1;
  itemsPerPage: number = 9;
  totalPages: number = 0;
  paginatedUnpinnedProducts: Product[] = [];
  
  // Animation state
  isJumping: boolean = false;

  // Filters
  deliveryFilter: string = 'all';
  sortBy: string = 'name';
  searchQuery: string = '';
  isLoading: boolean = true;

  // Helper methods
  get hasPinnedProducts(): boolean {
    return this.filteredProducts.some(p => p.Ispinned);
  }

  get hasUnpinnedProducts(): boolean {
    return this.unpinnedProducts.length > 0;
  }

  get pinnedProducts(): Product[] {
    return this.filteredProducts.filter(p => p.Ispinned);
  }

  get unpinnedProducts(): Product[] {
    return this.filteredProducts.filter(p => !p.Ispinned);
  }

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

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.nom.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }

    if (this.deliveryFilter === 'livrable') {
      filtered = filtered.filter((p) => p.livrable);
    } else if (this.deliveryFilter === 'non-livrable') {
      filtered = filtered.filter((p) => !p.livrable);
    }

    this.filteredProducts = filtered;
    this.currentPage = 1;
    this.applySorting();
  }

  applySorting() {
    this.filteredProducts.sort((a, b) => {
      if (a.Ispinned && !b.Ispinned) return -1;
      if (!a.Ispinned && b.Ispinned) return 1;

      switch (this.sortBy) {
        case 'price-asc':
          return a.prix - b.prix;
        case 'price-desc':
          return b.prix - a.prix;
        case 'stock':
          return (b.quantite || 0) - (a.quantite || 0);
        case 'name':
        default:
          return a.nom.localeCompare(b.nom);
      }
    });
    
    this.updatePagination();
  }

  updatePagination() {
    const unpinned = this.unpinnedProducts;
    this.totalPages = Math.ceil(unpinned.length / this.itemsPerPage);

    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    }

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedUnpinnedProducts = unpinned.slice(startIndex, endIndex);
  }

  // FIXED: No scroll manipulation - just clean pagination
  goToPage(page: number, event?: MouseEvent) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    }
    
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.triggerJumpAnimation();
      this.currentPage = page;
      this.updatePagination();
    }
  }

  triggerJumpAnimation() {
    this.isJumping = true;
    setTimeout(() => {
      this.isJumping = false;
    }, 600);
  }

  get pageNumbers(): number[] {
    const maxPages = 7;
    const pages: number[] = [];

    if (this.totalPages <= maxPages) {
      return Array.from({ length: this.totalPages }, (_, i) => i + 1);
    }

    pages.push(1);

    if (this.currentPage > 3) {
      pages.push(-1);
    }

    const start = Math.max(2, this.currentPage - 1);
    const end = Math.min(this.totalPages - 1, this.currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (this.currentPage < this.totalPages - 2) {
      pages.push(-1);
    }

    if (this.totalPages > 1) {
      pages.push(this.totalPages);
    }

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
    
    return padding + ((visualIndex + 1) * (buttonWidth + gap));
  }

  clearFilters() {
    this.searchQuery = '';
    this.deliveryFilter = 'all';
    this.sortBy = 'name';
    this.currentPage = 1;
    this.filteredProducts = [...this.products];
    this.applySorting();
  }

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
        },
        error: (err) => {
          console.error('Erreur ajout produit:', err);
          alert('Impossible d\'ajouter le produit au panier.');
        },
      });
  }

  onViewDetails(product: Product) {
    console.log('View product details:', product);
  }
}
