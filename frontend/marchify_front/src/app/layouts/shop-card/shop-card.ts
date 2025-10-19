import { Component, inject, Input, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Shop } from '../../core/models/shop';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-shop-card',
  imports: [CommonModule,RouterLink],
  templateUrl: './shop-card.html',
  styleUrl: './shop-card.css',
})
export class ShopCard {
  @Input() shop!: Shop;

  getInitials(name: string): string {
    if (!name) return '??';
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getCategoryColor(): string {
    const category = this.shop.categorie.toLowerCase();

    if (category.includes('fruits') || category.includes('légumes')) {
      return 'border-l-[#29875c]';
    } else if (category.includes('épicerie') || category.includes('epicerie')) {
      return 'border-l-[#ec945a]';
    } else if (category.includes('viandes') || category.includes('poissons')) {
      return 'border-l-[#dd5248]';
    } else if (category.includes('laitiers')) {
      return 'border-l-[#ace0e4]';
    } else if (category.includes('boissons')) {
      return 'border-l-[#38cddd]';
    } else {
      return 'border-l-[#d585e1]';
    }
  }

  onViewProducts(): void {
    console.log('View products for shop:', this.shop.id);
  }
}
