  import { Component, inject, OnInit } from '@angular/core';
  import { AsyncPipe, CommonModule } from '@angular/common'; // Add this
  import { ShopService } from '../../core/services/shop-service';
  import { Shop } from '../../core/models/shop';
  import { ShopCard } from '../shop-card/shop-card';
import { HttpClient } from '@angular/common/http';

  @Component({
    selector: 'app-shops-list',
    imports: [CommonModule, ShopCard],
    templateUrl: './shops-list.html',
    styleUrl: './shops-list.css',
  })
  export class ShopsList implements OnInit {
    private shopService = inject(ShopService);
    private http = inject(HttpClient);

    shops: Shop[] = [];
    isLoading = true;

    ngOnInit(): void {
      this.fetchShops();
    }

    fetchShops(): void {
      this.isLoading = true;
      this.shopService.getAllShops().subscribe({
        next: (shops) => {
          this.shops = shops;
          this.isLoading = false;
          console.log('Fetched shops:', shops);
        },
        error: (error) => {
          console.error('Error fetching shops:', error);
          this.shops = [];
          this.isLoading = false;
        },
      });
    }
  }



