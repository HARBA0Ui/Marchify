import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ShopService } from '../../core/services/shop-service';
import { Shop as ShopModel } from '../../core/models/shop';
import { ProductByshopList } from '../product-byshop-list/product-byshop-list';
import { BoutiqueCommentaireComponent } from '../boutique-commentaire/boutique-commentaire.component';


@Component({
  selector: 'app-shop',
  imports: [CommonModule, RouterLink, ProductByshopList, BoutiqueCommentaireComponent],
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


  getInitials(name: string): string {
    if (!name) return '??';
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }


  openMap() {
    if (this.shop?.localisation) {
      const { lat, lng } = this.shop.localisation;
      window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
    }
  }


  callShop() {
    if (this.shop?.telephone) {
      window.location.href = `tel:${this.shop.telephone}`;
    }
  }
}
