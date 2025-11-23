import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Product } from '../../core/models/product';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-product-card',
  imports: [CommonModule, RouterModule],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
})
export class ProductCard {
  @Input() product!: Product;
  @Output() addToCartEvent = new EventEmitter<Product>();
  @Output() viewDetailsEvent = new EventEmitter<Product>();
  @Input() shopName: string = 'Boutique'; // ✅ ADD THIS

  isAdding = false;
  showSuccess = false;

  addToCart(): void {
    if (this.isAdding) return;
    console.log('product: ', this.product);

    this.isAdding = true;

    setTimeout(() => {
      this.showSuccess = true;

      setTimeout(() => {
        this.isAdding = false;
        this.showSuccess = false;
      }, 2000);
    }, 600);

    this.addToCartEvent.emit(this.product);
  }
}