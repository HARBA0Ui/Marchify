import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { Product } from '../../../core/models/product';
import { PanierService } from '../../../core/services/panier';
import { ProductCard } from '../../../layouts/product-card/product-card';

@Component({
  selector: 'app-predict-results',
  imports: [DecimalPipe, RouterLink, ProductCard],
  templateUrl: './predict-results.html',
  styleUrl: './predict-results.css',
})
export class PredictResults {
  predictions: any[] = [];
  results: any[] = [];
  private panierService = inject(PanierService);

  ngOnInit() {
    const data = localStorage.getItem('predictResult');
    if (data) {
      const parsed = JSON.parse(data);
      this.predictions = parsed.predictions || [];
      this.results = parsed.results || [];
      console.log('Loaded results:', this.results);
    }
  }

  onAddToCart(product: Product) {
    const clientid = '68f743532df2f750af13a584';
    const quantite = 1;

    this.panierService
      .ajouterProduit(clientid, product.id, quantite)
      .subscribe({
        next: (res) => {
          console.log('Produit ajouté au panier:', res);
        },
        error: (err) => {
          console.error('Erreur ajout produit:', err);
          alert("❌ Impossible d'ajouter le produit au panier.");
        },
      });
  }

  onViewDetails(product: Product) {
    console.log('View product details:', product);
    // TODO: Navigate to product details page if you have one
  }
}