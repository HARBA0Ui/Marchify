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
  styleUrl: './shop.css'
})
export class Shop implements OnInit {
  private route = inject(ActivatedRoute);
  private shopService = inject(ShopService);

  shopId: string = '';
  shop: ShopModel | null = null;
  isLoading: boolean = true;

  ngOnInit() {
    this.route.params.subscribe(params => {
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
        console.error('Error loading shop details:', error);
        this.isLoading = false;
      }
    });
  }

  openMap() {
    if (this.shop?.localisation) {
      const url = `https://www.google.com/maps?q=${this.shop.localisation.lat},${this.shop.localisation.lng}`;
      window.open(url, '_blank');
    }
  }

  callShop() {
    if (this.shop?.telephone) {
      window.location.href = `tel:${this.shop.telephone}`;
    }
  }
}