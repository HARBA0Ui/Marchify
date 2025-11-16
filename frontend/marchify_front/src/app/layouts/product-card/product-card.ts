import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Product } from '../../core/models/product';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-card',
  imports: [CommonModule],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
})
export class ProductCard {
  @Input() product!: Product;
  @Output() addToCartEvent = new EventEmitter<Product>();
  @Output() viewDetailsEvent = new EventEmitter<Product>();

  isAdding = false;
  showSuccess = false;

  addToCart(): void {
    if (this.isAdding) return; // Prevent double clicks
    
    this.isAdding = true;
    
    // Reset after animation completes
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