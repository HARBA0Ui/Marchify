import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Product } from '../../core/models/product';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-mostrate-card',
  imports: [RouterModule, CommonModule],
  templateUrl: './product-mostrate-card.html',
  styleUrl: './product-mostrate-card.css',
})
export class ProductMostrateCard {
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
