import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Product } from '../../core/models/product';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-product-card',
  imports: [CommonModule,RouterModule],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
})
export class ProductCard {
  @Input() product!: Product;
  @Output() addToCartEvent = new EventEmitter<Product>();
  @Output() viewDetailsEvent = new EventEmitter<Product>();

  isAdding = false;
  showSuccess = false;
  // constructor(private router: Router) {} 

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
  //redirection vers le detail_produit
  // viewDetails(): void {
  //   if (!this.product?.id) return;
  //   this.router.navigate(['/produit', this.product.id]);
  // }
}