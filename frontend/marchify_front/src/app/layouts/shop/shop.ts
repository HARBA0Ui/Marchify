import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ShopService } from '../../core/services/shop-service';
import { Shop as ShopModel } from '../../core/models/shop';
import { ProductByshopList } from '../product-byshop-list/product-byshop-list';

@Component({
  selector: 'app-shop',
  imports: [CommonModule, RouterLink, ProductByshopList],
  templateUrl: './shop.html',
  styleUrl: './shop.css',
})
export class Shop implements OnInit {
  private route = inject(ActivatedRoute);
  private shopService = inject(ShopService);

  shopId: string = '';
  shop: ShopModel | null = null;
  isLoading: boolean = true;

  ngOnInit() {
    // Get shop ID from route params
    this.route.params.subscribe((params) => {
      this.shopId = params['id'];
      if (this.shopId) {
        this.loadShopDetails();
      }
    });
  }

  loadShopDetails() {
    this.isLoading = true;
    this.shopService.getShopById(this.shopId).subscribe({
      next: (shop) => {
        this.shop = shop;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement de la boutique:', error);
        this.isLoading = false;
      },
    });
  }

  /** Open Google Maps at shop location */
  openMap() {
    if (this.shop?.localisation) {
      const { lat, lng } = this.shop.localisation;
      window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
    }
  }

  /** Call shop by phone */
  callShop() {
    if (this.shop?.telephone) {
      window.location.href = `tel:${this.shop.telephone}`;
    }
  }
}