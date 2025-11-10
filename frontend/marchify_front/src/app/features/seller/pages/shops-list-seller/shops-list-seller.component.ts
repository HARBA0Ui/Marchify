import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { OnInit } from '@angular/core';
import { Shop } from '../../../../core/models/shop';
import { ShopService } from '../../../../core/services/shop-service';

@Component({
  selector: 'app-shops-list-seller',
  imports: [RouterModule],  
  templateUrl: './shops-list-seller.component.html',
  styleUrl: './shops-list-seller.component.css'
})
export class ShopsListSellerComponent implements OnInit {
  shops: Shop[] = [];
  loading = true;
  vendeurId: string | null = null;

  constructor(private shopService: ShopService, private router: Router) {}

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role !== 'VENDEUR') {
      this.router.navigate(['/login']);
      return;
    }
    this.vendeurId = user.id;
    this.loadShops();
  }

  loadShops(): void {
    if (!this.vendeurId) return;
    this.shopService.getShopsByVendeurId(this.vendeurId).subscribe({
      next: (data: any) => {
        this.shops = data;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Erreur chargement boutiques:', err);
        this.loading = false;
      }
    });
  }

  createNewShop(): void {
    this.router.navigate(['/seller/shop-creation']);
  }
}