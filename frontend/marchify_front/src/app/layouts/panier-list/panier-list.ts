import { Component } from '@angular/core';
import { PanierService } from '../../core/services/panier-service'; // Fixed import name
import { Panier } from '../../core/models/panier';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-panier-list',
  imports: [DecimalPipe],
  templateUrl: './panier-list.html',
  styleUrl: './panier-list.css'
})
export class PanierList {
  paniers: Panier[] = [];
  loading = true;
  error: string | null = null;

  constructor(private panierService: PanierService) {} // Fixed service name

  ngOnInit() {
    console.log('🔄 Loading paniers...');
    
    this.panierService.getPanier().subscribe({
      next: (data: any) => {
        console.log('✅ Data received:', data);
        this.paniers = data;
        this.loading = false;
        this.error = null;
      },
      error: (err: any) => {
        console.error('❌ Error loading panier:', err);
        this.error = 'Erreur lors du chargement du panier';
        this.loading = false;
        this.paniers = [];
      }
    });
  }

  confirmerCommande(): void {
    if (this.paniers && this.paniers.length > 0) {
      this.panierService.confirmerCommande(this.paniers[0]);
      alert('Commande confirmée ✅');
    } else {
      alert('Aucun panier à confirmer');
    }
  }
  // In your component class
increaseQuantity(product: any): void {
  product.quantite++;
  this.updateTotals();
}

decreaseQuantity(product: any): void {
  if (product.quantite > 1) {
    product.quantite--;
    this.updateTotals();
  }
}

removeProduct(product: any): void {
  const index = this.paniers[0].produits.indexOf(product);
  if (index > -1) {
    this.paniers[0].produits.splice(index, 1);
    this.updateTotals();
  }
}

viderPanier(): void {
  this.paniers[0].produits = [];
  this.updateTotals();
}

continuerAchats(): void {
  // Navigate back or do something else
  console.log('Continuing shopping...');
}

updateTotals(): void {
  if (this.paniers[0]?.produits) {
    // First: Recalculate prixTotal for each product
    for (const p of this.paniers[0].produits) {
      p.prixTotal = p.prixUnitaire * p.quantite;
    }

    // Then: Recalculate cart totals
    const sousTotal = this.paniers[0].produits.reduce((sum, p) => sum + p.prixTotal, 0);
    const livraison = sousTotal > 0 ? 3.00 : 0.00; // or however you compute delivery

    this.paniers[0].total = sousTotal + livraison;
  }
}
}