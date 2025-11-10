import { DecimalPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Product } from '../../../core/models/product';
import { PanierService } from '../../../core/services/panier';

@Component({
  selector: 'app-predict-results',
  imports: [DecimalPipe],
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
      this.predictions = parsed.predictions;
      this.results = parsed.results;
    }
  }
  // ✅ Handle events emitted from ProductCard
    onAddToCart(product: Product) {
      const clientid = '68f743532df2f750af13a584'; // replace with actual panier ID or get from user session
      const quantite = 1; // default quantity for now
  
      this.panierService
        .ajouterProduit(clientid, product.id, quantite)
        .subscribe({
          next: (res) => {
            console.log('Produit ajouté au panier:', res);
            alert(`${product.nom} ajouté au panier !`);
          },
          error: (err) => {
            console.error('Erreur ajout produit:', err);
            alert('Impossible d’ajouter le produit au panier.');
          },
        });
    }
}
