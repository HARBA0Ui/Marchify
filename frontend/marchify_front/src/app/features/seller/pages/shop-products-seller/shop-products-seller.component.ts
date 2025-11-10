import { Component } from '@angular/core';
import { Product } from '../../../../core/models/product';
import { Shop } from '../../../../core/models/shop';
import { ProductService } from '../../../../core/services/product-service';
import { ShopService } from '../../../../core/services/shop-service';
import { Router, RouterModule } from '@angular/router';
import { OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-shop-products-seller',
  imports: [RouterModule],  // ✅ CommonModule retiré (non nécessaire pour @if et @for)
  templateUrl: './shop-products-seller.component.html',
  styleUrl: './shop-products-seller.component.css'
})
export class ShopProductsSellerComponent implements OnInit {
  products: Product[] = [];
  shopId!: string;
  shop?: Shop;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private shopService: ShopService
  ) {}

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role !== 'VENDEUR') {
      this.router.navigate(['/login']);
      return;
    }
    this.shopId = this.route.snapshot.paramMap.get('id')!;
    this.loadShop();
    this.loadProducts();
  }

  loadShop(): void {
    this.shopService.getShopById(this.shopId).subscribe({
      next: (data: any) => (this.shop = data),
      error: (err: any) => console.error('Erreur chargement boutique:', err),
    });
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (data: any) => {
        this.products = data.filter((p: any) => p.boutiqueId === this.shopId);
      },
      error: (err: any) => console.error('Erreur chargement produits:', err),
    });
  }

  editProduct(productId: string): void {
    this.router.navigate(['/seller/product-edit', productId]);
  }

  deleteProduct(productId: string): void {
    if (confirm('Voulez-vous vraiment supprimer ce produit ?')) {
      this.productService.deleteProduct(productId).subscribe({
        next: () => this.loadProducts(),
        error: (err: any) => console.error('Erreur suppression produit:', err),
      });
    }
  }

  addProduct(): void {
    this.router.navigate(['/seller/product-add', this.shopId]);
  }
}