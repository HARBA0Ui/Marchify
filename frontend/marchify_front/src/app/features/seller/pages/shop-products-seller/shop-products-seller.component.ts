  import { Component, inject, OnInit, signal } from '@angular/core';
  import { Router, RouterModule, ActivatedRoute } from '@angular/router';
  import { FormsModule } from '@angular/forms';
  import { CommonModule } from '@angular/common';
  import { catchError, finalize, of } from 'rxjs';
  import { Product } from '../../../../core/models/product';
  import { Shop } from '../../../../core/models/shop';
  import { ProductService } from '../../../../core/services/product-service';
  import { ShopService } from '../../../../core/services/shop-service';
  import { AuthService } from '../../../../core/services/auth.service';

  @Component({
    selector: 'app-shop-products-seller',
    standalone: true,
    imports: [RouterModule, FormsModule, CommonModule],
    templateUrl: './shop-products-seller.component.html',
    styleUrl: './shop-products-seller.component.css',
  })
  export class ShopProductsSellerComponent implements OnInit {
    // 🔹 Services
    private authService = inject(AuthService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private productService = inject(ProductService);
    private shopService = inject(ShopService);

    // 🔹 Data
    products: Product[] = [];
    filteredProducts: Product[] = [];
    shopId!: string;
    shop?: Shop;

    // 🔹 Filter and sort properties
    categories: string[] = [];
    selectedCategory: string = '';
    priceFilter: string = 'all';
    sortBy: string = 'name';

    // 🔹 UI State
    isLoading = signal(false);
    error = signal<string | null>(null);

    ngOnInit(): void {
      console.log('🚀 Component initialized');

      // 🔹 Get shop ID from route
      this.shopId = this.route.snapshot.paramMap.get('id')!;
      console.log('🏪 Shop ID from route:', this.shopId);

      if (!this.shopId) {
        console.error('❌ Shop ID not found in route');
        this.error.set('ID de boutique non trouvé');
        return;
      }

      // 🔹 Load shop and verify ownership
      this.loadShop();
    }

    loadShop(): void {
      if (!this.shopId) return;

      this.isLoading.set(true);
      this.error.set(null);


      this.shopService
        .getShopById(this.shopId)
        .pipe(
          catchError((err) => {
            console.error('❌ Error loading shop:', err);
            this.error.set('Erreur lors du chargement de la boutique');
            return of(null);
          })
        )
        .subscribe({
          next: (shopData) => {
            if (!shopData) {
              this.error.set('Boutique non trouvée');
              this.isLoading.set(false);
              this.router.navigate(['/seller/shop-list']);
              return;
            }

           

            this.shop = shopData;
            this.loadProducts();
          },
        });
    }

    loadProducts(): void {
      if (!this.shopId) {
        this.error.set('ID boutique non disponible');
        this.isLoading.set(false);
        return;
      }

      this.productService
        .getProductsByShopId(this.shopId)
        .pipe(
          catchError((err) => {
            console.error('❌ Error loading products:', err);
            this.error.set('Erreur lors du chargement des produits');
            return of([]);
          }),
          finalize(() => {
            this.isLoading.set(false);
          })
        )
        .subscribe({
          next: (data) => {
            console.log('✅ Products loaded:', data.length);
            this.products = data;
            this.extractCategories();
            this.filteredProducts = [...this.products];
            this.applySorting();
          },
        });
    }

    extractCategories(): void {
      const uniqueCategories = new Set(
        this.products
          .map((p) => p.categorie)
          .filter((cat) => cat !== null && cat !== undefined)
      );
      this.categories = Array.from(uniqueCategories).sort();
    }

    applyFilters(): void {
      let filtered = [...this.products];

      if (this.selectedCategory) {
        filtered = filtered.filter((p) => p.categorie === this.selectedCategory);
      }

      switch (this.priceFilter) {
        case 'low':
          filtered = filtered.filter((p) => p.prix < 10);
          break;
        case 'medium':
          filtered = filtered.filter((p) => p.prix >= 10 && p.prix <= 50);
          break;
        case 'high':
          filtered = filtered.filter((p) => p.prix > 50);
          break;
      }

      this.filteredProducts = filtered;
      this.applySorting();
    }

    applySorting(): void {
      switch (this.sortBy) {
        case 'name':
          this.filteredProducts.sort((a, b) =>
            a.nom.localeCompare(b.nom, 'fr', { sensitivity: 'base' })
          );
          break;
        case 'price-asc':
          this.filteredProducts.sort((a, b) => a.prix - b.prix);
          break;
        case 'price-desc':
          this.filteredProducts.sort((a, b) => b.prix - a.prix);
          break;
      }
    }

    clearFilters(): void {
      this.selectedCategory = '';
      this.priceFilter = 'all';
      this.sortBy = 'name';
      this.filteredProducts = [...this.products];
      this.applySorting();
    }

    deleteProduct(productId: string): void {
      if (confirm('Voulez-vous vraiment supprimer ce produit ?')) {
        this.productService
          .deleteProduct(productId)
          .pipe(
            catchError((err) => {
              console.error('❌ Error deleting product:', err);
              this.error.set('Erreur lors de la suppression du produit');
              return of(null);
            })
          )
          .subscribe({
            next: () => {
              console.log('✅ Product deleted successfully');
              this.loadProducts();
            },
          });
      }
    }

    trackById(index: number, item: Product): string {
      return item.id;
    }
  }
