import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Product } from '../../core/models/product';

@Component({
  selector: 'app-product-card',
  imports: [],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
})
export class ProductCard {
  @Input() product!: Product;
  @Output() addToCartEvent = new EventEmitter<Product>();
  @Output() viewDetailsEvent = new EventEmitter<Product>();

  addToCart(): void {
    this.addToCartEvent.emit(this.product);
  }

  
}
