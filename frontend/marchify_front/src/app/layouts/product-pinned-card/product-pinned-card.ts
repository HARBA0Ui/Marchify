import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Product } from '../../core/models/product';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-pinned-card',
  imports: [RouterModule, CommonModule],
  templateUrl: './product-pinned-card.html',
  styleUrl: './product-pinned-card.css',
})
export class ProductPinnedCard {
  @Input() product!: Product;
  @Output() addToCartEvent = new EventEmitter<Product>();
  @Output() viewDetailsEvent = new EventEmitter<Product>();

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
