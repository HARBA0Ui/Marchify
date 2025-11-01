import { Component, inject, Input, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Shop } from '../../core/models/shop';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-shop-card',
  imports: [CommonModule, RouterLink],
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
}
