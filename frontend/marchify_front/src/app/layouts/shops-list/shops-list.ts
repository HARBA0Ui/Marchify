import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Add this
import { ShopService } from '../../core/services/shop-service';
import { Shop } from '../../core/models/shop';
import { ShopCard } from '../shop-card/shop-card';
import { Router } from '@angular/router';

@Component({
  selector: 'app-shops-list',
  imports: [CommonModule, ShopCard], // Add CommonModule here
  templateUrl: './shops-list.html',
  styleUrl: './shops-list.css',
})
export class ShopsList implements OnInit {
  private shopService = inject(ShopService);

  shops: Shop[] = [];
  isLoading: boolean = true;

  ngOnInit(): void {
    this.fetchShops();
  }

  fetchShops(): void {
    this.isLoading = true;
    this.shopService.getShops().subscribe({
      next: (shops) => {
        this.shops = shops;
        this.isLoading = false;
        console.log('Fetched shops:', shops);
      },
      error: (error) => {
        console.error('Error:', error);
        this.shops = [];
        this.isLoading = false;
      },
    });
  }
}



